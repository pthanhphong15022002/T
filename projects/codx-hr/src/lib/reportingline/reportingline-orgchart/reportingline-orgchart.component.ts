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
import { ApiHttpService, CRUDService, CacheService, CallFuncService, NotificationsService, RequestOption, SidebarModel, ViewsComponent } from 'codx-core';
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
  @Input() grvSetup: any;
  @Input() addedData: any;
  // @Output() deletedInputPosition: EventEmitter<any> = new EventEmitter();
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
  haveHighLight: boolean = true;

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private shareService: CodxShareService,
    private cache : CacheService,
  ) { }

  //#region chart setting
  public layout: LayoutModel = {
    type: 'ComplexHierarchicalTree',
    connectionPointOrigin: ConnectionPointOrigin.DifferentPoint,
    verticalSpacing: 80,
    horizontalSpacing: 30,
  };
  public tool: DiagramTools = DiagramTools.ZoomPan;
  public snapSettings: SnapSettingsModel = {
    constraints: SnapConstraints.None,
  };
  public scrollSettings: ScrollSettingsModel = { scrollLimit: 'Infinity' };
  public created(): void {
    if (this.diagram) {
      this.diagram.fitToPage();
      this.firstLoadDiagram = false;
    }
  }
  public connDefaults(connector: ConnectorModel, diagram: Diagram): ConnectorModel {
    connector.targetDecorator.shape = 'None';
    connector.type = 'Orthogonal';
    connector.cornerRadius = 5;
    connector.targetDecorator.height = 5;
    connector.targetDecorator.width = 5;
    let sourceNode = diagram.getNodeObject(connector.sourceID).data;
    let targetNode = diagram.getNodeObject(connector.targetID).data;
    if (sourceNode['positionID'] === targetNode['reportTo2']) {
      connector.style!.strokeColor = '#6d6d6d';
      connector.style.strokeDashArray = '5,5';
    }
    if (sourceNode['isSelected'] == true || targetNode['isSelected'] == true) {
      connector.style!.strokeColor = 'var(--primary)';
      connector.style!.strokeWidth = 2;
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
    this.getFunction(this.funcID);
    //this.getDataPositionByID(this.positionID);
  }
  getFunction(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
        //if (func) this.funcID = func;
        if (func?.formName && func?.gridViewName) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grvSetup = grd;
              }
            });
        }
      });
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.posEmpPageIndex = 0;
    this.scrolling = true;
    this.currentViewPosEmp = { countEmp: 0, employees: [] }
    if (changes.positionID.currentValue != changes.positionID.previousValue) {
      this.onDoneLoading = false;
      this.haveHighLight = true;
      // if(this.addedData.positionID != null){
      //   this.positionID = this.addedData.positionID
      // }else 
      this.positionID = changes.positionID.currentValue;
      this.firstLoadDiagram = true;
      this.getDataPositionByID(this.positionID);
      this.changeDetectorRef.detectChanges();
    }
  }
  public reloadDiagram(): void {
    this.firstLoadDiagram = true;
    this.getDataPositionByID(this.positionID);
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
            let index = res.findIndex(x => x.positionID === positionID);
            res.forEach(item => {
              if (item?.positionID === positionID) {
                item['isSelected'] = true;
              } else item['isSelected'] = false
            });
            this.data = JSON.parse(JSON.stringify(res))
            this.setDataOrg(this.data);
          }
          this.onDoneLoading = true;
        });
    }

  }

  renewData() {
    this.data.forEach(item => {
      var countChild = this.data.filter(x => x.reportTo == item.positionID || x.reportTo2 == item.positionID).length;
      item.loadChildrent = (countChild == item.countChild);
    });
  }


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
    this.currentViewPosEmp.employees = this.data[index].employees;
    this.currentViewPosEmp.countEmp = this.data[index].countEmp;
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
                  hasChanged: true,
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
            this.hasChangedData.emit({
              data: null,
              action: 'delete',
              hasChanged: true,
            });
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
              this.currentViewPosEmp.employees = [...new Map(this.currentViewPosEmp.employees.map(item => [item['employeeID'], item])).values()];;
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
    var totalScroll = ele.clientHeight + ele.scrollTop;
    if (this.scrolling && totalScroll == ele.scrollHeight) {
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
                  this.currentViewPosEmp.employees = [...new Map(this.currentViewPosEmp.employees.map(item => [item['employeeID'], item])).values()];;
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
                  this.data[index].employees = [...new Map(this.data[index].employees.map(item => [item['employeeID'], item])).values()];;
                  this.data[index].countEmp = res[1];
                  this.currentViewPosEmp.countEmp = res[1];
                  this.currentViewPosEmp.employees = this.data[index].employees;
                  //this.currentViewPosEmp.employees = [...new Map(this.currentViewPosEmp.employees.map(item => [item['employeeID'], item])).values()];;
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
