import { ChangeDetectorRef, Component, Input, OnInit, Output, SimpleChanges,EventEmitter, ViewChild } from '@angular/core';
import { ConnectorModel, Diagram, DiagramComponent, DiagramTools, NodeModel, SnapConstraints, SnapSettingsModel, TextModel } from '@syncfusion/ej2-angular-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import { ApiHttpService, CallFuncService, CodxFormDynamicComponent, CRUDService, FormModel, SidebarModel, ViewsComponent } from 'codx-core';
import { PopupAddOrganizationComponent } from '../popup-add-organization/popup-add-organization.component';

@Component({
  selector: 'hr-organization-orgchart',
  templateUrl: './organization-orgchart.component.html',
  styleUrls: ['./organization-orgchart.component.css']
})
export class OrganizationOrgchartComponent implements OnInit {
  datasetting: any = null;
  dataSource:any = null;
  public layout: Object = {
    type: 'HierarchicalTree',
    verticalSpacing: 60,
    horizontalSpacing: 60,
    enableAnimation: true,
  };
  public tool: DiagramTools = DiagramTools.ZoomPan;
  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None
  };

  // end setting orgChart
  @Input() formModel:FormModel;
  @Input() orgUnitID:string; 
  @Input() view:ViewsComponent = null; 
  @Input() dataService:CRUDService = null; 
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
    private dt:ChangeDetectorRef,
    private callFC:CallFuncService
  ) 
  { }

  ngOnInit(): void {
  }
  //onChange dataSource
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID){
      this.dataService.setPredicates([],[this.orgUnitID]).subscribe(res => {
        //this.setDataOrg(this.dataService.data);
        this.dataSource = this.newDataManager(this.dataService.data);
      })
    }
  }
  setDataOrg(data: any[]) {
    let setting = this.newDataManager(data);
    setting.dataManager = new DataManager(data);
    this.datasetting = setting;
    this.dt.detectChanges();
  }

  newDataManager(data:any[]): any {
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
          type: 'HTML' ,
          content: "",
          data : data
        };
      },
    };
  }

  public connDefaults(
    connector: ConnectorModel,
    diagram: Diagram
  ): ConnectorModel {
    connector.targetDecorator.shape = "None";
    connector.type = "Orthogonal";
    connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.style.strokeColor = "#6d6d6d";
    return connector;
  }

  public nodeDefaults(obj: NodeModel): NodeModel {
    obj.expandIcon = {
      height: 15,
      width: 15,
      shape: "Minus",
      fill: "lightgray",
      offset: { x: 0.5, y: 1}
    };
    obj.collapseIcon = {
      height: 15,
      width: 15,
      shape: "Plus",
      fill: "lightgray",
      offset: { x: 0.5, y: 1 }
    };
    return obj;
  }

  // // click moreFC
  clickMF(event:any, node:any)
  {
    if(event){
      switch(event.functionID){
        case "SYS02": //delete
          break;
        case "SYS03": // edit
          this.editData(node,event);
          break;
        case "SYS04": // copy
          break;
        default:
          break;  
      }
    }
  }

  // // edit data
  editData(node:any,event:any){
    if (this.dataService) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.dataService;
      option.FormModel = this.formModel;
      let object = {
        data:node,
        action: event,
        funcID:this.formModel.funcID,
        isModeAdd : false
      }
      let popup = this.callFC.openSide(PopupAddOrganizationComponent,object,option,this.formModel.funcID);
      popup.closed.subscribe((res:any) => {
        if(res.event){
          let org = res.event[0];
          let tmpOrg = res.event[1];
          this.dataService.update(tmpOrg).subscribe(() => {
            let data = JSON.parse(JSON.stringify(this.dataService.data));
            this.setDataOrg(data);   
            this.dt.detectChanges();

          });
          this.view.dataService.add(org).subscribe();
        }
      });
    }
  }
}
