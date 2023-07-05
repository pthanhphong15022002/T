import { ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  ConnectorModel,
  Diagram,
  DiagramComponent,
  DiagramTools,
  NodeModel,
  ShapeStyleModel,
  SnapConstraints,
  SnapSettingsModel,
} from '@syncfusion/ej2-angular-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import { ApiHttpService, CallFuncService, NotificationsService, RequestOption, SidebarModel } from 'codx-core';
import { PopupAddPositionsComponent } from '../popup-add-positions/popup-add-positions.component';

@Component({
  selector: 'lib-reportingline-orgchart',
  templateUrl: './reportingline-orgchart.component.html',
  styleUrls: ['./reportingline-orgchart.component.css']
})
export class ReportinglineOrgChartComponent implements OnInit, OnChanges {

  @Input() postion: any = null;
  @Input() positionID: string = "";
  @Input() funcID: string = "";
  @Input() formModel: any;
  @Input() view: any;

  width: number = 250;
  height: number = 150;
  maxWidth: number = 250;
  maxHeight: number = 150;
  minWidth: number = 200;
  minHeight: number = 150;
  employees: any[] = [];
  employeeInfor: any = null;
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
  data: any = null;
  onDoneLoading: boolean = false;
  isCorporation: boolean;
  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private notiService: NotificationsService,
  ) { }

  ngOnInit(): void {
    console.log(this.view);
    this.api.execSv<any>('SYS', 'AD', 'CompanySettingsBusiness', 'GetAsync')
    .subscribe((res) => {
      if (res) {
        this.isCorporation = res.isCorporation;
      }
    });
    this.getDataPositionByID(this.positionID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.positionID.currentValue != changes.positionID.previousValue) {
      this.onDoneLoading = false;
      this.positionID = changes.positionID.currentValue;
      this.getDataPositionByID(this.positionID);
      this.changeDetectorRef.detectChanges();
    }
  }

  public  connDefaults(connector: ConnectorModel, diagram: Diagram): ConnectorModel {
    connector.targetDecorator.shape = 'None';
    connector.type = 'Orthogonal';
    // connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.style!.strokeColor = '#6d6d6d';
    return connector;
  }

  public nodeDefaults(node: NodeModel): NodeModel {
    return node;
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

  getDataPositionByID(positionID: string) {
    if (positionID) {
      this.api.execSv("HR", "ERM.Business.HR", "PositionsBusiness", "GetDataOrgChartAsync", [positionID])
        .subscribe((res: any) => {
          if (res) {
            this.data = res;
            //this.renewData();
            this.setDataOrg(this.data);
          }
          this.onDoneLoading = true;
        });
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

  loadDataChild(node: any, element: HTMLElement) {
    let result = [];
    if (node.loadChildrent) {
      result = this.data.filter(e => e.reportTo != node.positionID);
      if (result.length > 0) {
        result.forEach(element => {
          if (element.positionID == node.positionID) {
            element.loadChildrent = false;
          }
        });
        // this.data = JSON.parse(JSON.stringify(result))
        this.removeNode(node.positionID);
      }
      this.setDataOrg(this.data);
    }
    else {
      if (node.positionID) {
        this.api.execSv("HR", "ERM.Business.HR", "PositionsBusiness", "GetChildOrgChartAsync", [node.positionID])
          .subscribe((res: any) => {
            if (res) {
              result = this.data.concat(res);
              if (result.length > 0) {
                result.forEach(element => {
                  if (element.positionID == node.positionID) {
                    element.loadChildrent = true;
                  }
                });
                this.data = JSON.parse(JSON.stringify(result))
                // this.data.filter((e , index) => {
                //   this.data.indexOf(e) === index

                //   return this.data;
                // })
              }
              //this.renewData();
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

  removeNode(positionID: string) {
    var children = this.data.filter((x) => x.reportTo === positionID);
    if (children.length > 0) {
      children.forEach(element => {
        this.data = this.data.filter((x) => x.positionID !== element.positionID)
        this.removeNode(element.positionID);
      });
    }
  }

  clickMF(event: any, data: any = null) {
    if (event) {
      switch (event.functionID) {
        case 'SYS03':
          this.edit(event, data);
          break;
        case 'SYS04':
          this.copy(event, data);
          break;
        case 'SYS02':
          this.delete(data);
          break;
      }
    }
  }
  // coppy position
  copy(event: any, data: any) {
    if (event && data) {
      this.view.dataService.dataSelected = data;
      this.view.dataService.copy().subscribe((res) => {
        if (res) {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.Width = '800px';
          let object = {
            //dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: res,
            funcID: this.funcID,
            isAdd: true,
            title: event.text + ' ' + this.view.function.description,
          };
          this.callfc.openSide(PopupAddPositionsComponent, object, option, this.funcID)
            .closed.subscribe((res) => {
              if (res?.event) {
                let node = res.event;
              }
            });
        }
      });
    }
  }
  edit(event: any, data: any) {
    if (this.view && data && event) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.view.dataService
        .edit(this.view.dataService.dataSelected)
        .subscribe((result) => {
          let object = {
            //dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: result,
            funcID: this.funcID,
            isAdd: false,
            title: event.text + ' ' + this.view.function.description,
            isCorporation: this.isCorporation,
          };
          this.callfc.openSide(
            PopupAddPositionsComponent, object, option, this.funcID)
            .closed.subscribe(res => {
              if (res) {

              }
            });

        });
    }
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'Delete';
    opt.className = 'PositionsBusiness';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.positionID;
    return true;
  }
  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt), null, null, null, null, null
      )
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS008')
          this.data = this.data.filter((x) => x.positionID !== data.positionID);
          this.setDataOrg(this.data);
        }else{
          //this.notiService.notifyCode('HR021', 0, this.view.dataService?.dataSelected?.positionName);
        }
      });

  }
  // renewData(){
  //   this.data.forEach(element => {
  //     var childCount = this.data.filter(e => e.reportTo === element.positionID 
  //       || e.reportTo2 === element.positionID).length;
  //     if(childCount < element?.childrenCount) element.loadChildrent = false;
  //     else element.loadChildrent = true;
  //   });
  // }


}
