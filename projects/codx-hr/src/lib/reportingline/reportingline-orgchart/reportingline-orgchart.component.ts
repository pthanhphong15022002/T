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
import { threadId } from 'worker_threads';

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
  data:any = null;

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
    connector.targetDecorator.shape = 'None';
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

  getDataPositionByID(positionID:string)
  {
    if(positionID){
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
    
  }
  orgClick(event){

  }

  showEmploy(pemp, emp){

  }

  onSearch($event){
    
  }
  mouseUp(dataNode: any, evt: any) {
    this.positionID = dataNode.positionID;
    var exist = this.checkExistParent(this.positionID);
    if (this.diagram && exist) {
      var tool = this.diagram.getTool('LayoutAnimation');
      tool.mouseUp(this.diagram.eventHandler.eventArgs);
    }
  }

  loadDataChild(node: any,element: HTMLElement) {
    let result = [];
    if(node.loadChildrent){
      result = this.data.filter(e => e.reportTo != node.positionID);
      if(result.length > 0)
      {
        result.forEach(element => {
          if(element.positionID == node.positionID)
          {
            element.loadChildrent = false;
          }
        });
        this.data = JSON.parse(JSON.stringify(result))
      }
      this.setDataOrg(this.data);
    }
    else{
      if(node.positionID)
      {
        this.api.execSv(
          "HR",
          "ERM.Business.HR",
          "PositionsBusiness",
          "GetChildOrgChartAsync",
          [node.positionID]
          )
          .subscribe((res:any) =>{
            if(res)
            {
              result = this.data.concat(res);
              if(result.length > 0)
              {
                result.forEach(element => {
                  if(element.positionID == node.positionID)
                  {
                    element.loadChildrent = true;
                  }
                });
                this.data = JSON.parse(JSON.stringify(result))
              }
              this.setDataOrg(this.data);
            }
          });
      }
    }
    
  }
  checkExistParent(parentID: string): boolean {
    var dt = this.data.filter((x) => x.positionID === parentID);
    if (dt && dt.length > 0) return true;
    return false;
  }

  removeNode(id:string,result:any[] = null): any[] | null{
    let data  = this.data.filter(e => e.reportTo === id)
    if(data?.length > 0)
    {
      result = result.concat(data);
      data.forEach(element => {
        this.removeNode(element.positionID,result);
      });
    }
    return result;
  }
}
