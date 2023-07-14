import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  EventEmitter,
  Output,
  TemplateRef,
} from '@angular/core';
// import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  ConnectorModel,
  Diagram,
  DiagramTools,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel,
} from '@syncfusion/ej2-angular-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import {
  OrgItemConfig,
  Enabled,
  PageFitMode,
  ChildrenPlacementType,
  GroupByType,
  LevelAnnotationConfig,
  ConnectorType,
  NavigationMode,
  OrientationType,
} from 'ngx-basic-primitives';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CRUDService,
  DialogRef,
  FormModel,
  RequestOption,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { PopupAddOrganizationComponent } from '../popup-add-organization/popup-add-organization.component';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'hr-organization-orgchart',
  templateUrl: './organization-orgchart.component.html',
  styleUrls: ['./organization-orgchart.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationOrgchartComponent implements OnInit {
  console = console;
  PageFitMode = PageFitMode;
  NavigationMode = NavigationMode;
  Enabled = Enabled;
  ChildrenPlacementType = ChildrenPlacementType;
  ConnectorType = ConnectorType;
  GroupByType = GroupByType;
  OrientationType = OrientationType;
  items: Array<OrgItemConfig> = [];
  dataVll: [];
  //Variable diagram
  pagefit: any;
  orientationType: any;
  childrenPlacementType: any;
  @ViewChild('contactTemplate') contactTemplate: TemplateRef<any>;

  //Popup Settings
  dialogEditStatus: any;
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;

  annotations: Array<LevelAnnotationConfig> = [];
  datasetting: any = null;
  dataSource: any = null;
  public layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 60,
    horizontalSpacing: 60,
    enableAnimation: true,
  };
  public tool: DiagramTools = DiagramTools.ZoomPan;
  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  @Input() formModel: FormModel;
  @Input() orgUnitID: string = '';
  @Input() view: ViewsComponent;
  @Input() dataService: CRUDService = null;
  @Output() clickMFunction = new EventEmitter();

  scaleNumber: number = 0.5;
  width = 250;
  height = 350;
  maxWidth = 300;
  maxHeight = 400;
  minWidth = 250;
  minHeight = 350;
  imployeeInfo: any = {};
  employees: any[] = [];
  headerColor: string = '#03a9f4';
  selectedTeam = '';

  //style slider
  stylesObj = { width: '30%', display: 'flex', margin: '5px auto' };
  stylesObjChart = { border: '3px solid #03a9f4', position: 'relative' };
  stylesObjChart1 = { border: '1px ridge gray', position: 'relative' };

  @ViewChild('diagram') diagram: any;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService,
    private cacheService: CacheService,
    private hrService: CodxHrService
  ) {
    this.isGetManager(this.selectedTeam);
  }

  showVal(value) {
    this.scaleNumber = value / 100;
  }

  changeMode(e) {
    var target = e.target.id;

    if (target === 'pageFitModeNone') {
      this.pagefit = this.PageFitMode.None;
    }
    if (target === 'pageFitModeFit') {
      this.pagefit = this.PageFitMode.FitToPage;
    }

    //Orientation
    if (target === 'orientationTop') {
      this.orientationType = this.OrientationType.Top;
    }
    if (target === 'orientationBottom') {
      this.orientationType = this.OrientationType.Bottom;
    }
    if (target === 'orientationLeft') {
      this.orientationType = this.OrientationType.Left;
    }
    if (target === 'orientationRight') {
      this.orientationType = this.OrientationType.Right;
    }
    if (target === 'orientationNone') {
      this.orientationType = this.OrientationType.None;
    }

    //PlacementType
    if (target === 'childrenPlacementAuto') {
      this.childrenPlacementType = this.ChildrenPlacementType.Auto;
    }
    if (target === 'childrenPlacementVertical') {
      this.childrenPlacementType = this.ChildrenPlacementType.Vertical;
    }
    if (target === 'childrenPlacementHorizontal') {
      this.childrenPlacementType = this.ChildrenPlacementType.Horizontal;
    }
  }

  // onScale(data: number): void {
  //   this.scaleNumber = data;
  // }

  // onMouseWheel(evt) {
  //   if (evt.deltaY > 0) {
  //     this.scaleNumber = this.scaleNumber - 0.1;
  //   } else {
  //     this.scaleNumber = this.scaleNumber + 0.1;
  //   }
  // }

  openSetting() {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';

    this.dialogEditStatus = this.callFC.openSide(
      this.templateUpdateStatus,
      {
        actionType: 'abc',
      },
      option
    );
    this.dialogEditStatus.closed.subscribe((res) => {
      if (res?.event) {
        this.view.dataService.update(res.event[0]).subscribe();
        //Render new data when update new status on view detail
        this.dt.detectChanges();
      }
    });
  }

  CloseDialog(dialog: DialogRef) {
    dialog.close();
  }

  onSaveUpdateForm() {
    this.dialogEditStatus && this.dialogEditStatus.close();
    // this.hrService.editEContract(this.editStatusObj).subscribe((res) => {
    //   if (res != null) {
    //     this.notify.notifyCode('SYS007');
    //     res[0].emp = this.currentEmpObj;
    //     this.view.formModel.entityName;
    //     this.hrService
    //       .addBGTrackLog(
    //         res[0].recID,
    //         this.cmtStatus,
    //         this.view.formModel.entityName,
    //         'C1',
    //         null,
    //         'EContractsBusiness'
    //       )
    //       .subscribe();
    //     this.dialogEditStatus && this.dialogEditStatus.close(res);
    //   }
    // });
  }

  getDataPositionByID(orgUnitID: string, getManager: boolean) {
    if (orgUnitID) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness',
          'GetDataOrgChartAsync',
          [orgUnitID, getManager]
        )
        .subscribe((res: any) => {
          if (res) {
            // this.dataSource = this.newDataManager(res);
            var items: Array<OrgItemConfig> = [];
            res.map((item) => {
              items.push(
                new OrgItemConfig({
                  id: item.orgUnitID,
                  parent: item.parentID,
                  title: item.orgUnitName,
                  description: item.positionName,
                  //image: this.imgTest,
                  templateName: 'contactTemplate',
                  context: {
                    employeeID: item.employeeID,
                    employeeName: item.employeeName,
                    employeeManager: item.employeeManager,
                    orgUnitType: item.orgUnitType,
                    data: item,
                  },
                  //itemType: ItemType.Assistant,
                  // adviserPlacementType: AdviserPlacementType.Left,
                  // groupTitle: 'Sub Adviser',
                  // groupTitleColor: Colors.Red,
                })
              );
              // }
            });
            console.log(items);

            this.items = items;
          }
        });
    }
    //this.dt.detectChanges();
  }

  ngOnInit(): void {
    this.cacheService.valueList('L0605').subscribe((res) => {
      if (res) {
        this.dataVll = res.datas;
      }
    });
  }

  //#region  Get manager depend combobox
  isGetManager(value) {
    if (value.includes('Không')) {
      this.getDataPositionByID(this.orgUnitID, false);
    } else {
      this.getDataPositionByID(this.orgUnitID, true);
    }
  }

  onSelected(value): void {
    this.selectedTeam = value;
    this.isGetManager(value);
  }

  GetChartDiagram() {
    this.isGetManager(this.selectedTeam);
  }

  //#endregion

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orgUnitID.currentValue != changes.orgUnitID.previousValue) {
      if (this.orgUnitID) {
        //Function get new orgchart
        this.isGetManager(this.selectedTeam);
        //this.dt.detectChanges();
        //Function get olg orgchart
        // this.dataService.setPredicates([], [this.orgUnitID], (res) => {
        //   if (res) {
        //     res.forEach((x) => {
        //       if (x.orgUnitID === this.orgUnitID) {
        //         x.parentID = '';
        //         return;
        //       }
        //     });
        //   }
        //   this.dataSource = this.newDataManager(res);
        // });
      }
    }
  }

  setDataOrg(data: any[]) {
    let setting = this.newDataManager(data);
    setting.dataManager = new DataManager(data);
    this.datasetting = setting;
    this.dt.detectChanges();
  }

  newDataManager(data: any[]): any {
    return {
      id: 'orgUnitID',
      parentId: 'parentID',
      dataSource: new DataManager(data),
      doBinding: (nodeModel: NodeModel, data: any, diagram: Diagram) => {
        nodeModel.data = data;
        nodeModel.borderWidth = 1;
        nodeModel.width = this.width;
        nodeModel.height = this.height;
        nodeModel.maxWidth = this.maxWidth;
        nodeModel.maxHeight = this.maxHeight;
        nodeModel.minWidth = this.minWidth;
        nodeModel.minHeight = this.minHeight;
        nodeModel.shape = {
          type: 'HTML',
          content: '',
          data: data,
        };
      },
    };
  }

  public connDefaults(
    connector: ConnectorModel,
    diagram: Diagram
  ): ConnectorModel {
    connector.targetDecorator.shape = 'None';
    connector.type = 'Orthogonal';
    //connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.style.strokeColor = '#6d6d6d';
    return connector;
  }

  public nodeDefaults(obj: NodeModel): NodeModel {
    obj.expandIcon = {
      height: 15,
      width: 15,
      shape: 'Minus',
      fill: 'lightgray',
      offset: { x: 0.5, y: 1 },
    };
    obj.collapseIcon = {
      height: 15,
      width: 15,
      shape: 'Plus',
      fill: 'lightgray',
      offset: { x: 0.5, y: 1 },
    };
    return obj;
  }

  // click moreFC
  clickMF(event: any, data: any) {
    if (event) {
      switch (event.functionID) {
        case 'SYS02': //delete
          this.deleteData(data);
          break;
        case 'SYS03': // edit
          this.editData(data, event);
          break;
        case 'SYS04': // copy
          break;
        default:
          break;
      }
    }
  }

  changeDataMf(event, data) {
    this.hrService.handleShowHideMF(event, data, this.formModel);
  }
  // edit data
  editData(data: any, event: any) {
    if (this.dataService) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.dataService;
      option.FormModel = this.formModel;
      let object = {
        data: data,
        action: event,
        funcID: this.formModel.funcID,
        isModeAdd: false,
      };
      let popup = this.callFC.openSide(
        PopupAddOrganizationComponent,
        object,
        option,
        this.formModel.funcID
      );
      popup.closed.subscribe((res: any) => {
        if (res.event) {
          this.dataService.update(res.event).subscribe(() => {
            // this.dataSource = this.newDataManager(this.dataService.data);
            this.getDataPositionByID(this.orgUnitID, true);
            this.dt.detectChanges();
          });
          //this.view.dataService.add(res.event).subscribe();
        }
      });
    }
  }

  beforeDelete(opt: RequestOption, id) {
    opt.methodName = 'DeleteEOrgChartAsync';
    opt.className = 'OrganizationUnitsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = id;
    return true;
  }

  // delete data
  deleteData(data) {
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data.orgUnitID)
      )
      .subscribe(() => {
        this.getDataPositionByID(this.orgUnitID, true);
        this.dt.detectChanges();
      });
  }

  //Load more icon add
  loadDataChild(node: any, element: HTMLElement) {
    let data = [];
    let result = new OrgItemConfig({
      id: 'abc',
      parent: 'ORG-0156',
      title: 'haha',
      description: 'hichic',
      templateName: 'contactTemplate',

      context: {
        employeeID: '26',
        employeeName: 'test',
        employeeManager: null,
        orgUnitType: '1',
        data: this.items[0].context.data,
      },
    });

    data = this.items.concat(result);

    this.items = data;
    // if (node.loadChildrent) {
    //   result = this.data.filter(e => e.reportTo != node.positionID);
    //   if (result.length > 0) {
    //     result.forEach(element => {
    //       if (element.positionID == node.positionID) {
    //         element.loadChildrent = false;
    //       }
    //     });
    //     this.removeNode(node.positionID);
    //   }
    //   this.setDataOrg(this.data);
    // }
    // else {
    //   if (node.positionID) {
    //     this.api.execSv("HR", "ERM.Business.HR", "PositionsBusiness", "GetChildOrgChartAsync", [node.positionID])
    //       .subscribe((res: any) => {
    //         if (res) {
    //           result = this.data.concat(res);
    //           if (result.length > 0) {
    //             result.forEach(element => {
    //               if (element.positionID == node.positionID) {
    //                 element.loadChildrent = true;
    //               }
    //             });
    //             this.data = JSON.parse(JSON.stringify(result))
    //           }
    //           this.setDataOrg(this.data);
    //         }
    //       });
    //   }
    // }
  }
}
