import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit,OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
import { ApiHttpService, CallFuncService, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-reportingline-orgchart',
  templateUrl: './reportingline-orgchart.component.html',
  styleUrls: ['./reportingline-orgchart.component.css']
})
export class ReportinglineOrgChartComponent implements OnInit,OnChanges {

  @Input() postion:any = null;
  @Input() positionID:string = "";

  width:number = 250;
  height:number = 150;
  maxWidth:number = 250;
  maxHeight:number = 150;
  minWidth:number = 200;
  minHeight:number = 150;
  employees:any[] = [];
  employeeInfor:any = null;
  layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 30,
    horizontalSpacing: 40,
    enableAnimation: true,
  };
  tool: DiagramTools = DiagramTools.ZoomPan;
  snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  @ViewChild('diagram') diagram: any;

  datasetting: any = null;
  data:any = null

  constructor(
    private api:ApiHttpService,
    private notifySV:NotificationsService,
    private callFC:CallFuncService,
    private changeDetectorRef:ChangeDetectorRef
  ) 
  { }
  
  

  ngOnInit(): void {
    this.getDataPositionByID(this.positionID);
  }



  ngOnChanges(changes: SimpleChanges): void {
    if(changes.positionID.currentValue != changes.positionID.previousValue){
      this.positionID = changes.positionID.currentValue;
      this.getDataPositionByID(this.positionID);
      this.changeDetectorRef.detectChanges();
    }
  }

  public connDefaults(connector: ConnectorModel,diagram: Diagram): ConnectorModel {
    connector.targetDecorator!.shape = 'None';
    connector.type = 'Orthogonal';
    connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.style!.strokeColor = '#6d6d6d';
    return connector;
  }

  public nodeDefaults(obj: NodeModel): NodeModel {
    return obj;
  }

  newDataManager(): any {
    return {
      id: 'positionID',
      parentId: 'reportTo',
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

  setDataOrg(data: any[] = []) {
    if (data.length > 0) {
      this.data = data;
      var setting = this.newDataManager();
      setting.dataManager = new DataManager(this.data);
      this.datasetting = setting;
      this.changeDetectorRef.detectChanges();
    }
  }

  getDataPositionByID(positionID:string){
    this.api.execSv("HR",
    "ERM.Business.HR",
    "PositionsBusiness",
    "GetDataOrgChartAsync",
    [positionID]
    )
    .subscribe((res:any) =>{
      if(res)
      {
        this.data = res;
        this.setDataOrg(this.data);
      }
    });
  }
  orgClick(event){

  }

  showEmploy(pemp, emp){

  }

  onSearch($event){
    
  }

  isClick = false;
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
      var exist = this.checkExistParent(dt.positionCode);
      if (exist) return 'icon-do_disturb_on';
      else return 'icon-add_circle_outline';
    }
  }

  mouseUp(dataNode: any, evt: any) {
    this.positionID = dataNode.positionID;
    var exist = this.checkExistParent(this.positionID);
    if (this.diagram && exist) {
      var tool = this.diagram.getTool('LayoutAnimation');
      tool.mouseUp(this.diagram.eventHandler.eventArgs);
    }
  }

  loadDataChild(dataNode: any) {
    this.positionID = dataNode.positionID;
    var exist = this.checkExistParent(this.positionID);
    if (!exist) {
      this.getDataPositionByID(this.positionID);
    }
  }
  checkExistParent(parentID: string): boolean {
    var dt = this.data.filter((x) => x.positionID === parentID);
    if (dt && dt.length > 0) return true;
    return false;
  }
}
