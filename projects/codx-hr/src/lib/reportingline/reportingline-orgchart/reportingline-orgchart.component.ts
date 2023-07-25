import { ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import {
  DiagramComponent,
  NodeModel,
  LineDistribution,
  ConnectorModel,
  DiagramTools,
  Diagram,
  DataBinding,
  ComplexHierarchicalTree,
  SnapConstraints,
  SnapSettingsModel,
  LayoutModel,
  ConnectionPointOrigin,
  ScrollSettingsModel,
  LayoutOrientation,
} from '@syncfusion/ej2-angular-diagrams';
// import {} from '@syncfusion/ej2-diagrams';
import { ChangeEventArgs as NumericChangeEventArgs } from '@syncfusion/ej2-inputs';
import { ApiHttpService, CRUDService, CallFuncService, NotificationsService, RequestOption, SidebarModel, ViewsComponent } from 'codx-core';
import { PopupAddPositionsComponent } from '../popup-add-positions/popup-add-positions.component';
import { DataManager } from '@syncfusion/ej2-data';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CheckBoxChangeEventArgs } from '@syncfusion/ej2-angular-grids';
Diagram.Inject(DataBinding, ComplexHierarchicalTree, LineDistribution);

@Component({
  selector: 'lib-reportingline-orgchart',
  templateUrl: './reportingline-orgchart.component.html',
  styleUrls: ['./reportingline-orgchart.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ReportinglineOrgChartComponent implements OnInit, OnChanges {

  @Input() position: any = null;
  @Input() positionID: string = "";
  @Input() funcID: string = "";
  @Input() formModel: any;
  @Input() view: ViewsComponent;
  @Output() deletedInputPosition: EventEmitter<any> = new EventEmitter();
  @Output() hasChangedData: EventEmitter<any> = new EventEmitter();
  @Output() itemSelectedChanged: EventEmitter<any> = new EventEmitter();

  width: number = 250;
  height: number = 150;
  maxWidth: number = 250;
  maxHeight: number = 150;
  minWidth: number = 200;
  minHeight: number = 150;
  employees: any[] = [];
  employeeInfor: any = null;
  firstLoadDiagram: boolean = true;
  @ViewChild('diagram') diagram: DiagramComponent;
  datasetting: any = null;
  data: any = null;
  onDoneLoading: boolean = false;
  isCorporation: boolean;

  posEmpPageSize: number = 5;
  posEmpPageIndex: number = 2;
  viewEmpPosition: string = '';
  scrolling: boolean = true;
  currentViewPosEmp: {
    countEmp: 0,
    employees: any[]
  };
  haveHighLight: boolean = false;

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private shareService: CodxShareService,
  ) { }

  //#region chart setting
  public layout: LayoutModel = {
    type: 'ComplexHierarchicalTree',
    connectionPointOrigin: ConnectionPointOrigin.SamePoint,
    //orientation: 'LeftToRight',
    verticalSpacing: 80,
    horizontalSpacing: 30,
    enableAnimation: false,
  };
  public tool: DiagramTools = DiagramTools.ZoomPan;
  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  public scrollSettings: ScrollSettingsModel = { scrollLimit: 'Infinity' };
  public reloadDiagram(): void {
    this.firstLoadDiagram = true;
    this.getDataPositionByID(this.positionID);
  }
  public onmarginLeftChange(args: NumericChangeEventArgs): void {
    this.diagram.layout.margin.left = args.value;
    this.diagram.dataBind();
  }
  public onmarginTopChange(args: NumericChangeEventArgs): void {
    this.diagram.layout.margin.top = args.value;
    this.diagram.dataBind();
  }
  public onhSpacingChange(args: NumericChangeEventArgs): void {
    this.diagram.layout.horizontalSpacing = Number(args.value);
    this.diagram.dataBind();
  }

  public onvSpacingChange(args: NumericChangeEventArgs): void {
    this.diagram.layout.verticalSpacing = Number(args.value);
    this.diagram.dataBind();
  }
  public documentClick(args: MouseEvent): void {
    let target: HTMLElement = args.target as HTMLElement;
    // custom code start
    let selectedElement: HTMLCollection = document.getElementsByClassName('e-selected-style');
    if (selectedElement.length) {
      selectedElement[0].classList.remove('e-selected-style');
    }
    // custom code end
    if (target.className === 'image-pattern-style') {
      let id: string = target.id;
      let orientation1: string = id.substring(0, 1).toUpperCase() + id.substring(1, id.length);
      this.diagram.layout.orientation = orientation1 as LayoutOrientation;
      this.diagram.layout.orientation = orientation1 as LayoutOrientation;
      this.diagram.doLayout();
      // custom code start
      target.classList.add('e-selected-style');
      // custom code end
      this.diagram.dataBind();
    }
  };
  public created(): void {
    if (this.diagram) {
      this.diagram.fitToPage();
      this.firstLoadDiagram = false;
    }
  }
  public onChange(args: CheckBoxChangeEventArgs): void {
    if (args.checked) {
      this.diagram.layout.connectionPointOrigin = ConnectionPointOrigin.DifferentPoint;
    }
    else {
      this.diagram.layout.connectionPointOrigin = ConnectionPointOrigin.SamePoint;
    }
  }
  public connDefaults(connector: ConnectorModel, diagram: Diagram): ConnectorModel {
    connector.targetDecorator.shape = 'None';
    connector.type = 'Orthogonal';
    // connector.constraints = 0;
    connector.cornerRadius = 5;
    connector.targetDecorator.height = 5;
    connector.targetDecorator.width = 5;
    connector.style!.strokeColor = '#6d6d6d';
    let sourceNode = diagram.getNodeObject(connector.sourceID).data;
    let targetNode = diagram.getNodeObject(connector.targetID).data;
    if (sourceNode['positionID'] === targetNode['reportTo2']) {
      connector.style!.strokeColor = '#6d6d6d';
      connector.style.strokeDashArray = '5,5';
      // diagram.previousSelectedObject =  [connector];
      // diagram.sendToBack();
      // diagram.sendBackward();
    }
    if (sourceNode['isSelected'] == true || targetNode['isSelected'] == true) {
      connector.style!.strokeColor = '#3699FF';
      connector.style!.strokeWidth = 5;
    }
    return connector;
  }
  public nodeDefaults(node: NodeModel): NodeModel {
    return node;
  }

  //#endregion

  ngOnInit(): void {
    this.api.execSv<any>('SYS', 'AD', 'CompanySettingsBusiness', 'GetAsync')
      .subscribe((res) => {
        if (res) {
          this.isCorporation = res.isCorporation;
        }
      });
    //this.getDataPositionByID(this.positionID);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.positionID.currentValue != changes.positionID.previousValue) {
      this.onDoneLoading = false;
      this.haveHighLight = false;
      this.positionID = changes.positionID.currentValue;
      this.firstLoadDiagram = true;
      this.getDataPositionByID(this.positionID);
      this.changeDetectorRef.detectChanges();
    }
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
      this.renewData();
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
            this.setDataOrg(this.data);
          }
          this.onDoneLoading = true;
        });
    }

  }

  renewData() {
    for (var i = 0; i < this.data.length; i++) {
      var count = this.data.filter(data => data.reportTo == this.data[i].positionID
        || data.reportTo2 == this.data[i].positionID).length;
      if (this.data[i].countChild == count) {
        this.data[i]['loadChildrent'] = true;
      } else this.data[i]['loadChildrent'] = false;

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

  loadDataChild(node: any, element: HTMLElement, e: Event) {
    e.stopPropagation();
    //e.preventDefault();
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
  changeSelectedItem(data: any) {
    var index = this.data.findIndex(x => x.positionID == data?.positionID);
    this.haveHighLight = true;
    if (this.data[index]['isSelected']) {
      this.data[index]['isSelected'] = false;
      this.haveHighLight = false;
    } else {
      this.positionID = data?.positionID;
      this.data.forEach(item => {
        if (item?.positionID === this.positionID) {
          item['isSelected'] = true;
        } else item['isSelected'] = false
      });
      this.itemSelectedChanged.emit(data);
    }
    this.datasetting = this.newDataManager();
    //this.diagram.updateData();

  }
  //#region more function
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
        default:
          this.shareService.defaultMoreFunc(
            event,
            data,
            null,
            this.view.formModel,
            this.view.dataService,
            this
          );
          break;
      }
    }
  }
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
  //#endregion
  
  //#region emp list
  searchText: string = "";
  searchUser(event: any, positionId: string) {
    this.searchText = event;

    //set scroll when 
    var index = this.data.findIndex(x => x.positionID == positionId)
    this.posEmpPageIndex = 0;
    this.scrolling = true;
    this.currentViewPosEmp = { countEmp: 0, employees: [] }

    if (this.searchText.length <= 0) {
      this.currentViewPosEmp = {
        countEmp: this.data[index].countEmp,
        employees: this.data[index].employees
      };
    } else {
      this.currentViewPosEmp = { countEmp: 0, employees: [] }
      this.posEmpPageIndex = 0;
      this.scrolling = true;
      this.api.execSv<any>('HR', 'ERM.Business.HR', 'PositionsBusiness', 'GetListEmpPositionsAsync', [positionId, this.posEmpPageSize, 0, this.searchText])
        .subscribe(res => {
          if (res) {
            if (index >= 0) {
              this.currentViewPosEmp.countEmp = res[1];
              this.currentViewPosEmp.employees = this.currentViewPosEmp.employees.concat(res[0]);
            }
            if (this.currentViewPosEmp.countEmp <= this.currentViewPosEmp.employees.length) {
              this.scrolling = false;
            } else {
              this.posEmpPageIndex = this.posEmpPageIndex + 1;
              this.scrolling = true;
            }
          }
        })
    }
  }
  onScrollEmpList(ele: HTMLDivElement, positionID: string, totalEmp: number) {
    if (this.viewEmpPosition !== positionID) { //change position
      this.posEmpPageIndex = 1;
      this.scrolling = true;
      this.viewEmpPosition = positionID;
    }
    var totalScroll = ele.offsetHeight + ele.scrollTop;
    if (this.scrolling && (totalScroll == ele.scrollHeight)) {
      this.getEmpListPaging(positionID);
    }
  }
  getEmpListPaging(positionID: string) {
    var index = this.data.findIndex(x => x.positionID == positionID)
    if (this.scrolling) {
      if (this.searchText.length > 0) {
        if (this.currentViewPosEmp.countEmp > this.currentViewPosEmp.employees.length) {
          this.api.execSv<any>('HR', 'ERM.Business.HR', 'PositionsBusiness', 'GetListEmpPositionsAsync', [positionID, this.posEmpPageSize, this.posEmpPageIndex, this.searchText])
            .subscribe(res => {
              if (res) {
                if (index >= 0) {
                  this.currentViewPosEmp.countEmp = res[1];
                  this.currentViewPosEmp.employees = this.currentViewPosEmp.employees.concat(res[0]);
                }

                if (this.currentViewPosEmp.countEmp <= this.currentViewPosEmp.employees.length) {
                  this.scrolling = false;
                } else {
                  this.posEmpPageIndex = this.posEmpPageIndex + 1;
                  this.scrolling = true;
                }
              }
            })
        } else {
          this.scrolling = false;
        }
      } else {
        if (this.data[index]?.countEmp > this.data[index].employees.length) {
          this.api.execSv<any>('HR', 'ERM.Business.HR', 'PositionsBusiness', 'GetListEmpPositionsAsync', [positionID, this.posEmpPageSize, this.posEmpPageIndex, this.searchText])
            .subscribe(res => {
              if (res) {
                if (index >= 0) {
                  this.data[index].employees = this.data[index].employees.concat(res[0]);
                  this.data[index].countEmp = res[1];
                  this.currentViewPosEmp.countEmp = res[1];
                  this.currentViewPosEmp.employees = this.currentViewPosEmp.employees.concat(res[0]);
                }

                if (this.data[index]?.countEmp <= this.data[index].employees.length) {
                  this.scrolling = false;
                } else {
                  this.posEmpPageIndex = this.posEmpPageIndex + 1;
                  this.scrolling = true;
                }
              }
            })
        } else {
          this.scrolling = false;
        }
      }
    }

  }
  hasOpenEmpList(positionID: string, event: Event) {
    event.stopPropagation();
    // event.preventDefault();
    if (this.viewEmpPosition !== positionID) { //change position
      this.posEmpPageIndex = 1;
      this.scrolling = true;
      this.viewEmpPosition = positionID;
    }
    var index = this.data.findIndex(x => x.positionID == positionID)
    if (index >= 0) {
      this.currentViewPosEmp = {
        countEmp: this.data[index].countEmp,
        employees: this.data[index].employees
      };

    } else this.currentViewPosEmp = { countEmp: 0, employees: [] }
  }
  //#endregion
}
