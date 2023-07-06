import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
  ViewChild,
  TemplateRef,
} from '@angular/core';
// import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  ConnectorModel,
  Diagram,
  DiagramComponent,
  DiagramTools,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel,
  TextModel,
} from '@syncfusion/ej2-angular-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import {
  OrgItemConfig,
  Enabled,
  PageFitMode,
  Colors,
  AnnotationType,
  Thickness,
  LineType,
  AdviserPlacementType,
  ItemType,
  ChildrenPlacementType,
  GroupByType,
  LevelAnnotationConfig,
  ConnectorType,
  TemplateConfig,
  Size,
  FamDiagramComponent,
} from 'ngx-basic-primitives';
import {
  ApiHttpService,
  CallFuncService,
  CodxFormDynamicComponent,
  CRUDService,
  FormModel,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { PopupAddOrganizationComponent } from '../popup-add-organization/popup-add-organization.component';

@Component({
  selector: 'hr-organization-orgchart',
  templateUrl: './organization-orgchart.component.html',
  styleUrls: ['./organization-orgchart.component.css'],
})
export class OrganizationOrgchartComponent implements OnInit {
  console = console;
  PageFitMode = PageFitMode;
  Enabled = Enabled;
  ChildrenPlacementType = ChildrenPlacementType;
  ConnectorType = ConnectorType;
  GroupByType = GroupByType;
  items: Array<OrgItemConfig> = [];
  annotations: Array<LevelAnnotationConfig> = [];
  imgTest: any =
    'data:image/png;base64,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';

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
  @ViewChild('diagram') diagram: any;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService
  ) {}

  onScale(data: number): void {
    this.scaleNumber = data;
  }

  onMouseWheel(evt) {
    console.log('Wheel event: ', evt.deltaY);
    if (evt.deltaY > 0) {
      this.scaleNumber = this.scaleNumber - 0.1;
    } else {
      this.scaleNumber = this.scaleNumber + 0.1;
    }
    console.log(this.scaleNumber);
  }

  // getContactTemplate() {
  //   var result = new TemplateConfig();
  //   result.name = 'itemTemplate';

  //   result.itemSize = new Size(160, 30);
  //   result.minimizedItemSize = new Size(3, 3);

  //   result.itemTemplate = this.itemTemplate;
  //   console.log(result);
  //   return result;
  // }

  getDataPositionByID(orgUnitID: string) {
    if (orgUnitID) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness',
          'GetDataOrgChartAsync',
          [orgUnitID]
        )
        .subscribe((res: any) => {
          if (res) {
            console.log(res);
            // this.dataSource = this.newDataManager(res);
            var items: Array<OrgItemConfig> = [];
            res.map((item) => {
              items.push(
                new OrgItemConfig({
                  id: item.orgUnitID,
                  parent: item.parentID,
                  title: item.orgUnitName,
                  description: item.positionName,
                  image: this.imgTest,
                  templateName: 'contactTemplate',
                  context: {
                    employeeID: item.employeeID,
                    employeeName: item.employeeName,
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
  }

  // highlightPadding: { left: 4, top: 4, right: 4, bottom: -18 },
  // cursorPadding: { left: 0, top: 0, right: 0, bottom: 0 }
  ngOnInit(): void {
    // items.push(
    //   new OrgItemConfig({
    //     id: 14,
    //     parent: 0,
    //     title: 'Assistant 4',
    //     description: 'Assistant Description',
    //     itemType: ItemType.Assistant,
    //     adviserPlacementType: AdviserPlacementType.Left,
    //     groupTitle: 'Audit',
    //     groupTitleColor: Colors.Olive,
    //     levelOffset: 1,
    //   })
    // );
    var annotations = [
      new LevelAnnotationConfig({
        annotationType: AnnotationType.Level,
        levels: [0],
        title: 'CEO',
        titleColor: Colors.RoyalBlue,
        offset: new Thickness(0, 0, 0, -1),
        lineWidth: new Thickness(0, 0, 0, 0),
        opacity: 0,
        borderColor: Colors.Gray,
        fillColor: Colors.Gray,
        lineType: LineType.Dotted,
      }),
      new LevelAnnotationConfig({
        annotationType: AnnotationType.Level,
        levels: [1],
        title: 'Children 1',
        titleColor: Colors.RoyalBlue,
        offset: new Thickness(0, 0, 0, -1),
        lineWidth: new Thickness(0, 0, 0, 0),
        opacity: 0.08,
        borderColor: Colors.Gray,
        fillColor: Colors.Gray,
        lineType: LineType.Dotted,
      }),
      new LevelAnnotationConfig({
        annotationType: AnnotationType.Level,
        levels: [2],
        title: 'Children 2',
        titleColor: Colors.RoyalBlue,
        offset: new Thickness(0, 0, 0, -1),
        lineWidth: new Thickness(0, 0, 0, 0),
        opacity: 0,
        borderColor: Colors.Gray,
        fillColor: Colors.Gray,
        lineType: LineType.Dotted,
      }),
      new LevelAnnotationConfig({
        annotationType: AnnotationType.Level,
        levels: [3],
        title: 'Members',
        titleColor: Colors.RoyalBlue,
        offset: new Thickness(0, 0, 0, -1),
        lineWidth: new Thickness(0, 0, 0, 0),
        opacity: 0.08,
        borderColor: Colors.Gray,
        fillColor: Colors.Gray,
        lineType: LineType.Dotted,
      }),
    ];
    // this.items = items;
    // this.annotations = annotations;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orgUnitID.currentValue != changes.orgUnitID.previousValue) {
      if (this.orgUnitID) {
        //Function get new orgchart
        this.getDataPositionByID(this.orgUnitID);
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

  // // click moreFC
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
