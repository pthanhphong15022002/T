import { P } from "@angular/cdk/keycodes";
import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ViewEncapsulation, TemplateRef, ViewChild, ChangeDetectorRef, ElementRef, Optional, Input, OnChanges, SimpleChanges, OnDestroy } from "@angular/core";
import { HierarchicalTreeService, MindMapService, RadialTreeService, ComplexHierarchicalTreeService, DataBindingService, SnappingService, PrintAndExportService, BpmnDiagramsService, SymmetricLayoutService, ConnectorBridgingService, UndoRedoService, LayoutAnimationService, DiagramContextMenuService, ConnectorEditingService, DiagramComponent, SymbolPaletteComponent, BpmnShapeModel, ConnectorModel, ContextMenuSettingsModel, DiagramBeforeMenuOpenEventArgs, DiagramTools, HeaderModel, LaneModel, NodeModel, PaletteModel, PortConstraints, PortVisibility, RulerSettingsModel, SelectorConstraints, SelectorModel, ShapeStyleModel, SnapConstraints, SnapSettingsModel, SwimLaneModel, UserHandleModel, cloneObject, ScrollSettingsModel } from "@syncfusion/ej2-angular-diagrams";
import { shadowProperty } from "@syncfusion/ej2-angular-documenteditor";
import { modulesList } from "@syncfusion/ej2-angular-inplace-editor";
import { ExpandMode, MenuEventArgs } from "@syncfusion/ej2-angular-navigations";
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, SidebarModel, UrlUtil, Util } from "codx-core";
import { BP_Processes_Steps } from "projects/codx-bp/src/lib/models/BP_Processes.model";
import { FormEditConnectorComponent } from "projects/codx-share/src/lib/components/codx-diagram/form-edit-connector/form-edit-connector.component";
import { Subscription } from "rxjs";

@Component({
  selector: 'codx-diagram',
  templateUrl: './codx-diagram.component.html',
  styleUrls: ['./codx-diagram.component.scss'],
  host: {class: 'h-100 overflow-scroll'},
  encapsulation: ViewEncapsulation.None,
  providers: [
    HierarchicalTreeService,
    MindMapService,
    RadialTreeService,
    ComplexHierarchicalTreeService,
    DataBindingService,
    SnappingService,
    PrintAndExportService,
    BpmnDiagramsService,
    SymmetricLayoutService,
    ConnectorBridgingService,
    UndoRedoService,
    LayoutAnimationService,
    DiagramContextMenuService,
    ConnectorEditingService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodxDiagramComponent implements OnInit, AfterViewInit,OnChanges,OnDestroy {

  @ViewChild('diagram') diagram: DiagramComponent;
  @ViewChild('palette') palette: SymbolPaletteComponent;
  @ViewChild('nodeTemplate') nodeTemplate: TemplateRef<any>;
  @Input() columns:any=[];
  @Input() process:any={};
  @Input() viewOnly:boolean=false;
  @Input() recID!:any;
  @Input() scrollSettings: ScrollSettingsModel = {horizontalOffset:-500};
  vllStepType:any=[];
  vllInterval:any=[];
  dialog:any;
  data:any
  subscription:Subscription = new Subscription();
  user:any;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    private cache: CacheService,
    private authStore: AuthStore,
    private notiSv: NotificationsService,
    private elementRef: ElementRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.user = this.authStore.get()
    this.dialog = dialog;
     let sub = this.cache.valueList('BP001').subscribe((res:any)=>{

      if(res){
        this.vllStepType=res.datas;
        this.menuDrag = [...this.menuDrag,...this.vllStepType];
        this.detectorRef.detectChanges();
      }

    })
    this.subscription.add(sub);
     let sub1 = this.cache.valueList('BP019').subscribe((res:any)=>{

      if(res){
        this.vllInterval=res.datas;
      }

    })
    this.subscription.add(sub1);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes['viewOnly'] ){
      if(!changes['viewOnly'].currentValue){
        if(this.diagram) this.diagram.tool = DiagramTools.Default;
      }
      else{
        if(this.diagram) this.diagram.tool = DiagramTools.ZoomPan
      }
    }
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    if(this.recID){
      this.getProcess();
    }
    else this.initProcess();
  }

  created(): void {
    //this.diagram.fitToPage();
    this.diagram.clearSelection();
    this.diagram.scrollSettings.canAutoScroll = true;

    if(this.viewOnly) this.diagram.tool = DiagramTools.ZoomPan;
  }
  clickPan(isPan) {
    if (this.diagram && isPan) this.diagram.tool = DiagramTools.ZoomPan;
    if (this.diagram && !isPan) this.diagram!.tool = DiagramTools.Default;
  }
  interval = [
    1, 9, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25,
    9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75,
  ];
  gridlines = { lineColor: '#e0e0e0', lineIntervals: this.interval };
  snapSettings: SnapSettingsModel = {
    horizontalGridlines: this.gridlines,
    verticalGridlines: this.gridlines,
    constraints: SnapConstraints.All & ~SnapConstraints.ShowLines,
  };
  rulerSettings: RulerSettingsModel = { showRulers: false, dynamicGrid: true };
  nodes: NodeModel[] = [
    // {
    //   id: 'swimlane',
    //   shape: {
    //     type: 'SwimLane',
    //     header: {
    //       annotation: { content: 'QUY TRÌNH ĐỘNG DO TUI TẠO RA', style: { fontSize: 14, bold: true,color:'#005dc7',textAlign:'Left'  } },
    //       height: 30,
    //       style:{fill:'#cce4ff'}
    //     },
    //     lanes: [
    //       {
    //         canMove:true,
    //         id: 'caythongso1',
    //         height: 400,
    //         width: 400,
    //         header: {
    //           annotation: { content: `Xác định nhu cầu`,style: { fontSize: 14, bold: true,color:'#005dc7',textAlign:'Left'  } }, width: 30,
    //           style:{fill:'#cce4ff'}
    //         },
    //         // Set the children of lane
    //         children: [
    //           {
    //             id: 'node1',
    //             shape:{
    //               type: 'Bpmn',
    //               shape: 'Event',
    //               // set the event type as End
    //               event: {
    //                   event: 'Start',
    //                   trigger: 'None'
    //               }
    //            }
    //           }, {
    //             id: 'node2_template',
    //             shape: { type: 'HTML' },
    //             margin: { left: 200, top: 20 },
    //             height: 200, width: 300,
    //           },
    //         ],
    //       },
    //       {
    //         id: 'caythongso2',
    //         height: 800,
    //         width: 1400,
    //         header: {
    //           annotation: { content: 'Duyệt nhu cầu tuyển dụng', style: { fontSize: 14, bold: true,color:'#005dc7',textAlign:'Left'  } }, width: 30,
    //           style:{fill:'#cce4ff'}
    //         },
    //         // Set the children of lane
    //         children: [
    //           {
    //             id: 'node3',
    //             shape:{
    //               type: 'Flow',
    //               shape: 'Decision',
    //             },
    //             annotations: [
    //               {
    //                   content: 'Chức vụ \nNhân sự cần\n tuyển dụng?',
    //                   style: { fontSize: 14 }
    //               }
    //             ],
    //             margin: { left: 400, top: 30 },
    //             height: 80, width: 120,
    //           }, {
    //             id: 'node3_template',
    //             shape: { type: 'HTML' },
    //             margin: { left: 50, top: 20 },
    //             height: 200, width: 300,
    //           },{
    //             id: 'node4_template',
    //             shape: { type: 'HTML' },
    //             margin: { left: 600, top: -220 },
    //             height: 200, width: 300,
    //             annotations: [{content:'Quản lý', style: {fill: 'white'}}]
    //           },
    //           {
    //             id: 'node5_template',
    //             shape: { type: 'HTML' },
    //             margin: { left: 600, top: 220 },
    //             height: 200, width: 300,
    //           },
    //         ],
    //         style:{fill:'#fff'}
    //       },
    //     ],
    //     orientation: 'Vertical', isLane: true,
    //   },
    //   offsetX: 420, offsetY: 270,
    //   height: 400,
    //   width: 650,
    // }
  ];
  connectors: any = [
    {
      id: 'connector1',
      sourceID: 'node1',
      targetID: 'node2_template',
    },
    {
      id: 'connector2',
      sourceID: 'node2_template',
      targetID: 'node3_template',
    },
    {
      id: 'connector3',
      sourceID: 'node3_template',
      targetID: 'node3',
    },
    {
      id: 'connector4',
      sourceID: 'node3',
      targetID: 'node4_template',
      type: 'Orthogonal',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 40, y: 40 },
      targetDecorator: {
        shape: 'Arrow',
        style: { strokeColor: '#757575', fill: '#757575' },
      },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      annotations: [{ content: 'Quản lý', style: { fill: '#ddd' } }],
    },
    {
      id: 'connector5',
      sourceID: 'node3',
      targetID: 'node5_template',
      type: 'Orthogonal',
      sourcePoint: { x: 0, y: 0 },
      targetPoint: { x: 40, y: 40 },
      targetDecorator: {
        shape: 'Arrow',
        style: { strokeColor: '#757575', fill: '#757575' },
      },
      style: { strokeWidth: 1, strokeColor: '#757575' },
      annotations: [{ content: 'Nhân viên', style: { fill: '#ddd' } }],
    },
  ];

  menuDrag: any = [
    //{ id: 'connector', text: 'Connector', icon: 'icon-timeline' },
    { value: 'start', text: 'Bắt đầu', icon: 'icon-i-circle' },
    { value: 'end', text: 'Kết thúc', icon: 'icon-i-circle fw-bold' },
    { value: 'swimlane', text: 'SwimLane', icon: 'icon-view_quilt' },

  ];
  documentClick(args: MouseEvent): void {
    this.isDragging = true;
    let target: HTMLElement = args.target as HTMLElement;
    // custom code start
    let selectedElement: HTMLCollection =
      document.getElementsByClassName('e-selected-style');
    if (selectedElement.length) {
      selectedElement[0].classList.remove('e-selected-style');
    }
    // custom code end
    let drawingObject: NodeModel | ConnectorModel | any = null;
    if (target.tagName == 'SPAN') target = target.parentElement;
    if (target.classList.contains('image-pattern-style')) {
      switch (target.id) {
        case 'shape1':
          drawingObject = { shape: { type: 'Basic', shape: 'Rectangle' } };
          break;
        case 'shape2':
          drawingObject = { shape: { type: 'Basic', shape: 'Ellipse' } };
          break;
        case 'shape3':
          drawingObject = { shape: { type: 'Basic', shape: 'Hexagon' } };
          break;
        case 'shape4':
          drawingObject = { shape: { type: 'Basic', shape: 'Pentagon' } };
          break;
        case 'shape5':
          drawingObject = { shape: { type: 'Basic', shape: 'Triangle' } };
          break;
        case 'straight':
          drawingObject = { type: 'Straight' };
          break;
        case 'ortho':
          drawingObject = { type: 'Orthogonal' };
          break;
        case 'cubic':
          drawingObject = { type: 'Bezier' };
          break;
        case 'freehand':
          drawingObject = { type: 'Freehand' };
          break;
        case 'path':
          drawingObject = {
            shape: {
              type: 'Path',
              data:
                'M540.3643,137.9336L546.7973,159.7016L570.3633,159.7296L550.7723,171.9366L558.9053,194.9966L540.3643,' +
                '179.4996L521.8223,194.9966L529.9553,171.9366L510.3633,159.7296L533.9313,159.7016L540.3643,137.9336z',
            },
          };
          break;
        case 'image':
          drawingObject = {
            shape: {
              type: 'Image',
              source: './assets/diagram/employees/Clayton.png',
            },
          };
          break;
        case 'svg':
          drawingObject = {
            shape: { type: 'Native', content: this.getNativeContent() },
          };
          break;
        case 'text':
          drawingObject = { shape: { type: 'Text' } };
          break;
        case 'swimlane':
          let swimLane: NodeModel = {
            id: this.makeid(10),
            shape: {
              type: 'SwimLane',
              header: {
                height: 30,
                style: { fill: '#fff', textAlign: 'Left' },
                annotation: { content: 'Quy trình động' },
              },
              lanes: [
                {
                  id: this.makeid(10),
                  canMove: true,
                  header: {
                    height: 30,
                    style: { fontSize: 14, fill: '#fff' },
                    annotation: { content: 'Bước quy trình' },
                  },
                },
              ],
              phases: [
                {
                  id: this.makeid(10),
                  header: { annotation: { content: '' } },
                },
              ],
              phaseSize: 0.5,
              orientation: 'Vertical',
              isLane: true,
            },
            style: { strokeColor: '#ffffff', fill: '#ffffff' },
          };
          drawingObject = swimLane;
          break;
        default:
          drawingObject = { shape: { type: 'HTML', version: target.id } };
          break;
      }
      if (drawingObject) {
        this.diagram.drawingObject = drawingObject;
        // custom code start
        target.classList.add('e-selected-style');
        // custom code end
      }
    }
    this.diagram.tool = DiagramTools.DrawOnce;
    this.diagram.dataBind();
  }
  getNativeContent(): string {
    let str: string =
      '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="350.000000pt" ' +
      'height="229.000000pt" viewBox="0 0 350.000000 229.000000" ' +
      'preserveAspectRatio="xMidYMid meet"> <metadata>' +
      ' Created by potrace 1.11, written by Peter Selinger 2001-2013' +
      ' </metadata> <g transform="translate(0.000000,229.000000) scale(0.100000,-0.100000)"' +
      ' fill="#de6ca9" stroke="none"><path d="M0 1145 l0 -1145 1750 0 1750 0 0 1145 0 1145' +
      ' -1750 0 -1750 0 0 -1145z m1434 186 c19 -8 26 -18 26 -37 0 -24 -3 -26' +
      ' -27 -19 -16 3 -58 9 -94 12 -63 5 -67 4 -88 -23 -23 -29 -21 -60 6 -81 8' +
      ' -6 47 -19 86 -29 55 -13 80 -25 106 -51 31 -31 33 -37 29 -88 -8 -94 -69' +
      ' -133 -193 -122 -90 7 -115 20 -115 58 0 26 3 30 18 24 91 -38 168 -41 204' +
      ' -8 23 21 23 75 1 96 -10 8 -49 23 -88 33 -88 22 -135 63 -135 118 0 92 67 140' +
      ' 181 131 31 -2 68 -9 83 -14z m854 -6 c38 -15 42 -21 42 -51 l0 -33 -47 25' +
      ' c-41 22 -58 25 -115 22 -58 -3 -72 -8 -97 -32 -79 -75 -59 -259 32 -297 35' +
      ' -15 106 -18 150 -6 26 7 27 10 27 67 l0 60 -50 0 c-47 0 -50 2 -50 25 0 25' +
      ' 1 25 80 25 l81 0 -3 -97 -3 -98 -40 -20 c-22 -10 -65 -21 -95 -23 -153 -11' +
      ' -242 74 -243 230 0 145 93 235 233 224 30 -2 74 -12 98 -21z m-638 -169 l67' +
      ' -178 40 103 c22 57 53 139 69 182 28 75 29 77 62 77 19 0 32 -4 30 -9 -1 -5' +
      ' -39 -104 -83 -220 l-80 -211 -37 0 c-35 0 -37 2 -56 53 -11 28 -48 124 -81 ' +
      '211 -34 87 -61 163 -61 168 0 5 14 8 32 6 31 -3 32 -5 98 -182z" />' +
      '</g> </svg>';
    return str;
  }

  clickRF() {
    this.diagram && this.diagram.refresh();
  }
  // SymbolPalette Properties
  public expandMode: ExpandMode = 'Multiple';
  // public palettes: PaletteModel[] = [
  //   {
  //     id: 'flow',
  //     expanded: true,
  //     title: 'Flow Shapes',
  //     symbols: [
  //       {
  //         id: 'Terminator',
  //         addInfo: { tooltip: 'Terminator' },
  //         width: 50,
  //         height: 60,
  //         shape: { type: 'Flow', shape: 'Terminator' },
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //         ports: [
  //           {
  //             offset: { x: 0, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 0 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 1, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 1 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //         ],
  //       },
  //       {
  //         id: 'Process',
  //         addInfo: { tooltip: 'Process' },
  //         width: 50,
  //         height: 60,
  //         shape: { type: 'Flow', shape: 'Process' },
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //         ports: [
  //           {
  //             offset: { x: 0, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 0 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 1, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 1 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //         ],
  //       },
  //       {
  //         id: 'Decision',
  //         addInfo: { tooltip: 'Decision' },
  //         width: 50,
  //         height: 50,
  //         shape: { type: 'Flow', shape: 'Decision' },
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //         ports: [
  //           {
  //             offset: { x: 0, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 0 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 1, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 1 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //         ],
  //       },
  //       {
  //         id: 'Document',
  //         addInfo: { tooltip: 'Document' },
  //         width: 50,
  //         height: 50,
  //         shape: { type: 'Flow', shape: 'Document' },
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //         ports: [
  //           {
  //             offset: { x: 0, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 0 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 1, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 1 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //         ],
  //       },
  //       {
  //         id: 'Predefinedprocess',
  //         addInfo: { tooltip: 'Predefined process' },
  //         width: 50,
  //         height: 50,
  //         shape: { type: 'Flow', shape: 'PreDefinedProcess' },
  //         ports: [
  //           {
  //             offset: { x: 0, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 0 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 1, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 1 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //         ],
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //       },
  //       {
  //         id: 'Data',
  //         addInfo: { tooltip: 'Data' },
  //         width: 50,
  //         height: 50,
  //         shape: { type: 'Flow', shape: 'Data' },
  //         ports: [
  //           {
  //             offset: { x: 0, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 0 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 1, y: 0.5 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //           {
  //             offset: { x: 0.5, y: 1 },
  //             visibility: PortVisibility.Connect | PortVisibility.Hover,
  //             constraints: PortConstraints.Draw,
  //           },
  //         ],
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //       },
  //       {
  //         id: 'hehehehihi',
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //         annotations: [{ content: 'hello' }],
  //       },
  //     ],
  //   },
  //   {
  //     id: 'swimlaneShapes',
  //     expanded: true,
  //     title: 'Swimlane Shapes',
  //     symbols: [
  //       {
  //         id: 'Horizontalswimlane',
  //         addInfo: { tooltip: 'Horizontal swimlane' },
  //         shape: {
  //           type: 'SwimLane',
  //           lanes: [
  //             {
  //               id: 'lane1',
  //               style: { strokeColor: '#757575' },
  //               height: 60,
  //               width: 150,
  //               header: {
  //                 width: 50,
  //                 height: 50,
  //                 style: { strokeColor: '#757575', fontSize: 11 },
  //               },
  //             },
  //           ],
  //           orientation: 'Horizontal',
  //           isLane: true,
  //         },
  //         height: 60,
  //         width: 140,
  //         offsetX: 70,
  //         offsetY: 30,
  //       },
  //       {
  //         id: 'Verticalswimlane',
  //         addInfo: { tooltip: 'Vertical swimlane' },
  //         shape: {
  //           type: 'SwimLane',
  //           lanes: [
  //             {
  //               id: 'lane1',
  //               style: { strokeColor: '#757575' },
  //               height: 150,
  //               width: 60,
  //               header: {
  //                 width: 50,
  //                 height: 50,
  //                 style: { strokeColor: '#757575', fontSize: 11 },
  //               },
  //             },
  //           ],
  //           orientation: 'Vertical',
  //           isLane: true,
  //         },
  //         height: 140,
  //         width: 60,
  //         // style: { fill: '#f5f5f5' },
  //         offsetX: 70,
  //         offsetY: 30,
  //       },
  //       {
  //         id: 'Verticalphase',
  //         addInfo: { tooltip: 'Vertical phase' },
  //         shape: {
  //           type: 'SwimLane',
  //           phases: [
  //             {
  //               style: {
  //                 strokeWidth: 1,
  //                 strokeDashArray: '3,3',
  //                 strokeColor: '#757575',
  //               },
  //             },
  //           ],
  //           annotations: [{ text: '' }],
  //           orientation: 'Vertical',
  //           isPhase: true,
  //         },
  //         height: 60,
  //         width: 140,
  //         style: { strokeColor: '#757575' },
  //       },
  //       {
  //         id: 'Horizontalphase',
  //         addInfo: { tooltip: 'Horizontal phase' },
  //         shape: {
  //           type: 'SwimLane',
  //           phases: [
  //             {
  //               style: {
  //                 strokeWidth: 1,
  //                 strokeDashArray: '3,3',
  //                 strokeColor: '#757575',
  //               },
  //             },
  //           ],
  //           annotations: [{ text: '' }],
  //           orientation: 'Horizontal',
  //           isPhase: true,
  //         },
  //         height: 60,
  //         width: 140,
  //         style: { strokeColor: '#757575' },
  //       },
  //     ],
  //   },
  //   {
  //     id: 'connectors',
  //     expanded: true,
  //     symbols: [
  //       {
  //         id: 'Link1',
  //         type: 'Orthogonal',
  //         sourcePoint: { x: 0, y: 0 },
  //         targetPoint: { x: 40, y: 40 },
  //         targetDecorator: {
  //           shape: 'Arrow',
  //           style: { strokeColor: '#757575', fill: '#757575' },
  //         },
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //       },
  //       {
  //         id: 'Link2',
  //         type: 'Orthogonal',
  //         sourcePoint: { x: 0, y: 0 },
  //         targetPoint: { x: 40, y: 40 },
  //         targetDecorator: {
  //           shape: 'Arrow',
  //           style: { strokeColor: '#757575', fill: '#757575' },
  //         },
  //         style: {
  //           strokeWidth: 1,
  //           strokeDashArray: '4 4',
  //           strokeColor: '#757575',
  //         },
  //       },
  //       {
  //         id: 'Link21',
  //         type: 'Straight',
  //         sourcePoint: { x: 0, y: 0 },
  //         targetPoint: { x: 60, y: 60 },
  //         targetDecorator: {
  //           shape: 'Arrow',
  //           style: { strokeColor: '#757575', fill: '#757575' },
  //         },
  //         style: { strokeWidth: 1, strokeColor: '#757575' },
  //       },
  //       {
  //         id: 'Link22',
  //         type: 'Straight',
  //         sourcePoint: { x: 0, y: 0 },
  //         targetPoint: { x: 60, y: 60 },
  //         targetDecorator: {
  //           shape: 'Arrow',
  //           style: { strokeColor: '#757575', fill: '#757575' },
  //         },
  //         style: {
  //           strokeWidth: 1,
  //           strokeDashArray: '4 4',
  //           strokeColor: '#757575',
  //         },
  //       },
  //     ],
  //     title: 'Connectors',
  //   },
  // ];
  contextMenuSettings: ContextMenuSettingsModel = {
    show: true,
    items: [
      {
        text: 'Clone',
        id: 'Clone',
        target: '.e-diagramcontent',
      },
      {
        text: 'Cut',
        id: 'Cut',
        target: '.e-diagramcontent',
      },
      {
        text: 'InsertLaneBefore',
        id: 'InsertLaneBefore',
        target: '.e-diagramcontent',
      },
      {
        text: 'InsertLaneAfter',
        id: 'InsertLaneAfter',
        target: '.e-diagramcontent',
      },
    ],
    showCustomMenuOnly: true,
  };

  onDrop(e: any) {
    if (e.state == 'Completed') {
      console.log('drop', e);
      // setTimeout(() => {
      //   this.diagram && this.diagram.refreshDiagramLayer();
      // }, 100);
    }
  }


  objNodes:any;
  dragEnter(e: any) {
    let ele = this.elementRef.nativeElement.querySelector('.diagramzone');
    //console.log(e);
    //let objDragpane = document.querySelector('.dragarea').getBoundingClientRect();
    //if(objDragpane && e.dropPoint.x < objDragpane.x) return;
    //if(!e.event.target) return;

    let targetId = e.event.target.id.includes('_content')
      ? e.event.target.id.split('_content')[0]
      : e.event.target.id;
    let swimlane = '';
    if (this.targetItem && this.targetItem.isLane) {
      targetId = this.targetItem.id;
      swimlane = this.targetItem.parentId;
    }

    let laneID = swimlane ? targetId.split(swimlane)[1].slice(0, -1) : '';
    this.isDragging = false;
    let model: any = {
      id: this.makeid(10),
      // Position of the node
      offsetX: e.dropPoint.x,
      offsetY: e.dropPoint.y,
      // Size of the node
      width: 100,
      height: 100,
      margin: { left: 0, top: 100 },
      style: { strokeColor: '#000' },
    };

    //model.offsetX = model.offsetX -  this.diagram.diagramLayer?.getBoundingClientRect().width
    //model.offsetY = model.offsetY -  this.diagram.diagramLayer?.getBoundingClientRect().y
    //model.offsetY = e.event.target.getBoundingClientRect().y - model.offsetY +  e.event.target.getBoundingClientRect().height;
    model.margin.left =
      model.offsetX - e.event.target.getBoundingClientRect().x ;
    model.margin.top = model.offsetY - e.event.target.getBoundingClientRect().y;
    switch (e.item?.element?.nativeElement?.id) {
      case 'start':
        model.shape = {
          type: 'Bpmn',
          shape: 'Event',
          // set the event type as End
          event: {
            event: 'Start',
            trigger: 'None',
          },
        };
        model.offsetY = model.offsetY - 50;
        if (this.targetItem && this.targetItem.isLane && swimlane && laneID)
          this.diagram.addNodeToLane(model, swimlane, laneID);
        else this.diagram.add(model);
        break;
      case 'end':
        model.shape = {
          type: 'Bpmn',
          shape: 'Event',
          // set the event type as End
          event: {
            event: 'End',
            trigger: 'None',
          },
        };
        model.offsetY = model.offsetY - 50;
        if (this.targetItem && this.targetItem.isLane && swimlane && laneID)
          this.diagram.addNodeToLane(model, swimlane, laneID);
        else this.diagram.add(model);
        break;
      case 'Conditions':
        model.shape = {
          type: 'Flow',
          shape: 'Decision',
        };
        model.offsetY = model.offsetY - 100;
        model.data = this.generateStep(e.item?.element?.nativeElement?.id,this.targetItem.refID)
        this.process.steps.push(model.data);
        if (this.targetItem && this.targetItem.isLane && swimlane && laneID)
          this.diagram.addNodeToLane(model, swimlane, laneID);
        else this.diagram.add(model);
        break;
      case 'connector':
        let connector: ConnectorModel = {
          id: this.makeid(10),
          sourcePoint: { x: model.offsetX - 200, y: model.offsetY - 100 },
          targetPoint: { x: model.offsetX - 100, y: model.offsetY - 100 },
          targetDecorator: {
            shape: 'Arrow',
            style: { strokeColor: '#757575', fill: '#757575' },
          },
          style: { strokeWidth: 3, strokeColor: '#757575' },
          type: 'Orthogonal',
        };
        this.diagram.addConnector(connector);
        break;
      case 'swimlane':
        let height = 500;
        if(ele) height = ele.offsetHeight

        this.generateProcess();
        if(this.process && Object.keys(this.process)){
          let objDiagram: NodeModel | any = {
            id: this.makeid(10),
            isProcess:true,

            shape: {
              id: this.makeid(10),
              type: 'SwimLane',
              hasHeader:true,
              header: {
                height: 30,
                id: this.makeid(5),
                annotation: { content: 'Quy trình động',style: { fontSize: 16, color: '#0099ff', bold: true } },
              },
              lanes: [
                {
                  id: this.makeid(10),
                  canMove: true,
                  height: height,
                  width: 600,
                  header: {
                    height: 30,
                    id:this.makeid(5),
                    annotation: {
                      content: 'Bước quy trình',
                      style: { fontSize: 10,bold:true },
                      refID:undefined,
                    },
                  },
                  refID:undefined,
                  data:undefined,
                  isStage:true
                },
              ],
              // phases: [
              //   {
              //     id: this.makeid(10),
              //     offset: 170,
              //     header: { annotation: { content: '' } },
              //   },
              // ],
              // phaseSize: 0.5,
              isLane:true,
              orientation: 'Vertical',

            },
            height: height,
            width: 800,
            style: { strokeColor: '#ffffff', fill: '#ffffff' },
            offsetX: model.offsetX,
            offsetY: model.offsetY + 100,

          };
          objDiagram.isProcess=true;
          objDiagram.data=this.process;
          objDiagram.processID=this.process.recID
          objDiagram.shape.header.annotation.content = this.process.processName;
          if(this.process.steps.length){
            let stage = this.process.steps.findLast((x:any)=>x.activityType=='Stage');
            if(stage){
              objDiagram.shape.lanes[0].refID = stage.recID;
              //objDiagram.shape.lanes[0].content = stage.stepName;
              objDiagram.shape.lanes[0].style={bold:true};
              objDiagram.shape.lanes[0].data=stage;
              objDiagram.shape.lanes[0].header.annotation.content = stage.stepName;
              objDiagram.shape.lanes[0].header.annotation.refID = stage.recID;
              objDiagram.shape.lanes[0].isStage = true;

            }

          }
          setTimeout(()=>{
            this.objNodes = objDiagram;
            console.log(objDiagram);

            this.diagram.addNode(objDiagram);
          },100)
        }


        //this.generateProcess();
        break;
      case 'Form':
      case 'Sign':
      case 'Image':
      case 'Task':
      case 'Event':
      case 'Email':
      case 'Approve':
      case 'Check':
        model.id = this.makeid(10);
        model.shape = {
          type: 'HTML',
          version: 'step',
        };
        model.width = 300;
        model.height = 150;
        //model.margin.left =  model.margin.left + model.width/2;
        model.data = this.generateStep(e.item?.element?.nativeElement?.id,this.targetItem?.refID)
        if(this.process && this.process.steps)this.process.steps.push(model.data);
        // if(swimlane)this.diagram.addNodeToLane(model,swimlane,laneID)
        // else this.diagram.add(model);
        this.diagram.add(model);
        if (this.targetItem && this.targetItem.isLane) {
          this.diagram.addChild(this.targetItem, model.id);
        }
        break;
    }

    // this.diagram.add(model);
    // this.diagram.addChild(this.targetItem,model.id)
    this.targetItem = undefined;
    //this.diagram.dataBind()
  }

  clickForm() {
    let option = new SidebarModel();
    option.FormModel = this.dialog?.formModel;
    option.Width = '550px';
    this.callfc.openSide(FormEditConnectorComponent, '', option, '');
  }

  logData(e) {
    console.log(e);
  }

  clickAddForm(data: any) {
    if(this.viewOnly) return;
    console.log('addForm nè', data);
  }

  deleteNode(node: any) {
    if (node && this.diagram) {
      this.diagram.remove(node);
      let connector = this.diagram.getConnectorObject(node.id);
      if (connector) this.diagram.removeData(connector as any);
    }
  }

  nodeSelected: any;
  drawNode: any;
  onSelect(e: any) {
    if (
      e.newValue.length > 0 &&
      (e.newValue[0] as ConnectorModel).sourceID === undefined
    ) {
      this.diagram.selectedItems = {
        constraints: SelectorConstraints.All | SelectorConstraints.UserHandle,
        userHandles: this.handles,
      };
      if (this.diagram.selectedItems.nodes.length > 0) {
        this.drawNode =
          this.diagram.selectedItems.nodes[
            this.diagram.selectedItems.nodes.length - 1
          ];
      }
      //return
    }
    if (e.newValue && e.newValue.length == 1) {
      this.nodeSelected = e.newValue[0];
    }
  }

  defaultData: any = JSON.parse(
    `[{"id":"diagram_id_TeizhRsl0s","shape":{"type":"SwimLane","header":{"style":{"fill":"#fff","strokeColor":"#CCCCCC","textAlign":"Left","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1},"annotation":{"id":"VCs5J","content":"Quy trình động"},"height":30,"id":"PC28g"},"lanes":[{"id":"diagram_id_ycL9JqN5xF","canMove":true,"height":500,"width":400,"header":{"style":{"fill":"#fff","strokeColor":"#CCCCCC","fontSize":14,"gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1},"annotation":{"id":"S4iQc","content":"Bước quy trình"},"height":30,"id":"diagram_id_TeizhRsl0sdiagram_id_ycL9JqN5xF_0_header"},"style":{"fill":"#F9F9F9","strokeColor":"#CCCCCC","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1},"children":[{"id":"diagram_id_XbZlj321Ks","offsetX":296.9375,"offsetY":228,"width":100,"height":100,"margin":{"left":146.4375,"top":50,"right":0,"bottom":0},"style":{"fill":"white","strokeColor":"#000","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"shape":{"type":"Bpmn","shape":"Event","event":{"event":"Start","trigger":"None"},"activity":{"subProcess":{}},"annotations":[]},"ports":[],"zIndex":6,"container":null,"visible":true,"horizontalAlignment":"Left","verticalAlignment":"Top","backgroundColor":"transparent","borderColor":"none","borderWidth":0,"rotateAngle":0,"pivot":{"x":0.5,"y":0.5},"flip":"None","wrapper":{"actualSize":{"width":100,"height":100},"offsetX":271.65625,"offsetY":225.75},"constraints":5240806,"annotations":[],"isExpanded":true,"expandIcon":{"shape":"None"},"fixedUserHandles":[],"flipMode":"All","tooltip":{"openOn":"Auto","content":"","isSticky":false},"inEdges":[],"outEdges":["diagram_id_4CI3Azdg1u"],"parentId":"diagram_id_TeizhRsl0sdiagram_id_ycL9JqN5xF0","processId":"","isPhase":false,"isLane":false},{"id":"diagram_id_UmWPwxt6U0","offsetX":263.28,"offsetY":438.13,"width":300,"height":163.75749999999994,"margin":{"left":38.06124999999997,"top":230.50125000000003,"right":0,"bottom":0},"style":{"fill":"white","strokeColor":"#000","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1,"textOverflow":"Wrap"},"shape":{"type":"HTML","content":"","version":"event"},"ports":[],"zIndex":8,"container":null,"visible":true,"horizontalAlignment":"Left","verticalAlignment":"Top","backgroundColor":"transparent","borderColor":"none","borderWidth":0,"rotateAngle":0,"pivot":{"x":0.5,"y":0.5},"flip":"None","wrapper":{"actualSize":{"width":300,"height":163.75749999999994},"offsetX":263.28,"offsetY":438.13},"annotations":[],"constraints":5240806,"isExpanded":true,"expandIcon":{"shape":"None"},"fixedUserHandles":[],"flipMode":"All","tooltip":{"openOn":"Auto","content":"","isSticky":false},"inEdges":["diagram_id_4CI3Azdg1u"],"outEdges":["diagram_id_c1Uz3Ot4lq"],"parentId":"diagram_id_TeizhRsl0sdiagram_id_ycL9JqN5xF0","processId":"","isPhase":false,"isLane":false}]},{"id":"diagram_id_XBzRMkZMwW","canMove":true,"height":500,"width":400,"header":{"style":{"fill":"#fff","strokeColor":"#CCCCCC","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1,"fontSize":14},"annotation":{"id":"RqmF1","content":"Bước quy trình"},"width":400,"height":30,"id":"diagram_id_TeizhRsl0sdiagram_id_XBzRMkZMwW_0_header"},"style":{"fill":"#F9F9F9","strokeColor":"#CCCCCC","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1},"children":[{"id":"diagram_id_Ny8cXJiDZR","offsetX":723.6990625000021,"offsetY":460,"width":300,"height":200,"margin":{"left":98.98031250000219,"top":234.25,"right":0,"bottom":0},"style":{"fill":"white","strokeColor":"#000","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1,"textOverflow":"Wrap"},"shape":{"type":"HTML","content":"","version":"form"},"ports":[],"zIndex":12,"container":null,"visible":true,"horizontalAlignment":"Left","verticalAlignment":"Top","backgroundColor":"transparent","borderColor":"none","borderWidth":0,"rotateAngle":0,"pivot":{"x":0.5,"y":0.5},"flip":"None","wrapper":{"actualSize":{"width":300,"height":200},"offsetX":723.6990625000021,"offsetY":460},"annotations":[],"constraints":5240806,"isExpanded":true,"expandIcon":{"shape":"None"},"fixedUserHandles":[],"flipMode":"All","tooltip":{"content":"","openOn":"Auto","isSticky":false},"inEdges":["diagram_id_c1Uz3Ot4lq"],"outEdges":["diagram_id_S54ukKmvdb"],"parentId":"diagram_id_TeizhRsl0sdiagram_id_XBzRMkZMwW0","processId":"","isPhase":false,"isLane":false}]},{"id":"diagram_id_SBl2Ptwe9F","canMove":true,"height":500,"width":400,"header":{"style":{"fill":"#fff","strokeColor":"#CCCCCC","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1,"fontSize":14},"annotation":{"id":"wsnRl","content":"Bước quy trình"},"width":400,"height":30,"id":"diagram_id_TeizhRsl0sdiagram_id_SBl2Ptwe9F_0_header"},"style":{"fill":"#F9F9F9","strokeColor":"#CCCCCC","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1},"children":[{"id":"diagram_id_7stMhzRYpM","offsetX":1149.4699999999998,"offsetY":460,"width":101.06124999999997,"height":160,"margin":{"left":224.22062500000004,"top":254.25,"right":0,"bottom":0},"style":{"fill":"white","strokeColor":"#000","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1,"textOverflow":"Wrap"},"shape":{"type":"HTML","content":"","version":"image"},"ports":[],"zIndex":18,"container":null,"visible":true,"horizontalAlignment":"Left","verticalAlignment":"Top","backgroundColor":"transparent","borderColor":"none","borderWidth":0,"rotateAngle":0,"pivot":{"x":0.5,"y":0.5},"flip":"None","wrapper":{"actualSize":{"width":101.06124999999997,"height":160},"offsetX":1195.2359374999996,"offsetY":460},"annotations":[],"constraints":5240806,"isExpanded":true,"expandIcon":{"shape":"None"},"fixedUserHandles":[],"flipMode":"All","tooltip":{"content":"","openOn":"Auto","isSticky":false},"inEdges":["diagram_id_S54ukKmvdb"],"outEdges":["diagram_id_62ykpcrk9r"],"parentId":"diagram_id_TeizhRsl0sdiagram_id_SBl2Ptwe9F0","processId":"","isPhase":false,"isLane":false},{"id":"diagram_id_3E9AipabBl","offsetX":1103.75,"offsetY":250.5,"width":100,"height":100,"margin":{"left":179.03125,"top":74.75,"right":0,"bottom":0},"style":{"fill":"white","strokeColor":"#000","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"shape":{"type":"Bpmn","shape":"Event","event":{"event":"Start","trigger":"None"},"activity":{"subProcess":{}},"annotations":[]},"ports":[],"zIndex":19,"container":null,"visible":true,"horizontalAlignment":"Left","verticalAlignment":"Top","backgroundColor":"transparent","borderColor":"none","borderWidth":0,"rotateAngle":0,"pivot":{"x":0.5,"y":0.5},"flip":"None","wrapper":{"actualSize":{"width":100,"height":100},"offsetX":1149.5159374999998,"offsetY":250.5},"constraints":5240806,"annotations":[],"isExpanded":true,"expandIcon":{"shape":"None"},"fixedUserHandles":[],"flipMode":"All","tooltip":{"openOn":"Auto","content":"","isSticky":false},"inEdges":["diagram_id_62ykpcrk9r"],"outEdges":[],"parentId":"diagram_id_TeizhRsl0sdiagram_id_SBl2Ptwe9F0","processId":"","isPhase":false,"isLane":false}]}],"phases":[{"id":"diagram_id_YsL535MnLO","offset":489.25,"header":{"annotation":{"id":"diagram_id_YsL535MnLO","content":""},"id":"diagram_id_TeizhRsl0sdiagram_id_YsL535MnLO_header"},"style":{"fill":"#FFFFFF","strokeColor":"#CCCCCC","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1}}],"phaseSize":0.5,"orientation":"Vertical","isLane":true,"isPhase":false,"hasHeader":true},"height":519.25,"width":1389.9846874999998,"style":{"fill":"#ffffff","strokeColor":"#ffffff","gradient":{"type":"None"},"strokeWidth":1,"strokeDashArray":"","opacity":1},"offsetX":769.7110937499999,"offsetY":355.375,"ports":[],"container":{"type":"Grid","orientation":"Vertical"},"visible":true,"horizontalAlignment":"Left","verticalAlignment":"Top","backgroundColor":"transparent","borderColor":"none","borderWidth":0,"rotateAngle":0,"pivot":{"x":0.5,"y":0.5},"margin":{},"flip":"None","wrapper":{"actualSize":{"width":1389.9846874999998,"height":519.25},"offsetX":769.7110937499999,"offsetY":355.375},"annotations":[],"constraints":22018030,"isExpanded":true,"expandIcon":{"shape":"None"},"fixedUserHandles":[],"zIndex":4,"flipMode":"All","tooltip":{"openOn":"Auto"},"inEdges":[],"outEdges":[],"parentId":"","processId":"","isPhase":false,"isLane":false}]`
  );
  defaultCnn: any = JSON.parse(
    `[{"id":"diagram_id_4CI3Azdg1u","sourcePoint":{"x":271.66,"y":275.75},"targetPoint":{"x":263.28,"y":356.25},"targetDecorator":{"shape":"Arrow","style":{"fill":"#757575","strokeColor":"#757575","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"width":10,"height":10,"pivot":{"x":0,"y":0.5}},"style":{"strokeWidth":3,"strokeColor":"#757575","fill":"transparent","strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"type":"Bezier","shape":{"type":"None"},"sourceID":"diagram_id_XbZlj321Ks","zIndex":30,"targetID":"diagram_id_UmWPwxt6U0","sourcePortID":"","targetPortID":"","flip":"None","connectorSpacing":13,"segments":[{"type":"Bezier","vector1":{"angle":89.99462852064154,"distance":20.000000087890626},"vector2":{"angle":0,"distance":2.094999999999999},"point":{"x":267.47,"y":315.75},"orientation":"Vertical","point1":{"x":0,"y":0},"point2":{"x":0,"y":0}},{"type":"Bezier","vector1":{"angle":180,"distance":2.0950000000000273},"vector2":{"angle":270,"distance":20.250625000000014},"orientation":"Horizontal","point1":{"x":0,"y":0},"point2":{"x":0,"y":0}}],"sourceDecorator":{"shape":"None","width":10,"height":10,"pivot":{"x":0,"y":0.5},"style":{"fill":"black","strokeColor":"black","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}}},"cornerRadius":0,"wrapper":{"actualSize":{"width":8.389053024379109,"height":79.4270213714313},"offsetX":267.46547348781047,"offsetY":315.4635106857156},"annotations":[],"fixedUserHandles":[],"ports":[],"visible":true,"flipMode":"All","constraints":994878,"hitPadding":10,"tooltip":{"openOn":"Auto","content":"","isSticky":false},"bezierSettings":{"controlPointsVisibility":14,"allowSegmentsReset":true},"connectionPadding":0,"sourcePadding":0,"targetPadding":0,"parentId":""},{"id":"diagram_id_c1Uz3Ot4lq","sourcePoint":{"x":413.28,"y":438.13},"targetPoint":{"x":573.7,"y":460},"targetDecorator":{"shape":"Arrow","style":{"fill":"#757575","strokeColor":"#757575","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"width":10,"height":10,"pivot":{"x":0,"y":0.5}},"style":{"strokeWidth":3,"strokeColor":"#757575","fill":"transparent","strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"type":"Bezier","shape":{"type":"None"},"sourceID":"diagram_id_UmWPwxt6U0","zIndex":31,"targetID":"diagram_id_Ny8cXJiDZR","sourcePortID":"","targetPortID":"","flip":"None","connectorSpacing":13,"segments":[{"type":"Bezier","vector1":{"angle":359.99999999999994,"distance":40.00000000000006},"vector2":{"angle":270,"distance":5.467500000000001},"point":{"x":493.28,"y":449.065},"orientation":"Horizontal","point1":{"x":0,"y":0},"point2":{"x":0,"y":0}},{"type":"Bezier","vector1":{"angle":90,"distance":5.467500000000001},"vector2":{"angle":180,"distance":40.209531250001135},"orientation":"Vertical","point1":{"x":0,"y":0},"point2":{"x":0,"y":0}}],"sourceDecorator":{"shape":"None","width":10,"height":10,"pivot":{"x":0,"y":0.5},"style":{"fill":"black","strokeColor":"black","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}}},"cornerRadius":0,"wrapper":{"actualSize":{"width":157.26197204832647,"height":21.853758919094048},"offsetX":491.9109860241632,"offsetY":449.056879459547},"annotations":[],"fixedUserHandles":[],"ports":[],"visible":true,"flipMode":"All","constraints":994878,"hitPadding":10,"tooltip":{"openOn":"Auto","content":"","isSticky":false},"connectionPadding":0,"bezierSettings":{"controlPointsVisibility":14,"allowSegmentsReset":true},"sourcePadding":0,"targetPadding":0,"parentId":""},{"id":"diagram_id_S54ukKmvdb","sourcePoint":{"x":873.7,"y":460},"targetPoint":{"x":1144.71,"y":460},"targetDecorator":{"shape":"Arrow","style":{"fill":"#757575","strokeColor":"#757575","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"width":10,"height":10,"pivot":{"x":0,"y":0.5}},"style":{"strokeWidth":3,"strokeColor":"#757575","fill":"transparent","strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"type":"Bezier","shape":{"type":"None"},"sourceID":"diagram_id_Ny8cXJiDZR","zIndex":35,"targetID":"diagram_id_7stMhzRYpM","sourcePortID":"","targetPortID":"","flip":"None","connectorSpacing":13,"segments":[{"type":"Bezier","vector1":{"angle":360,"distance":20},"vector2":{"angle":179.99999999999997,"distance":20},"orientation":"Horizontal","point1":{"x":0,"y":0},"point2":{"x":0,"y":0}}],"sourceDecorator":{"shape":"None","width":10,"height":10,"pivot":{"x":0,"y":0.5},"style":{"fill":"black","strokeColor":"black","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}}},"cornerRadius":0,"wrapper":{"actualSize":{"width":270.7752912665501,"height":3.410605131648481e-13},"offsetX":1009.0876456332751,"offsetY":460},"annotations":[],"fixedUserHandles":[],"ports":[],"visible":true,"flipMode":"All","constraints":994878,"hitPadding":10,"tooltip":{"openOn":"Auto","content":"","isSticky":false},"connectionPadding":0,"bezierSettings":{"controlPointsVisibility":14,"allowSegmentsReset":true},"sourcePadding":0,"targetPadding":0,"parentId":""},{"id":"diagram_id_62ykpcrk9r","sourcePoint":{"x":1195.24,"y":380},"targetPoint":{"x":1149.52,"y":300.5},"targetDecorator":{"shape":"Arrow","style":{"fill":"#757575","strokeColor":"#757575","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"width":10,"height":10,"pivot":{"x":0,"y":0.5}},"style":{"strokeWidth":3,"strokeColor":"#757575","fill":"transparent","strokeDashArray":"","opacity":1,"gradient":{"type":"None"}},"type":"Bezier","shape":{"type":"None"},"sourceID":"diagram_id_7stMhzRYpM","zIndex":36,"targetID":"diagram_id_3E9AipabBl","sourcePortID":"","targetPortID":"","flip":"None","connectorSpacing":13,"segments":[{"type":"Bezier","vector1":{"angle":270.00596831034073,"distance":19.5000001057943},"vector2":{"angle":0,"distance":11.42999999999995},"point":{"x":1172.38,"y":341},"orientation":"Vertical","point1":{"x":0,"y":0},"point2":{"x":0,"y":0}},{"type":"Bezier","vector1":{"angle":180,"distance":11.430000000000064},"vector2":{"angle":89.99425273818039,"distance":20.250000101877756},"orientation":"Horizontal","point1":{"x":0,"y":0},"point2":{"x":0,"y":0}}],"sourceDecorator":{"shape":"None","width":10,"height":10,"pivot":{"x":0,"y":0.5},"style":{"fill":"black","strokeColor":"black","strokeWidth":1,"strokeDashArray":"","opacity":1,"gradient":{"type":"None"}}},"cornerRadius":0,"wrapper":{"actualSize":{"width":45.68675888982125,"height":78.67206392318258},"offsetX":1172.3966205550894,"offsetY":340.6639680384087},"annotations":[],"fixedUserHandles":[],"ports":[],"visible":true,"flipMode":"All","constraints":994878,"hitPadding":10,"tooltip":{"openOn":"Auto","content":"","isSticky":false},"bezierSettings":{"controlPointsVisibility":14,"allowSegmentsReset":true},"connectionPadding":0,"sourcePadding":0,"targetPadding":0,"parentId":""}]`
  );
  formData: any = {};
  handles: UserHandleModel[] = [
    {
      name: 'delete',
      pathData:
        'M 7.04 22.13 L 92.95 22.13 L 92.95 88.8 C 92.95 91.92 91.55 94.58 88.76 96.74 C 85.97 98.91 82.55 100 78.52 100 L 21.48 100 C 17.45 100 14.03 98.91 11.24 96.74 C 8.45 94.58 7.04 91.92 7.04 88.8 z M 32.22 0 L 67.78 0 L 75.17 5.47 L 100 5.47 L 100 16.67 L 0 16.67 L 0 5.47 L 24.83 5.47 z',
      visible: true,
      offset: 0.5,
      side: 'Bottom',
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    },
    {
      name: 'add',
      pathData:
        'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z',
      visible: true,
      offset: 0.5,
      side: 'Right',
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    },
    {
      name: 'connect',
      pathData:
        'M256 504C119 504 8 393 8 256S119 8 256 8s248 111 248 248-111 248-248 248zm28.9-143.6L209.4 288H392c13.3 0 24-10.7 24-24v-16c0-13.3-10.7-24-24-24H209.4l75.5-72.4c9.7-9.3 9.9-24.8.4-34.3l-11-10.9c-9.4-9.4-24.6-9.4-33.9 0L107.7 239c-9.4 9.4-9.4 24.6 0 33.9l132.7 132.7c9.4 9.4 24.6 9.4 33.9 0l11-10.9c9.5-9.5 9.3-25-.4-34.3z',
      visible: true,
      offset: 0.5,
      side: 'Left',
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  ];
  selectedItems: SelectorModel = {
    userHandles: this.handles,
  };
  getCustomTool: Function = this.getTool.bind(this);

  userHandleClick(e: any) {
    this.getTool(e.element.name);
  }

  public getTool(action: string) {
    if (action == 'delete') {
      this.diagram.remove();
    }
    if (action == 'add') {
      let newNode:any= cloneObject(this.nodeSelected);
      newNode.id = this.makeid(10);

       if(newNode.isLane){
        this.contextMenuClick({item:{id:'InsertLaneAfter'}} as any)
       }
       else{
        newNode.offsetY = newNode.offsetY+300;
       newNode.wrapper.offsetY = newNode.offsetY;
       newNode.margin.top =  newNode.margin.top + 300
       if(newNode.parentId){
        let prNode = this.diagram.getNodeObject(newNode.parentId);
        if(prNode){
          prNode.height = prNode.height +300;
          newNode.parentId = undefined

          this.diagram.add(newNode);
          this.diagram.addChild(prNode,newNode.id);
          let cnn:ConnectorModel =  {
            id: this.makeid(10),
            type: 'Orthogonal',
           sourceID: this.nodeSelected.id,
           targetID: newNode.id,
          };
          this.diagram.add(cnn);
          this.diagram.reset();
          setTimeout(()=>{
            let item = this.diagram.getNodeObject(newNode.id);
            if(item){

              //this.diagram.updateViewPort();

              this.diagram.select([item]);
            }


          },500)

          return;
          //prNode.height = prNode.height + 300;
          // if((prNode as any).parentId){
          //   let gpNode = this.diagram.nodes.find((x:any)=>x.id== (prNode as any).parentId);
          //   if(gpNode){
          //     //gpNode.height = gpNode.height+300
          //     this.diagram.addNodeToLane(newNode,gpNode.id,prNode.id);
          //   }
          // }
        }
        else {
          newNode.parentId = undefined;
          this.diagram.add(newNode);
          // setTimeout(()=>{
          //   this.diagram.refreshDiagramLayer();
          //   this.diagram.select(newNode);
          // },200)
        }
       }
       else {
        newNode.parentId = undefined;
        this.diagram.add(newNode);
        // setTimeout(()=>{
        //   this.diagram.refreshDiagramLayer();
        //   this.diagram.select(newNode);
        // },200)
      }
       }


      //this.diagram.refreshDiagramLayer();
      console.log('thêm', this.nodeSelected);
    }
    if (action == 'connect') {
      if(!this.diagram.drawingObject) this.diagram.drawingObject =  { type: 'Orthogonal' }
      this.diagram.drawingObject.shape = {};
      (this.diagram.drawingObject as any).type = (
        this.diagram.drawingObject as any
      ).type
        ? (this.diagram.drawingObject as any).type
        : 'Orthogonal';
      (this.diagram.drawingObject as any).sourceID = (this.drawNode as any).id;
      this.diagram.tool = DiagramTools.DrawOnce;
      this.diagram.dataBind();

      // console.log('Nối',this.nodeSelected);
    }
  }

  valueDataChange(e: any, data:any=null) {
    if (this.nodeSelected) {
      if (!this.formData[this.nodeSelected.id]) {
        this.formData[this.nodeSelected.id] = {};
      }
      this.formData[this.nodeSelected.id][e.field] = e.data;
      console.log(this.formData);
    }
  }

  contextMenuOpen(args: DiagramBeforeMenuOpenEventArgs): void {
    for (let item of args.items) {
      if (
        this.diagram.selectedItems.connectors.length +
          this.diagram.selectedItems.nodes.length >
        0
      ) {
        if (item.id === 'InsertLaneBefore' || item.id === 'InsertLaneAfter') {
          if (
            this.diagram.selectedItems.connectors.length ||
            (this.diagram.selectedItems.nodes.length &&
              !(this.diagram.selectedItems.nodes[0] as any).isLane)
          ) {
            args.hiddenItems.push(item.text);
          }
        }
      } else {
        args.hiddenItems.push(item.text);
      }
    }
  }

  contextMenuClick(args: MenuEventArgs): void {
    if (
      args.item.id === 'InsertLaneBefore' ||
      args.item.id === 'InsertLaneAfter'
    ) {
      if (
        this.diagram.selectedItems.nodes.length > 0 &&
        (this.diagram.selectedItems.nodes[0] as any).isLane
      ) {
        let index: number;
        let node: any = this.diagram.selectedItems.nodes[0];
        let swimlane: NodeModel = this.diagram.getObject(
          (this.diagram.selectedItems.nodes[0] as any).parentId
        );
        let shape: SwimLaneModel = swimlane.shape as SwimLaneModel;
        let existingLane: any = cloneObject(shape.lanes[0]);
        let newLane = existingLane;
        newLane.id = this.makeid(10);
        newLane.children = [];
        newLane.header = {
          width: existingLane.header.width,
          height: existingLane.header.height,
          style: existingLane.header.style as ShapeStyleModel,
          annotation: { content: 'Bước quy trình' },
        } as HeaderModel;

        if (shape.orientation === 'Horizontal') {
          let exclude = 0;
          exclude += shape.header ? 1 : 0;
          exclude += shape.phases.length ? 1 : 0;
          index = node.rowIndex - exclude;
          newLane.header.width = existingLane.header.width;
          newLane.header.height = existingLane.height;
        } else {
          index = node.columnIndex - 1;
          newLane.header.width = existingLane.width;
          newLane.header.height = existingLane.header.height;
        }
        newLane.data = this.generateStep('Stage');
        newLane.refID = newLane.data.recID;
        newLane.header.annotation.content = newLane.data.stepName;
        this.process.steps.push(newLane.data);
        if (args.item.id === 'InsertLaneBefore') {
          //this.defaultStep(index)
          this.diagram.addLanes(swimlane, [newLane], index);
        } else {
          this.defaultStep(index+1)
          this.diagram.addLanes(swimlane, [newLane], index + 1);
        }
        //this.diagram.refreshDiagramLayer();
        //this.diagram.clearSelection();
      }
    } else if (args.item.id === 'Cut') {
      this.diagram.cut();
    } else if (args.item.id === 'Clone') {
      this.diagram.copy();
      this.diagram.paste();
    }
  }
  initProcess(){
    if(this.process && Object.keys(this.process).length){
      let objDiagram:any={};
      objDiagram.id=this.makeid(10);
      objDiagram.processID=this.process.recID;
      objDiagram.isProcess=true;
      let shape:any={};
      shape.type='SwimLane';
      shape.hasHeader=true;
      shape.isLane=true;
      // objDiagram.offsetY=-200;
      // objDiagram.offsetX=100;
      objDiagram.margin= { left: 50, top: 20 },
      objDiagram.height = 700;
      objDiagram.width = 500;
      shape.orientation="Vertical";
      shape.margin= { left: 50, top: 20 },
      shape.width=500;
      shape.header = {
        id:this.makeid(5),
        height:30,
        annotation:{
          id: this.process.processID,
          content:this.process.processName,
          style: { fontSize: 16, color: '#0099ff', bold: true }
        },

      }
      shape.lanes=[];
      if(this.process!.steps){
        this.process!.steps = this.process?.steps.sort((a:any,b:any)=> a.stepNo-b.stepNo)
        this.columns= this.process?.steps?.filter(
          (x) => x.activityType == 'Stage'
        );
      }

      let stepNodes:any=[];
      for(let i =0;i < this.columns.length;i++){
        objDiagram.width = 500*(i+1);
        let objLane:any={};
        objLane.id=this.makeid(10);
        //objLane.canMove=false;
        objLane.height=700;
        objLane.width=500;
        objLane.header={
          id:this.makeid(5),
          height:30,
          annotation:{
            id: this.makeid(5),
            refID:this.columns[i].recID,
            content:this.columns[i].stepName,
            style:{bold:true}
          },

        }
        let maxheight:any=0
        let maxwidth:any=objLane.width;
        objLane.children=[];
        if(this.process.steps && this.process.steps.length){
          let currentStageActions= this.process.steps.filter((x:any)=>x.stageID==this.columns[i].recID);
          let offset=50;
          currentStageActions = currentStageActions.sort((a:any,b:any)=> a.stepNo-b.stepNo)
          for(let j =0;j < currentStageActions.length;j++){

            let model:any={};
            model.id = this.makeid(10);
            model.refID = currentStageActions[j].recID;
            if(currentStageActions[j].activityType?.toLowerCase() == 'conditions'){
              model.shape = {
                type: 'Flow',
                shape: 'Decision',
              };
              model.width=100;
              model.height=50;
              model.annotations=[
                {
                    content: currentStageActions[j].stepName,
                    style: { fontSize: 10 }
                }
              ];

              if(currentStageActions[j].settings){
                let setting = typeof currentStageActions[j].settings == 'string' ?  JSON.parse(currentStageActions[j].settings) : currentStageActions[j].settings;
                if(setting && setting.nextSteps){
                  for(let i = 0; i<setting.nextSteps.length;i++){
                    if(setting.nextSteps[i].nextStepID){
                      let step = currentStageActions.find((x:any)=>x.recID == setting.nextSteps[i].nextStepID);
                      if(step){
                        let stepModel:any={};
                        stepModel.id = this.makeid(10);
                        stepModel.refID = step.recID;
                        stepModel.refSourceID=model.refID;
                        if(step.activityType?.toLowerCase() != 'conditions'){
                          stepModel.shape = {
                            type: 'HTML',
                            version: 'step',

                          };
                          if(maxwidth < ((i+1)*300 + 100)){
                            maxwidth=((i+1)*300 + 100)
                          }

                          objLane.width = maxwidth;
                          model.margin={
                            top: offset,
                            left: (objLane.width + 100)/2
                          }
                          stepModel.width = 300;
                          stepModel.height = 150;
                          stepModel.offsetY = offset+200;
                          stepModel.offsetX = i*300 + 50;
                          stepModel.margin={
                            top: offset +200,
                            left: i*300 + 50
                          }
                          stepModel.data = step;
                          if(objLane.children.findIndex((c:any)=>c.refID==stepModel.refID) == -1){
                            objLane.children.push(stepModel)
                            stepNodes.push(stepModel);
                          }
                          else{
                            objLane.children = objLane.children.filter((c:any)=>c.refID!=stepModel.refID);
                            stepNodes = stepNodes.filter((x:any)=>x.refID != stepModel.refID);
                            objLane.children.push(stepModel)
                            stepNodes.push(stepModel);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            else{
              model.shape = {
                type: 'HTML',
                version: 'step'

              };
              model.width = 300;
              model.height = 150;
              model.offsetY = offset;
              model.offsetX = (objLane.width - model.width)/2;

            }

              if(!model.margin){
                model.margin={
                  top: offset,
                  //left: (objLane.width - model.width)/2
                }
              }

              offset=offset+200;
            model.data=currentStageActions[j];
            // model.margin={
            //   top: offset,
            //   left: 20
            // }
            //model.parentID=objLane.id;

            if(objLane.children.findIndex((c:any)=>c.refID==model.refID) == -1){
              objLane.children.push(model)
              stepNodes.push(model);
            }



          }

          if(maxheight < offset + 200){
            maxheight = offset + 200;

          }
          objDiagram.height = maxheight;

          objLane.height = maxheight
          //objLane.width = maxwidth
          offset=0;
        }
        //let maxMargin=0;
        objLane.children =objLane.children.sort((x:any,b:any)=>x.refSourceID ? -1 : 1 )
        objLane.children.forEach((child:any)=>{
          if(child.shape.type =='Flow'){
            child.margin.left=(maxwidth - child.width)/2;
            // child.offsetX =  (maxwidth- 200)/2;
          }
          else{
            if(child.refSourceID){
              let refItems =  objLane.children.filter((x:any)=>x.refSourceID==child.refSourceID);
              if(refItems.length){
                if(refItems.indexOf(child)>-1){
                  child.margin.left=(refItems.indexOf(child)*350 )
                  child.offsetX =  (refItems.indexOf(child)*350)
                  //maxMargin = refItems.indexOf(child)*350 ;
                }
              }
            }
            else{
              child.margin.left=(objLane.width - child.width)/2
              child.offsetX =  (objLane.width - child.width)/2;
            }

          }
        })
        shape.lanes.push(objLane)

      }
      objDiagram.shape=shape;
      this.diagram.clear();
      // objDiagram.isPhase=false;
      // objDiagram.isLane=false;
      setTimeout(()=>{

        this.diagram.addNode(objDiagram);
        this.process.steps.forEach((x:any)=>{
          if(x.settings){
            let setting = typeof x.settings == 'string' ? JSON.parse(x.settings) : x.settings
            if(setting && setting.nextSteps && setting.nextSteps.length){
              for(let i = 0; i< setting.nextSteps.length;i++){
                if(setting.nextSteps[i].nextStepID){
                  let source = stepNodes.find((s:any)=>s.refID== x.recID);
                  let target = stepNodes.find((s:any)=>s.refID== setting.nextSteps[i].nextStepID);
                  if(source && target){
                    let connector: ConnectorModel = {
                      id: this.makeid(10),
                      sourceID: source.id,
                      targetID:target.id,
                      targetDecorator: {
                        shape: 'Arrow',
                        style: { strokeColor: '#757575', fill: '#757575' },
                      },
                      style: { strokeWidth: 1, strokeColor: '#757575' },
                      type: 'Straight',
                    };
                    if(setting.nextSteps[i].predicateName){
                      connector.annotations= [{content:setting.nextSteps[i].predicateName, style: {fill: 'white'}}]
                    }
                    //arrConn.push(connector);
                    this.diagram.addConnector(connector);
                  }

                }


              }

            }
            //debugger
          }

        })
      },500)
      this.detectorRef.detectChanges();
    }
  }

  private makeid(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return 'diagram_id_' + result;
  }
  getSymbolTemplate(e) {
    return {
      description: { text: e.id },
      template: {
        id: 'hehehehihi',
        shape: { type: 'HTML' },
        width: 50,
        height: 50,
      },
    };
  }
  expand(e: any) {
    debugger;
  }
  mouseEnter(e: any) {
    if (this.isDragging) {
      if (e.actualObject) {
        let id = e.actualObject.id.split(e.actualObject.parentId)[1];
        if(id){
          let objRoot = this.diagram.nodes.find((x:any)=>x.id == e.actualObject.parentId);
          if(objRoot && objRoot.shape && (objRoot.shape as any).lanes?.length){
            let objLane = (objRoot.shape as any).lanes.find((x:any)=>id.includes(x.id));
            if(objLane){
              e.actualObject.refID = objLane.refID;
            }
          }
        }
        this.targetItem = e.actualObject;
        console.log(this.targetItem);
      }
    }
  }
  targetItem: any;
  isDragging: boolean = false;
  onDragStart(e: any) {
    this.isDragging = true;
  }
  eleDraw(e: any) {
    if (e.state == 'Completed') {
      //this.isDragging = false;
      //console.log('ta gét',this.targetItem);
      if(e.objectType == 'Connector'){
        let source = this.diagram.nodes.find((x:any)=>x.id==e.source.sourceID)?.data;
        let target = this.diagram.nodes.find((x:any)=>x.id==e.source.targetID)?.data;
        if(source && target){
          let sourceSetting:any={};
          if(typeof (source as any).settings == 'string'){
              sourceSetting = JSON.parse((source as any).settings);
          }
          else sourceSetting = (source as any).settings;
          if(sourceSetting){
            if(sourceSetting.nextSteps && sourceSetting.nextSteps.length){
              sourceSetting.nextSteps.push({nextStepID: (target as any).recID})
            }
            else{
              sourceSetting.nextSteps = [];
              sourceSetting.nextSteps.push({nextStepID: (target as any).recID})
            }
          }
          (source as any).settings = JSON.stringify(sourceSetting);
          let step = this.process.steps.find((x:any)=>x.recID== (source as any).recID);
          if(step) step.settings = JSON.stringify(sourceSetting);
          console.log(this.process);

        }
      }
      //console.log('vẽ cục:   ', e);
      // setTimeout(() => {
      //   this.diagram && this.diagram.refresh();
      // }, 100);
    }
  }
  clickchoi() {
    console.log(this.diagram);
    let dataDiagram = this.diagram.saveDiagram();
    let obj = JSON.parse(dataDiagram);
    if (Object.keys(obj).length && obj.nodes) {
      console.log(JSON.stringify(obj.nodes));
      //console.log(JSON.stringify(obj.connectors));
    }
  }
  shape: any = { type: 'HTML', shape: 'Rectangle' };
  shape1: BpmnShapeModel = {
    type: 'Bpmn',
    shape: 'Event',
    // set the event type as End
    event: {
      event: 'Start',
      trigger: 'None',
    },
  };

  getUserPermission(permission:any){
    if(permission && permission.length){
      let user = permission.filter((x:any)=>x.objectType == 'U' || x.objectType == '1');
      return user.map((x:any)=>x.objectID).join(';');
    }
  }

  lstSteps:any=[];

    getProcess() {
      if(this.recID){
        let sub= this.api
        .execSv('BP', 'BP', 'ProcessesBusiness', 'GetAsync', this.recID)
        .subscribe((item) => {
          if (item) {
            this.process = item;
            this.lstSteps = this.process?.steps?.filter(
              (x) => x.activityType == 'Stage'
            );
            this.columns = this.lstSteps;
            this.initProcess();
          }
          sub.unsubscribe();
        });
      }

    }
   collectionChange(e:any){
    if(this.diagram && this.viewOnly) this.diagram.fitToPage();
    else{
      //this.diagram.bringIntoView({x:600,y:200,width:1024,height:768} as any);
    }
   }

   getVllObject(type:string){
    if(type && this.vllStepType){
      return this.vllStepType.find((x:any)=>x.value==type);
    }
    return {text:'',value:'',icon:'',color:'', textColor:''};
   }
   getIntervalObject(type:string){
    if(type && this.vllInterval){
      return this.vllInterval.find((x:any)=>x.value==type);
    }
    return {text:'',value:'',icon:'',color:'', textColor:''};
   }

   dataValueSettings:any;
   genData(isGenForm:boolean=true) {
    this.process.category = '';
    this.process.settings = [];
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingsBusiness',
        'GetSettingByFormAsync',
        ['BPParameters', '1']
      )
      .subscribe((st) => {
        if (st && st['1']) {
          this.dataValueSettings = JSON.stringify(st['1']);
          if(this.process)this.process.settings = st['1'];
        } else {
          if(this.process) this.process.settings = [];
        }
      });
      this.defaultAdminPermission();
      this.defaultStep(0,isGenForm);
    }
    defaultAdminPermission() {
      let perm :any={};
      perm.objectID = this.user?.userID;
      perm.objectName = this.user?.userName;
      perm.objectType = '1';
      perm.roleType = 'O';
      perm.create = true;
      perm.read = true;
      perm.update = true;
      perm.assign = true;
      perm.delete = true;
      perm.share = true;
      perm.download = true;
      perm.allowPermit = true;
      perm.publish = true;
      perm.isActive = true;

      let permissions = [];
      permissions.push(perm);
      this.process.permissions = permissions;
    }

    generateProcess(){
      this.process = {};
      this.process.recID=Util.uid();
      this.process.steps=[];
      this.process.processName="Quy trình mới";
      this.genData(false);
    }

    generateStep(type:string ='Form',parentID:any=undefined){
      if(!this.process || !Object.keys(this.process).length) return null;
      let vllStage = this.vllStepType.filter((x) => x.value == 'Stage')[0];
      let vllForm = this.vllStepType.filter((x) => x.value == 'Form')[0];
      let form=new BP_Processes_Steps();
      form.recID=Util.uid();
      form.activityType=type;
      form.stepNo = this.process.steps.length ? this.process.steps.length+1 : 1;
      form.stepName = type;
      form.activityType = type;
      let allowEdit = this.process?.settings ?  this.process.settings.filter(
        (x) => x.fieldName == 'AllowEdit'
      )[0] : null;
      form.stageID = parentID;
      form.parentID = parentID;
      form.extendInfo = this.extendInfos;
      form.memo = '';
      form.duration = 1;
      form.interval = '1';
      form.stepType = '1';
      form.settings = JSON.stringify({
        icon: vllForm.icon,
        color: vllForm.color,
        backGround: vllForm.textColor,
        nextSteps: null,
        sortBy: null,
        totalControl: null,
        allowEdit: allowEdit?.fieldValue,
      });
      form.permissions = [{ objectID: this.user?.userID, objectType: 'U' }];
      return form;
    }
    defaultStep(stepNo:number=0, isGenForm:boolean=true) {
      let lstStep = [];
      if(this.process.steps){
        lstStep = this.process.steps;
      }
      let stage = new BP_Processes_Steps();
      let form = new BP_Processes_Steps();
      let vllStage = this.vllStepType.filter((x) => x.value == 'Stage')[0];
      let vllForm = this.vllStepType.filter((x) => x.value == 'Form')[0];

      stage.recID = Util.uid();
      stage.stepNo = stepNo;
      stage.activityType = 'Stage';
      stage.stepName = vllStage.text + ' 1';
      stage.reminder = this.process.reminder;
      stage.eventControl = null;
      stage.stepType = '1';
      stage.permissions = [{ objectID: this.user?.userID, objectType: 'U' }];
      let processallowDrag = null;
      let processDefaultProcess = null;
      let processCompleteControl = null;
      let allowEdit = null;
      if (this.process.settings && this.process.settings.length > 0) {
        processallowDrag = this.process.settings.filter(
          (x) => x.fieldName == 'AllowDrag'
        )[0];
        processDefaultProcess = this.process.settings.filter(
          (x) => x.fieldName == 'DefaultProcess'
        )[0];
        processCompleteControl = this.process.settings.filter(
          (x) => x.fieldName == 'CompleteControl'
        )[0];
        allowEdit = this.process.settings.filter(
          (x) => x.fieldName == 'AllowEdit'
        )[0];
      }

      stage.settings = JSON.stringify({
        icon: 'icon-i-bar-chart-steps',
        color: '#0078FF',
        backGround: '#EAF0FF',
        allowDrag: processallowDrag?.fieldValue || null,
        defaultProcess: processDefaultProcess?.defaultProcess || null,
        completeControl: processCompleteControl?.completeControl || null,
        nextSteps: [{ nextStepID: form.recID }],
        sortBy: null,
        totalControl: null,
        allowEdit: allowEdit?.fieldValue,
      });
      lstStep.push(stage);
      if(isGenForm){
        form.recID = Util.uid();
        form.stepNo = stepNo+1;
        form.stepName = vllForm.text + ' 1';
        form.activityType = 'Form';
        form.stageID = stage.recID;
        form.parentID = stage.recID;
        form.extendInfo = this.extendInfos;
        form.memo = '';
        form.duration = 1;
        form.interval = '1';
        form.stepType = '1';
        form.settings = JSON.stringify({
          icon: vllForm.icon,
          color: vllForm.color,
          backGround: vllForm.textColor,
          nextSteps: null,
          sortBy: null,
          totalControl: null,
          allowEdit: allowEdit?.fieldValue,
        });
        form.permissions = [{ objectID: this.user?.userID, objectType: 'U' }];
        stage.child = [form];
        lstStep.push(form);
      }

      this.process.steps = lstStep;
      // this.cache.message('BP001').subscribe((item) => {
      //   this.process.steps[0].stepName = item?.customName;
      // });
      // this.cache.message('BP002').subscribe((item) => {
      //   if(this.process.steps[1])this.process.steps[1].stepName = item?.customName;
      // });
      this.setLstExtends();
      //this.initProcess();
    }
    lstShowExtends:any=[];
    extendInfos:any=[];
    setLstExtends() {
      let lst = [];
      if (this.extendInfos?.length > 0) {
        this.extendInfos.forEach((res) => {
          let count = 1;
          let tmp = {};
          tmp['columnOrder'] = res.columnOrder;
          const index = lst.findIndex((x) => x.columnOrder == res.columnOrder);
          if (index != -1) {
            let indxChild = lst[index]['children'].findIndex(
              (x) => x.columnNo == res.columnNo
            );
            if (indxChild != -1) {
              lst[index]['children'][indxChild] = res;
            } else {
              lst[index]['children'].push(res);
            }
            lst[index]['children'].sort((a, b) => a.columnNo - b.columnNo);
            count = lst[index]['children'].length ?? 1;
            lst[index]['width'] = (100 / count).toString();
          } else {
            count = 1;
            tmp['width'] = '100';
            let lstChild = [];
            lstChild.push(res);
            tmp['children'] = lstChild;
            lst.push(tmp);
          }
        });
      }
      this.lstShowExtends = lst;
    }
    textEdit(e:any){
      if(e.element.processID){
        this.process.processName=e.newValue;
      }
      if(e.element.data){
        let step = this.columns.find((x:any)=>x.recID==e.element.refID);
        if(step){
          step.stepName=e.newValue;
          e.element.data.stepName=e.newValue;
        }
      }
    }

    sizeChanged(e:any){
      debugger
    }
  //===========
}
