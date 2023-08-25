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
  ElementRef,
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
  TextOrientationType,
  PlacementType,
} from 'ngx-basic-primitives';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CRUDService,
  DataRequest,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { PopupAddOrganizationComponent } from '../popup-add-organization/popup-add-organization.component';
import { CodxHrService } from '../../codx-hr.service';
import { DataVll } from '../../model/HR_OrgChart.model';

@Component({
  selector: 'hr-organization-orgchart',
  templateUrl: './organization-orgchart.component.html',
  styleUrls: ['./organization-orgchart.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationOrgchartComponent {
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
  LinesType = LineType;
  ShowLabels = Enabled;
  LabelOrientation = TextOrientationType;
  LabelPlacement = PlacementType;
  items: Array<OrgItemConfig> = [];

  dataVll: Array<DataVll>;
  //Variable diagram
  pagefit: any = PageFitMode.FitToPage;
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
  linesType: any;
  labelOrientation: any;
  labelPlacement: any;
  navigationMode: any;
  showLabels: any = Enabled.False;
  hasSelectorCheckbox: any = Enabled.False;
  alignBranches: boolean = false;
  placeAdviserAbove: boolean = false;
  placeAssitantAbove: boolean = false;
  showFrame: boolean = false;
  maximumColumnsInMatrix: number;
  minimumVisibleLevels: number;
  markerWidth: number = 40;
  markerHeight: number = 40;
  minimizedItemCornerRadius: number;
  selectCheckBoxLabel: string;
  hightlightleft: number;
  hightlightTop: number;
  hightlightRight: number;
  hightlightBottom: number;
  minimizedItemLineWidth: number;
  minimizedItemOpacity: number;
  normalLevelShift: number = 50;
  dotLevelShift: number = 30;
  lineLevelShift: number;
  normalItemsInterval: number = 40;
  dotItemsInterval: number = 30;
  lineItemsInterval: number;
  cousinsIntervalMultiplier: number;
  paddingIntervalLeft: number;
  paddingIntervalTop: number;
  paddingIntervalRight: number;
  paddingIntervalBottom: number;
  bevelSize: number;
  elbowDotSize: number;
  lineWidth: number;
  widthTitle: number;
  heightTitle: number;
  labelOffset: number;
  frameLeft: number;
  frameTop: number;
  frameRight: number;
  frameBottom: number;
  frameoutLeft: number;
  frameoutTop: number;
  frameoutRight: number;
  frameoutBottom: number;
  linesColor: string = '#000';
  labelFontSize: string;
  labelFontFamily: string;
  labelColor: string;
  labelFontWeight: string;
  disableActive: boolean = false;
  disableEdit: boolean = true;
  treeLevel = [
    { name: '1 Cấp', value: '0' },
    { name: '2 Cấp', value: '1' },
    { name: '3 Cấp', value: '2' },
    { name: 'Tất cả', value: '10' },
  ];
  @ViewChild('contactTemplate') contactTemplate: TemplateRef<any>;
  @Output() newIdItem = new EventEmitter<string>();

  //Popup Settings
  dialogEditStatus: any;
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;

  @ViewChild('input') input: ElementRef;
  // @ViewChild('diagram1') diagram1: ElementRef;
  collapsed: boolean[] = [];
  dataTree: any = {};

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
  cursorItem: number | string = '';

  @Input() formModel: FormModel;
  @Input() orgUnitID: string = '';
  @Input() itemAdded;
  @Input() formModelEmployee;
  @Input() view: ViewsComponent;
  @Input() dataService: CRUDService = null;
  @Output() clickMFunction = new EventEmitter();

  scaleNumber: number = 0.7;
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
  level: number;
  isPopUpManager: boolean = false;
  idHover: string;
  user: any;

  stylesObjChart = {
    border: '3px solid #03a9f4',
    position: 'relative',
    height: '100%',
    background: '#fff',
  };

  stylesObjChartActiveNoManager = {
    border: '3px solid #03a9f4',
    position: 'relative',
    height: 'max-content',
    background: '#fff',
  };
  stylesObjChartNone = {
    border: '1px ridge gray',
    position: 'relative',
    height: '100%',
    background: '#fff',
  };
  stylesObjChartNoneIsManager = {
    border: '1px ridge gray',
    position: 'relative',
    height: 'max-content',
    background: '#fff',
  };

  @ViewChild('diagram') diagram: any;
  constructor(
    private authStore: AuthStore,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callFC: CallFuncService,
    private cacheService: CacheService,
    private hrService: CodxHrService,
    private notify: NotificationsService
  ) {
    this.user = this.authStore.get();
  }

  showVal(value) {
    this.scaleNumber = parseInt(value) / 100;
  }

  //Settings
  changeMode(e) {
    var target = e?.target?.id ?? e;
    if (e?.target?.id) {
      this.disableEdit = false;
    }
    switch (target) {
      case 'pageFitModeNone':
        this.pagefit = this.PageFitMode.None;
        this.dataTree.pagefit = 'pageFitModeNone';
        break;
      case 'pageFitModeWidth':
        this.pagefit = this.PageFitMode.PageWidth;
        this.dataTree.pagefit = 'pageFitModeWidth';
        break;
      case 'pageFitModeHeight':
        this.pagefit = this.PageFitMode.PageHeight;
        this.dataTree.pagefit = 'pageFitModeHeight';
        break;
      case 'pageFitModeFit':
        this.pagefit = this.PageFitMode.FitToPage;
        this.dataTree.pagefit = 'pageFitModeFit';
        break;

      //Orientation
      case 'orientationTop':
        this.orientationType = this.OrientationType.Top;
        this.dataTree.orientationType = 'orientationTop';
        break;
      case 'orientationBottom':
        this.orientationType = this.OrientationType.Bottom;
        this.dataTree.orientationType = 'orientationBottom';
        break;
      case 'orientationLeft':
        this.orientationType = this.OrientationType.Left;
        this.dataTree.orientationType = 'orientationLeft';
        break;
      case 'orientationRight':
        this.orientationType = this.OrientationType.Right;
        this.dataTree.orientationType = 'orientationRight';
        break;
      case 'orientationNone':
        this.orientationType = this.OrientationType.None;
        this.dataTree.orientationType = 'orientationNone';
        break;

      //PlacementType children
      case 'childrenPlacementAuto':
        this.childrenPlacementType = this.ChildrenPlacementType.Auto;
        this.dataTree.childrenPlacementType = 'childrenPlacementAuto';
        break;
      case 'childrenPlacementVertical':
        this.childrenPlacementType = this.ChildrenPlacementType.Vertical;
        this.dataTree.childrenPlacementType = 'childrenPlacementVertical';
        break;
      case 'childrenPlacementHorizontal':
        this.childrenPlacementType = this.ChildrenPlacementType.Horizontal;
        this.dataTree.childrenPlacementType = 'childrenPlacementHorizontal';
        break;
      case 'childrenPlacementMatrix':
        this.childrenPlacementType = this.ChildrenPlacementType.Matrix;
        this.dataTree.childrenPlacementType = 'childrenPlacementMatrix';
        break;

      //Hạng mục căn dọc
      case 'itemVerticalTop':
        this.verticalAlignment = this.VerticalAlignment.Top;
        //this.dataTree.verticalAlignment = 'itemVerticalTop';
        break;
      case 'itemVerticalMiddle':
        this.verticalAlignment = this.VerticalAlignment.Middle;
        //this.dataTree.verticalAlignment = 'itemVerticalMiddle';
        break;
      case 'itemVerticalBottom':
        this.verticalAlignment = this.VerticalAlignment.Bottom;
        //this.dataTree.verticalAlignment = 'itemVerticalBottom';
        break;

      //Hạng mục căn ngang
      case 'horizontalAlignmentCenter':
        this.horizontalAlignment = this.HorizontalAlignmentType.Center;
        //this.dataTree.horizontalAlignment = 'horizontalAlignmentCenter';
        break;
      case 'horizontalAlignmentleft':
        this.horizontalAlignment = this.HorizontalAlignmentType.Left;
        //this.dataTree.horizontalAlignment = 'horizontalAlignmentleft';
        break;
      case 'horizontalAlignmentRight':
        this.horizontalAlignment = this.HorizontalAlignmentType.Right;
        //this.dataTree.horizontalAlignment = 'horizontalAlignmentRight';
        break;

      case 'crossBranch':
        this.alignBranches = e.target.checked;
        //this.dataTree.alignBranches = 'crossBranch';
        break;

      //Hạng mục lá con
      case 'leavesPlaceAuto':
        this.leavesPlacementType = this.LeavesPlacementType.Auto;
        //this.dataTree.leavesPlacementType = 'leavesPlaceAuto';
        break;
      case 'leavesPlaceVertical':
        this.leavesPlacementType = this.LeavesPlacementType.Vertical;
        //this.dataTree.leavesPlacementType = 'leavesPlaceVertical';
        break;
      case 'leavesPlaceHorizontal':
        this.leavesPlacementType = this.LeavesPlacementType.Horizontal;
        //this.dataTree.leavesPlacementType = 'leavesPlaceHorizontal';
        break;
      case 'leavesPlaceMatrix':
        this.leavesPlacementType = this.LeavesPlacementType.Matrix;
        //this.dataTree.leavesPlacementType = 'leavesPlaceMatrix';
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
      // itemSize: { width: 170, height: 150 },

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

      case 'bevelSize':
        this.bevelSize = parseInt(e.target.value);
        break;
      case 'elbowDotSize':
        this.elbowDotSize = parseInt(e.target.value);
        break;

      //Loại đường kẻ
      case 'linesTypeSolid':
        this.linesType = this.LinesType.Solid;
        break;
      case 'linesTypeDot':
        this.linesType = this.LinesType.Dotted;
        break;
      case 'linesTypeDash':
        this.linesType = this.LinesType.Dashed;
        break;

      case 'linesColor':
        this.linesColor = e.target.value;
        break;

      case 'lineWidth':
        this.lineWidth = parseInt(e.target.value);
        break;

      //Hiển thị tiêu đề
      case 'showLabelAuto':
        this.showLabels = this.ShowLabels.Auto;
        break;
      case 'showLabelTrue':
        this.showLabels = this.ShowLabels.True;
        break;
      case 'showLabelFalse':
        this.showLabels = this.ShowLabels.False;
        break;
      case 'widthTitle':
        this.widthTitle = parseInt(e.target.value);
        break;
      case 'heightTitle':
        this.heightTitle = parseInt(e.target.value);
        break;
      case 'offsetTitle':
        this.labelOffset = parseInt(e.target.value);
        break;

      //Định hướng tiêu đề
      case 'labelHorizontal':
        this.labelOrientation = this.LabelOrientation.Horizontal;
        break;
      case 'labelLeft':
        this.labelOrientation = this.LabelOrientation.RotateLeft;
        break;
      case 'labelRight':
        this.labelOrientation = this.LabelOrientation.RotateRight;
        break;
      case 'labelAuto':
        this.labelOrientation = this.LabelOrientation.Auto;
        break;

      //Vị trí tiêu đề
      case 'labelAuto':
        this.labelPlacement = this.LabelPlacement.Auto;
        break;
      case 'placeLeft':
        this.labelPlacement = this.LabelPlacement.TopLeft;
        break;
      case 'placeTop':
        this.labelPlacement = this.LabelPlacement.Top;
        break;
      case 'placeTopRight':
        this.labelPlacement = this.LabelPlacement.TopRight;
        break;
      case 'placeRightTop':
        this.labelPlacement = this.LabelPlacement.RightTop;
        break;
      case 'placeRight':
        this.labelPlacement = this.LabelPlacement.Right;
        break;
      case 'placeRightBottom':
        this.labelPlacement = this.LabelPlacement.RightBottom;
        break;
      case 'placeBottomRight':
        this.labelPlacement = this.LabelPlacement.BottomRight;
        break;
      case 'placeBottom':
        this.labelPlacement = this.LabelPlacement.Bottom;
        break;
      case 'placeBottomLeft':
        this.labelPlacement = this.LabelPlacement.BottomLeft;
        break;
      case 'placeLeftBottom':
        this.labelPlacement = this.LabelPlacement.LeftBottom;
        break;
      case 'placeLeft':
        this.labelPlacement = this.LabelPlacement.Left;
        break;
      case 'placeLeftTop':
        this.labelPlacement = this.LabelPlacement.LeftTop;
        break;

      case 'labelFontSize':
        this.labelFontSize = e.target.value;
        break;
      case 'labelFontFamily':
        this.labelFontFamily = e.target.value;
        break;
      case 'labelFontWeight':
        this.labelFontWeight = e.target.value;
        break;

      //Sử dụng tùy chọn này để tắt đánh dấu chuột
      case 'navigationModeDefault':
        this.navigationMode = this.NavigationMode.Default;
        break;
      case 'navigationModeCursor':
        this.navigationMode = this.NavigationMode.CursorOnly;
        break;
      case 'navigationModeHightlight':
        this.navigationMode = this.NavigationMode.HighlightOnly;
        break;
      case 'navigationModeInactive':
        this.navigationMode = this.NavigationMode.Inactive;
        break;

      //Hiển thị khung bao quanh
      case 'frameCheck':
        this.showFrame = e.target.checked;
        break;

      //Tăng khoảng cách bên trong
      case 'frameLeft':
        this.frameLeft = parseInt(e.target.value);
        break;
      case 'frameTop':
        this.frameTop = parseInt(e.target.value);
        break;
      case 'frameRight':
        this.frameRight = parseInt(e.target.value);
        break;
      case 'frameBottom':
        this.frameBottom = parseInt(e.target.value);
        break;
      //Tăng khoảng cách bên ngoài
      case 'frameoutLeft':
        this.frameoutLeft = parseInt(e.target.value);
        break;
      case 'frameoutTop':
        this.frameoutTop = parseInt(e.target.value);
        break;
      case 'frameoutRight':
        this.frameoutRight = parseInt(e.target.value);
        break;
      case 'frameoutBottom':
        this.frameoutBottom = parseInt(e.target.value);
        break;

      //Get orgunit
      case 'isOrgUnitID':
        this.dataTree.isOrgUnitID = e.target.checked;

        if (this.dataTree.isOrgUnitID === true) {
          this.getEmployeeInfoById(this.user.userID);
        }

        this.hrService
          .SaveSettingValue('HRParameters', '1', this.dataTree)
          .subscribe((res: any) => {
            if (res) {
              this.notify.notifyCode('SYS007');
            }
          });
        break;
      default:
        break;
    }
  }

  // onScale(data: number): void {
  //   this.scaleNumber = data;
  // }

  onMouseWheel(evt) {
    if (evt.ctrlKey) {
      evt.preventDefault();
      if (evt.deltaY > 0) {
        if (this.scaleNumber > 0.3) {
          this.scaleNumber = this.scaleNumber - 0.1;
        }
      } else {
        if (this.scaleNumber < 1) {
          this.scaleNumber = this.scaleNumber + 0.1;
        }
      }
    }
  }

  clearSetting() {
    this.pagefit = this.PageFitMode.FitToPage;
    this.orientationType = this.OrientationType.Top;
    this.childrenPlacementType = this.ChildrenPlacementType.Horizontal;

    this.verticalAlignment = '';
    this.horizontalAlignment = '';
    this.alignBranches = false;
    this.leavesPlacementType = '';
    this.placeAssitantAbove = false;
    this.maximumColumnsInMatrix = 1;
    this.minimalVisibility = '';
    this.minimumVisibleLevels = 1;
    this.selectionPathMode = '';
    this.hasButtons = '';
    this.hasSelectorCheckbox = this.HasSelectorCheckbox.False;
    this.selectCheckBoxLabel = '';
    this.markerHeight = 1;
    this.minimizedItemOpacity = 1;
    this.hightlightBottom = 1;
    this.minimizedItemShapeType = '';
    this.minimizedItemLineType = '';
    this.minimizedItemCornerRadius = 10;
    this.normalLevelShift = 50;
    this.minimizedItemLineWidth = 2;
    this.dotLevelShift = 30;
    this.lineLevelShift = 1;
    this.normalItemsInterval = 1;
    this.dotItemsInterval = 30;
    this.lineItemsInterval = 30;
    this.cousinsIntervalMultiplier = 5;
    this.paddingIntervalLeft = 1;
    this.paddingIntervalTop = 1;
    this.paddingIntervalRight = 1;
    this.paddingIntervalBottom = 1;
    this.arrowsDirection = '';
    this.connectorType = '';
    this.elbowType = '';
    this.bevelSize = 1;
    this.elbowDotSize = 1;
    this.linesType = '';
    this.linesColor = '#000';
    this.lineWidth = 1;
    this.labelOrientation = '';
    this.labelPlacement = '';
    this.labelFontSize = '';
    this.labelFontFamily = '';
    this.labelFontWeight = '';
    this.navigationMode = '';
    this.showFrame = false;
    this.frameLeft = 1;
    this.frameTop = 1;
    this.frameRight = 1;
    this.frameBottom = 1;
    this.frameoutLeft = 1;
    this.frameoutTop = 1;
    this.frameoutRight = 1;
    this.frameoutBottom = 1;

    //Clear under database
    this.dataTree.pagefit = 'pageFitModeFit';
    this.dataTree.orientationType = 'orientationTop';
    this.dataTree.childrenPlacementType = 'childrenPlacementHorizontal';

    this.dataTree.verticalAlignment = '';
    this.dataTree.horizontalAlignment = '';
    this.dataTree.alignBranches = false;
    this.dataTree.leavesPlacementType = '';
    this.dataTree.placeAssitantAbove = false;
    this.dataTree.maximumColumnsInMatrix = 1;
    this.dataTree.minimalVisibility = '';
    this.dataTree.minimumVisibleLevels = 1;
    this.dataTree.selectionPathMode = '';
    this.dataTree.hasButtons = '';
    this.dataTree.hasSelectorCheckbox = 'selectionCheckboxFalse';
    this.dataTree.selectCheckBoxLabel = '';
    this.dataTree.markerHeight = 1;
    this.dataTree.minimizedItemOpacity = 1;
    this.dataTree.hightlightBottom = 1;
    this.dataTree.minimizedItemShapeType = '';
    this.dataTree.minimizedItemLineType = '';
    this.dataTree.minimizedItemCornerRadius = 10;
    this.dataTree.normalLevelShift = 50;
    this.dataTree.minimizedItemLineWidth = 2;
    this.dataTree.dotLevelShift = 30;
    this.dataTree.lineLevelShift = 1;
    this.dataTree.normalItemsInterval = 1;
    this.dataTree.dotItemsInterval = 30;
    this.dataTree.lineItemsInterval = 30;
    this.dataTree.cousinsIntervalMultiplier = 5;
    this.dataTree.paddingIntervalLeft = 1;
    this.dataTree.paddingIntervalTop = 1;
    this.dataTree.paddingIntervalRight = 1;
    this.dataTree.paddingIntervalBottom = 1;
    this.dataTree.arrowsDirection = '';
    this.dataTree.connectorType = '';
    this.dataTree.elbowType = '';
    this.dataTree.bevelSize = 1;
    this.dataTree.elbowDotSize = 1;
    this.dataTree.linesType = '';
    this.dataTree.linesColor = '#000';
    this.dataTree.lineWidth = 1;
    this.dataTree.labelOrientation = '';
    this.dataTree.labelPlacement = '';
    this.dataTree.labelFontSize = '';
    this.dataTree.labelFontFamily = '';
    this.dataTree.labelFontWeight = '';
    this.dataTree.navigationMode = '';
    this.dataTree.showFrame = false;
    this.dataTree.frameLeft = 1;
    this.dataTree.frameTop = 1;
    this.dataTree.frameRight = 1;
    this.dataTree.frameBottom = 1;
    this.dataTree.frameoutLeft = 1;
    this.dataTree.frameoutTop = 1;
    this.dataTree.frameoutRight = 1;
    this.dataTree.frameoutBottom = 1;
  }

  openSetting() {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';

    this.dialogEditStatus = this.callFC.openSide(
      this.templateUpdateStatus,
      {
        actionType: 'settings',
      },
      option
    );
  }

  CloseDialog(dialog: DialogRef) {
    dialog.close();
    this.disableEdit = true;
  }

  //Disable active chart
  // clickActive(data) {
  //   //Patch id to parent chart
  //   this.newIdItem.emit(data);
  //   this.disableActive = true;
  // }
  onCursorChanged(e) {
    //Patch id to parent chart
    this.newIdItem.emit(e.context.id);

    this.disableActive = true;
  }

  getColorItem(orgType: any) {
    return this.dataVll
      .filter((item) => item.value === orgType)
      .map((obj) => obj.color);
  }

  getEmployeeInfoById(userID: string) {
    if (userID) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness',
          'GetOrgEmployeeAsync',
          userID
        )
        .subscribe((res: any) => {
          if (res) {
            this.getDataPositionByID(
              res,
              this.selectedTeam.includes('No') ? false : true,
              this.level
            );
          }
        });
    }
  }

  getDataPositionByID(orgUnitID: string, getManager: boolean, level: number) {
    if (orgUnitID) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'OrganizationUnitsBusiness',
          'GetDataOrgChartAsync',
          [orgUnitID, getManager, level]
        )
        .subscribe((res: any) => {
          if (res) {
            // this.dataSource = this.newDataManager(res);
            var items: Array<OrgItemConfig> = [];

            res.map((item) => {
              items.push(
                new OrgItemConfig({
                  id: item.orgUnitID,
                  parent: item.parentID || null,
                  title: item.orgUnitName,
                  description: item.positionName,
                  label: item.orgUnitName,
                  templateName: 'contactTemplate',
                  itemTitleColor: String(this.getColorItem(item.orgUnitType)),
                  context: {
                    employeeID: item.employeeID,
                    employeeName: item.employeeName,
                    employeeManager: item.employeeManager,
                    orgUnitType: item.orgUnitType,
                    data: item,
                    isChildren: item.isChildren,
                    loadChildrent: item.loadChildrent,
                  },
                  //itemType: ItemType.Assistant,
                  // adviserPlacementType: AdviserPlacementType.Left,
                  // groupTitle: 'Sub Adviser',
                  // groupTitleColor: Colors.Red,
                })
              );
            });

            this.items = items;
          }
        });
    }
  }

  ngOnInit(): void {
    // this.hrService.getFormModel('HRT03a1').then((res) => {
    //   if (res) {
    //     this.formModelEmployee = res;
    //   }
    // });
    this.hrService
      .GetParameterByHRAsync('HRParameters', '1')
      .subscribe((res: any) => {
        this.dataTree = JSON.parse(res);

        this.selectedTeam = this.dataTree.isGetManager;
        this.level = this.dataTree.level;
        //this.level = this.dataTree.level;
        //this.isGetManager(this.selectedTeam);

        this.dataTree.isOrgUnitID = JSON.parse(this.dataTree.isOrgUnitID);

        //Load data depend orgunit check
        if (this.dataTree.isOrgUnitID === true) {
          this.getEmployeeInfoById(this.user.userID);
        } else {
          this.isGetManager();
        }

        for (const [key, value] of Object.entries(this.dataTree)) {
          this.changeMode(value);
        }
      });

    this.cacheService.valueList('L0605').subscribe((res) => {
      if (res) {
        this.dataVll = res.datas;
      }
    });
  }

  //#region Get manager depend combobox
  isGetManager() {
    this.getDataPositionByID(
      this.orgUnitID,
      this.selectedTeam.includes('No') ? false : true,
      this.level
    );
    //Reset disalbe when select differ item
    this.disableActive = false;
  }

  onSelected(e, value): void {
    if (e.id === 'teams') {
      this.selectedTeam = value;
    }
    if (e.id === 'level') {
      this.level = value;
    }
    this.isGetManager();

    this.disableEdit = false;
  }

  //Call from parent class
  // GetChartDiagram() {
  //   this.isGetManager(this.selectedTeam);
  // }

  //#endregion
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.itemAdded?.currentValue != changes?.itemAdded?.previousValue) {
      const data = changes.itemAdded.currentValue;

      let checkSameTree = this.items.find((e) => e.id === data.parentID);

      if (!checkSameTree) {
        this.orgUnitID = data.orgUnitID;
        this.isGetManager();
      } else {
        let checkSameTree1 = this.items.find(
          (e) => e.id === data.parentID && e.context.loadChildrent !== false
        );

        if (checkSameTree1) {
          //Add to chart from parent
          this.items.push(
            new OrgItemConfig({
              id: data.orgUnitID,
              parent: data.parentID,
              title: data.orgUnitName,
              description: data.positionName,
              label: data.orgUnitName,
              templateName: 'contactTemplate',
              itemTitleColor: String(this.getColorItem(data.orgUnitType)),
              context: {
                employeeID: data.employeeID,
                employeeName: data.employeeName,
                employeeManager: data.employeeManager,
                orgUnitType: data.orgUnitType,
                data: data,
                isChildren: data.isChildren,
                loadChildrent: data.loadChildrent,
              },
            })
          );

          this.items.forEach((e) => {
            if (e.id === data.parentID && e.context.loadChildrent !== false) {
              if (e.context.id == data.parentID) {
                e.context.isChildren = true;
                e.context.loadChildrent = true;
              }
            }
          });
        } else {
          this.api
            .execSv(
              'HR',
              'ERM.Business.HR',
              'OrganizationUnitsBusiness',
              'GetChildChartAsync',
              [data.parentID, this.selectedTeam.includes('No') ? false : true]
            )
            .subscribe((res: any) => {
              if (res) {
                res.map((item) => {
                  this.items.push(
                    new OrgItemConfig({
                      id: item.orgUnitID,
                      parent: item.parentID,
                      title: item.orgUnitName,
                      description: item.positionName,
                      label: item.orgUnitName,
                      templateName: 'contactTemplate',
                      itemTitleColor: String(
                        this.getColorItem(item.orgUnitType)
                      ),
                      context: {
                        employeeID: item.employeeID,
                        employeeName: item.employeeName,
                        employeeManager: item.employeeManager,
                        orgUnitType: item.orgUnitType,
                        data: item,
                        isChildren: item.isChildren,
                        loadChildrent: item.loadChildrent,
                      },
                    })
                  );
                });

                this.items.forEach((e) => {
                  if (e.id === data.parentID) {
                    e.context.isChildren = true;
                    e.context.loadChildrent = true;
                  }
                });
              }
            });
        }
        // this.items.forEach((e) => {
        //   if (e.id === data.parentID && e.context.loadChildrent !== false) {
        //     //Add to chart from parent
        //     this.items.push(
        //       new OrgItemConfig({
        //         id: data.orgUnitID,
        //         parent: data.parentID,
        //         title: data.orgUnitName,
        //         description: data.positionName,
        //         label: data.orgUnitName,
        //         templateName: 'contactTemplate',
        //         itemTitleColor: String(this.getColorItem(data.orgUnitType)),
        //         context: {
        //           employeeID: data.employeeID,
        //           employeeName: data.employeeName,
        //           employeeManager: data.employeeManager,
        //           orgUnitType: data.orgUnitType,
        //           data: data,
        //           isChildren: data.isChildren,
        //           loadChildrent: data.loadChildrent,
        //         },
        //       })
        //     );
        //     e.context.isChildren = true;
        //     e.context.loadChildrent = true;
        //   } else {
        //     this.api
        //       .execSv(
        //         'HR',
        //         'ERM.Business.HR',
        //         'OrganizationUnitsBusiness',
        //         'GetChildChartAsync',
        //         [data.parentID, this.selectedTeam.includes('No') ? false : true]
        //       )
        //       .subscribe((res: any) => {
        //         if (res) {
        //           res.map((item) => {
        //             this.items.push(
        //               new OrgItemConfig({
        //                 id: item.orgUnitID,
        //                 parent: item.parentID,
        //                 title: item.orgUnitName,
        //                 description: item.positionName,
        //                 label: item.orgUnitName,
        //                 templateName: 'contactTemplate',
        //                 itemTitleColor: String(
        //                   this.getColorItem(item.orgUnitType)
        //                 ),
        //                 context: {
        //                   employeeID: item.employeeID,
        //                   employeeName: item.employeeName,
        //                   employeeManager: item.employeeManager,
        //                   orgUnitType: item.orgUnitType,
        //                   data: item,
        //                   isChildren: item.isChildren,
        //                   loadChildrent: item.loadChildrent,
        //                 },
        //               })
        //             );
        //           });

        //           if (e.id == data.parentID) {
        //             e.context.isChildren = true;
        //             e.context.loadChildrent = true;
        //           }
        //         }
        //       });
        //   }
        // });
      }

      //CursorItem
      this.disableActive = true;
      this.cursorItem = data.orgUnitID;
    }
    if (
      changes?.orgUnitID?.currentValue != changes?.orgUnitID?.previousValue &&
      !changes?.orgUnitID.firstChange
    ) {
      if (this.orgUnitID) {
        //Function get new orgchart
        this.isGetManager();
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
          this.copyValue(data, event);
          break;
        default:
          break;
      }
    }
  }

  changeDataMf(event, data) {
    this.hrService.handleShowHideMF(event, data, this.formModel);
  }

  copyValue(data: any, event: any) {
    if (data) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;

      this.hrService
        .copy(data, this.view.formModel, 'OrgUnitID')
        .subscribe((res) => {
          if (res) {
            res.orgUnitID = '';

            let object = {
              data: res,
              funcID: this.view.formModel.funcID,
              isModeAdd: true,
              titleMore: event.text,
              action: event,
            };
            let popup = this.callFC.openSide(
              PopupAddOrganizationComponent,
              object,
              option,
              this.view.formModel.funcID
            );
            popup.closed.subscribe((res: any) => {
              if (res.event) {
                this.view.dataService.add(res.event, 0).subscribe();

                const data = res.event;

                let checkSameTree = this.items.find(
                  (e) => e.id === data.parentID
                );

                if (!checkSameTree) {
                  this.orgUnitID = data.orgUnitID;
                  this.isGetManager();
                } else {
                  this.items.forEach((e) => {
                    if (
                      e.id === data.parentID &&
                      e.context.loadChildrent !== false
                    ) {
                      //Add to chart from parent
                      this.items.push(
                        new OrgItemConfig({
                          id: data.orgUnitID,
                          parent: data.parentID,
                          title: data.orgUnitName,
                          description: data.positionName,
                          label: data.orgUnitName,
                          templateName: 'contactTemplate',
                          itemTitleColor: String(
                            this.getColorItem(data.orgUnitType)
                          ),
                          context: {
                            employeeID: data.employeeID,
                            employeeName: data.employeeName,
                            employeeManager: data.employeeManager,
                            orgUnitType: data.orgUnitType,
                            data: data,
                            isChildren: data.isChildren,
                            loadChildrent: data.loadChildrent,
                          },
                        })
                      );
                      e.context.isChildren = true;
                      e.context.loadChildrent = true;
                    } else {
                      this.api
                        .execSv(
                          'HR',
                          'ERM.Business.HR',
                          'OrganizationUnitsBusiness',
                          'GetChildChartAsync',
                          [
                            data.parentID,
                            this.selectedTeam.includes('No') ? false : true,
                          ]
                        )
                        .subscribe((res: any) => {
                          if (res) {
                            res.map((item) => {
                              this.items.push(
                                new OrgItemConfig({
                                  id: item.orgUnitID,
                                  parent: item.parentID,
                                  title: item.orgUnitName,
                                  description: item.positionName,
                                  label: item.orgUnitName,
                                  templateName: 'contactTemplate',
                                  itemTitleColor: String(
                                    this.getColorItem(item.orgUnitType)
                                  ),
                                  context: {
                                    employeeID: item.employeeID,
                                    employeeName: item.employeeName,
                                    employeeManager: item.employeeManager,
                                    orgUnitType: item.orgUnitType,
                                    data: item,
                                    isChildren: item.isChildren,
                                    loadChildrent: item.loadChildrent,
                                  },
                                })
                              );
                            });

                            // this.items.forEach((e) => {
                            if (e.id == data.parentID) {
                              e.context.isChildren = true;
                              e.context.loadChildrent = true;
                            }
                            // });
                          }
                        });
                    }
                  });
                }

                //CursorItem
                this.disableActive = true;
                this.cursorItem = data.orgUnitID;
              }
            });
          }
        });
    }
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

      const dataSelect = this.items.find((item) => data.orgUnitID === item.id);

      popup.closed.subscribe((res: any) => {
        if (res.event) {
          let dataUpdated = res.event;

          dataUpdated = new OrgItemConfig({
            id: dataUpdated.orgUnitID,
            parent: dataUpdated.parentID,
            title: dataUpdated.orgUnitName,
            description: dataUpdated.positionName,
            label: dataUpdated.orgUnitName,
            templateName: 'contactTemplate',
            itemTitleColor: String(this.getColorItem(dataUpdated.orgUnitType)),
            context: {
              employeeID: dataUpdated.employeeID,
              employeeName: dataUpdated.employeeName,
              employeeManager: dataUpdated.employeeManager,
              orgUnitType: dataUpdated.orgUnitType,
              data: dataUpdated,
              //Bind from data when open or close child
              isChildren: dataSelect.context.isChildren,
              loadChildrent: dataSelect.context.loadChildrent,
            },
          });

          this.items.forEach((element, index) => {
            if (element.id === dataUpdated.id) {
              let oldDataParent = this.items.find(
                (item) => item.id === this.items[index].parent
              );
              this.items[index] = dataUpdated;

              if (oldDataParent && dataUpdated.parent !== oldDataParent.id) {
                const checkChildExist = this.items.find(
                  (element) => oldDataParent.id === element.parent
                );
                if (!checkChildExist) {
                  oldDataParent.context.isChildren = false;
                  oldDataParent.context.loadChildrent = false;
                }
                // this.items.find((element) => {
                //   if (
                //     element.id === oldDataParent.id &&
                //     element.parent !== oldDataParent.id
                //   ) {
                //     oldDataParent.context.isChildren = false;
                //     oldDataParent.context.loadChildrent = false;

                //     // this.items.forEach((element, index) => {
                //     //   if (element.id === oldDataParent.id) {
                //     //     this.items[index] = oldDataParent;
                //     //   }
                //     // });
                //   }
                // });
              }
            }

            //Update plus icon in new data added
            if (element.id === dataUpdated.parent) {
              element.context.isChildren = true;
              element.context.loadChildrent = true;
            }
          });

          this.view.dataService.update(res.event).subscribe(() => {
            // this.dataSource = this.newDataManager(this.dataService.data);
            //this.isGetManager(this.selectedTeam);
            this.dt.detectChanges();
          });
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
      .subscribe((res) => {
        if (res === true) {
          this.items = this.items.filter((item) => item.id != data.orgUnitID);

          // const ids = this.items.map(({ id }) => id);
          // const filtered = this.items.filter(
          //   ({ id }, index) => !ids.includes(id, index + 1)
          // );

          // this.items = filtered;

          const checkSameLevel = this.items.filter(
            (item) => data.parentID === item.parent
          );

          if (checkSameLevel.length === 0) {
            let tmpParent = this.items.find(
              (item) => data.parentID === item.id
            );

            tmpParent.context.isChildren = false;
            tmpParent.context.loadChildrent = false;
          }

          this.dt.detectChanges();
        }
      });
  }

  removeNode(id: string) {
    var children = this.items.filter((x) => x.parent === id);
    if (children.length > 0) {
      children.forEach((e) => {
        this.items = this.items.filter((x) => x.id !== e.id);
        if (e.id) {
          this.removeNode(String(e.id));
        }
      });
    }
  }

  //Load more icon add
  loadDataChild(node: any, element: HTMLElement) {
    let result = [];
    var items = [];
    if (node.context.loadChildrent) {
      result = this.items.filter((e) => e.parent != node.id);
      if (result.length > 0) {
        result.forEach((element) => {
          if (element.id == node.id) {
            element.context.loadChildrent = false;
          }
        });
        this.removeNode(node.id);
      }
    } else {
      if (node.id) {
        let listPos = [];
        this.items.forEach(function (object) {
          var posID = object.id;
          listPos.push(posID);
        });

        this.api
          .execSv(
            'HR',
            'ERM.Business.HR',
            'OrganizationUnitsBusiness',
            'GetChildChartAsync',
            [node.id, this.selectedTeam.includes('No') ? false : true]
          )
          .subscribe((res: any) => {
            if (res) {
              this.items.forEach((e) => {
                if (e.id == node.id) {
                  e.context.loadChildrent = true;
                }
                items.push(e);
              });
              res.map((item) => {
                items.push(
                  new OrgItemConfig({
                    id: item.orgUnitID,
                    parent: item.parentID,
                    title: item.orgUnitName,
                    description: item.positionName,
                    label: item.orgUnitName,
                    templateName: 'contactTemplate',
                    itemTitleColor: String(this.getColorItem(item.orgUnitType)),
                    context: {
                      employeeID: item.employeeID,
                      employeeName: item.employeeName,
                      employeeManager: item.employeeManager,
                      orgUnitType: item.orgUnitType,
                      data: item,
                      isChildren: item.isChildren,
                      loadChildrent: item.loadChildrent,
                    },
                  })
                );
              });
            } else {
              result = this.items;
            }
            this.items = items;
          });
      }
    }
  }

  dataManager: any;
  mouseEnter(e, id) {
    this.isPopUpManager = true;
    this.idHover = id;
    this.dataManager = e;
  }

  mouseLeave(e, id) {
    this.isPopUpManager = false;
    this.idHover = id;
    // this.dataManager = '';
  }

  onSaveForm() {
    if (this.selectedTeam.includes('No')) {
      this.dataTree.isGetManager = 'No';
    } else {
      this.dataTree.isGetManager = 'Yes';
    }

    if (this.level) {
      this.dataTree.level = this.level;
    }

    this.hrService
      .SaveSettingValue('HRParameters', '1', this.dataTree)
      .subscribe((res: any) => {
        if (res) {
          this.dialogEditStatus && this.dialogEditStatus.close();
          this.notify.notifyCode('SYS007');
          this.disableEdit = true;
        }
      });
  }
}
