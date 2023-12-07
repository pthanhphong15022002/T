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
  AlertConfirmInputConfig,
  AuthStore,
  ButtonModel,
  CacheService,
  CallFuncService,
  DialogModel,
  DialogRef,
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
import { firstValueFrom } from 'rxjs';
import { WR_WorkOrderUpdates } from '../_models-wr/wr-model.model';
import { PopupAddServicetagComponent } from './popup-add-servicetag/popup-add-servicetag.component';

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
  @ViewChild('updateStatus') updateStatus: TemplateRef<any>;
  @ViewChild('itemPriority') itemPriority: TemplateRef<any>;
  @ViewChild('itemComment') itemComment: TemplateRef<any>;
  @ViewChild('itemService') itemService: TemplateRef<any>;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;

  dialogStatus: DialogRef;
  // extension core
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  formModel: FormModel;

  // type any for view detail
  @Input() dataObj?: any;

  // region LocalVariable
  viewMode = 1;
  vllStatus = '';
  vllPriority = 'TM005';
  dataSelected: any;
  viewCrr: any;
  request: ResourceModel;
  showMoreAdd: boolean;
  button?: ButtonModel[] = [{ id: 'btnAdd' }];
  readonly btnAdd: string = 'btnAdd';
  funcIDCrr: any;
  titleAction = '';
  user: any;
  gridViewSetup: any;
  moreFuncInstance: any;
  columnGrids = [];
  arrFieldIsVisible: any[];
  listRoles = [];

  // config api get data
  service = 'WR';
  assemblyName = 'ERM.Business.WR';
  entityName = 'WR_WorkOrders';
  className = 'WorkOrdersBusiness';
  method = 'GetListWorkOrdersAsync';
  idField = 'recID';
  lstOrderUpdate = [];
  cancelledNote = '';
  status = '';
  priority = '';
  comment = '';
  serviceLocator: any;
  zone: any;
  zone2: any;
  partnerZone: any;
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  moreFuncEdit = '';
  asideMode: string = '1';
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
    // this.router.params.subscribe((param: any) => {
    //   if (param.funcID) {
    //   }
    // });
    this.executeApiCalls();
  }

  onInit(): void {
    this.showMoreAdd = false; //Hiện tại theo bên digipro tắt.
    this.asideMode = this.codxService?.asideMode;

    this.button = [
      {
        id: this.btnAdd,
      },
    ];
    this.wrSv.listOrderUpdateSubject.subscribe((res) => {
      if (res) {
        this.lstOrderUpdate = res?.e ?? [];
        if (res?.date) {
          this.dataSelected.lastUpdatedOn = res?.date;
          if (res?.update) {
            this.dataSelected.statusCode = res?.update?.statusCode;
            this.dataSelected.status = res?.update?.status;
          }
          if (this.lstOrderUpdate == null || this.lstOrderUpdate.length == 0)
            this.dataSelected.status = '1';
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.update(this.dataSelected, true).subscribe();
        }

        this.wrSv.listOrderUpdateSubject.next(null);
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadViewModel();
    this.view.dataService.methodSave = 'AddWorkOrderAsync';
    this.view.dataService.methodUpdate = 'UpdateWorkOrderAsync';
    this.view.dataService.methodDelete = 'DeleteWorkOrderAsync';
    this.api
      .exec('BS', 'ProvincesBusiness', 'InitCacheLocationsAsync')
      .subscribe((res) => {});
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS03');
        if (m) this.moreFuncEdit = m?.customName;
      }
    });
    this.detectorRef.detectChanges();
  }

  searchChanged(e) {}

  onLoading(e) {}

  getColumsGrid(grvSetup) {
    this.columnGrids = [];
    if (this.arrFieldIsVisible?.length > 0) {
      this.arrFieldIsVisible.forEach((key) => {
        let field = Util.camelize(key);
        let template: any;
        let colums: any;

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
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.grid,
        sameData: true,
        active: false,
        model: {
          template2: this.templateMore,
        },
      },
    ];
  }

  executeApiCalls() {
    try {
      this.getFuncID(this.funcID);
      // this.getColorReason();
      // this.getCurrentSetting();
      this.getValueListRole();
    } catch (error) {}
  }

  async getValueListRole() {
    this.cache.valueList('WR005').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
      default:
        let f = evt.data;
        let data = evt.model;
        if (!data) data = this.view.dataService.dataSelected;
        this.codxShareService.defaultMoreFunc(
          f,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
    }
  }

  clickMoreFunc(e) {
    this.clickMF(e.e, e.data);
  }

  changeMoreMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  updateComment(e) {
    this.updateCommentWarranty(e.data);
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
      case 'WR0103_1': //Cập nhật trạng thái
      case 'WR0102_1':
      case 'WR0104_1':
        this.updateReasonCode(data);
        break;
      case 'WR0101_2': //Cập nhật kĩ thuật viên
      case 'WR0103_2':
      case 'WR0102_2':
      case 'WR0104_2':
        this.updateAssignEngineer(data);
        break;
      case 'WR0101_3': //Hủy case - status = 9
      case 'WR0103_3':
      case 'WR0102_3':
      case 'WR0104_3':
        this.updateStatusWarranty('9', data);
        break;
      case 'WR0101_4': //Đóng case - status = 7
      case 'WR0103_4':
      case 'WR0102_4':
      case 'WR0104_4':
        this.updateStatusWarranty('7', data);
        break;
      case 'WR0101_5': //Mở case - status = 3
      case 'WR0103_5':
      case 'WR0102_5':
      case 'WR0104_5':
        this.updateStatusWarranty('3', data);
        break;
      case 'WR0101_6': //Cập nhật độ ưu tiên
      case 'WR0103_6':
      case 'WR0102_6':
      case 'WR0104_6':
        this.updatePriority(data);
        break;
      case 'WR0103_8': //Cập nhật trạng thái part
        break;
      default:
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this,
          null
        );
        break;
    }
    this.detectorRef.detectChanges();
  }

  changeDataMF($event, data, type = null) {
    if ($event != null && data != null) {
      $event.forEach((res) => {
        if (type == '11') res.isbookmark = false;
        if (
          (data.status != '7' &&
            ['WR0101_5', 'WR0102_5', 'WR0103_5', 'WR0104_5'].includes(
              res.functionID
            )) ||
          (data.status == '7' &&
            ['WR0101_4', 'WR0102_4', 'WR0103_4', 'WR0104_4'].includes(
              res.functionID
            )) ||
          (data.status == '9' &&
            ['WR0101_3', 'WR0102_3', 'WR0103_3', 'WR0104_3'].includes(
              res.functionID
            )) ||
          ['WR0101_7', 'WR0102_7', 'WR0103_7', 'WR0104_7', 'WR0103_8'].includes(
            res.functionID
          ) ||
          ['SYS02', 'SYS04'].includes(res.functionID)
        )
          res.disabled = true;
      });
    }
  }

  isFunctionToDisable(functionID, disabledFunctions) {
    return disabledFunctions.includes(functionID);
  }

  async getGridViewSetup(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
        this.vllStatus =
          this.gridViewSetup?.Status?.referedValue ?? this.vllStatus;
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
    this.viewCrr = e?.view?.type;
  }

  //#region CRUD
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
            this.view.dataService.update(e?.event, true).subscribe();
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
              this.view.dataService.update(e.event, true).subscribe();
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
            this.view.dataService.update(e.event, true).subscribe();
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
          let dataUpdates = new WR_WorkOrderUpdates();
          dataUpdates.recID = Util.uid();
          let obj = {
            data: dataUpdates,
            title: this.titleAction,
            transID: data?.recID,
            engineerID: data?.engineerID,
            createdBy: data?.createdBy,
            gridViewSetup: res,
            action: 'add',
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
              if (e && e?.event != null) {
                this.dataSelected.statusCode = e?.event?.statusCode;
                this.dataSelected.scheduleStart = e?.event?.scheduleStart;
                this.dataSelected.lastUpdatedOn = new Date();
                this.dataSelected.status = e?.event?.status;
                let index = this.lstOrderUpdate.findIndex(
                  (x) =>
                    x.recID == e?.event?.recID && x.transID == e?.event?.transID
                );
                if (index != -1) {
                  this.lstOrderUpdate[index] = e?.event;
                } else {
                  this.lstOrderUpdate.unshift(e?.event);
                }
                this.dataSelected = JSON.parse(
                  JSON.stringify(this.dataSelected)
                );
                this.view.dataService
                  .update(this.dataSelected, true)
                  .subscribe();
                if (this.viewDetail) this.viewDetail.listOrderUpdate();

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
          this.dataSelected.owner = e?.event[0];
          this.dataSelected.feedbackComment = e?.event[1];
          this.dataSelected.lastUpdatedOn = new Date();
          if (this.viewDetail) this.viewDetail.listOrderUpdate();
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          this.view.dataService.update(this.dataSelected, true).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }

  updateAssignEngineerEmit(e) {
    if (e && e?.data) {
      let title = this.funcID + '_2';
      const more = this.moreFuncInstance.find((el) => el.functionID == title);
      if (e?.type == 'engineerID') {
        this.titleAction = more?.description ?? 'Update engineer';
        this.updateAssignEngineer(e?.data);
      } else {
        this.updateServiceLocator(e?.data);
      }
    }
  }
  //#endregion

  //#region update serviceLocator
  updateServiceLocator(data) {
    this.dataSelected = data;
    this.serviceLocator = this.dataSelected?.serviceLocator;
    this.titleAction =
      this.moreFuncEdit +
      ' ' +
      this.gridViewSetup?.ServiceLocator?.headerText?.toLowerCase();
    this.dialogStatus = this.callfc.openForm(this.itemService, '', 500, 350);
    this.dialogStatus.closed.subscribe((ele) => {
      if (ele && ele?.event) {
        this.dataSelected.serviceLocator = this.serviceLocator;
        this.dataSelected.zone = this.zone;
        this.dataSelected.zone2 = this.zone2;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.view.dataService.update(this.dataSelected, true).subscribe();
        this.notificationsService.notifyCode('SYS007');
        this.detectorRef.detectChanges();
      }
    });
  }

  //#endregion

  //#region update status
  updateStatusWarranty(status, data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notificationsService
      .alertCode(
        'CM007',
        null,
        this.titleAction?.toLocaleLowerCase(),
        "'" + data?.orderNo + "'"
      )
      .subscribe(async (x) => {
        if (x?.event?.status == 'Y') {
          if (status == '9') {
            this.status = status;
            this.dialogStatus = this.callfc.openForm(
              this.updateStatus,
              '',
              500,
              350
            );
            this.dialogStatus.closed.subscribe((ele) => {
              if (ele && ele?.event) {
                this.dataSelected.status = this.status;
                this.dataSelected.cancelledNote = this.cancelledNote;
                this.dataSelected.cancelled = true;
                this.dataSelected.cancelledOn = new Date();
                this.dataSelected = JSON.parse(
                  JSON.stringify(this.dataSelected)
                );
                this.view.dataService
                  .update(this.dataSelected, true)
                  .subscribe();
                this.notificationsService.notifyCode('SYS007');
                this.detectorRef.detectChanges();
              }
            });
          } else {
            this.api
              .execSv<any>(
                'WR',
                'ERM.Business.WR',
                'WorkOrdersBusiness',
                'UpdateStatusWarrantyAsync',
                [data?.recID, status, '']
              )
              .subscribe((res) => {
                if (res) {
                  this.dataSelected.status = res;
                  this.dataSelected = JSON.parse(
                    JSON.stringify(this.dataSelected)
                  );
                  this.view.dataService
                    .update(this.dataSelected, true)
                    .subscribe();
                  this.notificationsService.notifyCode('SYS007');
                  this.detectorRef.detectChanges();
                }
              });
          }
        }
      });
  }

  //update priority
  updatePriority(data) {
    this.priority = data?.priority;
    this.dialogStatus = this.callfc.openForm(this.itemPriority, '', 400, 200);
    this.dialogStatus.closed.subscribe((ele) => {
      if (ele && ele?.event) {
        this.dataSelected.priority = ele?.event;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.view.dataService.update(this.dataSelected, true).subscribe();
        this.notificationsService.notifyCode('SYS007');
        this.detectorRef.detectChanges();
      }
    });
  }

  //update comment
  updateCommentWarranty(data) {
    this.dataSelected = data;
    this.comment = this.dataSelected.comment;
    let title = this.funcID + '_7';
    const event = this.moreFuncInstance.find((e) => e.functionID == title);
    this.titleAction = event?.description ?? 'Edit note';
    this.dialogStatus = this.callfc.openForm(this.itemComment, '', 600, 400);
    this.dialogStatus.closed.subscribe((ele) => {
      if (ele && ele?.event) {
        this.dataSelected.comment = this.comment;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.view.dataService.update(this.dataSelected, true).subscribe();
        this.notificationsService.notifyCode('SYS007');
        this.detectorRef.detectChanges();
      }
    });
  }

  changValueStatus(e) {
    this[e?.field] = e?.data;
    if (e?.field == 'serviceLocator') {
      this.zone = e?.component?.itemsSelected[0]?.Zone;
      this.zone2 = e?.component?.itemsSelected[0]?.Zone2;
    }
    this.detectorRef.detectChanges();
  }

  onSave(type) {
    let methodName = '';
    let data = [];
    switch (type) {
      case 'status':
        data = [this.dataSelected?.recID, this.status, this.cancelledNote];
        methodName = 'UpdateStatusWarrantyAsync';
        break;
      case 'comment':
        data = [this.dataSelected?.recID, this.comment];
        methodName = 'UpdateCommentWarrantyAsync';
        break;
      case 'priority':
        data = [this.dataSelected?.recID, this.priority];
        methodName = 'UpdatePriorityWarrantyAsync';
        break;
      case 'serviceLocator':
        data = [
          this.dataSelected?.recID,
          this.serviceLocator,
          this.zone,
          this.zone2,
        ];
        methodName = 'UpdateServiceLocatorWarrantyAsync';
        break;
    }

    this.api
      .execSv<any>(
        'WR',
        'ERM.Business.WR',
        'WorkOrdersBusiness',
        methodName,
        data
      )
      .subscribe((res) => {
        if (res) {
          this.dialogStatus.close(res);

          this.detectorRef.detectChanges();
        }
      });
  }
  //#endregion

  //#region
  editProduct($event) {
    if ($event?.data) {
      const data = $event?.data;
      let opt = new DialogModel();
      let formModel = new FormModel();
      formModel.formName = 'WRProducts';
      formModel.gridViewName = 'grvWRProducts';
      formModel.entityName = 'WR_Products';
      formModel.funcID = 'WRS0103';
      formModel.userPermission = this.view?.formModel?.userPermission;
      opt.FormModel = formModel;

      this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
        if (res && res.length) {
          let m = res.find((x) => x.functionID == 'SYS03');

          this.cache
            .gridViewSetup(formModel.formName, formModel.gridViewName)
            .subscribe((grid) => {
              if (grid) {
                var obj = {
                  data: data,
                  title:
                    m?.defaultName +
                    ' ' +
                    this.gridViewSetup?.ProductID?.headerText?.toLowerCase(),
                  addProduct: true,
                  gridViewSetup: grid,
                  recID: data.recID,
                };
                var dialog = this.callFc.openForm(
                  PopupAddServicetagComponent,
                  '',
                  500,
                  450,
                  '',
                  obj,
                  '',
                  opt
                );
                dialog.closed.subscribe((ele) => {
                  if (ele && ele?.event) {
                    this.dataSelected = JSON.parse(JSON.stringify(ele?.event));
                    this.view.dataService
                      .update(this.dataSelected, true)
                      .subscribe();
                    this.detectorRef.detectChanges();
                  }
                });
              }
            });
        }
      });
    }
  }
  //#endregion

  getIcon($event) {
    return this.listRoles.find((x) => x.value == $event)?.icon ?? null;
  }

  //#region popover
  PopoverDetail(e, p: any, emp, field: string) {
    let parent = e.currentTarget.parentElement.offsetWidth;
    let child = e.currentTarget.offsetWidth;
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp[field] != null && emp[field]?.trim() != '') {
        if (parent <= child) {
          p.open();
        }
      }
    } else p.close();
    this.popupOld = p;
  }

  closePopover() {
    this.popupOld?.close();
  }
  //#endregion
}
