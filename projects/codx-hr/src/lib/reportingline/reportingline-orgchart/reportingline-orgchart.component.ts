import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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
export class ReportinglineOrgChartComponent implements OnInit, AfterViewInit {

  @Input()  positionID:string = "";
  width:number = 260;
  height:number = 300;
  maxWidth:number = 300;
  maxHeight:number = 300;
  minWidth:number = 100;
  minHeight:number = 300;
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
    this.datasetting = this.newDataManager();
  }

  ngAfterViewInit(): void {
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
    return obj;
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

  setDataOrg(data: any[] = []) {
    if (data.length > 0) {
      this.data = data;
      var setting = this.newDataManager();
      var dataManager = JSON.parse(JSON.stringify(this.data)) as JSON[];
      dataManager = dataManager.filter((item: any) => {
        if (item.departmentCode === this.positionID) item.parentID = '';
        return item;
      });
      setting.dataManager = new DataManager(dataManager as JSON[]);
      this.datasetting = setting;
      this.changeDetectorRef.detectChanges();
    }
  }

  getDataPositionByID(positonID:string){
    if(positonID){
      this.api.execSv("","","","",)
      .subscribe((res:any) =>{
        if(res)
        {
          this.data = res;
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
}
