import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ConnectorModel, Diagram, DiagramTools, NodeModel, SnapConstraints, SnapSettingsModel } from '@syncfusion/ej2-angular-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import { ApiHttpService, FormModel } from 'codx-core';

@Component({
  selector: 'hr-organization-orgchart',
  templateUrl: './organization-orgchart.component.html',
  styleUrls: ['./organization-orgchart.component.css']
})
export class OrganizationOrgchartComponent implements OnInit {

  // setting orgChart
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
  datasetting: any = null;
  layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 60,
    horizontalSpacing: 60,
    enableAnimation: true,
  };
  tool: DiagramTools = DiagramTools.ZoomPan;
  snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  // end setting orgChart
  @Input() formModel:FormModel;
  @Input() orgUnitID:string; 
  data:any[] = [];
  width = 250;
  height = 350;
  maxWidth = 300;
  maxHeight = 400;
  minWidth = 250;
  minHeight = 350;
  imployeeInfo: any = {};
  employees:any[] = [];
  headerColor:string = "#03a9f4";
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef
  ) 
  { }

  ngOnInit(): void {
    this.getOrgUnitByID(this.orgUnitID);
  }
  //onChange orgUnitID
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID.currentValue != changes.orgUnitID.previousValue){
      this.orgUnitID = changes.orgUnitID.currentValue;
      this.getOrgUnitByID(this.orgUnitID);
      this.dt.detectChanges();
    }
  }
  // get data orgUnit by orgUnitID
  getOrgUnitByID(orgUnitID:string){
    if(orgUnitID)
    {
      this.api.execSv(
        'HR',
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetDataOrgChartAsync',
        [orgUnitID])
        .subscribe((res:any) =>{
          if(res){
            console.log(res);
            this.data = JSON.parse(JSON.stringify(res));
            this.setDataOrg(this.data);
          }
        });
    }
  }
  setDataOrg(data: any[]) {
    if (data?.length > 0) 
    {
      let setting = this.newDataManager();
      setting.dataManager = new DataManager(data);
      this.datasetting = setting;
      this.dt.detectChanges();
    }
  }
  newDataManager(): any {
    return {
      id: 'orgUnitID',
      parentId: 'parentID',
      dataManager: new DataManager(this.data as JSON[]),
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


  //orgClick
  orgClick(event:any){

  }
  // load data child
  loadDataChild(node:any){
    let result = [];
    if(node.loadChildren){
      result = this.data.filter(e => e.parentID != node.orgUnitID);
      if(result.length > 0)
      {
        result.forEach(element => {
          if(element.orgUnitID == node.orgUnitID)
          {
            element.loadChildren = false;
          }
        });
        this.data = JSON.parse(JSON.stringify(result))
      }
      this.setDataOrg(this.data);
    }
    else{
      if(node.orgUnitID)
      {
        this.api.execSv(
          "HR",
          "ERM.Business.HR",
          "OrganizationUnitsBusiness",
          "GetDataChildOrgChartAsync",
          [node.orgUnitID]
          )
          .subscribe((res:any) =>{
            if(res)
            {
              result = this.data.concat(res);
              if(result.length > 0)
              {
                result.forEach(element => {
                  if(element.orgUnitID == node.orgUnitID)
                  {
                    element.loadChildren = true;
                  }
                });
              }
              this.data = JSON.parse(JSON.stringify(result))
              this.setDataOrg(this.data);
            }
          });
      }
    }
  }

  // show employee infor
  showEmploy(pemp, emp){

  }
}
