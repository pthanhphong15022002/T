import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef, FormModel, Util } from 'codx-core';
import { FormPropertiesFieldsComponent } from './form-properties-fields/form-properties-fields.component';
import {Diagram,ConnectorEditing, DiagramComponent, SymbolPaletteComponent, SnapSettingsModel, SnapConstraints, NodeModel, PaletteModel, PortVisibility, PortConstraints, BpmnShapeModel, BpmnDiagramsService, ComplexHierarchicalTreeService, ConnectorBridgingService, ConnectorEditingService, DataBindingService, DiagramContextMenuService, HierarchicalTreeService, LayoutAnimationService, MindMapService, PrintAndExportService, RadialTreeService, SnappingService, SymmetricLayoutService, UndoRedoService, ConnectorModel, HeaderModel, DiagramTools, ContextMenuSettingsModel, DiagramBeforeMenuOpenEventArgs, LaneModel, ShapeStyleModel, SwimLaneModel, cloneObject, randomId } from '@syncfusion/ej2-angular-diagrams';
import { ExpandMode, MenuEventArgs } from '@syncfusion/ej2-angular-navigations';
import { log } from 'console';
Diagram.Inject(ConnectorEditing)
@Component({
  selector: 'lib-popup-add-process',
  templateUrl: './popup-add-process.component.html',
  styleUrls: ['./popup-add-process.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ HierarchicalTreeService, MindMapService, RadialTreeService, ComplexHierarchicalTreeService, DataBindingService, SnappingService, PrintAndExportService, BpmnDiagramsService, SymmetricLayoutService, ConnectorBridgingService, UndoRedoService, LayoutAnimationService, DiagramContextMenuService, ConnectorEditingService ]

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
clickPan(isPan){
  if(this.diagram && isPan) this.diagram.tool = DiagramTools.ZoomPan;
  if(this.diagram && !isPan) this.diagram!.tool = DiagramTools.Default
}
  interval = [1, 9, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75, 0.25, 9.75];
  gridlines = { lineColor: '#e0e0e0', lineIntervals: this.interval };
  snapSettings: SnapSettingsModel = {
    horizontalGridlines: this.gridlines,
    verticalGridlines: this.gridlines,
    constraints: SnapConstraints.All & ~SnapConstraints.ShowLines
  }
  nodes: NodeModel[]  = [

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
connectors:any=[{
  id:'connector1',
  sourceID:'node1',
  targetID:'node2_template'

},{
  id:'connector2',
  sourceID:'node2_template',
  targetID:'node3_template'

},{
  id:'connector3',
  sourceID:'node3_template',
  targetID:'node3'

},
{
  id:'connector4',
  sourceID:'node3',
  targetID:'node4_template',
  type: 'Orthogonal', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 40, y: 40 },
  targetDecorator: { shape: 'Arrow', style: {strokeColor: '#757575', fill: '#757575'} }, style: { strokeWidth: 1, strokeColor: '#757575' },
  annotations: [{content:'Quản lý', style: {fill: '#ddd'}}]
},
{
  id:'connector5',
  sourceID:'node3',
  targetID:'node5_template',
  type: 'Orthogonal', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 40, y: 40 },
  targetDecorator: { shape: 'Arrow', style: {strokeColor: '#757575', fill: '#757575'} }, style: { strokeWidth: 1, strokeColor: '#757575' },
  annotations: [{content:'Nhân viên', style: {fill: '#ddd'}}]

},]

menuDrag:any=[
  {id:'swimlane',text: 'SwimLane', icon:'icon-view_quilt'},
  {id:'connector',text: 'Connector', icon:'icon-timeline'},
  {id:'start_end',text: 'Start/End', icon:'icon-i-circle'},
  {id:'decision',text: 'Điều kiện', icon:'icon-i-diamond'},
  {id:'form',text: 'Forms', icon:'icon-note_add'},
  {id:'event',text: 'Sự kiện', icon:'icon-i-calendar2-event-fill'},
  {id:'email',text: 'Gửi mail', icon:'icon-mail'},
  {id:'task',text: 'Công việc', icon:'icon-check-correct'},
  {id:'esign',text: 'Ký số', icon:'icon-i-pen'},
  {id:'image',text: 'hình ảnh', icon:'icon-broken_image'},
]

  // SymbolPalette Properties
  public expandMode: ExpandMode = 'Multiple';
  public palettes: PaletteModel[] = [
      {
          id: 'flow', expanded: true, title: 'Flow Shapes', symbols: [
              {
                  id: 'Terminator', addInfo: { tooltip: 'Terminator' }, width: 50, height: 60, shape: { type: 'Flow', shape: 'Terminator' }, style: { strokeWidth: 1, strokeColor: '#757575' }, ports: [
                      { offset: { x: 0, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 0 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 1, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 1 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw }
                  ]
              },
              {
                  id: 'Process',  addInfo: { tooltip: 'Process' }, width: 50, height: 60, shape: { type: 'Flow', shape: 'Process' }, style: { strokeWidth: 1, strokeColor: '#757575' }, ports: [
                      { offset: { x: 0, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 0 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 1, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 1 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw }
                  ]
              },
              {
                  id: 'Decision', addInfo: { tooltip: 'Decision' }, width: 50, height: 50, shape: { type: 'Flow', shape: 'Decision' }, style: { strokeWidth: 1, strokeColor: '#757575' }, ports: [
                      { offset: { x: 0, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 0 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 1, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 1 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw }
                  ]
              },
              {
                  id: 'Document', addInfo: { tooltip: 'Document' }, width: 50, height: 50, shape: { type: 'Flow', shape: 'Document' }, style: { strokeWidth: 1, strokeColor: '#757575' }, ports: [
                      { offset: { x: 0, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 0 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 1, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 1 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw }
                  ]
              },
              {
                  id: 'Predefinedprocess', addInfo: { tooltip: 'Predefined process' }, width: 50, height: 50, shape: { type: 'Flow', shape: 'PreDefinedProcess' }, ports: [
                      { offset: { x: 0, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 0 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 1, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 1 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw }
                  ], style: { strokeWidth: 1, strokeColor: '#757575' }
              },
              {
                  id: 'Data', addInfo: { tooltip: 'Data' }, width: 50, height: 50, shape: { type: 'Flow', shape: 'Data' }, ports: [
                      { offset: { x: 0, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 0 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 1, y: 0.5 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw },
                      { offset: { x: 0.5, y: 1 }, visibility: PortVisibility.Connect | PortVisibility.Hover, constraints: PortConstraints.Draw }
                  ], style: { strokeWidth: 1, strokeColor: '#757575' }
              },
              {
                  id: 'hehehehihi', style: { strokeWidth: 1, strokeColor: '#757575' }, annotations:[{content: 'hello'}]
              },
          ]
      },
      {
          id: 'swimlaneShapes', expanded: true,
          title: 'Swimlane Shapes',
          symbols: [
              {
                  id: 'Horizontalswimlane', addInfo: { tooltip: 'Horizontal swimlane' },
                  shape: {
                      type: 'SwimLane', lanes: [
                          {
                              id: 'lane1',
                              style: { strokeColor: '#757575' }, height: 60, width: 150,
                              header: { width: 50, height: 50, style: { strokeColor: '#757575', fontSize: 11 } },
                          }
                      ],
                      orientation: 'Horizontal', isLane: true
                  },
                  height: 60,
                  width: 140,
                  offsetX: 70,
                  offsetY: 30,
              }, {
                  id: 'Verticalswimlane', addInfo: { tooltip: 'Vertical swimlane' },
                  shape: {
                      type: 'SwimLane',
                      lanes: [
                          {
                              id: 'lane1',
                              style: { strokeColor: '#757575' }, height: 150, width: 60,
                              header: { width: 50, height: 50, style: { strokeColor: '#757575', fontSize: 11 } },
                          }
                      ],
                      orientation: 'Vertical', isLane: true
                  },
                  height: 140,
                  width: 60,
                  // style: { fill: '#f5f5f5' },
                  offsetX: 70,
                  offsetY: 30,
              }, {
                  id: 'Verticalphase', addInfo: { tooltip: 'Vertical phase' },
                  shape: {
                      type: 'SwimLane',
                      phases: [{ style: { strokeWidth: 1, strokeDashArray: '3,3', strokeColor: '#757575' }, }],
                      annotations: [{ text: '' }],
                      orientation: 'Vertical', isPhase: true
                  },
                  height: 60,
                  width: 140,
                  style: {strokeColor: '#757575'}
              }, {
                  id: 'Horizontalphase', addInfo: { tooltip: 'Horizontal phase' },
                  shape: {
                      type: 'SwimLane',
                      phases: [{ style: { strokeWidth: 1, strokeDashArray: '3,3', strokeColor: '#757575' }, }],
                      annotations: [{ text: '' }],
                      orientation: 'Horizontal', isPhase: true
                  },
                  height: 60,
                  width: 140,
                  style: {strokeColor: '#757575'}
              }
          ]
      },
      {
          id: 'connectors', expanded: true, symbols: [
              {
                  id: 'Link1', type: 'Orthogonal', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 40, y: 40 },
                  targetDecorator: { shape: 'Arrow', style: {strokeColor: '#757575', fill: '#757575'} }, style: { strokeWidth: 1, strokeColor: '#757575' }
              },
              {
                  id: 'Link2', type: 'Orthogonal', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 40, y: 40 },
                  targetDecorator: { shape: 'Arrow', style: {strokeColor: '#757575', fill: '#757575'} }, style: { strokeWidth: 1, strokeDashArray: '4 4', strokeColor: '#757575' }
              },
              {
                  id: 'Link21', type: 'Straight', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 60, y: 60 },
                  targetDecorator: { shape: 'Arrow', style: {strokeColor: '#757575', fill: '#757575'} }, style: { strokeWidth: 1, strokeColor: '#757575' }
              },
              {
                  id: 'Link22', type: 'Straight', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 60, y: 60 },
                  targetDecorator: { shape: 'Arrow', style: {strokeColor: '#757575', fill: '#757575'} }, style: { strokeWidth: 1, strokeDashArray: '4 4', strokeColor: '#757575' }
              }
          ], title: 'Connectors'
      }
  ];
  contextMenuSettings: ContextMenuSettingsModel = {
    show: true, items: [
        {
            text: 'Clone', id: 'Clone', target: '.e-diagramcontent',
        },
        {
            text: 'Cut', id: 'Cut', target: '.e-diagramcontent',
        },
        {
            text: 'InsertLaneBefore', id: 'InsertLaneBefore', target: '.e-diagramcontent',
        },
        {
            text: 'InsertLaneAfter', id: 'InsertLaneAfter', target: '.e-diagramcontent',
        }],
    showCustomMenuOnly: true,
};
  dragEnter(e:any){
    //console.log(e);
    //let objDragpane = document.querySelector('.dragarea').getBoundingClientRect();
    //if(objDragpane && e.dropPoint.x < objDragpane.x) return;
    //if(!e.event.target) return;

    let targetId = e.event.target.id.includes('_content') ? e.event.target.id.split('_content')[0] : e.event.target.id;
    let swimlane=''
    if(this.targetItem && this.targetItem.isLane){
      targetId = this.targetItem.id;
      swimlane =this.targetItem.parentId;
    }

    let laneID =swimlane ? targetId.split(swimlane)[1].slice(0, -1) : ''
    this.isDragging = false;
    let model:any = {
      id: this.makeid(10),
      // Position of the node
      offsetX: e.dropPoint.x,
      offsetY: e.dropPoint.y,
      // Size of the node
      width: 100,
      height: 100,
      margin: { left: 100, top: 100 },
      style: {borderColor:'#fff'}
  };

  //model.offsetX = model.offsetX -  this.diagram.diagramLayer?.getBoundingClientRect().width
  //model.offsetY = model.offsetY -  this.diagram.diagramLayer?.getBoundingClientRect().y
  //model.offsetY = e.event.target.getBoundingClientRect().y - model.offsetY +  e.event.target.getBoundingClientRect().height;
  model.margin.left = model.offsetX  -e.event.target.getBoundingClientRect().x ;
  model.margin.top = model.offsetY  -e.event.target.getBoundingClientRect().y ;
  switch (e.item?.element?.nativeElement?.id) {
    case 'start_end':
        model.shape = {
          type: 'Bpmn',
          shape: 'Event',
          // set the event type as End
          event: {
              event: 'Start',
              trigger: 'None'
          }
       };
       model.offsetY = model.offsetY -100;
       if(this.targetItem && this.targetItem.isLane && swimlane && laneID)this.diagram.addNodeToLane(model,swimlane,laneID)
       else this.diagram.add(model);
      break;
    case 'decision':
       model.shape = {
        type: 'Flow',
        shape: 'Decision',

        };
        model.offsetY = model.offsetY -100;
        if(this.targetItem && this.targetItem.isLane && swimlane && laneID)this.diagram.addNodeToLane(model,swimlane,laneID)
        else this.diagram.add(model);
    break;
    case 'connector':
        let connector: ConnectorModel={
          id: this.makeid(10),
          sourcePoint: { x: model.offsetX -200, y: model.offsetY -100 }, targetPoint: { x: model.offsetX -100, y: model.offsetY-100 },
          targetDecorator: { shape: 'Arrow', style: {strokeColor: '#757575', fill: '#757575'} }, style: { strokeWidth: 3, strokeColor: '#757575' },
          type:'Bezier'
        }
        this.diagram.addConnector(connector)
    break;
    case 'swimlane':
        let swimLane:any= {
          id: this.makeid(10),
          shape: {
              type: 'SwimLane',
              borderColor: '#ddd',
              header: {

                      height: 0.5,
                      style:{fill:'#fff',textAlign:'Left'},
                       annotation: {content:''}
                    },
              lanes: [
                  {
                      id: this.makeid(10),
                      canMove:true,
                      borderColor: '#fff',
                      style: { borderColor: '#fff',strokeColor: '#ddd' }, height: 500, width: 300,
                      header: {  height:30, style: { strokeColor: '#fff', fontSize: 11 },annotation: {content:'Bước quy trình'}},
                  }
              ],
              style: { borderColor: '#fff' },
              orientation: 'Vertical', isLane: true
          },
          height: 500,
          // style: { fill: '#f5f5f5' },
          offsetX: model.offsetX,
          offsetY: model.offsetY +100,
        }
        this.diagram.add(swimLane);
    break;
    case 'form':
    case 'esign':
    case 'image':
    case 'task':
    case 'event':
    case 'email':
        model.id = this.makeid(10);
        model.shape = { type: 'HTML', version: e.item?.element?.nativeElement?.id };
        model.width = 300;
        model.height = 200;
        // if(swimlane)this.diagram.addNodeToLane(model,swimlane,laneID)
        // else this.diagram.add(model);
        this.diagram.add(model)
        if(this.targetItem && this.targetItem.isLane)  this.diagram.addChild(this.targetItem,model.id);
    break;


  }


  // this.diagram.add(model);
  // this.diagram.addChild(this.targetItem,model.id)
  this.targetItem = undefined;
  //this.diagram.dataBind()
  }

  logData(e){
    console.log(e);

  }
  clickAddForm(data:any){
    console.log('addForm nè',data.id);
  }

  deleteNode(node:any){
    if(node && this.diagram){
      this.diagram.remove(node);
      let connector = this.diagram.getConnectorObject(node.id);
      if(connector)this.diagram.removeData(connector as any);

    }
  }

  contextMenuOpen(args: DiagramBeforeMenuOpenEventArgs): void {
    for (let item of args.items) {
        if ((this.diagram.selectedItems.connectors.length + this.diagram.selectedItems.nodes.length) > 0) {
            if (item.id === 'InsertLaneBefore' || item.id === 'InsertLaneAfter') {
                if (this.diagram.selectedItems.connectors.length || (this.diagram.selectedItems.nodes.length && !(this.diagram.selectedItems.nodes[0] as any).isLane)) {
                    args.hiddenItems.push(item.text);
                }
            }
        } else {
            args.hiddenItems.push(item.text);
        }
    }
  }

  contextMenuClick(args: MenuEventArgs): void {
    if (args.item.id === 'InsertLaneBefore' || args.item.id === 'InsertLaneAfter') {
        if (this.diagram.selectedItems.nodes.length > 0 && (this.diagram.selectedItems.nodes[0] as any).isLane) {
            let index: number;
            let node: any = this.diagram.selectedItems.nodes[0];
            let swimlane: NodeModel = this.diagram.getObject((this.diagram.selectedItems.nodes[0] as any).parentId);
            let shape: SwimLaneModel = swimlane.shape as SwimLaneModel;
            let existingLane: LaneModel = cloneObject(shape.lanes[0]);
            let newLane = existingLane;
            newLane.id= this.makeid(10);
              newLane.header={
                    width: existingLane.header.width, height: existingLane.header.height,
                    style: existingLane.header.style as ShapeStyleModel
                } as HeaderModel;

            if (shape.orientation === 'Horizontal') {
                let exclude = 0;
                exclude += (shape.header) ? 1 : 0;
                exclude += (shape.phases.length) ? 1 : 0;
                index = node.rowIndex - exclude;
                newLane.header.width = existingLane.header.width;
                newLane.header.height = existingLane.height;
            } else {
                index = node.columnIndex - 1;
                newLane.header.width = existingLane.width;
                newLane.header.height = existingLane.header.height;
            }
            if (args.item.id === 'InsertLaneBefore') {
                this.diagram.addLanes(swimlane, [newLane], 0);
            } else {
                this.diagram.addLanes(swimlane, [newLane], 0);
                this.diagram.refresh();
            }
            this.diagram.clearSelection();
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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return 'diagram_id_'+result;
}
  getSymbolTemplate(e){
   return { description: { text: e.id}, template: {id:'hehehehihi', shape:{type:'HTML'},width: 50, height: 50} };
  }
  expand(e:any){
    debugger
  }
  mouseEnter(e:any){
    if(this.isDragging) this.targetItem = e.actualObject;
    console.log(this.targetItem);

  }
  targetItem:any;
  isDragging:boolean=false;
  onDragStart(e:any){
    this.isDragging = true;
  }
  eleDraw(e:any){
    console.log('vẽ cục:   ',e);
  }
clickchoi(){
  console.log(this.diagram);
  let dataDiagram = this.diagram.saveDiagram();
  let obj = JSON.parse(dataDiagram);
  if(Object.keys(obj).length && obj.nodes){
    console.log(obj.nodes);
  }

  }
  shape:any = { type: "HTML", shape: "Rectangle" }
  shape1: BpmnShapeModel = {
    type: 'Bpmn',
    shape: 'Event',
    // set the event type as End
    event: {
        event: 'Start',
        trigger: 'None'
    }
}


//===========
  dialog: any;
  data: any;
  action = 'add';
  currentTab = 0; //Tab hiện tại
  processTab = 0; // Tổng bước đã quua
  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  //#region setting created tab
  clickTab(tabNo: number) {
    let newNo = tabNo;
    let oldNo = this.currentTab;
    // if (tabNo <= this.processTab && tabNo != this.currentTab) { //cmt tạm để làm cho xong rồi bắt sau
      this.updateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
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

  //#region form setting properties
  formPropertieFields(){
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    let formModelField = new FormModel();
    formModelField.formName = "DPStepsFields";
    formModelField.gridViewName = "grvDPStepsFields";
    formModelField.entityName = "DP_Steps_Fields";
    formModelField.userPermission = this.dialog?.formModel?.userPermission;
    option.FormModel = formModelField;
    let data = {};
    let popupDialog = this.callfc.openForm(
      FormPropertiesFieldsComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    popupDialog.closed.subscribe((dg) => {
      if(dg){

      }
    })
  }
  //#endregion
}
