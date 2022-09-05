import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ClickEventArgs } from '@syncfusion/ej2-angular-buttons';
import {
  ConnectorModel,
  Diagram,
  DiagramComponent,
  DiagramTools,
  NodeModel,
  SnapConstraints,
  SnapSettingsModel,
} from '@syncfusion/ej2-angular-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import { ApiHttpService, FormModel } from 'codx-core';
import { AnyNaptrRecord } from 'dns';
import { map, Observable } from 'rxjs';
let data: any[] = [
  { Name: 'Species', fillColor: '#3DD94A' },
  { Name: 'Plants', Category: 'Species' },
  { Name: 'Fungi', Category: 'Species' },
  { Name: 'Lichens', Category: 'Species' },
  { Name: 'Animals', Category: 'Species' },
  { Name: 'Mosses', Category: 'Plants' },
  { Name: 'Ferns', Category: 'Plants' },
  { Name: 'Gymnosperms', Category: 'Plants' },
  { Name: 'Dicotyledens', Category: 'Plants' },
  { Name: 'Monocotyledens', Category: 'Plants' },
  { Name: 'Invertebrates', Category: 'Animals' },
  { Name: 'Vertebrates', Category: 'Animals' },
  { Name: 'Insects', Category: 'Invertebrates' },
  { Name: 'Molluscs', Category: 'Invertebrates' },
  { Name: 'Crustaceans', Category: 'Invertebrates' },
  { Name: 'Others', Category: 'Invertebrates' },
  { Name: 'Fish', Category: 'Vertebrates' },
  { Name: 'Amphibians', Category: 'Vertebrates' },
  { Name: 'Reptiles', Category: 'Vertebrates' },
  { Name: 'Birds', Category: 'Vertebrates' },
  { Name: 'Mammals', Category: 'Vertebrates' },
];
@Component({
  selector: 'lib-organize-detail',
  templateUrl: './organize-detail.component.html',
  styleUrls: ['./organize-detail.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizeDetailComponent implements OnInit, OnChanges {
  @Input() width = 260;
  @Input() height = 300;
  @Input() maxWidth = 300;
  @Input() maxHeight = 300;
  @Input() minWidth = 100;
  @Input() minHeight = 300;
  @Input() node?: any;
  @Input() orgUnitID!: string;
  @Input() numberLV: string = '3';
  @Input() parentID: string = '';
  @Input() onlyDepartment?: boolean;
  @Input() formModel!: FormModel;

  data: any[] = [];
  datasetting: any = null;
  layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 30,
    horizontalSpacing: 40,
    enableAnimation: true,
  };
  snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  tool: DiagramTools = DiagramTools.ZoomPan;
  isClick: boolean = false;

  @ViewChild('diagram') diagram: any;
  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.datasetting = this.newDataManager();
    // this.loadOrgchart().subscribe((res) => {
    //   if (res) {
    //     this.data = res.Data as any[];
    //     this.datasetting.dataManager = new DataManager(this.data as JSON[]);
    //     this.changeDetectorRef.detectChanges();
    //   }
    // });
  }

  newDataManager(): any {
    return {
      id: 'departmentCode',
      parentId: 'parentID',
      dataManager: new DataManager(this.data as JSON[]),
      //binds the external data with node
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

  ngOnChanges(changes: SimpleChanges): void {
    this.loadOrgchart().subscribe((res) => {
      if (res) {
        this.data = res.Data as any[];
        //this.datasetting.dataManager = new DataManager(this.data as JSON[]);
        var setting = this.newDataManager();
        setting.dataManager = new DataManager(this.data as JSON[]);
        this.datasetting = setting;
        //this.diagram.refresh();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  loadOrgchart(): Observable<any> {
    return this.api
      .callSv(
        'HR',
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetDataDiagramAsync',
        [
          this.orgUnitID,
          this.numberLV,
          this.parentID,
          this.onlyDepartment,
          true,
        ]
      )
      .pipe(
        map((data) => {
          if (data.error) return;
          return data.msgBodyData[0];
        })
      );
  }

  loadDataChild(dataNode: any, node: any) {
    //this.orgUnitID = dataNode.departmentCode;
    //this.diagram.action = 'LayoutAnimation';
    this.parentID = dataNode.departmentCode;
    var exist = this.checkExistParent(this.parentID);
    if (!exist) {
      this.loadOrgchart().subscribe((res) => {
        var arrDt = res.Data as any[];
        this.data = [...this.data, ...arrDt];
        var setting = this.newDataManager();
        setting.dataManager = new DataManager(this.data as JSON[]);
        this.datasetting = setting;
        this.changeDetectorRef.detectChanges();
      });
    } else {
      // node.isExpanded = true;
      // this.diagram.commandHandler.expandNode(node, this.diagram);
    }
  }

  mouseUp(dataNode: any, evt: any) {
    //eventArgs
    // this.isClick = true;
    this.parentID = dataNode.departmentCode;
    var exist = this.checkExistParent(this.parentID);
    if (this.diagram && exist) {
      var tool = this.diagram.getTool('LayoutAnimation');
      tool.mouseUp(this.diagram.eventHandler.eventArgs);
    }
  }

  testMouseDown(evt: any) {
    // if (this.diagram) {
    //   this.diagram.eventHandler.action = 'LayoutAnimation';
    //   this.diagram.eventHandler.inAction = true;
    //   //this.diagram.eventHandler.mouseDown(evt);
    //   // var a = this.diagram.getTool('LayoutAnimation');
    //   // this.diagram.eventHandler.tool = a;
    //   //this.diagram.mouseUp(evt);
    // }
  }

  checkExistParent(parentID: string): boolean {
    var dt = this.data.filter((x) => x.parentID === parentID);
    if (dt && dt.length > 0) return true;
    return false;
  }

  public connDefaults(
    connector: ConnectorModel,
    diagram: Diagram
  ): ConnectorModel {
    connector.targetDecorator!.shape = 'None';
    connector.type = 'Orthogonal';
    connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.style!.strokeColor = '#6d6d6d';
    return connector;
  }

  public nodeDefaults(obj: NodeModel): NodeModel {
    // obj.expandIcon = {
    //   height: 10,
    //   width: 10,
    //   shape: 'Plus',
    //   fill: 'lightgray',
    //   offset: { x: 0.5, y: 1 },
    //   content: 'sssss',
    // };
    // obj.collapseIcon = {
    //   height: 10,
    //   width: 10,
    //   shape: 'Minus',
    //   fill: 'lightgray',
    //   offset: { x: 0.5, y: 1 },
    //   content: 'sssss',
    // };

    return obj;
  }

  classIcon(dt: any, ele: HTMLElement): string {
    if (this.isClick) {
      var cls = ele.classList;
      if (cls.contains('icon-do_disturb_on')) {
        cls.remove('icon-do_disturb_on');
        return 'icon-add_circle_outline';
      } else {
        cls.remove('icon-add_circle_outline');
        return 'icon-do_disturb_on';
      }
    } else {
      var exist = this.checkExistParent(dt.departmentCode);
      if (exist) return 'icon-do_disturb_on';
      else return 'icon-add_circle_outline';
    }
  }

  public click(arg: ClickEventArgs) {
    console.log(arg.element?.id);
  }

  test(data) {}
}
