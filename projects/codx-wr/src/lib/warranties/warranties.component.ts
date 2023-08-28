import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupAddWarrantyComponent } from './popup-add-warranty/popup-add-warranty.component';
import { PopupUpdateReasonCodeComponent } from './popup-update-reasoncode/popup-update-reasoncode.component';
import { PopupAssignEngineerComponent } from './popup-assign-engineer/popup-assign-engineer.component';
import { CodxWrService } from '../codx-wr.service';
import { ViewDetailWrComponent } from './view-detail-wr/view-detail-wr.component';

@Component({
  selector: 'lib-warranties',
  templateUrl: './warranties.component.html',
  styleUrls: ['./warranties.component.css'],
})
export class WarrantiesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // ViewChild
  @ViewChild('itemViewList') itemViewList: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate!: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail!: TemplateRef<any>;
  @ViewChild('viewDetail') viewDetail: ViewDetailWrComponent;

  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  @Input() dataObj?: any;
  @Input() funcID: any;

  // region LocalVariable
  viewMode = 1;
  vllStatus = '';
  dataSelected: any;
  viewCrr: any;
  request: ResourceModel;
  button?: ButtonModel = { id: 'btnAdd' };
  readonly btnAdd: string = 'btnAdd';
  funcIDCrr: any;
  titleAction = '';
  user: any;
  gridViewSetup: any;
  moreFuncInstance: any;
  columnGrids = [];
  arrFieldIsVisible: any[];

  // config api get data
  service = 'WR';
  assemblyName = 'ERM.Business.WR';
  entityName = 'WR_WorkOrders';
  className = 'WorkOrdersBusiness';
  method = 'GetListWorkOrdersAsync';
  idField = 'recID';
  lstOrderUpdate = [];
  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private callFc: CallFuncService,
    private wrSv: CodxWrService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private authStore: AuthStore
  ) {
    super(inject);
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
    this.executeApiCalls();
    // this.loadParam();
  }

  onInit(): void {
    this.afterLoad();
    this.button = {
      id: this.btnAdd,
    };
    this.wrSv.listOrderUpdateSubject.subscribe((res) => {
      if (res) {
        this.lstOrderUpdate = res;
        // this.listContacts.push(Object.assign({}, res));
        // this.lstContactEmit.emit(this.listContacts);
        this.wrSv.listOrderUpdateSubject.next(null);
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadViewModel();
    this.view.dataService.methodSave = 'AddWorkOrderAsync';
    this.view.dataService.methodUpdate = 'UpdateWorkOrderAsync';
    this.view.dataService.methodDelete = 'DeleteWorkOrderAsync';

    this.detectorRef.detectChanges();
  }

  searchChanged(e) {}

  onLoading(e) {
    this.getColumsGrid(this.gridViewSetup);
    return;
  }

  getColumsGrid(grvSetup) {
    this.columnGrids = [];
    if (this.arrFieldIsVisible?.length > 0) {
      this.arrFieldIsVisible.forEach((key) => {
        let field = Util.camelize(key);
        let template: any;
        let colums: any;
        switch (key) {
          // case 'CustomerID':
          //   template = this.templateCustomer;
          //   break;
          // case 'BusinessLineID':
          //   template = this.templateBusinessLines;
          //   break;
          // case 'DealValue':
          //   template = this.templateDealValue;
          //   break;
          // case 'Status':
          //   template = this.templateStatus;
          //   break;
          // case 'Owner':
          //   template = this.templateOwner;
          //   break;
          // case 'StepID':
          //   template = this.templateSteps;
          //   break;
          // case 'ConsultantID':
          //   template = this.templateConsultant;
          //   break;
          // case 'ExpectedClosed':
          //   template = this.templateExpectedClosed;
          //   break;

          default:
            break;
        }
        if (template) {
          colums = {
            field: field,
            headerText: grvSetup[key].headerText,
            width: grvSetup[key].width,
            template: template,
            // textAlign: 'center',
          };
        } else {
          colums = {
            field: field,
            headerText: grvSetup[key].headerText,
            width: grvSetup[key].width,
          };
        }
        this.columnGrids.push(colums);
      });
    }

    // this.loadViewModel();
  }

  loadViewModel() {
    this.views = [
      {
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.itemViewList,
        },
      },
      // {
      //   type: ViewType.grid,
      //   active: false,
      //   sameData: true,
      //   model: {
      //     template2: this.itemViewList,
      //     resources: this.columnGrids,
      //   },
      // },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
  }

  afterLoad() {
    // this.request = new ResourceModel(); //Phúc comment lại vì cái này để chạy những view kanban schudule, tự chạy hàm riêng, request riêng.
    // this.request.service = 'WR';
    // this.request.assemblyName = 'ERM.Business.WR';
    // this.request.className = 'WorkOrdersBusiness';
    // this.request.method = 'GetListWorkOrdersAsync';
    // this.request.idField = 'recID';
    // this.request.dataObj = this.dataObj;
    // this.resourceKanban = new ResourceModel();
    // this.resourceKanban.service = 'DP';
    // this.resourceKanban.assemblyName = 'DP';
    // this.resourceKanban.className = 'ProcessesBusiness';
    // this.resourceKanban.method = 'GetColumnsKanbanAsync';
    // this.resourceKanban.dataObj = this.dataObj;
  }

  executeApiCalls() {
    try {
      this.getFuncID(this.funcID);
      // this.getColorReason();
      // this.getCurrentSetting();
      this.getValuelistStatus();
    } catch (error) {}
  }

  async getValuelistStatus() {
    console.log('Not implemented');
    // this.cache.valueList('CRM041').subscribe((func) => {
    //   if (func) {
    //     this.valueListStatus = func.datas
    //       .filter((x) => ['2', '3', '5', '7'].includes(x.value))
    //       .map((item) => ({
    //         text: item.text,
    //         value: item.value,
    //       }));
    //   }
    // });
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeMoreMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'WR0101_1':
        this.updateReasonCode(data);
        break;
      case 'WR0101_2':
        this.updateAssignEngineer(data);
        break;
      default:
        var customData = {
          refID: data.processID,
          refType: 'DP_Processes',
          dataSource: '', // truyen sau
        };
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this,
          customData
        );
        break;
    }
    this.detectorRef.detectChanges();
  }

  changeDataMF($event, data, type = null) {
    // if ($event != null && data != null) {
    //   for (let eventItem of $event) {
    //     if (type == 11) {
    //       eventItem.isbookmark = false;
    //     }
    //     const functionID = eventItem.functionID;
    //     // const mappingFunction = this.getRoleMoreFunction(functionID);
    //     // mappingFunction && mappingFunction(eventItem, data);
    //   }
    // }
  }

  async getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        this.vllStatus =
          this.gridViewSetup['Status'].referedValue ?? this.vllStatus;
        // this.vllApprove =
        //   this.gridViewSetup['ApproveStatus'].referedValue ?? this.vllApprove;
        //lay grid view
        let arrField = Object.values(this.gridViewSetup).filter(
          (x: any) => x.isVisible
        );
        if (Array.isArray(arrField)) {
          this.arrFieldIsVisible = arrField
            .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
            .map((x: any) => x.fieldName);
          // this.getColumsGrid(this.gridViewSetup);
        }
      }
    });
  }

  async getFuncID(funcID) {
    this.cache.functionList(funcID).subscribe((f) => {
      if (f) {
        this.funcIDCrr = f;
        this.getGridViewSetup(
          this.funcIDCrr.formName,
          this.funcIDCrr.gridViewName
        );
        this.getMoreFunction(
          this.funcIDCrr.formName,
          this.funcIDCrr.gridViewName
        );
      }
    });
  }

  async getMoreFunction(formName, gridViewName) {
    this.cache.moreFunction(formName, gridViewName).subscribe((res) => {
      if (res && res.length > 0) {
        this.moreFuncInstance = res;
      }
    });
  }

  selectedChange(data) {
    if (data || data?.data) this.dataSelected = data?.data ? data?.data : data;
    this.changeDetectorRef.detectChanges();
  }

  changeView(e) {
    // this.funcID = this.activedRouter.snapshot.params['funcID'];
    // if (this.crrFuncID != this.funcID) {
    //   this.crrFuncID = this.funcID;
    // }
    this.viewCrr = e?.view?.type;
    // if (this.viewCrr == 6) {
    //   this.kanban = (this.view?.currentView as any)?.kanban;
    // }
  }

  onActions(e) {
    console.log('Not implemented');
    // switch (e.type) {
    //   case 'drop':
    //     this.dataDrop = e.data;
    //     this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
    //     // xử lý data chuyển công đoạn
    //     if (this.crrStepID != this.dataDrop.stepID)
    //       this.dropDeals(this.dataDrop);
    //     break;
    //   case 'drag':
    //     ///bắt data khi kéo
    //     this.crrStepID = e?.data?.stepID;
    //     break;
    //   case 'dbClick':
    //     //xư lý dbClick
    //     if (this.viewCrr != 11) this.viewDetail(e.data);
    //     else if (e?.data?.rowData) this.viewDetail(e?.data?.rowData);
    //     break;
    //   //chang fiter
    //   case 'pined-filter':
    //     this.seclectFilter(e.data);
    // }
  }

  //#region  CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      this.cache.functionList(this.funcID).subscribe((fun) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        var formMD = new FormModel();
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        formMD.funcID = this.funcID;
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '550px';
        var obj = {
          action: 'add',
          title: this.titleAction,
          gridViewSetup: this.gridViewSetup,
        };
        var dialog = this.callfc.openSide(
          PopupAddWarrantyComponent,
          obj,
          option
        );
        dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e && e.event != null) {
            this.dataSelected = JSON.parse(JSON.stringify(e?.event));
            this.view.dataService.update(e?.event).subscribe();
            this.detectorRef.detectChanges();
          }
        });
      });
    });
  }

  edit(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        this.cache.functionList(this.funcID).subscribe((fun) => {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          var formMD = new FormModel();
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          formMD.funcID = this.funcID;
          option.FormModel = JSON.parse(JSON.stringify(formMD));
          option.Width = '550px';
          var obj = {
            action: 'edit',
            title: this.titleAction,
            gridViewSetup: this.gridViewSetup,
          };
          var dialog = this.callfc.openSide(
            PopupAddWarrantyComponent,
            obj,
            option
          );
          dialog.closed.subscribe((e) => {
            if (!e?.event) this.view.dataService.clear();
            if (e && e.event != null) {
              this.view.dataService.update(e.event).subscribe();
              this.dataSelected = JSON.parse(JSON.stringify(e?.event));
              this.detectorRef.detectChanges();
            }
          });
        });
      });
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      this.cache.functionList(this.funcID).subscribe((fun) => {
        var formMD = new FormModel();
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        formMD.funcID = this.funcID;
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '550px';
        var obj = {
          action: 'copy',
          title: this.titleAction,
          gridViewSetup: this.gridViewSetup,
        };
        var dialog = this.callfc.openSide(
          PopupAddWarrantyComponent,
          obj,
          option
        );
        dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          if (e && e.event != null) {
            this.dataSelected = JSON.parse(JSON.stringify(e?.event));
            this.view.dataService.update(e.event).subscribe();
            this.detectorRef.detectChanges();
          }
        });
      });
    });
  }

  async delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
        }
      });

    this.detectorRef.detectChanges();
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteWorkOrderAsync';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion

  //#region update reason code
  updateReasonCode(data) {
    this.cache
      .gridViewSetup('WRWorkOrderUpdates', 'grvWRWorkOrderUpdates')
      .subscribe((res) => {
        if (res) {
          let dialogModel = new DialogModel();
          dialogModel.zIndex = 1010;
          let formModel = new FormModel();

          formModel.entityName = 'WR_WorkOrderUpdates';
          formModel.formName = 'WRWorkOrderUpdates';
          formModel.gridViewName = 'grvWRWorkOrderUpdates';
          dialogModel.FormModel = formModel;
          let obj = {
            title: this.titleAction,
            transID: data?.recID,
            engineerID: data?.engineerID,
            gridViewSetup: res,
          };
          this.callFc
            .openForm(
              PopupUpdateReasonCodeComponent,
              '',
              600,
              700,
              '',
              obj,
              '',
              dialogModel
            )
            .closed.subscribe((e) => {
              if (e?.event && e?.event != null) {
                this.dataSelected.statusCode = e?.event?.statusCode;
                this.dataSelected.scheduleStart = e?.event?.scheduleStart;
                this.dataSelected.scheduleEnd = e?.event?.scheduleEnd;
                let index = this.lstOrderUpdate.findIndex(
                  (x) =>
                    x.statusCode == e?.event?.statusCode &&
                    x.transID == e?.event?.transID
                );
                if (index != -1) {
                  this.lstOrderUpdate[index] = e?.event;
                } else {
                  this.lstOrderUpdate.push(e?.event);
                }

                this.viewDetail.listOrderUpdate(this.lstOrderUpdate);

                this.detectorRef.detectChanges();
              }
            });
        }
      });
  }
  //#endregion

  //#region Update assign engineer
  updateAssignEngineer(data) {
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    dialogModel.FormModel = this.view.formModel;
    let obj = {
      title: this.titleAction,
      data: data,
    };
    this.callFc
      .openForm(
        PopupAssignEngineerComponent,
        '',
        500,
        400,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.dataSelected.engineerID = e?.event[0];
          this.dataSelected.comment = e?.event[1];
          this.view.dataService.update(this.dataSelected).subscribe();
          let index = this.lstOrderUpdate.findIndex(
            (x) =>
              x.statusCode == this.dataSelected?.statusCode &&
              x.transID == this.dataSelected?.recID
          );
          if (index != -1) {
            this.lstOrderUpdate[index].engineerID = this.dataSelected.engineerID;
          }

          this.viewDetail.listOrderUpdate(this.lstOrderUpdate);

          this.detectorRef.detectChanges();
        }
      });
  }
  //#endregion
}
