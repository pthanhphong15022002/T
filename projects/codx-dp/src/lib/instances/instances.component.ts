import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  UIComponent,
  ViewModel,
  ViewType,
  ApiHttpService,
  SidebarModel,
  CallFuncService,
  DialogRef,
  DialogData,
  DialogModel,
  FormModel,
  ResourceModel,
  RequestOption,
  Util,
  NotificationsService,
  DataRequest,
  AlertConfirmInputConfig,
  PageTitleService,
  LayoutService,
  CRUDService,
  AuthStore,
} from 'codx-core';
import { ES_SignFile } from 'projects/codx-es/src/lib/codx-es.model';
import { PopupAddSignFileComponent } from 'projects/codx-es/src/lib/sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxDpService } from '../codx-dp.service';
import { DP_Instances } from '../models/models';
import { InstanceDetailComponent } from './instance-detail/instance-detail.component';
import { PopupAddInstanceComponent } from './popup-add-instance/popup-add-instance.component';
import { PopupMoveReasonComponent } from './popup-move-reason/popup-move-reason.component';
import { PopupMoveStageComponent } from './popup-move-stage/popup-move-stage.component';
import { LayoutInstancesComponent } from '../layout-instances/layout-instances.component';
import { debug } from 'util';

@Component({
  selector: 'codx-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css'],
})
export class InstancesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  // @Input() process: any;
  @Input() isCreate: boolean = true;
  // @Input() tabInstances = [];
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('detailViewInstance') detailViewInstance: InstanceDetailComponent;
  @ViewChild('detailViewPopup') detailViewPopup: InstanceDetailComponent;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;

  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @Output() valueListID = new EventEmitter<any>();
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  views: Array<ViewModel> = [];

  showButtonAdd = true;
  button?: ButtonModel;
  dataSelected: any;
  dataReload :any
  //Setting load list
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Instances';
  className = 'InstancesBusiness';
  idField = 'recID';
  funcID = 'DPT04';
  method = 'GetListInstancesAsync';
  //end
  // data T
  hideMoreFC = false;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  dataObj: any;
  vllStatus = 'DP028';
  instanceID: string;
  dialog: any;
  moreFunc: any;
  moreFuncStart: any;
  instanceNo: string;
  listSteps = [];
  listStepInstances = [];
  stepNameCurrent: string;
  progress: string;
  formModel: FormModel;
  isMoveSuccess: boolean = true;
  titleAction = '';
  instances = new DP_Instances();
  kanban: any;
  listdetail: any;
  listStepsCbx: any;
  lstStepInstances = [];
  lstStepCbx = [];
  crrStepID: string;
  moreFuncInstance = [];
  dataColums = [];
  dataDrop: any;
  isClick: boolean = true;
  isUseSuccess: boolean = true;
  isUseFail: boolean = true;
  stepIdClick = '';
  listProccessCbx: any;
  sumDaySteps: number;
  sumHourSteps: number;
  lstParticipants = [];
  listParticipantReason = []; // for moveReason
  oldIdInstance: any;
  viewMode: any;
  viewModeDetail = 'S';
  totalInstance: number = 0;
  itemSelected: any;
  stepSuccess: any;
  stepFail: any;
  viewType = 'd';
  autoName: string = '';
  processID = '';
  //bien chuyen page
  process: any;
  tabInstances = [];
  instanceStepsId = [];
  haveDataService = false;
  listHeader = [];
  viewsCurrent = '';
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  grvSetup: any;
  dataValueFilterArr: any = [];
  filterInstancePredicates: string;

  filterStatusPredicates: string;
  filterOwnerPredicates: string;
  filterStepPredicates: string;

  arrFieldFilter = [];
  dataValueByStatusArr: any = [];
  dataValueByOwnerArr: any = [];
  dataValueByStepIDArr: any = [];
  fieldsResource = { text: 'stepName', value: 'recID' };
  stepsResource = [];
  user: any;
  isAdminRoles = false;
  listInstanceStep = [];
  reloadData = false ;
  constructor(
    private inject: Injector,
    private callFunc: CallFuncService,
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private pageTitle: PageTitleService,
    private layout: LayoutService,
    private layoutInstance: LayoutInstancesComponent,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.user = this.authStore.get();
    //thao tesst
    this.router.params.subscribe((param) => {
      this.funcID = param['funcID'];
      this.processID = param['processID'];
      //data từ service ném qua
      this.codxDpService.dataProcess.subscribe((res) => {
        if (res) this.haveDataService = true;
        else this.haveDataService = false;
        if (res && res.read) {
          this.loadData(res);
        }
      });
    });
    this.layout.setUrl('dp/dynamicprocess/DP0101');
    this.layout.setLogo(null);

    this.cache
      .gridViewSetup('DPInstances', 'grvDPInstances')
      .subscribe((grv) => {
        if (grv) {
          this.grvSetup = grv;
          this.vllStatus = grv['Status'].referedValue ?? this.vllStatus;
        }
      });
    this.cache.valueList('DP034').subscribe((res) => {
      if (res && res.datas) {
        var tabIns = [];
        res.datas.forEach((element) => {
          var tab = {};
          tab['viewModelDetail'] = element?.value;
          tab['textDefault'] = element?.text;
          tab['icon'] = element?.icon;
          tabIns.push(tab);
        });
        this.tabInstances = tabIns;
      }
    });

    this.cache.functionList(this.funcID).subscribe((f) => {
      // if (f) this.pageTitle.setSubTitle(f?.customName);
      this.cache.moreFunction(f.formName, f.gridViewName).subscribe((res) => {
        if (res && res.length > 0) {
          this.moreFuncInstance = res;
          this.moreFuncStart = this.moreFuncInstance.filter(
            (x) => x.functionID == 'DP21'
          )[0];
        }
      });
    });
  }
  ngAfterViewInit() {
    // if (!this.haveDataService) {
    //   let dataProcess = await firstValueFrom(
    //     this.codxDpService.getProcessByProcessID(this.processID)
    //   );
    //   if (dataProcess && dataProcess.read) {
    //     this.loadData(dataProcess);
    //     // this.continueLoad = true ;
    //   } else {
    //     this.codxService.navigate('', `dp/dynamicprocess/DP0101`);
    //   }
    // }
    this.views = [
      {
        type: ViewType.listdetail,
        active: false,
        sameData: true,
        toolbarTemplate: this.footerButton,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        toolbarTemplate: this.footerButton,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
          setColorHeader: true,
        },
      },
    ];

    this.view.dataService.methodDelete = 'DeletedInstanceAsync';
  }
  onInit() {
    this.button = {
      id: 'btnAdd',
    };

    this.dataObj = {
      processID: this.processID,
      haveDataService: this.haveDataService ? '1' : '0',
      showInstanceControl: this.process?.showInstanceControl
        ? this.process?.showInstanceControl
        : '2',
      hiddenInstanceReason: this.getListStatusInstance(
        this.isUseSuccess,
        this.isUseFail
      ),
    };

    if (this.haveDataService) this.getListCbxProccess(this.process?.applyFor);
    else {
      this.codxDpService
        .getProcessByProcessID(this.processID)
        .subscribe((ps) => {
          if (ps && ps.read) {
            this.loadData(ps);
            this.getListCbxProccess(ps?.applyFor);
          } else {
            this.codxService.navigate('', `dp/dynamicprocess/DP0101`);
          }
        });
    }

    this.codxDpService
      .createListInstancesStepsByProcess(this.processID)
      .subscribe((dt) => {
        if (dt && dt?.length > 0) {
          this.listSteps = dt;
          this.listStepsCbx = JSON.parse(JSON.stringify(this.listSteps));
          // this.getSumDurationDayOfSteps(this.listStepsCbx);
        }
      });
    //this.getPermissionProcess(this.processID);
    this.getAdminRoleDP();
    //kanban
    this.request = new ResourceModel();
    this.request.service = 'DP';
    this.request.assemblyName = 'DP';
    this.request.className = 'InstancesBusiness';
    this.request.method = 'GetListInstancesAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.titleAction = evt.text;
        this.add();
        break;
    }
  }
  getPropertyColumn() {
    let dataColumns =
      this.kanban?.columns?.map((column) => {
        return {
          recID: column['dataColums']?.recID,
          icon: column['dataColums']?.icon || null,
          iconColor: column['dataColums']?.iconColor || null,
          backgroundColor: column['dataColums']?.backgroundColor || null,
          textColor: column['dataColums']?.textColor || null,
        };
      }) || [];

    return dataColumns;
  }

  getAdminRoleDP() {
    if (!this.user.administrator) {
      this.codxDpService.getAdminRoleDP(this.user.userID).subscribe((res) => {
        this.isAdminRoles = res;
      });
    }
  }

  getPropertiesHeader(data, type) {
    if (this.listHeader?.length == 0) {
      this.listHeader = this.getPropertyColumn();
    }
    let find = this.listHeader?.find((item) => item.recID === data.keyField);
    return find ? find[type] : '';
  }

  //CRUD
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      const funcIDApplyFor =
        this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
      const applyFor = this.process.applyFor;
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.cache.functionList(funcIDApplyFor).subscribe((fun) => {
        this.cache
          .gridViewSetup(fun.formName, fun.gridViewName)
          .subscribe((grvSt) => {
            var formMD = new FormModel();
            formMD.funcID = funcIDApplyFor;
            formMD.entityName = fun.entityName;
            formMD.formName = fun.formName;
            formMD.gridViewName = fun.gridViewName;
            option.Width = '800px';
            option.zIndex = 1001;
            this.view.dataService.dataSelected.processID = this.process.recID;
            if (!this.process.instanceNoSetting) {
              this.codxDpService
                .genAutoNumber(this.funcID, 'DP_Instances', 'InstanceNo')
                .subscribe((res) => {
                  if (res) {
                    this.view.dataService.dataSelected.instanceNo = res;
                    this.openPopUpAdd(applyFor, formMD, option, 'add');
                  }
                });
            } else
              this.codxDpService
                .getAutoNumberByInstanceNoSetting(
                  this.process.instanceNoSetting
                )
                .subscribe((isNo) => {
                  if (isNo) {
                    this.view.dataService.dataSelected.instanceNo = isNo;
                    this.openPopUpAdd(applyFor, formMD, option, 'add');
                  }
                });
          });
      });
    });
  }
  copy(data, titleAction) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.oldIdInstance = data.recID;
    }
    this.view.dataService
      .copy(this.view.dataService.dataSelected)
      .subscribe((res) => {
        const funcIDApplyFor =
          this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
        const applyFor = this.process.applyFor;
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        this.cache.functionList(funcIDApplyFor).subscribe((fun) => {
          this.cache
            .gridViewSetup(fun.formName, fun.gridViewName)
            .subscribe((grvSt) => {
              this.codxDpService
                .GetStepsByInstanceIDAsync([data.recID, data.processID])
                .subscribe((res) => {
                  if (res && res?.length > 0) {
                    this.listStepInstances = JSON.parse(JSON.stringify(res));
                    var formMD = new FormModel();
                    formMD.funcID = funcIDApplyFor;
                    formMD.entityName = fun.entityName;
                    formMD.formName = fun.formName;
                    formMD.gridViewName = fun.gridViewName;
                    option.Width = '800px';
                    option.zIndex = 1001;
                    if (!this.process.instanceNoSetting) {
                      this.codxDpService
                        .genAutoNumber(
                          this.funcID,
                          'DP_Instances',
                          'InstanceNo'
                        )
                        .subscribe((res) => {
                          if (res) {
                            this.view.dataService.dataSelected.instanceNo = res;
                            this.openPopUpAdd(
                              applyFor,
                              formMD,
                              option,
                              titleAction
                            );
                          }
                        });
                    } else {
                      this.codxDpService
                        .getAutoNumberByInstanceNoSetting(
                          this.process.instanceNoSetting
                        )
                        .subscribe((isNo) => {
                          if (isNo) {
                            this.view.dataService.dataSelected.instanceNo =
                              isNo;
                            this.openPopUpAdd(
                              applyFor,
                              formMD,
                              option,
                              titleAction
                            );
                          }
                        });
                    }
                  }
                });
            });
        });
      });
  }
  openPopUpAdd(applyFor, formMD, option, action) {
    var endDate = new Date();
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      applyFor: applyFor,
      listSteps: 'add' ? this.listSteps : this.listStepInstances,
      titleAction: this.titleAction,
      formMD: formMD,
      endDate: this.HandleEndDate(this.listStepsCbx, action, null),
      lstParticipants: this.lstParticipants,
      oldIdInstance: this.oldIdInstance,
      autoName: this.autoName,
      isAdminRoles: this.isAdminRoles,
    };
    var dialogCustomField = this.callfc.openSide(
      PopupAddInstanceComponent,
      obj,
      option
    );
    dialogCustomField.closed.subscribe((e) => {
      if (e && e.event != null) {
        var data = e.event;
        if (this.kanban) {
          this.kanban.updateCard(data);
          if (this.kanban?.dataSource?.length == 1) {
            this.kanban.refresh();
          }
        }
        this.dataSelected = data;
        if(this.detailViewInstance){
          this.detailViewInstance.dataSelect = this.dataSelected;
          this.detailViewInstance.instance = this.dataSelected;
          this.detailViewInstance.listSteps = this.listStepInstances;
        }

        this.detectorRef.detectChanges();
      }
    });
  }

  edit(data, titleAction) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }

    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        const funcIDApplyFor =
          this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
        const applyFor = this.process.applyFor;
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        this.cache.functionList(funcIDApplyFor).subscribe((fun) => {
          // this.cache.gridView(fun.gridViewName).subscribe((grv) => {
          this.cache
            .gridViewSetup(fun.formName, fun.gridViewName)
            .subscribe((grvSt) => {
              this.codxDpService
                .GetStepsByInstanceIDAsync([data.recID, data.processID])
                .subscribe((res) => {
                  if (res && res?.length > 0) {
                    this.listStepInstances = JSON.parse(JSON.stringify(res));
                    var formMD = new FormModel();
                    formMD.funcID = funcIDApplyFor;
                    formMD.entityName = fun.entityName;
                    formMD.formName = fun.formName;
                    formMD.gridViewName = fun.gridViewName;

                    option.Width = '800px';
                    option.zIndex = 1001;
                    this.view.dataService.dataSelected.processID =
                      this.process.recID;
                    var obj = {
                      action: 'edit',
                      applyFor: applyFor,
                      listStep: this.listStepInstances,
                      titleAction: titleAction,
                      formMD: formMD,
                      endDate: this.HandleEndDate(
                        this.listStepsCbx,
                        'edit',
                        this.view.dataService?.dataSelected?.createdOn
                      ),
                      autoName: this.autoName,
                      lstParticipants: this.lstParticipants,
                    };
                    var dialogEditInstance = this.callfc.openSide(
                      PopupAddInstanceComponent,
                      obj,
                      option
                    );
                    dialogEditInstance.closed.subscribe((e) => {
                      if (e && e.event != null) {
                        //xu ly data đổ về
                        this.detectorRef.detectChanges();
                      }
                    });
                  }
                });
            });
        });
      });
  }

  //End

  //Event
  clickMF(e, data?) {
    this.dataSelected = data;
    this.titleAction = e.text;
    this.moreFunc = e.functionID;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data, e.text);
        break;
      case 'SYS04':
        this.copy(data, e.text);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'DP09':
        // listStep by Id Instacess is null
        this.moveStage(e.data, data, this.lstStepInstances);
        break;
      case 'DP02':
        this.moveReason(e.data, data, !this.isMoveSuccess);
        break;
      case 'DP10':
        this.moveReason(e.data, data, this.isMoveSuccess);
        break;
      //Đóng nhiệm vụ = true;
      case 'DP14':
        this.openOrClosed(data, true);
        break;
      //Mở nhiệm vụ = false;
      case 'DP15':
        this.openOrClosed(data, false);
        break;
      //export File
      case 'DP16':
        this.exportFile();
        break;
      //trinh kí File
      case 'DP17':
        this.approvalTrans('tes1', 'test2');
        break;
      case 'DP21':
        this.startInstance(data);
        break;
    }
  }

  startInstance(data) {
    this.codxDpService.startInstance(data.recID).subscribe((res) => {
      if (res) {
        this.listInstanceStep = res;
        data.status ='2'     
        data.startDate = res?.length > 0 ? res[0].startDate : null;
        this.dataSelected= data;
        this.reloadData = true
        this.view.dataService.update(this.dataSelected).subscribe();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
       
      }else  this.reloadData = false;
      this.detectorRef.detectChanges();
    });
  }

  openOrClosed(data, check) {
    this.notificationsService
      .alertCode('DP018', null, "'" + this.titleAction + "'")
      .subscribe((info) => {
        if (info.event.status == 'Y') {
          this.codxDpService
            .openOrClosedInstance(data.recID, check)
            .subscribe((res) => {
              if (res) {
                this.dataSelected.closed = check;
                this.notificationsService.notifyCode(check ? 'DP016' : 'DP017');
                if (this.process.showInstanceControl === '1') {
                  this.view.dataService.update(this.dataSelected).subscribe();
                }
                if (
                  this.process.showInstanceControl === '0' ||
                  this.process.showInstanceControl === '2'
                ) {
                  this.view.dataService.remove(this.dataSelected).subscribe();
                  this.dataSelected = this.view.dataService.data[0];
                  this.view.dataService.onAction.next({
                    type: 'delete',
                    data: data,
                  });
                }
                this.detectorRef.detectChanges();
              }
            });
        }
      });
  }

  beforeClosed(opt: RequestOption, check) {
    var itemSelected = opt.data[0];
    opt.methodName = 'OpenOrClosedInstanceAsync';
    opt.data = [itemSelected.recID, check];
    return true;
  }

  //#popup roles
  i = 0;
  changeDataMF(e, data) {
    if (e != null && data != null && data.status == '2') {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS003':
            if ((data.status != '1' && data.status != '2') || data.closed)
              res.disabled = true;
            break;
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          //more core - thay doi nhieu dong, bo chon, chon tat ca..
          case 'SYS005':
          case 'SYS007':
          case 'SYS006':
            res.disabled = true;
            break;
          //Chỉnh sửa, chuyển tiếp, thất bại, thành công
          case 'SYS103':
          case 'SYS03':
          case 'DP09':
            let isUpdate = data.write;
            if (
              !isUpdate ||
              (data.status !== '1' && data.status !== '2') ||
              data.closed
            )
              res.disabled = true;
            break;
          //Copy
          case 'SYS104':
          case 'SYS04':
            let isCopy = this.isCreate ? true : false;
            if (!isCopy || data.closed) res.disabled = true;
            break;
          //xóa
          case 'SYS102':
          case 'SYS02':
            let isDelete = data.delete;
            if (!isDelete || data.closed) res.disabled = true;
            break;
          //Đóng nhiệm vụ = true
          case 'DP14':
            if (data.closed) res.disabled = true;
            break;
          //Mở nhiệm vụ = false
          case 'DP15':
            if (!data.closed) res.disabled = true;
            break;
          case 'DP02':
            let isUpdateFail = data.write;
            if (
              !isUpdateFail ||
              (data.status !== '1' && data.status !== '2') ||
              data.closed ||
              !this.isUseFail
            ) {
              res.disabled = true;
            }

            break;
          case 'DP10':
            let isUpdateSuccess = data.write;
            if (
              !isUpdateSuccess ||
              (data.status !== '1' && data.status !== '2') ||
              data.closed ||
              !this.isUseSuccess
            ) {
              res.disabled = true;
            }
            break;
          case 'DP21':
            res.disabled = true;
            break;
        }
      });
    } else {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'DP09':
          case 'DP10':
          case 'DP02':
            res.disabled = true;
            break;
          default:
            res.isblur = true;
        }
      });
    }
  }
  //End

  convertHtmlAgency(buID: any, test: any, test2: any) {
    var desc = '<div class="d-flex">';
    if (buID)
      desc +=
        '<div class="d-flex align-items-center"><span class="text-gray-600 icon-14 icon-apartment me-1"></span><span>' +
        buID +
        '</span></div>' +
        '<div class="d-flex align-items-center"><span class="text-gray-600"></span><span>' +
        test +
        '</span></div>' +
        '<div class="d-flex justify-content-end"><span class="text-gray-600 icon-14 icon-apartment me-1"></span><span>' +
        test2 +
        '</span></div>';

    return desc + '</div>';
  }

  selectedChange(data: any) {
    this.dataSelected = data?.data ? data?.data : data;
    //formModel instances
    let formModel = new FormModel();
    formModel.formName = 'DPInstances';
    formModel.gridViewName = 'grvDPInstances';
    formModel.entityName = 'DP_Instances';
    this.formModel = formModel;
    this.detectorRef.detectChanges();
  }

  showInput(data) {}

  //begin code Thao
  dblClick(e, data) {}

  onActions(e) {
    switch (e.type) {
      case 'drop':
        this.dataDrop = e.data;
        this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
        // xử lý data chuyển công đoạn
        if (this.crrStepID != this.dataDrop.stepID)
          this.dropInstance(this.dataDrop);

        break;
      case 'drag':
        ///bắt data khi kéo
        this.crrStepID = e?.data?.stepID;

        break;
      case 'dbClick':
        //xư lý dbClick
        this.viewDetail(e.data);
        break;
    }
  }

  viewDetail(data) {
    this.dataSelected = data;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;
    this.viewType = 'p';
    let popup = this.callFunc.openForm(
      this.popDetail,
      '',
      Util.getViewPort().width,
      Util.getViewPort().height,
      '',
      null,
      '',
      option
    );
    popup.closed.subscribe((e) => {});
  }

  dropInstance(data) {
    data.stepID = this.crrStepID;
    if (this.moreFuncInstance?.length == 0) {
      this.changeDetectorRef.detectChanges();
      return;
    }
    if(data.status=="1"){
      this.notificationsService.notify(
        'Không thể chuyển tiếp giai đoạn khi chưa bắt đầu ! - Khanh thêm mess gấp để thay thế!',
        '2'
      );
      this.changeDetectorRef.detectChanges();
      return;
    }

    if (
      this.kanban &&
      this.kanban.columns?.length > 0 &&
      this.dataColums.length == 0
    )
      this.dataColums = this.kanban.columns;
    if (this.dataColums.length > 0) {
      var idx = this.dataColums.findIndex(
        (x) => x.dataColums.recID == this.stepIdClick
      );
      if (idx != -1) {
        var stepCrr = this.dataColums[idx].dataColums;
        if (!stepCrr?.isSuccessStep && !stepCrr?.isFailStep) {
          if (data.closed || !data.edit) {
            this.notificationsService.notify(
              'Không thể chuyển tiếp giai đoạn ! - Khanh thêm mess gấp để thay thế!',
              '2'
            );
            return;
          }
          idx = this.moreFuncInstance.findIndex((x) => x.functionID == 'DP09');
          if (idx != -1) {
            this.moveStage(this.moreFuncInstance[idx], data, this.listSteps);
          }
        } else {
          if (data.closed || !data.edit) {
            this.notificationsService.notify(
              'Không thể đánh dấu thành công / thất bại  ! - Khanh thêm mess gấp để thay thế!',
              '2'
            );
            return;
          }
          if (stepCrr?.isSuccessStep) {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'DP10'
            );
            if (idx != -1)
              this.moveReason(this.moreFuncInstance[idx], data, true);
          } else {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'DP02'
            );
            if (idx != -1)
              this.moveReason(this.moreFuncInstance[idx], data, false);
          }
        }
      }
      // else {
      //  // data.stepID = this.crrStepID;
      //   this.changeDetectorRef.detectChanges();
      // }
    }
  }

  changeView(e) {
    if (e?.view.type == 2) this.viewsCurrent = 'd-';
    if (e?.view.type == 6) {
      if (this.kanban) (this.view.currentView as any).kanban = this.kanban;
      else this.kanban = (this.view.currentView as any).kanban;
      this.viewsCurrent = 'k-';
    }
    this.changeDetectorRef.detectChanges();
  }
  // end code

  #region;
  moveStage(dataMore, data, listStepCbx) {
    if (!this.isClick) {
      return;
    }
    if (listStepCbx.length == 0 || listStepCbx == null) {
      listStepCbx = this.listSteps;
    }
    this.isClick = false;
    this.crrStepID = data.stepID;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      this.cache
        .gridViewSetup(fun.formName, fun.gridViewName)
        .subscribe((grvSt) => {
          var formMD = new FormModel();
          formMD.funcID = fun.functionID;
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          var stepReason = {
            isUseFail: this.isUseFail,
            isUseSuccess: this.isUseSuccess,
          };
          var obj = {
            stepName: this.getStepNameById(data.stepID),
            formModel: formMD,
            instance: data,
            listStepCbx: listStepCbx,
            stepIdClick: this.stepIdClick,
            stepReason: stepReason,
            headerTitle: dataMore.defaultName,
            listStepProccess: this.process.steps,
          };
          var dialogMoveStage = this.callfc.openForm(
            PopupMoveStageComponent,
            '',
            850,
            900,
            '',
            obj
          );
          dialogMoveStage.closed.subscribe((e) => {
            this.isClick = true;
            this.stepIdClick = '';
            if (!e || !e.event) {
              data.stepID = this.crrStepID;
              this.changeDetectorRef.detectChanges();
            }

            if (e && e.event != null) {
              //xu ly data đổ về
              data = e.event.instance;
              this.listStepInstances = e.event.listStep;
              if (e.event.isReason != null) {
                this.moveReason(null, data, e.event.isReason);
              }
              this.view.dataService.update(data).subscribe();
              if (this.kanban) this.kanban.updateCard(data);
              this.dataSelected = data;

              if (this.detailViewInstance) {
                this.detailViewInstance.dataSelect = this.dataSelected;
                this.detailViewInstance.instance = this.dataSelected;
                this.detailViewInstance.listSteps = this.listStepInstances;
              }

              this.detectorRef.detectChanges();
            }
          });
        });
      // });
    });
  }

  moveReason(dataMore, data: any, isMoveSuccess: Boolean) {
    this.crrStepID = data.stepID;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    var functionID = isMoveSuccess ? 'DPT0403' : 'DPT0404';
    this.cache.functionList(functionID).subscribe((fun) => {
      // this.cache.gridView(fun.gridViewName).subscribe((grv) => {
      this.cache
        .gridViewSetup(fun.formName, fun.gridViewName)
        .subscribe((grvSt) => {
          var newProccessIdReason = isMoveSuccess
            ? this.stepSuccess.newProcessID
            : this.stepFail.newProcessID;
          var isCheckExist = this.isExistNewProccessId(newProccessIdReason);
          if (isCheckExist) {
            this.codxDpService
              .getProcess(newProccessIdReason)
              .subscribe((res) => {
                if (res) {
                  if (res.permissions != null && res.permissions.length > 0) {
                    this.listParticipantReason = res.permissions.filter(
                      (x) => x.roleType === 'P'
                    );
                    this.openFormReason(
                      data,
                      fun,
                      isMoveSuccess,
                      dataMore,
                      this.listParticipantReason
                    );
                  }
                }
              });
          } else {
            this.openFormReason(data, fun, isMoveSuccess, dataMore, null);
          }
        });
      //  });
    });
  }

  autoMoveStage(dataInstance) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notificationsService
      .alert(
        'Chị khanh ơi thiết lập message code yesno cho em với',
        'Chị khanh ơi thiết lập message code yesno cho em với',
        config
      )
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          this.handleMoveStage(dataInstance);
        }
      });
  }
  handleMoveStage(dataInstance) {
    var isStopAuto = false;
    var strStepsId = [];
    var autoMoveStage = this.checkTransferControl(dataInstance.step.stepID);
    if (autoMoveStage.ischeck) {
      if (autoMoveStage.transferControl == 1) {
        var completedAllTask = this.completedAllTasks(
          dataInstance.step.stepID,
          dataInstance.listStep
        );
        isStopAuto = completedAllTask.isStopAuto;
        strStepsId = completedAllTask?.idxSteps;
      }
      if (isStopAuto) {
        return;
      } else {
        var instanceStepId = dataInstance.listStep.filter((x) =>
          strStepsId.some((y) => y == x.stepID)
        );
        for (let item of instanceStepId) {
          if (item.stepStatus == '0') {
            item.stepStatus = '1';
            item.actualStart = new Date();
          } else if (item.stepStatus == '1') {
            item.stepStatus = '3';
          }
        }
        dataInstance.instance.stepID = instanceStepId.find(
          (item) => item.stepStatus == '1'
        ).stepID;
        var processId = dataInstance.instance.processID;
        var data = [instanceStepId, processId];
        this.codxDpService.autoMoveStage(data).subscribe((res) => {
          if (res) {
            var stepsUpdate = dataInstance.listStep.map((item1) => {
              var item2 = instanceStepId.find(
                (item2) => item1.stepID === item2.stepID
              );
              if (item2) {
                return { ...item1, status: item2.status };
              }
            });
            this.listStepInstances = stepsUpdate;
            this.dataSelected = dataInstance.instance;
            this.view.dataService.update(this.dataSelected).subscribe();
            if (this.kanban) this.kanban.updateCard(this.dataSelected);

            if (this.detailViewInstance) {
              this.detailViewInstance.dataSelect = this.dataSelected;
              this.detailViewInstance.instance = this.dataSelected;
              this.detailViewInstance.listSteps = this.listStepInstances;
            }

            this.detectorRef.detectChanges();
          }
        });
      }
    }
  }

  completedAllTasks(stepID, listStep) {
    var isStopAuto = false;
    var index = listStep.findIndex((x) => x.stepID == stepID);
    var idxSteps = [];
    for (let i = index; i < listStep.length; i++) {
      if (this.checkTransferControl(listStep[i].stepID)) {
        var isCheckOnwer = listStep[i]?.owner ? false : true;
        var isCheckFields = this.checkFieldsIEmpty(listStep[i].fields);
      }
      if (isCheckFields || isCheckOnwer) {
        isStopAuto = true;
        break;
      }
      idxSteps.push(listStep[i].stepID);
      idxSteps.push(listStep[i + 1].stepID);
      if (listStep[i + 1].isSuccessStep || listStep[i + 1].isFailStep) {
        isStopAuto = true;
      }
      break;
    }
    var result = {
      isStopAuto: isStopAuto,
      idxSteps: idxSteps,
    };
    return result;
  }

  completedLastTasks() {}

  checkFieldsIEmpty(fields) {
    return fields.includes((x) => !x.dataValue && x.isRequired);
  }

  checkTransferControl(stepID) {
    var listStep = this.process.steps.filter(
      (x) => !x.isSuccessStep && !x.isFailStep
    );
    var stepCurrent = listStep.find((x) => x.recID == stepID);
    var ischeck = false;
    if (stepCurrent) {
      var transferControl = stepCurrent?.transferControl;
      if (transferControl != 0) {
        ischeck = true;
      }
    }
    return { ischeck: ischeck, transferControl: transferControl };
  }

  openFormReason(data, fun, isMoveSuccess, dataMore, listParticipantReason) {
    // this.codxDpService.get
    var formMD = new FormModel();
    formMD.funcID = fun.functionID;
    formMD.entityName = fun.entityName;
    formMD.formName = fun.formName;
    formMD.gridViewName = fun.gridViewName;
    let reason = isMoveSuccess ? this.stepSuccess : this.stepFail;
    var obj = {
      dataMore: dataMore,
      headerTitle: fun.defaultName,
      stepName: this.getStepNameById(data.stepID),
      formModel: formMD,
      isReason: isMoveSuccess,
      instance: data,
      objReason: reason,
      listProccessCbx: this.listProccessCbx,
      listParticipantReason: listParticipantReason,
    };

    var dialogRevision = this.callfc.openForm(
      PopupMoveReasonComponent,
      '',
      800,
      600,
      '',
      obj
    );
    dialogRevision.closed.subscribe((e) => {
      if (!e || !e.event) {
        data.stepID = this.crrStepID;
        this.changeDetectorRef.detectChanges();
      }
      if (e && e.event != null) {
        //xu ly data đổ về
        data = e.event.instance;
        this.listStepInstances = e.event.listStep;
        if (data.refID !== this.guidEmpty) {
          this.valueListID.emit(data.refID);
        }
        if (e.event.isReason != null) {
          this.moveReason(null, data, e.event.isReason);
        }
        this.view.dataService.update(data).subscribe();
        if (this.kanban) this.kanban.updateCard(data);
        this.dataSelected = data;

        if (this.detailViewInstance) {
          this.detailViewInstance.dataSelect = this.dataSelected;
          this.detailViewInstance.instance = this.dataSelected;
          this.detailViewInstance.listSteps = this.listStepInstances;
        }

        this.detectorRef.detectChanges();
      }
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
    this.changeDetectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedInstanceAsync';
    opt.data = [itemSelected.recID];
    return true;
  }

  getStepNameById(stepId: string): string {
    return this.listSteps
      .filter((x) => x.stepID === stepId)
      .map((x) => x.stepName)[0];
  }
  clickMoreFunc(e) {
    this.lstStepInstances = e.lstStepCbx;
    this.clickMF(e.e, e.data);
  }
  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }
  getListCbxProccess(applyFor: any) {
    this.cache.valueList('DP031').subscribe((data) => {
      this.codxDpService.getlistCbxProccess(applyFor).subscribe((res) => {
        this.listProccessCbx = res[0];
        var obj = {
          recID: this.guidEmpty,
          processName: data.datas[0].default,
        };
        this.listProccessCbx.unshift(obj);
        this.listProccessCbx = this.listProccessCbx.filter(
          (x) => x !== this.process?.recID
        );
      });
    });
  }
  isExistNewProccessId(newProccessId) {
    return this.listProccessCbx.some(
      (x) => x.recID == newProccessId && x.recID != this.guidEmpty
    );
  }

  // getSumDurationDayOfSteps(listStepCbx: any) {
  //   let totalDay = listStepCbx
  //     .filter((x) => !x.isSuccessStep && !x.isFailStep)
  //     .reduce(
  //       (sum, f) =>
  //         sum +
  //         f?.durationDay +
  //         f?.durationHour +
  //         this.setTimeHoliday(f?.excludeDayoff),
  //       0
  //     );
  //   return totalDay;
  // }
  // getSumDurationHourOfSteps(listStepCbx: any) {
  //   let totalHour = listStepCbx
  //     .filter((x) => !x.isSuccessStep && !x.isFailStep)
  //     .reduce((sum, f) => sum + f?.durationHour, 0);
  //   return totalHour;
  // }
  // setTimeHoliday(dayOffs: string): number {
  //   let listDays = dayOffs.split(';');
  //   return listDays.length;
  // }

  getListStatusInstance(isSuccess: boolean, isFail: boolean) {
    if (!isSuccess && !isFail) {
      return '1;2';
    } else if (!isSuccess) {
      return '3;4';
    } else if (!isFail) {
      return '5;6';
    }
    return '';
  }

  HandleEndDate(listSteps: any, action: string, endDateValue: any) {
    var dateNow =
      action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
    var endDate =
      action == 'add' || action == 'copy' ? new Date() : new Date(endDateValue);
    for (let i = 0; i < listSteps.length; i++) {
      endDate.setDate(endDate.getDate() + listSteps[i].durationDay);
      endDate.setHours(endDate.getHours() + listSteps[i].durationHour);
      endDate = this.setTimeHoliday(
        dateNow,
        endDate,
        listSteps[i]?.excludeDayoff
      );
      dateNow = endDate;
    }
    return endDate;
  }

  setTimeHoliday(startDay: Date, endDay: Date, dayOff: string) {
    if (!dayOff || (dayOff && (dayOff.includes('7') || dayOff.includes('8')))) {
      const isSaturday = dayOff.includes('7');
      const isSunday = dayOff.includes('8');
      let day = 0;

      for (
        let currentDate = new Date(startDay);
        currentDate <= endDay;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        if (currentDate.getDay() === 6 && isSaturday) {
          ++day;
        }
        if (currentDate.getDay() === 0 && isSunday) {
          ++day;
        }
      }
      endDay.setDate(endDay.getDate() + day);
      if (endDay.getDay() === 6 && isSaturday) {
        endDay.setDate(endDay.getDate() + 1);
      }
      endDay.setDate(endDay.getDate() + day);
      if (endDay.getDay() === 0 && isSunday) {
        endDay.setDate(endDay.getDate() + 1);
      }
    }
    return endDay;
  }

  #endregion;

  //Export file
  exportFile() {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //
    this.callfc.openForm(
      CodxExportComponent,
      null,
      null,
      800,
      '',
      [gridModel, this.dataSelected.recID],
      null
    );
  }
  //Xét duyệt
  approvalTrans(processID: any, datas: any) {
    // this.api
    //   .execSv(
    //     'ES',
    //     'ES',
    //     'ApprovalTransBusiness',
    //     'GetCategoryByProcessIDAsync',
    //     processID
    //   )
    //   .subscribe((res2: any) => {
    // let dialogModel = new DialogModel();
    // dialogModel.IsFull = true;
    // dialogModel.zIndex=1010 ;
    //trình ký
    //  if (res2?.eSign == true) {
    //let signFile = new ES_SignFile();
    // signFile.recID = datas.recID;
    //  signFile.title = datas.title;
    // signFile.categoryID = res2?.categoryID;
    //signFile.refId = datas.recID;
    // signFile.refDate = datas.refDate;
    //signFile.refNo = datas.refNo;
    //signFile.priority = datas.urgency;
    // signFile.refType = this.formModel?.entityName;
    //signFile.files = [];
    // if (this.data?.files) {
    //   for (var i = 0; i < this.data?.files.length; i++) {
    //     var file = new File();
    //     file.fileID = this.data?.files[i].recID;
    //     file.fileName = this.data?.files[i].fileName;
    //     file.eSign = true;
    //     signFile.files.push(file);
    //   }
    // }
    // let dialogApprove = this.callfc.openForm(
    //   PopupAddSignFileComponent,
    //   'Chỉnh sửa',
    //   700,
    //   650,
    //   '',
    //   {
    //     oSignFile: signFile,
    //     // files: this.data?.files,
    //     //  cbxCategory: this.gridViewSetup['CategoryID']?.referedValue,
    //     disableCateID: true,
    //     formModel: this.view?.currentView?.formModel,
    //   },
    //   '',
    //   dialogModel
    // );
    // dialogApprove.closed.subscribe((res) => {
    //   if (res.event && res.event?.approved == true) {
    //   }
    // });
    //this.callfunc.openForm();
    // } else if (res2?.eSign == false) {
    // }
    //xét duyệt
    // });
  }
  //load điều kiện
  loadData(ps) {
    this.process = ps;
    this.layoutInstance.viewNameProcess(ps.processName);
    this.stepsResource = this.process?.steps?.map((x) => {
      let obj = {
        icon: x?.icon,
        color: x?.iconColor,
        text: x.stepName,
        value: x.recID,
      };
      return obj;
    });
    this.isCreate = this.process.create;
    this.autoName = this.process?.autoName;
    this.stepSuccess = this.process?.steps?.filter((x) => x.isSuccessStep)[0];
    this.stepFail = this.process?.steps?.filter((x) => x.isFailStep)[0];
    this.isUseSuccess = this.stepSuccess?.isUsed;
    this.isUseFail = this.stepFail?.isUsed;
    this.showButtonAdd = this.isCreate;

    this.viewMode = this.process?.viewMode ?? 6;
    this.viewModeDetail = this.process?.viewModeDetail ?? 'S';

    if (
      this.process?.permissions != null &&
      this.process?.permissions.length > 0
    ) {
      this.lstParticipants = this.process?.permissions.filter(
        (x) => x.roleType === 'P'
      );
    }
  }
  //filter- tam
  valueChangeFilter(e) {
    this.dataSelected = null;
    switch (e.field) {
      case 'Status':
        this.dataValueByStatusArr = e.data;
        break;
      case 'StepID':
        this.dataValueByStepIDArr = e.data;
        break;
      case 'Owner':
        this.dataValueByOwnerArr = e.data;
        break;
    }
    let idxField = this.arrFieldFilter.findIndex((x) => x == e.field);
    if (e.data?.length > 0) {
      if (idxField == -1) this.arrFieldFilter.push(e.field);
    } else {
      if (idxField != -1) this.arrFieldFilter.splice(idxField, 1);
    }

    this.loadDataFiler();
  }

  updatePredicate(field, dataValueFiler) {
    let predicates = '';
    let predicate = field + '=@';
    let toltalData = this.dataValueFilterArr?.length;
    if (dataValueFiler.length > 1) {
      for (var i = 0; i < dataValueFiler.length - 1; i++) {
        predicates += predicate + (i + toltalData) + 'or ';
      }
      predicates += predicate + (dataValueFiler.length + toltalData);
    } else predicates = predicate + toltalData;

    if (this.arrFieldFilter.length > 0) {
      let idx = this.arrFieldFilter.findIndex((x) => x == field);
      if (idx == 0) {
        this.filterInstancePredicates = '( ' + predicates + ' )';
        this.dataValueFilterArr = dataValueFiler;
      } else if (idx > 0) {
        this.filterInstancePredicates += ' and ( ' + predicates + ' )';
        this.dataValueFilterArr =
          this.dataValueFilterArr.concat(dataValueFiler);
      }
    } else {
      this.filterInstancePredicates = '';
      this.dataValueFilterArr = [];
    }
  }

  //loading Data filter
  loadDataFiler() {
    this.filterInstancePredicates = '';
    this.dataValueFilterArr = [];
    if (this.arrFieldFilter.length > 0) {
      this.arrFieldFilter.forEach((field) => {
        switch (field) {
          case 'Status':
            this.updatePredicate(field, this.dataValueByStatusArr);
            break;
          case 'StepID':
            this.updatePredicate(field, this.dataValueByStepIDArr);
            break;
          case 'Owner':
            this.updatePredicate(field, this.dataValueByOwnerArr);
            break;
        }
      });
    }
    if (this.filterInstancePredicates)
      this.filterInstancePredicates =
        '( ' + this.filterInstancePredicates + ' )';
    (this.view.dataService as CRUDService)
      .setPredicates(
        [this.filterInstancePredicates],
        [this.dataValueFilterArr.join(';')]
      )
      .subscribe();

    //kanaban chua loc dc
    // if (this.kanban) {
    //   let filter = {
    //     predicate: this.filterInstancePredicates,
    //     dataValue: this.filterByStatusArr.join(';'),
    //   };
    //   this.dataObj = Object.assign({}, this.dataObj, filter);
    //   this.view.currentView['kanban'].refresh();
    // }
  }
  clickStartInstances(e) {
    //goij ham start ma dang sai
    if (e) this.startInstance(this.dataSelected);
  }
}
