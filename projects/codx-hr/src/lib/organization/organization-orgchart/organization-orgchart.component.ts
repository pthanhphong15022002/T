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
  VerticalAlignmentType,
  HorizontalAlignmentType,
  Visibility,
  SelectionPathMode,
  ShapeType,
  LineType,
  ElbowType,
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
  VerticalAlignment = VerticalAlignmentType;
  HorizontalAlignmentType = HorizontalAlignmentType;
  LeavesPlacementType = ChildrenPlacementType;
  Visibility = Visibility;
  SelectionPathMode = SelectionPathMode;
  HasButtons = Enabled;
  HasSelectorCheckbox = Enabled;
  MinimizedItemShapeType = ShapeType;
  MinimizedItemLineType = LineType;
  ArrowsDirection = GroupByType;
  ElbowType = ElbowType;
  items: Array<OrgItemConfig> = [];

  dataVll: [];
  //Variable diagram
  pagefit: any;
  orientationType: any;
  childrenPlacementType: any;
  verticalAlignment: any;
  horizontalAlignment: any;
  leavesPlacementType: any;
  minimalVisibility: any;
  selectionPathMode: any;
  hasButtons: any;
  minimizedItemShapeType: any;
  minimizedItemLineType: any;
  arrowsDirection: any;
  connectorType: any;
  elbowType: any;
  hasSelectorCheckbox: any = Enabled.False;
  alignBranches: boolean = false;
  placeAdviserAbove: boolean = false;
  placeAssitantAbove: boolean = false;
  maximumColumnsInMatrix: number;
  minimumVisibleLevels: number;
  markerWidth: number;
  markerHeight: number;
  minimizedItemCornerRadius: number;
  selectCheckBoxLabel: string;
  hightlightleft: number;
  hightlightTop: number;
  hightlightRight: number;
  hightlightBottom: number;
  minimizedItemLineWidth: number;
  minimizedItemOpacity: number;
  normalLevelShift: number;
  dotLevelShift: number;
  lineLevelShift: number;
  normalItemsInterval: number;
  dotItemsInterval: number = 30;
  lineItemsInterval: number;
  cousinsIntervalMultiplier: number;
  paddingIntervalLeft: number;
  paddingIntervalTop: number;
  paddingIntervalRight: number;
  paddingIntervalBottom: number;
  @ViewChild('contactTemplate') contactTemplate: TemplateRef<any>;

  //Popup Settings
  dialogEditStatus: any;
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  collapsed: boolean[] = [];

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

    switch (target) {
      case 'pageFitModeNone':
        this.pagefit = this.PageFitMode.None;
        break;
      case 'pageFitModeWidth':
        this.pagefit = this.PageFitMode.PageWidth;
        break;
      case 'pageFitModeHeight':
        this.pagefit = this.PageFitMode.PageHeight;
        break;
      case 'pageFitModeFit':
        this.pagefit = this.PageFitMode.FitToPage;
        break;
      case 'pageFitModeSelect':
        this.pagefit = this.PageFitMode.SelectionOnly;
        break;

      //Orientation
      case 'orientationTop':
        this.orientationType = this.OrientationType.Top;
        break;
      case 'orientationBottom':
        this.orientationType = this.OrientationType.Bottom;
        break;
      case 'orientationLeft':
        this.orientationType = this.OrientationType.Left;
        break;
      case 'orientationRight':
        this.orientationType = this.OrientationType.Right;
        break;
      case 'orientationNone':
        this.orientationType = this.OrientationType.None;
        break;

      //PlacementType children
      case 'childrenPlacementAuto':
        this.childrenPlacementType = this.ChildrenPlacementType.Auto;
        break;
      case 'childrenPlacementVertical':
        this.childrenPlacementType = this.ChildrenPlacementType.Vertical;
        break;
      case 'childrenPlacementHorizontal':
        this.childrenPlacementType = this.ChildrenPlacementType.Horizontal;
        break;
      case 'childrenPlacementMatrix':
        this.childrenPlacementType = this.ChildrenPlacementType.Matrix;
        break;

      //Hạng mục căn dọc
      case 'itemVerticalTop':
        this.verticalAlignment = this.VerticalAlignment.Top;
        break;
      case 'itemVerticalMiddle':
        this.verticalAlignment = this.VerticalAlignment.Middle;
        break;
      case 'itemVerticalBottom':
        this.verticalAlignment = this.VerticalAlignment.Bottom;
        break;

      //Hạng mục căn ngang
      case 'horizontalAlignmentCenter':
        this.horizontalAlignment = this.HorizontalAlignmentType.Center;
        break;
      case 'horizontalAlignmentleft':
        this.horizontalAlignment = this.HorizontalAlignmentType.Left;
        break;
      case 'horizontalAlignmentRight':
        this.horizontalAlignment = this.HorizontalAlignmentType.Right;
        break;

      case 'crossBranch':
        this.alignBranches = e.target.checked;
        break;

      //Hạng mục lá con
      case 'leavesPlaceAuto':
        this.leavesPlacementType = this.LeavesPlacementType.Auto;
        break;
      case 'leavesPlaceVertical':
        this.leavesPlacementType = this.LeavesPlacementType.Vertical;
        break;
      case 'leavesPlaceHorizontal':
        this.leavesPlacementType = this.LeavesPlacementType.Horizontal;
        break;
      case 'leavesPlaceMatrix':
        this.leavesPlacementType = this.LeavesPlacementType.Matrix;
        break;

      case 'placeAdviserAbove':
        this.placeAdviserAbove = e.target.checked;
        break;
      case 'placeAssitantAbove':
        this.placeAssitantAbove = e.target.checked;
        break;

      case 'columnMatrix':
        this.maximumColumnsInMatrix = parseInt(e.target.value);
        break;

      //Khả năng hiển thị tối thiểu
      case 'minimalNodeAuto':
        this.minimalVisibility = this.Visibility.Auto;
        break;
      case 'minimalNodeNormal':
        this.minimalVisibility = this.Visibility.Normal;
        break;
      case 'minimalNodeDot':
        this.minimalVisibility = this.Visibility.Dot;
        break;
      case 'minimalNodeLine':
        this.minimalVisibility = this.Visibility.Line;
        break;
      case 'minimalNodeInvisible':
        this.minimalVisibility = this.Visibility.Invisible;
        break;

      //Mức nhìn thấy tối thiểu
      case 'minimumVisible':
        this.minimumVisibleLevels = parseInt(e.target.value);
        break;

      //Chế độ đường dẫn
      case 'selectPathMode':
        this.selectionPathMode = this.SelectionPathMode.None;
        break;
      case 'selectPathModeFullStack':
        this.selectionPathMode = this.SelectionPathMode.FullStack;
        break;

      //Nút người dùng
      case 'buttonUserAuto':
        this.hasButtons = this.HasButtons.Auto;
        break;
      case 'buttonUserTrue':
        this.hasButtons = this.HasButtons.True;
        break;
      case 'buttonUserFalse':
        this.hasButtons = this.HasButtons.False;
        break;

      //Nút chọn
      case 'selectionCheckboxAuto':
        this.hasSelectorCheckbox = this.HasSelectorCheckbox.Auto;
        break;
      case 'selectionCheckboxTrue':
        this.hasSelectorCheckbox = this.HasSelectorCheckbox.True;
        break;
      case 'selectionCheckboxFalse':
        this.hasSelectorCheckbox = this.HasSelectorCheckbox.False;
        break;

      case 'selectCheckBoxLabelText':
        this.selectCheckBoxLabel = e.target.value;
        break;

      //Kích cỡ đánh dấu
      case 'markerWidth':
        this.markerWidth = parseInt(e.target.value);
        break;
      case 'markerHeight':
        this.markerHeight = parseInt(e.target.value);
        break;

      //Bán kính gó
      case 'cornerRadius':
        this.minimizedItemCornerRadius = parseInt(e.target.value);
        break;

      //Đánh dấu đường viền xung quanh
      case 'highlightPaddingLeft':
        this.hightlightleft = parseInt(e.target.value);
        break;
      case 'highlightPaddingTop':
        this.hightlightTop = parseInt(e.target.value);
        break;
      case 'highlightPaddingRight':
        this.hightlightRight = parseInt(e.target.value);
        break;
      case 'highlightPaddingBottom':
        this.hightlightBottom = parseInt(e.target.value);
        break;

      //Hình dạng đánh dấu
      case 'rectangle':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.Rectangle;
        break;
      case 'oval':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.Oval;
        break;
      case 'triangle':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.Triangle;
        break;
      case 'crossout':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.CrossOut;
        break;
      case 'circle':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.Circle;
        break;
      case 'rhombus':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.Rhombus;
        break;
      case 'wedge':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.Wedge;
        break;
      case 'frameoval':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.FramedOval;
        break;
      case 'frametriangle':
        this.minimizedItemShapeType =
          this.MinimizedItemShapeType.FramedTriangle;
        break;
      case 'framewedge':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.FramedWedge;
        break;
      case 'frameRhombus':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.FramedRhombus;
        break;
      case 'shapeNone':
        this.minimizedItemShapeType = this.MinimizedItemShapeType.None;
        break;

      case 'borderLineWidth':
        this.minimizedItemLineWidth = parseInt(e.target.value);
        break;

      //Loại đường viền đánh dấu
      case 'borderMarkerSolid':
        this.minimizedItemLineType = this.MinimizedItemLineType.Solid;
        break;
      case 'borderMarkerDot':
        this.minimizedItemLineType = this.MinimizedItemLineType.Dotted;
        break;
      case 'borderMarkerDash':
        this.minimizedItemLineType = this.MinimizedItemLineType.Dashed;
        break;

      //Độ trong suốt
      case 'opacityMarker':
        this.minimizedItemOpacity = parseFloat(e.target.value);
        break;

      //Khoảng cách dọc giữa các hàng
      case 'verticalBetweenNormal':
        this.normalLevelShift = parseInt(e.target.value);
        break;
      case 'verticalBetweenDot':
        this.dotLevelShift = parseInt(e.target.value);
        break;
      case 'verticalBetweenLine':
        this.lineLevelShift = parseInt(e.target.value);
        break;

      //Khoảng cách ngang giữa các hàng
      case 'horizontalBetweenNormal':
        this.normalItemsInterval = parseInt(e.target.value);
        break;
      case 'horizontalBetweenDot':
        this.dotItemsInterval = parseInt(e.target.value);
        break;
      case 'horizontaletweenLine':
        this.lineItemsInterval = parseInt(e.target.value);
        break;

      // Không gian giữa các hệ thống phân cấp
      case 'cousinInterval':
        this.cousinsIntervalMultiplier = parseInt(e.target.value);
        break;

      // Tăng khoảng cách
      case 'paddingIntervalLeft':
        this.paddingIntervalLeft = parseInt(e.target.value);
        break;
      case 'paddingIntervalTop':
        this.paddingIntervalTop = parseInt(e.target.value);
        break;
      case 'paddingIntervalRight':
        this.paddingIntervalRight = parseInt(e.target.value);
        break;
      case 'paddingIntervalBottom':
        this.paddingIntervalBottom = parseInt(e.target.value);
        break;

      //Hướng mũi tên
      case 'arrowDirectionNone':
        this.arrowsDirection = this.ArrowsDirection.None;
        break;
      case 'arrowDirectionParent':
        this.arrowsDirection = this.ArrowsDirection.Parents;
        break;
      case 'arrowDirectionChildren':
        this.arrowsDirection = this.ArrowsDirection.Children;
        break;

      //Kết nối
      case 'connectorsSquare':
        this.connectorType = this.ConnectorType.Squared;
        break;
      case 'connectorsAngular':
        this.connectorType = this.ConnectorType.Angular;
        break;
      case 'connectorsCurved':
        this.connectorType = this.ConnectorType.Curved;
        break;

      //Loại gập
      case 'elbowsNone':
        this.elbowType = this.ElbowType.None;
        break;
      case 'elbowsDot':
        this.elbowType = this.ElbowType.Dot;
        break;
      case 'elbowsBevel':
        this.elbowType = this.ElbowType.Bevel;
        break;
      case 'elbowsRound':
        this.elbowType = this.ElbowType.Round;
        break;
      default:
      // code block
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
