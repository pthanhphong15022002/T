import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  Util,
} from 'codx-core';
import { FormPropertiesFieldsComponent } from './form-properties-fields/form-properties-fields.component';
import {
  Diagram,
  ConnectorEditing,
  DiagramComponent,
  SymbolPaletteComponent,
  SnapSettingsModel,
  SnapConstraints,
  NodeModel,
  PaletteModel,
  PortVisibility,
  PortConstraints,
  BpmnShapeModel,
  BpmnDiagramsService,
  ComplexHierarchicalTreeService,
  ConnectorBridgingService,
  ConnectorEditingService,
  DataBindingService,
  DiagramContextMenuService,
  HierarchicalTreeService,
  LayoutAnimationService,
  MindMapService,
  PrintAndExportService,
  RadialTreeService,
  SnappingService,
  SymmetricLayoutService,
  UndoRedoService,
  ConnectorModel,
  HeaderModel,
  DiagramTools,
  ContextMenuSettingsModel,
  DiagramBeforeMenuOpenEventArgs,
  LaneModel,
  ShapeStyleModel,
  SwimLaneModel,
  cloneObject,
  randomId,
  RulerSettingsModel,
  SwimLane,
  UndoRedo,
  UserHandleModel,
  SelectorModel,
} from '@syncfusion/ej2-angular-diagrams';
import { ExpandMode, MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { log } from 'console';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import { FormAdvancedSettingsComponent } from './form-advanced-settings/form-advanced-settings.component';
import { FormEditConnectorComponent } from './form-edit-connector/form-edit-connector.component';
import {
  BP_Processes,
  BP_Processes_Permissions,
  BP_Processes_Steps,
} from '../../models/BP_Processes.model';
import { Subject, takeUntil } from 'rxjs';
import { ModeviewComponent } from '../../modeview/modeview.component';
import { DynamicSettingControlComponent } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting-control/dynamic-setting-control.component';
Diagram.Inject(ConnectorEditing);
@Component({
  selector: 'lib-popup-add-process',
  templateUrl: './popup-add-process.component.html',
  styleUrls: ['./popup-add-process.component.scss'],
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
export class PopupAddProcessComponent {
  @ViewChild('status') status: ElementRef;
  //============ TRAM TEST

  @ViewChild('diagram') diagram: DiagramComponent;
  @ViewChild('palette') palette: SymbolPaletteComponent;
  @ViewChild('nodeTemplate') nodeTemplate: TemplateRef<any>;

  created(): void {
    this.diagram.fitToPage();
    this.diagram.clearSelection();
    this.diagram.scrollSettings.canAutoScroll = true;
    //this.diagram.tool = DiagramTools.ZoomPan;
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
    { id: 'connector', text: 'Connector', icon: 'icon-timeline' },
    { id: 'start_end', text: 'Start/End', icon: 'icon-i-circle' },
    { id: 'decision', text: 'Điều kiện', icon: 'icon-i-diamond' },
    { id: 'swimlane', text: 'SwimLane', icon: 'icon-view_quilt' },
    { id: 'form', text: 'Forms', icon: 'icon-note_add' },
    { id: 'event', text: 'Sự kiện', icon: 'icon-i-calendar2-event-fill' },
    { id: 'email', text: 'Gửi mail', icon: 'icon-mail' },
    { id: 'task', text: 'Công việc', icon: 'icon-check-correct' },
    { id: 'esign', text: 'Ký số', icon: 'icon-i-pen' },
    { id: 'image', text: 'hình ảnh', icon: 'icon-broken_image' },
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
  public palettes: PaletteModel[] = [
    {
      id: 'flow',
      expanded: true,
      title: 'Flow Shapes',
      symbols: [
        {
          id: 'Terminator',
          addInfo: { tooltip: 'Terminator' },
          width: 50,
          height: 60,
          shape: { type: 'Flow', shape: 'Terminator' },
          style: { strokeWidth: 1, strokeColor: '#757575' },
          ports: [
            {
              offset: { x: 0, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 0 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 1, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 1 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
          ],
        },
        {
          id: 'Process',
          addInfo: { tooltip: 'Process' },
          width: 50,
          height: 60,
          shape: { type: 'Flow', shape: 'Process' },
          style: { strokeWidth: 1, strokeColor: '#757575' },
          ports: [
            {
              offset: { x: 0, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 0 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 1, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 1 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
          ],
        },
        {
          id: 'Decision',
          addInfo: { tooltip: 'Decision' },
          width: 50,
          height: 50,
          shape: { type: 'Flow', shape: 'Decision' },
          style: { strokeWidth: 1, strokeColor: '#757575' },
          ports: [
            {
              offset: { x: 0, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 0 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 1, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 1 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
          ],
        },
        {
          id: 'Document',
          addInfo: { tooltip: 'Document' },
          width: 50,
          height: 50,
          shape: { type: 'Flow', shape: 'Document' },
          style: { strokeWidth: 1, strokeColor: '#757575' },
          ports: [
            {
              offset: { x: 0, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 0 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 1, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 1 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
          ],
        },
        {
          id: 'Predefinedprocess',
          addInfo: { tooltip: 'Predefined process' },
          width: 50,
          height: 50,
          shape: { type: 'Flow', shape: 'PreDefinedProcess' },
          ports: [
            {
              offset: { x: 0, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 0 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 1, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 1 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
          ],
          style: { strokeWidth: 1, strokeColor: '#757575' },
        },
        {
          id: 'Data',
          addInfo: { tooltip: 'Data' },
          width: 50,
          height: 50,
          shape: { type: 'Flow', shape: 'Data' },
          ports: [
            {
              offset: { x: 0, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 0 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 1, y: 0.5 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
            {
              offset: { x: 0.5, y: 1 },
              visibility: PortVisibility.Connect | PortVisibility.Hover,
              constraints: PortConstraints.Draw,
            },
          ],
          style: { strokeWidth: 1, strokeColor: '#757575' },
        },
        {
          id: 'hehehehihi',
          style: { strokeWidth: 1, strokeColor: '#757575' },
          annotations: [{ content: 'hello' }],
        },
      ],
    },
    {
      id: 'swimlaneShapes',
      expanded: true,
      title: 'Swimlane Shapes',
      symbols: [
        {
          id: 'Horizontalswimlane',
          addInfo: { tooltip: 'Horizontal swimlane' },
          shape: {
            type: 'SwimLane',
            lanes: [
              {
                id: 'lane1',
                style: { strokeColor: '#757575' },
                height: 60,
                width: 150,
                header: {
                  width: 50,
                  height: 50,
                  style: { strokeColor: '#757575', fontSize: 11 },
                },
              },
            ],
            orientation: 'Horizontal',
            isLane: true,
          },
          height: 60,
          width: 140,
          offsetX: 70,
          offsetY: 30,
        },
        {
          id: 'Verticalswimlane',
          addInfo: { tooltip: 'Vertical swimlane' },
          shape: {
            type: 'SwimLane',
            lanes: [
              {
                id: 'lane1',
                style: { strokeColor: '#757575' },
                height: 150,
                width: 60,
                header: {
                  width: 50,
                  height: 50,
                  style: { strokeColor: '#757575', fontSize: 11 },
                },
              },
            ],
            orientation: 'Vertical',
            isLane: true,
          },
          height: 140,
          width: 60,
          // style: { fill: '#f5f5f5' },
          offsetX: 70,
          offsetY: 30,
        },
        {
          id: 'Verticalphase',
          addInfo: { tooltip: 'Vertical phase' },
          shape: {
            type: 'SwimLane',
            phases: [
              {
                style: {
                  strokeWidth: 1,
                  strokeDashArray: '3,3',
                  strokeColor: '#757575',
                },
              },
            ],
            annotations: [{ text: '' }],
            orientation: 'Vertical',
            isPhase: true,
          },
          height: 60,
          width: 140,
          style: { strokeColor: '#757575' },
        },
        {
          id: 'Horizontalphase',
          addInfo: { tooltip: 'Horizontal phase' },
          shape: {
            type: 'SwimLane',
            phases: [
              {
                style: {
                  strokeWidth: 1,
                  strokeDashArray: '3,3',
                  strokeColor: '#757575',
                },
              },
            ],
            annotations: [{ text: '' }],
            orientation: 'Horizontal',
            isPhase: true,
          },
          height: 60,
          width: 140,
          style: { strokeColor: '#757575' },
        },
      ],
    },
    {
      id: 'connectors',
      expanded: true,
      symbols: [
        {
          id: 'Link1',
          type: 'Orthogonal',
          sourcePoint: { x: 0, y: 0 },
          targetPoint: { x: 40, y: 40 },
          targetDecorator: {
            shape: 'Arrow',
            style: { strokeColor: '#757575', fill: '#757575' },
          },
          style: { strokeWidth: 1, strokeColor: '#757575' },
        },
        {
          id: 'Link2',
          type: 'Orthogonal',
          sourcePoint: { x: 0, y: 0 },
          targetPoint: { x: 40, y: 40 },
          targetDecorator: {
            shape: 'Arrow',
            style: { strokeColor: '#757575', fill: '#757575' },
          },
          style: {
            strokeWidth: 1,
            strokeDashArray: '4 4',
            strokeColor: '#757575',
          },
        },
        {
          id: 'Link21',
          type: 'Straight',
          sourcePoint: { x: 0, y: 0 },
          targetPoint: { x: 60, y: 60 },
          targetDecorator: {
            shape: 'Arrow',
            style: { strokeColor: '#757575', fill: '#757575' },
          },
          style: { strokeWidth: 1, strokeColor: '#757575' },
        },
        {
          id: 'Link22',
          type: 'Straight',
          sourcePoint: { x: 0, y: 0 },
          targetPoint: { x: 60, y: 60 },
          targetDecorator: {
            shape: 'Arrow',
            style: { strokeColor: '#757575', fill: '#757575' },
          },
          style: {
            strokeWidth: 1,
            strokeDashArray: '4 4',
            strokeColor: '#757575',
          },
        },
      ],
      title: 'Connectors',
    },
  ];
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
      setTimeout(() => {
        this.diagram && this.diagram.refreshDiagramLayer();
      }, 100);
    }
  }

  dragEnter(e: any) {
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
      margin: { left: 100, top: 100 },
      style: { strokeColor: '#000' },
    };

    //model.offsetX = model.offsetX -  this.diagram.diagramLayer?.getBoundingClientRect().width
    //model.offsetY = model.offsetY -  this.diagram.diagramLayer?.getBoundingClientRect().y
    //model.offsetY = e.event.target.getBoundingClientRect().y - model.offsetY +  e.event.target.getBoundingClientRect().height;
    model.margin.left =
      model.offsetX - e.event.target.getBoundingClientRect().x;
    model.margin.top = model.offsetY - e.event.target.getBoundingClientRect().y;
    switch (e.item?.element?.nativeElement?.id) {
      case 'start_end':
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
      case 'decision':
        model.shape = {
          type: 'Flow',
          shape: 'Decision',
        };
        model.offsetY = model.offsetY - 100;
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
          type: 'Bezier',
        };
        this.diagram.addConnector(connector);
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
                height: 500,
                width: 400,
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
                offset: 170,
                header: { annotation: { content: '' } },
              },
            ],
            phaseSize: 0.5,
            orientation: 'Vertical',
            isLane: true,
          },
          height: 500,
          width: 400,
          style: { strokeColor: '#ffffff', fill: '#ffffff' },
          offsetX: model.offsetX,
          offsetY: model.offsetY + 100,
        };
        this.diagram.add(swimLane);
        break;
      case 'form':
      case 'esign':
      case 'image':
      case 'task':
      case 'event':
      case 'email':
        model.id = this.makeid(10);
        model.shape = {
          type: 'HTML',
          version: e.item?.element?.nativeElement?.id,
        };
        model.width = 300;
        model.height = 200;
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
    console.log('addForm nè', data.id);
  }

  deleteNode(node: any) {
    if (node && this.diagram) {
      this.diagram.remove(node);
      let connector = this.diagram.getConnectorObject(node.id);
      if (connector) this.diagram.removeData(connector as any);
    }
  }
  nodeSelected: any;
  onSelect(e: any) {
    if (e.newValue && e.newValue.length == 1) {
      this.nodeSelected = e.newValue[0];
    }
    console.log('chọn nè', e);
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
    //   {
    //     name: 'connect', pathData: "M 7.04 22.13 L 92.95 22.13 L 92.95 88.8 C 92.95 91.92 91.55 94.58 88.76 96.74 C 85.97 98.91 82.55 100 78.52 100 L 21.48 100 C 17.45 100 14.03 98.91 11.24 96.74 C 8.45 94.58 7.04 91.92 7.04 88.8 z M 32.22 0 L 67.78 0 L 75.17 5.47 L 100 5.47 L 100 16.67 L 0 16.67 L 0 5.47 L 24.83 5.47 z",
    //     visible: true, offset: 0.5, side: 'Right', margin: { top: 0, bottom: 0, left: 0, right: 0 }
    // }
  ];
  selectedItems: SelectorModel = {
    userHandles: this.handles,
  };
  getCustomTool: Function = this.getTool.bind(this);

  public getTool(action: string) {
    if (action == 'delete') {
      this.diagram.remove();
    }
  }
  valueDataChange(e: any) {
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
        let existingLane: LaneModel = cloneObject(shape.lanes[0]);
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
        if (args.item.id === 'InsertLaneBefore') {
          this.diagram.addLanes(swimlane, [newLane], index);
        } else {
          this.diagram.addLanes(swimlane, [newLane], index + 1);
        }
        this.diagram.refreshDiagramLayer();
        //this.diagram.clearSelection();
      }
    } else if (args.item.id === 'Cut') {
      this.diagram.cut();
    } else if (args.item.id === 'Clone') {
      this.diagram.copy();
      this.diagram.paste();
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
      console.log('vẽ cục:   ', e);
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
      console.log(JSON.stringify(obj.connectors));
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

  //===========
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;
  private destroyFrom$: Subject<void> = new Subject<void>();

  dialog: any;
  data: BP_Processes;
  action = 'add';
  currentTab = 0; //Tab hiện tại
  processTab = 0; // Tổng bước đã quua
  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ
  linkAvatar = '';
  vllBP002: any;
  extendInfos = [];
  title = '';
  vllShare = '';
  typeShare = '';
  multiple = true;
  listCombobox = {};
  user: any;
  countValidate = 0;
  gridViewSetup: any;
  lstShowExtends = [];
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    private cache: CacheService,
    private bpSv: CodxBpService,
    private authStore: AuthStore,
    private notiSv: NotificationsService,
    private elementRef: ElementRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.action = dt?.data?.action;
    this.title = dt?.data?.title;
    this.user = this.authStore.get();
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }

  ngOnInit(): void {
    if (this.action == 'edit') {
      this.getAvatar(this.data?.recID, this.data?.processName);
      this.extendInfos =
        this.data?.steps?.length > 0
          ? this.data?.steps?.filter((x) => x.activityType == '1')[0]
              ?.extendInfo
          : [];
      this.setLstExtends();
    } else {
    }
    this.getCacheCbxOrVll();
  }

  ngAfterViewInit(): void {}

  onDestroy() {
    this.destroyFrom$.next();
    this.destroyFrom$.complete();
  }

  //#region get or set default form
  getCacheCbxOrVll() {
    this.cache
      .valueList('BP002')
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((item) => {
        if (item) {
          this.vllBP002 = item;
          if (this.action == 'add') {
            this.setDefaultTitle();
            this.defaultStep();
            this.setLstExtends();
          }
        }
      });
  }

  setDefaultTitle() {
    const createField = (value, fieldType, isForm = false) => {
      const field = {
        recID: Util.uid(),
        fieldName: this.bpSv.createAutoNumber(
          value,
          this.extendInfos,
          'fieldName'
        ),
        title: this.bpSv.createAutoNumber(value, this.extendInfos, 'title'),
        dataType: 'String',
        fieldType,
        controlType: 'TextBox',
        isRequired: true,
        defaultValue: null,
        description: '',
        columnOrder: !isForm ? 0 : 1, //parent
        columnNo: 0, //children
      };

      if (isForm) {
        field.description = 'Câu trả lời';
        field.defaultValue = field.title;
      }

      return field;
    };

    const dataVllTitle = this.vllBP002?.datas?.find((x) => x.value === 'Title');
    const dataVllSubTitle = this.vllBP002?.datas?.find(
      (x) => x.value === 'SubTitle'
    );

    const titleField = createField(dataVllTitle?.text, dataVllTitle?.value);
    const lst = [titleField];

    if (dataVllSubTitle) {
      const subTitleField = createField(
        dataVllSubTitle?.text,
        dataVllSubTitle?.value,
        true
      );
      lst.push(subTitleField);
    }

    this.extendInfos = [...this.extendInfos, ...lst];
  }

  defaultStep() {
    let lstStep = [];
    var step = new BP_Processes_Steps();
    step.recID = Util.uid();
    step.stepNo = 1;
    step.stepName = 'Bước 1';
    step.activityType = '1';
    step.stageID = step.recID;
    step.parentID = this.data.recID;
    step.extendInfo = this.extendInfos;
    lstStep.push(step);
    this.data.steps = lstStep;
  }

  setLstExtends() {
    let lst = [];
    if (this.extendInfos?.length > 0) {
      console.log('extendInfos: ', this.extendInfos);
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

  setColumn(item) {
    let count = this.extendInfos.filter(
      (x) => x.columnOrder == item.columnOrder
    ).length;
    return count <= 1 ? '100' : (100 / count).toString();
  }
  //#endregion

  //#region setting created tab
  clickTab(tabNo: number) {
    let newNo = tabNo;
    let oldNo = this.currentTab;
    // if (tabNo <= this.processTab && tabNo != this.currentTab) { //cmt tạm để làm cho xong rồi bắt sau
    this.updateNodeStatus(oldNo, newNo);
    this.currentTab = tabNo;
    if (tabNo == 1) {
      setTimeout(() => {
        if (this.elementRef.nativeElement.querySelector('#appearance'))
          this.elementRef.nativeElement.querySelector('#appearance').onclick =
            this.documentClick.bind(this);
      }, 200);
    }

    // }
    this.detectorRef.detectChanges();
  }

  updateNodeStatus(oldNode: number, newNode: number) {
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );
    let newClassName = (nodes[newNode] as HTMLElement).className;
    switch (newClassName) {
      case 'stepper-item':
        (nodes[newNode] as HTMLElement).classList.add('active');

        break;
      case 'stepper-item approve-disabled':
        (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
        (nodes[newNode] as HTMLElement).classList.add('approve');
        break;
    }

    let oldClassName = (nodes[oldNode] as HTMLElement).className;
    switch (oldClassName) {
      case 'stepper-item approve':
        (nodes[oldNode] as HTMLElement).classList.remove('approve');
        break;
      case 'stepper-item active':
        (nodes[oldNode] as HTMLElement).classList.remove('active');
        break;
    }
    if (
      oldNode > newNode &&
      this.currentTab == this.processTab &&
      this.action != 'edit'
    ) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }
  async continue(currentTab) {
    if (currentTab == 0) {
      //check điều kiện để continue
    }
    if (this.currentTab > 3) return;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      case 1:
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
        this.currentTab++;
        break;
      case 2:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab++;
        break;
    }
    // this.changeDetectorRef.detectChanges();
    this.detectorRef.markForCheck();
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }
  //#endregion

  //#region Thong tin chung - Infomations
  valueChange(e) {
    if (e) {
      this.data[e?.field] = e?.data;
    }
  }

  //---- AVATA ---- //
  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }
  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      let countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;
      // this.changeDetectorRef.detectChanges();
      this.detectorRef.markForCheck();
    }
  }

  getAvatar(objectID, proccessName) {
    let avatar = [
      '',
      this.dialog?.formModel?.funcID,
      objectID,
      'BP_Processes',
      'inline',
      1000,
      proccessName,
      'avt',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          // this.changeDetectorRef.detectChanges();
          this.detectorRef.markForCheck();
        }
      });
  }
  //#endregion

  //#region control Share
  //Control share
  sharePerm(share) {
    this.listCombobox = {};
    this.multiple = true;
    this.vllShare = 'DP0331';
    this.typeShare = '1';
    this.multiple = true;
    let option = new DialogModel();
    option.zIndex = 1010;
    this.callfc.openForm(share, '', 420, 600, null, null, null, option);
  }

  openPopupParticipants(popupParticipants) {
    let option = new DialogModel();
    option.zIndex = 1010;
    this.callfc.openForm(
      popupParticipants,
      '',
      950,
      650,
      null,
      null,
      null,
      option
    );
  }

  searchAddUsers(e) {
    if (e && e?.component?.itemsSelected?.length > 0) {
      let permissions = this.data.permissions ?? [];
      const data = e?.component?.itemsSelected[0];
      if (data) {
        let perm = new BP_Processes_Permissions();
        perm.objectID = data?.UserID;
        perm.objectName = data?.UserName;
        perm.objectType = 'U';
        perm.read = true;
        perm.full = true;
        perm.create = true;
        perm.assign = true;
        perm.edit = true;
        perm.delete = true;
        perm.isActive = true;

        permissions = this.checkUserPermission(permissions, perm);
        this.data.permissions = permissions;
      }

      this.detectorRef.markForCheck();
    }
  }

  applyShare(e) {
    let permissions = this.data?.permissions ?? [];
    if (e?.length > 0) {
      let value = e;
      //Người giám sát
      for (let i = 0; i < value.length; i++) {
        let data = value[i];
        let perm = new BP_Processes_Permissions();
        perm.objectName =
          data?.objectType != '1'
            ? data.text == null || data.text == ''
              ? data?.objectName
              : data?.text
            : this.user?.userName;

        perm.objectID =
          data?.objectType != '1'
            ? data.id != null
              ? data.id
              : null
            : this.user?.userID;
        perm.objectType = data.objectType;
        perm.full = true;
        perm.create = true;
        perm.read = true;
        perm.assign = true;
        perm.edit = true;
        // perm.publish = true;
        perm.delete = true;
        perm.isActive = true;
        permissions = this.checkUserPermission(permissions, perm);
      }
      this.data.permissions = permissions;
    }
    // this.changeDetectorRef.detectChanges();
    this.detectorRef.markForCheck();
  }

  checkUserPermission(
    listPerm: BP_Processes_Permissions[],
    perm: BP_Processes_Permissions
  ) {
    let index = -1;
    if (listPerm != null) {
      if (perm != null && listPerm.length > 0) {
        index = listPerm.findIndex(
          (x) =>
            (x.objectID != null &&
              x.objectID === perm.objectID &&
              x.objectType == perm.objectType) ||
            (x.objectID == null && x.objectType == perm.objectType)
        );
      }
    } else {
      listPerm = [];
    }

    if (index == -1) {
      listPerm.push(Object.assign({}, perm));
    }

    return listPerm;
  }

  clickRoles() {}

  removeUser(index) {
    // let config = new AlertConfirmInputConfig();
    // config.type = 'YesNo';
    this.notiSv
      .alertCode('SYS030')
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((x) => {
        if (x.event.status == 'Y') {
          this.data.permissions.splice(index, 1);
          // this.changeDetectorRef.detectChanges();
          this.detectorRef.markForCheck();
        }
      });
  }

  checkAssignRemove(i) {
    return true;
  }
  //#endregion

  //#region setting advanced - thiết lập nâng cao
  async popupAdvancedSetting() {
    let option = new DialogModel();
    option.zIndex = 1010;
    option.FormModel = JSON.parse(JSON.stringify(this.dialog.formModel));
    // let dataValue = await firstValueFrom(this.api
    //   .execSv<any>('BG', 'BG', 'ScheduleTasksBusiness', 'GetScheduleTasksAsync', [
    //     'ACP101',
    //   ]));

    let data = {
      newSetting: this.data.settings ?? [],
      lineType: '1',
      tilte: 'Thiết lập nâng cao',
      // settingFull: dataValue,
      // dataValue: dataValue?.paraValues
    };

    this.callfc.openForm(
      DynamicSettingControlComponent,
      '',
      700,
      800,
      '',
      data,
      '',
      option
    );
    // let popupDialog = this.callfc.openForm(
    //   FormAdvancedSettingsComponent,
    //   '',
    //   700,
    //   800,
    //   '',
    //   data,
    //   '',
    //   option
    // );
    // popupDialog.closed.subscribe((e) => {
    //   if (e) {
    //   }
    // });
  }
  //#endregion
  //#region form setting properties
  formPropertieFields() {
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;

    let formModelField = new FormModel();
    formModelField.formName = 'DPStepsFields';
    formModelField.gridViewName = 'grvDPStepsFields';
    formModelField.entityName = 'DP_Steps_Fields';
    formModelField.userPermission = this.dialog?.formModel?.userPermission;
    option.FormModel = formModelField;
    debugger;
    // let data = {
    //   process: this.data,
    //   vllBP002: this.vllBP002,
    //   lstStepFields: this.extendInfos,
    //   isForm: true,
    // };
    // let popupDialog = this.callfc.openForm(
    //   FormPropertiesFieldsComponent,
    //   '',
    //   null,
    //   null,
    //   '',
    //   data,
    //   '',
    //   option
    // );
    // popupDialog.closed.subscribe((e) => {
    //   if (e && e?.event) {
    //     this.extendInfos =
    //       e?.event?.length > 0 ? JSON.parse(JSON.stringify(e?.event)) : [];

    //     let extDocumentControls = this.extendInfos.filter(x => x.fieldType == 'Attachment' && x.documentControl != null && x.documentControl?.trim() != '');
    //     if(extDocumentControls?.length > 0){
    //       let lstDocumentControl = [];
    //       extDocumentControls.forEach((ele) => {
    //         const documents = JSON.parse(ele.documentControl);
    //         documents.forEach((res) => {
    //           var tmpDoc = {};
    //           tmpDoc['recID'] = Util.uid();
    //           tmpDoc['stepNo'] = 1;
    //           tmpDoc['fieldID'] = res.recID;
    //           tmpDoc['title'] = res.title;
    //           tmpDoc['memo'] = res.memo;
    //           tmpDoc['isRequired'] = res.isRequired ?? false;
    //           tmpDoc['count'] = res.count ?? 0;
    //           tmpDoc['templateID'] = res.templateID;
    //           lstDocumentControl.push(tmpDoc);
    //         });
    //       });
    //       this.data.documentControl = JSON.stringify(lstDocumentControl);
    //     }
    //     if(this.data?.steps[0]?.extendInfo){
    //       this.data.steps[0].extendInfo = this.extendInfos;
    //     }
    //     this.detectorRef.markForCheck()
    //   }
    // });

    let popupDialog = this.callfc.openForm(
      ModeviewComponent,
      '',
      null,
      null,
      '',
      this.extendInfos,
      '',
      option
    );
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        this.extendInfos =
          res?.event?.length > 0 ? JSON.parse(JSON.stringify(res?.event)) : [];
        this.setLstExtends();
        let extDocumentControls = this.extendInfos.filter(
          (x) => x.fieldType == 'Attachment' && x.documentControl != null
        );
        if (extDocumentControls?.length > 0) {
          let lstDocumentControl = [];
          extDocumentControls.forEach((ele) => {
            const documents =
              typeof ele.documentControl == 'string'
                ? ele.documentControl
                  ? JSON.parse(ele.documentControl)
                  : []
                : ele.documentControl ?? [];
            documents.forEach((res) => {
              var tmpDoc = {};
              tmpDoc['recID'] = Util.uid();
              tmpDoc['stepNo'] = 1;
              tmpDoc['fieldID'] = res.recID;
              tmpDoc['title'] = res.title;
              tmpDoc['memo'] = res.memo;
              tmpDoc['isRequired'] = res.isRequired ?? false;
              tmpDoc['count'] = res.count ?? 0;
              tmpDoc['templateID'] = res.templateID;
              lstDocumentControl.push(tmpDoc);
            });
          });
          this.data.documentControl = JSON.stringify(lstDocumentControl);
        }

        if (this.data?.steps[0]?.extendInfo) {
          this.extendInfos.forEach((element) => {
            if (typeof element.documentControl != 'string') {
              element.documentControl = JSON.stringify(element.documentControl);
            }
          });
          this.data.steps[0].extendInfo = this.extendInfos;
        }
        this.detectorRef.markForCheck();
      }
    });
  }
  //#endregion

  async onSave() {
    this.data.category = '1';
    // this.countValidate = this.bpSv.checkValidate(this.gridViewSetup, this.data);
    // if (this.countValidate > 0) return;

    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable())
        .pipe(takeUntil(this.destroyFrom$))
        .subscribe((res) => {
          // save file
          if (res) {
            this.handlerSave();
          }
        });
    } else {
      this.handlerSave();
    }
  }

  handlerSave() {
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else {
      this.onUpdate();
    }
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res.save);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res && res.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          res.update.modifiedOn = new Date();
          this.dialog.close(res.update);
        }
      });
  }

  beforeSave(op) {
    let data = [];
    op.className = 'ProcessesBusiness';
    op.service = 'BP';
    data = [this.data];
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddProcessAsync';
    } else {
      op.methodName = 'UpdateProcessAsync';
    }
    op.data = data;
    return true;
  }
}
