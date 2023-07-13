import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
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
  FormModel,
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
  @Input() orgUnitID: string;
  @Input() view: ViewsComponent = null;
  @Input() dataService: CRUDService = null;
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

  @ViewChild('diagram') diagram: any;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService,
    private cacheService: CacheService,
    private hrService: CodxHrService
  ) {}

  onSelected(value): void {
    this.selectedTeam = value;
    if (value.includes('Không')) {
      this.getDataPositionByID(this.orgUnitID, false);
    } else {
      this.getDataPositionByID(this.orgUnitID, true);
    }
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
                  },
                  //itemType: ItemType.Assistant,
                  // adviserPlacementType: AdviserPlacementType.Left,
                  // groupTitle: 'Sub Adviser',
                  // groupTitleColor: Colors.Red,
                })
              );
              // }
            });
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orgUnitID.currentValue != changes.orgUnitID.previousValue) {
      if (this.orgUnitID) {
        //Function get new orgchart
        if (this.selectedTeam.includes('Không')) {
          this.getDataPositionByID(this.orgUnitID, false);
        } else {
          this.getDataPositionByID(this.orgUnitID, true);
        }
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
  clickMF(event: any, node: any) {
    if (event) {
      switch (event.functionID) {
        case 'SYS02': //delete
          this.deleteData(node);
          break;
        case 'SYS03': // edit
          this.editData(node, event);
          break;
        case 'SYS04': // copy
          break;
        default:
          break;
      }
    }
  }

  changeDataMf(event, data) {
    this.hrService.handleShowHideMF(event, data, this.view.formModel);
  }
  // edit data
  editData(node: any, event: any) {
    if (this.dataService) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.dataService;
      option.FormModel = this.formModel;
      let object = {
        data: node,
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
          let org = res.event[0];
          let tmpOrg = res.event[1];
          this.dataService.update(tmpOrg).subscribe(() => {
            this.dataSource = this.newDataManager(this.dataService.data);
            this.dt.detectChanges();
          });
          this.view.dataService.add(org).subscribe();
        }
      });
    }
  }

  // delete data
  deleteData(node) {
    this.view.dataService.delete([node]).subscribe(() => {
      this.dataService.remove(node).subscribe(() => {
        this.dataSource = this.newDataManager(this.dataService.data);
        this.dt.detectChanges();
      });
    });
  }
}
