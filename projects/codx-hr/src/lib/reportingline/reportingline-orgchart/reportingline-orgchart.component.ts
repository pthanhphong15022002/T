import { concat } from 'rxjs';
import { style } from '@angular/animations';
import { ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import {
  DiagramComponent,
  LineDistribution,
} from '@syncfusion/ej2-angular-diagrams';
import {
  NodeModel,
  ConnectorModel,
  DiagramTools,
  Diagram,
  DataBinding,
  ComplexHierarchicalTree,
  SnapConstraints,
  SnapSettingsModel,
  LayoutModel,
  LayoutOrientation,
  ConnectionPointOrigin,

} from '@syncfusion/ej2-diagrams';
import { ApiHttpService, CRUDService, CallFuncService, NotificationsService, RequestOption, SidebarModel, ViewsComponent } from 'codx-core';
import { PopupAddPositionsComponent } from '../popup-add-positions/popup-add-positions.component';
import { DataManager } from '@syncfusion/ej2-data';
Diagram.Inject(DataBinding, ComplexHierarchicalTree, LineDistribution);

@Component({
  selector: 'lib-reportingline-orgchart',
  templateUrl: './reportingline-orgchart.component.html',
  styleUrls: ['./reportingline-orgchart.component.css']
})
export class ReportinglineOrgChartComponent implements OnInit, OnChanges {

  @Input() position: any = null;
  @Input() positionID: string = "";
  @Input() funcID: string = "";
  @Input() formModel: any;
  @Input() view: ViewsComponent;
  @Output() deletedInputPosition: EventEmitter<any> = new EventEmitter();
  @Output() hasChangedData: EventEmitter<any> = new EventEmitter();
  @Output() itemSelected: EventEmitter<any> = new EventEmitter();
  width: number = 250;
  height: number = 150;
  maxWidth: number = 250;
  maxHeight: number = 150;
  minWidth: number = 200;
  minHeight: number = 150;
  employees: any[] = [];
  employeeInfor: any = null;
  layout: LayoutModel = {
    type: 'ComplexHierarchicalTree',
    connectionPointOrigin: ConnectionPointOrigin.SamePoint,
    // orientation: 'LeftToRight',
    verticalSpacing: 70,
    horizontalSpacing: 40,
    enableAnimation: false,
  };
  tool: DiagramTools = DiagramTools.ZoomPan;
  snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  firstLoadDiagram: boolean = true;
  @ViewChild('diagram') diagram: DiagramComponent;
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
    this.api.execSv<any>('SYS', 'AD', 'CompanySettingsBusiness', 'GetAsync')
      .subscribe((res) => {
        if (res) {
          this.isCorporation = res.isCorporation;
        }
      });
    //this.getDataPositionByID(this.positionID);
  }
  public reloadDiagram(): void {
    this.firstLoadDiagram = true;
    this.getDataPositionByID(this.positionID);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.positionID.currentValue != changes.positionID.previousValue) {
      this.onDoneLoading = false;
      this.positionID = changes.positionID.currentValue;
      this.firstLoadDiagram = true;
      this.getDataPositionByID(this.positionID);
      this.changeDetectorRef.detectChanges();
    }
  }
  public created(): void {
    if (this.diagram) {
      this.diagram.fitToPage();
      this.firstLoadDiagram = false;
    }
  }
  public connDefaults(connector: ConnectorModel, diagram: Diagram): ConnectorModel {
    //connector.targetDecorator.shape = 'None';
    connector.type = 'Orthogonal';
    // connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.targetDecorator.height = 5;
    connector.targetDecorator.width = 5;
    connector.style!.strokeColor = '#6d6d6d';
    let sourceNode = diagram.getNodeObject(connector.sourceID).data;
    let targetNode = diagram.getNodeObject(connector.targetID).data;
    if (sourceNode['positionID'] === targetNode['reportTo2'])
    {
      connector.style!.strokeColor = '#6d6d6d';
      connector.style.strokeDashArray = '5,5';
    }
    return connector;
  }

  public nodeDefaults(node: NodeModel): NodeModel {
    return node;
  }
  newDataManager(): any {
    return {
      id: 'positionID',
      parentId: 'parents',
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
      //setting.dataManager = new DataManager(this.data);
      this.datasetting = setting;
      this.changeDetectorRef.detectChanges();
    }
  }

  getDataPositionByID(positionID: string) {
    if (positionID) {
      this.api.execSv("HR", "ERM.Business.HR", "PositionsBusiness", "GetDataOrgChartAsync", [positionID])
        .subscribe((res: any) => {
          if (res) {
            this.data = JSON.parse(JSON.stringify(res))
            //this.renewData();
            this.setDataOrg(this.data);
          }
          this.onDoneLoading = true;
        });
    }

  }

  // mouseUp(dataNode: any, evt: any) {
  //   this.positionID = dataNode.positionID;
  //   var exist = this.checkExistParent(this.positionID);
  //   if (this.diagram && exist) {
  //     var tool = this.diagram.getTool('LayoutAnimation');
  //     tool.mouseUp(this.diagram.eventHandler.eventArgs);
  //   }
  // }

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
        let listPos = [];
        this.data.forEach(function (object) {
          var posID = object.positionID;
          listPos.push(posID);
        });
        this.api.execSv("HR", "ERM.Business.HR", "PositionsBusiness", "GetChildOrgChartAsync", [node.positionID, listPos])
          .subscribe((res: any) => {
            if (res) {
              if (res.length > 0) {
                result = this.data.concat(res);
              }
            } else result = this.data;
            result.forEach(element => {
              if (element.positionID == node.positionID) {
                element.loadChildrent = true;
              }
            });
            this.data = JSON.parse(JSON.stringify(result))
            //this.renewData();
            this.setDataOrg(this.data);
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
  changeSelectedItem(data: any){
    this.positionID = data?.positionID;
    this.itemSelected.emit(data);
  }
  clickMF(event: any, data: any = null) {
    this.changeSelectedItem(data);
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
      (this.view.dataService as CRUDService).copy().subscribe((res) => {
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
                this.hasChangedData.emit({
                  data: res?.event?.positionID ? res.event : res,
                  action: 'copy',
                });
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
      (this.view.dataService as CRUDService)
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
                this.hasChangedData.emit({
                  data: res?.event?.positionID ? res.event : res,
                  action: 'edit',
                  hasChanged: true,
                });
                if (res?.positionID === this.positionID || res?.event?.positionID === this.positionID) {
                  // if (res?.reportTo != data?.reportTo && res?.reportTo2 != data?.reportTo2) {
                  //   this.getDataPositionByID(this.positionID);
                  // }
                  // else {
                  //   data['parents'] = [];
                  //   if (res?.event?.reportTo) (data['parents'] as any[]).push(res?.event?.reportTo);
                  //   if (res?.event?.reportTo2) (data['parents'] as any[]).push(res?.event?.reportTo2);
                  //   data.orgUnitID = res?.event?.orgUnitID;
                  //   data.orgUnitName = res?.event?.orgUnitName;
                  //   data.positionName = res?.event?.positionName;

                  //   var i = this.data.findIndex(p => p.positionID === data.positionID)
                  //   this.data[i]= data;
                  //   if(this.diagram)this.setDataOrg(this.data);
                  // }
                  this.getDataPositionByID(this.positionID);
                }
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
    (this.view.dataService as CRUDService)
      .delete([data], true, (opt) =>
        this.beforeDel(opt), null, null, null, null, null
      )
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS008');
          if (data?.positionID == this.positionID || data?.position == this.position?.positionID) {
            let parent = this.data.filter((item) => item.positionID == data?.reportTo);
            this.deletedInputPosition.emit(parent);
          } else {
            this.data = this.data.filter((x) => x.positionID !== data.positionID);
          }
          this.setDataOrg(this.data);
        }
        //else {
        //this.notiService.notifyCode('HR021', 0, this.view.dataService?.dataSelected?.positionName);
        //}
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
  searchText: string = "";
  searchUser(event: any) {
    this.searchText = event;
  }

}
