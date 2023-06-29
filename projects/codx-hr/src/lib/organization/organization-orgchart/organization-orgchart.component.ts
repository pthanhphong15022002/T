import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
  ViewChild,
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
// import {
//   OrgItemConfig,
//   Enabled,
//   PageFitMode,
//   Colors,
//   AnnotationType,
//   Thickness,
//   LineType,
//   AdviserPlacementType,
//   ItemType,
//   ChildrenPlacementType,
//   GroupByType,
//   LevelAnnotationConfig,
// } from 'ngx-basic-primitives';
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
  // PageFitMode = PageFitMode;
  // Enabled = Enabled;
  // ChildrenPlacementType = ChildrenPlacementType;
  // GroupByType = GroupByType;
  // items: Array<OrgItemConfig> = [];
  // annotations: Array<LevelAnnotationConfig> = [];

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
            this.dataSource = this.newDataManager(res);
          }
        });
    }
  }

  ngOnInit(): void {
    // var items: Array<OrgItemConfig> = [];
    // var rootItem = new OrgItemConfig({
    //   id: 0,
    //   parent: null,
    //   title: 'Title A',
    //   description: 'Description A',
    //   // //image: './assets/photos/a.png',
    //   // childrenPlacementType: ChildrenPlacementType.Vertical,
    // });
    // items.push(rootItem);
    // items.push(
    //   new OrgItemConfig({
    //     id: 1,
    //     parent: 0,
    //     title: 'Assistant 1',
    //     description: 'Assistant Description',
    //     //image: './assets/photos/a.png',
    //     itemType: ItemType.Assistant,
    //     adviserPlacementType: AdviserPlacementType.Right,
    //     groupTitle: 'Audit',
    //     groupTitleColor: Colors.Olive,
    //     levelOffset: 0,
    //   })
    // );
    // items.push(
    //   new OrgItemConfig({
    //     id: 2,
    //     parent: 0,
    //     title: 'Assistant 2',
    //     description: 'Assistant Description',
    //     //image: './assets/photos/b.png',
    //     itemType: ItemType.Assistant,
    //     adviserPlacementType: AdviserPlacementType.Left,
    //     groupTitle: 'Audit',
    //     groupTitleColor: Colors.Olive,
    //     levelOffset: 0,
    //   })
    // );
    // items.push(
    //   new OrgItemConfig({
    //     id: 13,
    //     parent: 0,
    //     title: 'Assistant 3',
    //     description: 'Assistant Description',
    //     //image: './assets/photos/c.png',
    //     itemType: ItemType.Assistant,
    //     adviserPlacementType: AdviserPlacementType.Right,
    //     groupTitle: 'Audit',
    //     groupTitleColor: Colors.Olive,
    //     levelOffset: 1,
    //   })
    // );
    // for (var index = 3; index <= 10; index += 2) {
    //   items.push(
    //     new OrgItemConfig({
    //       id: index,
    //       parent: 1,
    //       title: 'Sub Adviser 11',
    //       description: 'Sub Adviser Description',
    //       //image: './assets/photos/s.png',
    //       itemType: ItemType.SubAdviser,
    //       adviserPlacementType: AdviserPlacementType.Left,
    //       groupTitle: 'Sub Adviser',
    //       groupTitleColor: Colors.Red,
    //     })
    //   );
    //   items.push(
    //     new OrgItemConfig({
    //       id: index + 1,
    //       parent: 2,
    //       title: 'Sub Adviser 22',
    //       description: 'Sub Adviser Description',
    //       //image: './assets/photos/s.png',
    //       itemType: ItemType.SubAdviser,
    //       adviserPlacementType: AdviserPlacementType.Right,
    //       groupTitle: 'Sub Adviser',
    //       groupTitleColor: Colors.Red,
    //     })
    //   );
    //   items.push(
    //     new OrgItemConfig({
    //       id: index + 2,
    //       parent: 3,
    //       title: 'Sub Adviser 33',
    //       description: 'Sub Adviser Description',
    //       //image: './assets/photos/s.png',
    //       itemType: ItemType.SubAdviser,
    //       adviserPlacementType: AdviserPlacementType.Left,
    //       groupTitle: 'Sub Adviser',
    //       groupTitleColor: Colors.Red,
    //     })
    //   );
    // }
    // items.push(
    //   new OrgItemConfig({
    //     id: 14,
    //     parent: 0,
    //     title: 'Assistant 4',
    //     description: 'Assistant Description',
    //     //image: './assets/photos/d.png',
    //     itemType: ItemType.Assistant,
    //     adviserPlacementType: AdviserPlacementType.Left,
    //     groupTitle: 'Audit',
    //     groupTitleColor: Colors.Olive,
    //     levelOffset: 1,
    //   })
    // );
    // var annotations = [
    //   new LevelAnnotationConfig({
    //     annotationType: AnnotationType.Level,
    //     levels: [0],
    //     title: 'CEO',
    //     titleColor: Colors.RoyalBlue,
    //     offset: new Thickness(0, 0, 0, -1),
    //     lineWidth: new Thickness(0, 0, 0, 0),
    //     opacity: 0,
    //     borderColor: Colors.Gray,
    //     fillColor: Colors.Gray,
    //     lineType: LineType.Dotted,
    //   }),
    //   new LevelAnnotationConfig({
    //     annotationType: AnnotationType.Level,
    //     levels: [1],
    //     title: 'Children 1',
    //     titleColor: Colors.RoyalBlue,
    //     offset: new Thickness(0, 0, 0, -1),
    //     lineWidth: new Thickness(0, 0, 0, 0),
    //     opacity: 0.08,
    //     borderColor: Colors.Gray,
    //     fillColor: Colors.Gray,
    //     lineType: LineType.Dotted,
    //   }),
    //   new LevelAnnotationConfig({
    //     annotationType: AnnotationType.Level,
    //     levels: [2],
    //     title: 'Children 2',
    //     titleColor: Colors.RoyalBlue,
    //     offset: new Thickness(0, 0, 0, -1),
    //     lineWidth: new Thickness(0, 0, 0, 0),
    //     opacity: 0,
    //     borderColor: Colors.Gray,
    //     fillColor: Colors.Gray,
    //     lineType: LineType.Dotted,
    //   }),
    //   new LevelAnnotationConfig({
    //     annotationType: AnnotationType.Level,
    //     levels: [3],
    //     title: 'Members',
    //     titleColor: Colors.RoyalBlue,
    //     offset: new Thickness(0, 0, 0, -1),
    //     lineWidth: new Thickness(0, 0, 0, 0),
    //     opacity: 0.08,
    //     borderColor: Colors.Gray,
    //     fillColor: Colors.Gray,
    //     lineType: LineType.Dotted,
    //   }),
    // ];
    // this.items = items;
    // this.annotations = annotations;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orgUnitID.currentValue != changes.orgUnitID.previousValue) {
      if (this.orgUnitID) {
        //Function get new orgchart
        // this.getDataPositionByID(this.orgUnitID);

        //Function get olg orgchart
        this.dataService.setPredicates([], [this.orgUnitID], (res) => {
          if (res) {
            res.forEach((x) => {
              if (x.orgUnitID === this.orgUnitID) {
                x.parentID = '';
                return;
              }
            });
          }
          this.dataSource = this.newDataManager(res);
        });
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
