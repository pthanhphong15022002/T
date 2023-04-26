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
import { DP_Instances, DP_Instances_Steps_Reasons } from '../models/models';
import { InstanceDetailComponent } from './instance-detail/instance-detail.component';
import { PopupAddInstanceComponent } from './popup-add-instance/popup-add-instance.component';
import { PopupMoveReasonComponent } from './popup-move-reason/popup-move-reason.component';
import { PopupMoveStageComponent } from './popup-move-stage/popup-move-stage.component';
import { LayoutInstancesComponent } from '../layout-instances/layout-instances.component';
import { LayoutComponent } from '../_layout/layout.component';
import { Observable, finalize, map, filter } from 'rxjs';

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
  @ViewChild('footerButton') footerButton?: TemplateRef<any>;
  @ViewChild('popupTemplate') popupTemplate!: TemplateRef<any>;
  @ViewChild('emptyTemplate') emptyTemplate!: TemplateRef<any>;

  @Output() valueListID = new EventEmitter<any>();
  @Output() listReasonBySteps = new EventEmitter<any>();

  views: Array<ViewModel> = [];
  showButtonAdd = true;
  button?: ButtonModel;
  dataSelected: any;
  dataReload: any;
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
  lstOrg = [];
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
  reloadData = false;
  popup: DialogRef;
  reasonStepsObject: any;
  addFieldsControl = '1';
  isLockButton = false;
  esCategory: any;
  colorReasonSuccess: any;
  colorReasonFail: any;
  ownerStepProcess: any;

  isHaveFile: boolean = false;
  //test temp
  dataTemplet = [
    {
      templateName: 'File excel của Khanh- Team bá cháy',
      recID: '1',
    },
    {
      templateName: 'Khanh múa rất đẹp,sập sân khấu',
      recID: '2',
    },
    {
      templateName: 'Khanh pig bá đạo',
      recID: '3',
    },
  ];
  type = 'excel';
  requestTemp = new DataRequest();
  optionEx = new DataRequest();
  optionWord = new DataRequest();
  services = 'DP';
  idFieldTemp = 'RecID';
  serviceTemp: string = 'SYS';
  assemblyNameTemp: string = 'AD';
  classNameTemp: string = 'ExcelTemplatesBusiness';
  methodTemp: string = 'GetByEntityAsync';
  //submitted = false;
  // moreFunction = [
  //   {
  //     id: 'edit',
  //     icon: 'icon-edit',
  //     text: 'Chỉnh sửa',
  //     textColor: '#307CD2',
  //   },
  //   {
  //     id: 'delete',
  //     icon: 'icon-delete',
  //     text: 'Xóa',
  //     textColor: '#F54E60',
  //   },
  // ];
  dataEx = [];
  dataWord = [];

  dialogTemplate: DialogRef;
  isFormExport = true;
  stepInstanceDetailStage: any;
  listOwnerInMove = [];
  listStageManagerInMove = [];
  idTemp = '';
  nameTemp = '';
  constructor(
    private inject: Injector,
    private callFunc: CallFuncService,
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private pageTitle: PageTitleService,
    private layout: LayoutService,
    // private layoutInstance: LayoutInstancesComponent,
    private layoutDP: LayoutComponent,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.user = this.authStore.get();
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
    this.getColorReason();
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
          if (ps && ps.read && !ps.isDelete) {
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
        if (this.addFieldsControl == '2') {
          let customName = fun.customName || fun.description;
          if (this.autoName) customName = this.autoName;
          this.titleAction =
            this.titleAction +
            ' ' +
            customName.charAt(0).toLocaleLowerCase() +
            customName.slice(1);
        }
        this.cache
          .gridViewSetup(fun.formName, fun.gridViewName)
          .subscribe((grvSt) => {
            var formMD = new FormModel();
            formMD.funcID = funcIDApplyFor;
            formMD.entityName = fun.entityName;
            formMD.formName = fun.formName;
            formMD.gridViewName = fun.gridViewName;
            option.Width = this.addFieldsControl == '1' ? '800px' : '550px';
            option.zIndex = 1001;
            this.view.dataService.dataSelected.processID = this.process.recID;
            if (!this.process.instanceNoSetting) {
              this.codxDpService
                .genAutoNumber(this.funcID, 'DP_Instances', 'InstanceNo')
                .subscribe((res) => {
                  if (res) {
                    this.view.dataService.dataSelected.instanceNo = res;
                    this.openPopUpAdd(
                      applyFor,
                      formMD,
                      option,
                      'add',
                      this.listSteps
                    );
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
                    this.openPopUpAdd(
                      applyFor,
                      formMD,
                      option,
                      'add',
                      this.listSteps
                    );
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
    this.view.dataService.copy().subscribe((res) => {
      const funcIDApplyFor =
        this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
      const applyFor = this.process.applyFor;
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.cache.functionList(funcIDApplyFor).subscribe((fun) => {
        if (this.addFieldsControl == '2') {
          let customName = fun.customName || fun.description;
          if (this.autoName) customName = this.autoName;
          this.titleAction =
            this.titleAction +
            ' ' +
            customName.charAt(0).toLocaleLowerCase() +
            customName.slice(1);
        }
        this.cache
          .gridViewSetup(fun.formName, fun.gridViewName)
          .subscribe((grvSt) => {
            if (res) {
              this.listStepInstances = JSON.parse(JSON.stringify(res));
              var formMD = new FormModel();
              formMD.funcID = funcIDApplyFor;
              formMD.entityName = fun.entityName;
              formMD.formName = fun.formName;
              formMD.gridViewName = fun.gridViewName;
              option.Width = this.addFieldsControl == '1' ? '800px' : '550px';
              option.zIndex = 1001;
              let data = [this.oldIdInstance, this.process.recID];
              this.codxDpService
                .getInstanceStepsCopy(data)
                .subscribe((instanceSteps) => {
                  if (instanceSteps) {
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
                              'copy',
                              instanceSteps
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
                              'copy',
                              instanceSteps
                            );
                          }
                        });
                    }
                  }
                });
            }
          });
      });
    });
  }
  openPopUpAdd(applyFor, formMD, option, action, listSteps) {
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      applyFor: applyFor,
      listSteps: JSON.parse(JSON.stringify(listSteps)),
      titleAction: this.titleAction,
      formMD: formMD,
      endDate: this.HandleEndDate(this.listStepsCbx, action, null),
      lstParticipants: this.lstOrg,
      oldIdInstance: this.oldIdInstance,
      autoName: this.autoName,
      isAdminRoles: this.isAdminRoles,
      addFieldsControl: this.addFieldsControl,
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
          // this.kanban.updateCard(data);  //core mới lỗi chô này
          if (this.kanban?.dataSource?.length == 1) {
            this.kanban.refresh();
          }
        }
        this.dataSelected = data;
        if (this.detailViewInstance) {
          this.detailViewInstance.dataSelect = this.dataSelected;
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
          if (this.addFieldsControl == '2') {
            let customName = fun.customName || fun.description;
            if (this.autoName) customName = this.autoName;
            titleAction =
              titleAction +
              ' ' +
              customName.charAt(0).toLocaleLowerCase() +
              customName.slice(1);
          }
          this.cache
            .gridViewSetup(fun.formName, fun.gridViewName)
            .subscribe((grvSt) => {
              this.codxDpService
                .GetStepsByInstanceIDAsync([
                  data.recID,
                  data.processID,
                  data.status,
                ])
                .subscribe((res) => {
                  if (res && res?.length > 0) {
                    this.listStepInstances = JSON.parse(JSON.stringify(res));
                    var formMD = new FormModel();
                    formMD.funcID = funcIDApplyFor;
                    formMD.entityName = fun.entityName;
                    formMD.formName = fun.formName;
                    formMD.gridViewName = fun.gridViewName;
                    option.Width =
                      this.addFieldsControl == '1' ? '800px' : '550px';
                    option.zIndex = 1001;
                    this.view.dataService.dataSelected.processID =
                      this.process.recID;
                    var obj = {
                      action: 'edit',
                      applyFor: applyFor,
                      listSteps: this.listStepInstances,
                      titleAction: titleAction,
                      formMD: formMD,
                      endDate: this.HandleEndDate(
                        this.listStepsCbx,
                        'edit',
                        this.view.dataService?.dataSelected?.createdOn
                      ),
                      autoName: this.autoName,
                      lstParticipants: this.lstOrg,
                      addFieldsControl: this.addFieldsControl,
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

  handelStartDay(data) {
    this.notificationsService
      .alertCode('DP033', null, ['"' + data?.title + '"' || ''])
      .subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.startInstance(data);
        }
      });
  }

  startInstance(data) {
    this.codxDpService.startInstance(data.recID).subscribe((res) => {
      if (res) {
        this.listInstanceStep = res;
        data.status = '2';
        data.startDate = res?.length > 0 ? res[0].startDate : null;
        this.dataSelected = data;
        this.reloadData = true;
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected).subscribe();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
      } else this.reloadData = false;
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

  //#Event
  changeDataMF(e, data) {
    if (e != null && data != null) {
      if (data.status != '1') {
        e.forEach((res) => {
          switch (res.functionID) {
            case 'SYS003':
              if (data.status != '2' || data.closed) res.disabled = true;
              break;
            // case 'SYS004':
            // case 'SYS001':
            // case 'SYS002':
            // //more core - thay doi nhieu dong, bo chon, chon tat ca..
            // case 'SYS005':
            // case 'SYS007':
            // case 'SYS006':
            //   res.disabled = true;
            //   break;
            //Chỉnh sửa, chuyển tiếp, thất bại, thành công
            case 'SYS103':
            case 'SYS03':
              let isUpdate = data.write;
              if (!isUpdate || data.status != '2' || data.closed)
                res.disabled = true;
              break;
            case 'DP09':
              if (this.checkMoreReason(data, null)) {
                res.disabled = true;
              }
              break;
            //Copy
            case 'SYS104':
            case 'SYS04':
              let isCopy = this.isCreate ? true : false;
              if (!isCopy || data.closed || data.status != '2')
                res.disabled = true;
              break;
            //xóa
            case 'SYS102':
            case 'SYS02':
              let isDelete = data.delete;
              if (!isDelete || data.closed || data.status != '2')
                res.disabled = true;
              break;
            //Đóng nhiệm vụ = true
            case 'DP14':
              if (data.closed || !data.permissionCloseInstances)
                res.disabled = true;
              break;
            //Mở nhiệm vụ = false
            case 'DP15':
              if (!data.closed || !data.permissionCloseInstances) {
                res.disabled = true;
              }
              break;
            case 'DP02':
              if (this.checkMoreReason(data, !this.isUseFail)) {
                res.disabled = true;
              }
              break;
            case 'DP10':
              if (this.checkMoreReason(data, !this.isUseSuccess)) {
                res.disabled = true;
              }
              break;
            //an khi aprover rule
            case 'DP17':
              if (!this.process?.approveRule) {
                res.isblur = true;
              }
              break;
            case 'SYS004':
            case 'SYS002':
            case 'DP21':
              res.disabled = true;
              break;
          }
        });
      } else {
        e.forEach((mf) => {
          switch (mf.functionID) {
            case 'DP21':
              if (!data.permissionCloseInstances) {
                mf.disabled = true;
              }
              break;
            case 'DP09':
            case 'DP10':
            case 'SYS004':
            case 'SYS002':
            case 'DP02':
              mf.disabled = true;
              break;
            default:
              mf.isblur = true;
          }
        });
      }
    }
  }

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
        this.isFormExport = true;
        this.showFormExport();
        break;
      //trinh kí File
      case 'DP17':
        this.isFormExport = false;
        this.showFormSubmit();
        break;
      case 'DP21':
        this.handelStartDay(data);
        break;
      //xuat khau du lieu
      case 'SYS002':
        this.exportFile();
        break;
    }
  }
  //End
  checkMoreReason(data, isUseReason) {
    if (data.status != '2' || isUseReason) {
      return true;
    }
    if (!data.permissionMoveInstances) {
      return true;
    }
    return false;
  }

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

  checkOwnerRoleProcess(roles) {
    if (roles != null && roles.length > 0) {
      var checkOwner = roles.find((x) => x.roleType == 'S');

      return checkOwner != null ? checkOwner.objectID : null;
    } else {
      return null;
    }
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
    this.popup = this.callFunc.openForm(
      this.popDetail,
      '',
      Util.getViewPort().width,
      Util.getViewPort().height,
      '',
      null,
      '',
      option
    );
    this.popup.closed.subscribe((e) => {});
  }

  dropInstance(data) {
    data.stepID = this.crrStepID;
    if (this.moreFuncInstance?.length == 0) {
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status == '1') {
      this.notificationsService.notify('DP037');
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status != '1' && data.status != '2') {
      this.notificationsService.notify('DP038');
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
            lstParticipants: this.lstOrg,
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
    var checkTransferControl = this.process.steps.find(
      (x) => x.recID === dataInstance.step.stepID
    ).transferControl;

    if (!this.isCheckAutoMoveStage(checkTransferControl, dataInstance.isAuto)) {
      this.openFormForAutoMove(dataInstance);
    } else {
      this.handleMoveStage(dataInstance);
    }
  }
  isCheckAutoMoveStage(checkTransferControl: any, isAuto) {
    if (
      checkTransferControl == '1' &&
      isAuto.isShowFromTaskAll &&
      isAuto.isContinueTaskAll
    ) {
      return true;
    } else if (
      checkTransferControl == '2' &&
      isAuto.isContinueTaskEnd &&
      isAuto.isShowFromTaskEnd
    ) {
      return true;
    } else {
      return false;
    }
  }

  handleMoveStage(dataInstance) {
    var isStopAuto = false;
    var strStepsId = [];
    var completedAllTask = this.completedAllTasks(
      dataInstance.step.stepID,
      dataInstance.listStep
    );
    strStepsId = completedAllTask?.idxSteps;
    isStopAuto = completedAllTask.isStopAuto;
    if (isStopAuto) {
      this.openFormForAutoMove(dataInstance);
    }
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notificationsService.alertCode('DP034', config).subscribe((x) => {
      if (x.event?.status == 'Y') {
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
              this.detailViewInstance.listSteps = this.listStepInstances;
            }
            this.detectorRef.detectChanges();
          }
        });
      }
    });
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

  openFormForAutoMove(dataInstance) {
    var idx = this.moreFuncInstance.findIndex((x) => x.functionID == 'DP09');
    if (idx != -1) {
      this.moveStage(
        this.moreFuncInstance[idx],
        dataInstance.instance,
        dataInstance.listStep
      );
    }
  }

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
      listParticipantReason: this.lstOrg,
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

    this.loadDataFilter();
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
  loadDataFilter() {
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
    if (e) this.startInstance(this.dataSelected);
  }
  //load DATA
  async loadData(ps) {
    this.process = ps;
    this.loadEx();
    this.loadWord();
    this.addFieldsControl = ps?.addFieldsControl;
    // this.layoutInstance.viewNameProcess(ps);
    this.layoutDP.viewNameProcess(ps);
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
    this.reasonStepsObject = {
      stepReasonSuccess: this.stepSuccess.reasons,
      stepReasonFail: this.stepFail.reasons,
    };
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
      if (this.lstParticipants != null && this.lstParticipants.length > 0) {
        this.lstOrg = await this.codxDpService.getListUserByOrg(
          this.lstParticipants
        );
      }
    }
    this.codxDpService
      .updateHistoryViewProcessesAsync(this.process.recID)
      .subscribe();
  }
  saveDatasInstance(e) {
    this.dataSelected.datas = e;
    this.view.dataService.update(this.dataSelected).subscribe();
    if (this.kanban) {
      this.kanban.updateCard(this.dataSelected);
    }
  }
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

  showFormExport() {
    this.isLockButton = true;
    let option = new DialogModel();
    option.zIndex = 1001;
    this.dialogTemplate = this.callfc.openForm(
      this.popupTemplate,
      '',
      600,
      500,
      '',
      null,
      '',
      option
    );
  }

  exportFileDynamic() {
    //data test
    // let datas = [
    //   {
    //     dai_dien: 'Trần Đoàn Tuyết Khanh',
    //     ten_cong_ty: 'Tập đoàn may mặc Khanh Pig',
    //     dia_chi: '06 Lê Lợi, Huế',
    //     ma_so_thue: '1111111111111',
    //     hinh_thuc_thanh_toan: 'Chuyển khoản',
    //     tai_khoan: 'VCB-012024554565',
    //     san_pham: 'Sản phẩm quần què',
    //     dien_tich: '0',
    //     so_luong: 1,
    //     don_gia: 100000,

    //     // datas: [
    //     //   {
    //     //     dai_dien: 'Trần Đoàn Tuyết Khanh',
    //     //     ten_cong_ty: 'Tập đoàn may mặc Khanh Pig',
    //     //     dia_chi: '06 Lê Lợi, Huế',
    //     //     ma_so_thue: '1111111111111',
    //     //     hinh_thuc_thanh_toan: 'Chuyển khoản',
    //     //     tai_khoan: 'VCB-012024554565',
    //     //     san_pham: 'Sản phẩm quần què',
    //     //     dien_tich: '0',
    //     //     so_luong: 1,
    //     //     don_gia: 100000,
    //     //   },
    //     //   {
    //     //     san_pham: 'Sản phẩm 1',
    //     //     dien_tich: '0',
    //     //     so_luong: 10,
    //     //     don_gia: 5000,
    //     //   },
    //     // ],
    //   },
    // ];
    // let id = 'c4ab1735-d460-11ed-94a4-00155d035517';
    // this.dataSelected.datas = JSON.stringify(datas);
    if (!this.dataSelected.datas) return;

    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.Core',
        'CMBusiness',
        'ExportExcelDataAsync',
        [this.dataSelected.datas, this.idTemp]
      )
      .subscribe((res) => {
        if (res) {
          this.downloadFile(res);
        }
      });
  }

  downloadFile(data: any) {
    var sampleArr = this.base64ToArrayBuffer(data[0]);
    this.saveByteArray(
      'DP_Instances_' + this.dataSelected.title + '_' + this.nameTemp ||
        'excel',
      sampleArr
    );
  }

  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
  }
  loadEx() {
    this.requestTemp.predicates = 'RefID=@0 && RefType=@1';
    this.requestTemp.dataValues = this.process.recID + ';DP_Processes';
    this.requestTemp.entityName = 'AD_ExcelTemplates';
    this.classNameTemp = 'ExcelTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataEx = item;
    });
  }
  loadWord() {
    this.requestTemp.predicates = 'RefID=@0 && RefType=@1';
    this.requestTemp.dataValues = this.process.recID + ';DP_Processes';
    this.requestTemp.entityName = 'AD_WordTemplates';
    this.classNameTemp = 'WordTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataWord = item;
    });
  }
  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTemp,
        this.assemblyNameTemp,
        this.classNameTemp,
        this.methodTemp,
        this.requestTemp
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response[0];
        })
      );
  }
  //end export

  //Xét duyệt
  selectTemp(recID, nameTemp) {
    if (recID) {
      this.isLockButton = false;
      this.idTemp = recID;
      this.nameTemp = nameTemp;
    } else this.isLockButton = true;
  }

  showFormSubmit() {
    this.codxDpService
      .getESCategoryByCategoryID(this.process.processNo)
      .subscribe((item: any) => {
        if (item) {
          this.esCategory = item;
          this.codxDpService
            .checkApprovalStep(item.recID)
            .subscribe((check) => {
              if (check) {
                this.isLockButton = true;
                let option = new DialogModel();
                option.zIndex = 1001;
                this.dialogTemplate = this.callfc.openForm(
                  this.popupTemplate,
                  '',
                  600,
                  500,
                  '',
                  null,
                  '',
                  option
                );
              } else this.notificationsService.notifyCode('DP036');
            });
        }
      });
  }

  //Duyệt
  documentApproval(datas: any) {
    this.approvalTrans(this.esCategory?.processID, datas);
    // this.dialogTemplate.close();
    // // if (datas.bsCategory) {
    // //Có thiết lập bước duyệt
    // // if (datas.bsCategory.approval) {
    // this.api
    //   .execSv(
    //     'ES',
    //     'ES',
    //     'CategoriesBusiness',
    //     'GetByCategoryIDAsync',
    //     this.process.processNo
    //   )
    //   .subscribe((item: any) => {
    //     if (item) {

    //       this.codxDpService
    //         .checkApprovalStep(item.recID)
    //         .subscribe((check) => {
    //           if (check) this.approvalTrans(item?.processID, datas);
    //           else {
    //             this.notificationsService.notifyCode('DP036');
    //           }
    //         });
    //     } else {
    //     }
    // });
    // }
    //Chưa thiết lập bước duyệt
    // else {
    //   var config = new AlertConfirmInputConfig();
    //   config.type = 'YesNo';
    //   this.notificationsService.alertCode('OD024', config).subscribe((item) => {
    //     if (item.event.status == 'Y') {
    //       //Lấy processID mặc định theo entity
    //       this.api
    //         .execSv(
    //           'ES',
    //           'ES',
    //           'CategoriesBusiness',
    //           'GetDefaulProcessIDAsync',
    //           this.formModel.entityName
    //         )
    //         .subscribe((item: any) => {
    //           if (item) {
    //             this.approvalTrans(item?.processID, datas);
    //           }
    //         });
    //     }
    //   });
    // }
    // }
  }
  approvalTrans(processID: any, datas: any) {
    this.api
      .execSv(
        'ES',
        'ES',
        'ApprovalTransBusiness',
        'GetCategoryByProcessIDAsync',
        processID
      )
      .subscribe((res2: any) => {
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        //trình ký
        if (res2?.eSign == true) {
          //   let signFile = new ES_SignFile();
          //   signFile.recID = datas.recID;
          //   signFile.title = datas.title;
          //   signFile.categoryID = res2?.categoryID;
          //   signFile.refId = datas.recID;
          //   // signFile.refDate = datas.refDate;
          //   signFile.refNo = datas.refNo;
          //   signFile.priority = '1';
          //   signFile.refType = this.formModel?.entityName; // OD_Dispatches';
          //   signFile.files = [];
          //   // if (this.data?.files) {
          //   //   for (var i = 0; i < this.data?.files.length; i++) {
          //   //     var file = new File();
          //   //     file.fileID = this.data?.files[i].recID;
          //   //     file.fileName = this.data?.files[i].fileName;
          //   //     file.eSign = true;
          //   //     signFile.files.push(file);
          //   //   }
          //   // }
          //   let dialogApprove = this.callfc.openForm(
          //     PopupAddSignFileComponent,
          //     'Chỉnh sửa',
          //     700,
          //     650,
          //     '',
          //     {
          //       oSignFile: signFile,
          //       ///files: this.data?.files,  //file  cân xét duyet
          //       cbxCategory: 'ODCategories', //this.gridViewSetup['CategoryID']?.referedValue,
          //       disableCateID: true,
          //       //formModel: this.view?.currentView?.formModel,
          //     },
          //     '',
          //     dialogModel
          //   );
          //   dialogApprove.closed.subscribe((res) => {
          //     if (res.event && res.event?.approved == true) {
          //       //update lại data
          //     }
          //   });
        } else if (res2?.eSign == false)
          //xét duyệt
          this.release(datas, processID);
      });
  }
  //Gửi duyệt
  release(data: any, processID: any) {
    this.api
      .execSv(
        this.view.service,
        'ERM.Business.Core',
        'DataBusiness',
        'ReleaseAsync',
        [
          data?.processID,
          processID,
          this.view.formModel.entityName,
          this.view.formModel.funcID,
          '<div>' + data?.title + '</div>',
        ]
      )
      .subscribe((res2: any) => {
        if (res2?.msgCodeError)
          this.notificationsService.notify(res2?.msgCodeError);
        else {
          this.notificationsService.notifyCode('ES007');
        }
      });
  }
  //end duyet

  async getListUserByOrg(list = []) {
    this.lstOrg = [];
    if (list != null && list.length > 0) {
      var userOrgID = list
        .filter((x) => x.objectType == 'O')
        .map((x) => x.objectID);
      if (userOrgID != null && userOrgID.length > 0) {
        this.codxDpService
          .getListUserByListOrgUnitIDAsync(userOrgID, 'O')
          .subscribe((res) => {
            if (res != null && res.length > 0) {
              if (this.lstOrg != null && this.lstOrg.length > 0) {
                this.lstOrg = this.getUserArray(this.lstOrg, res);
              } else {
                this.lstOrg = res;
              }
            }
          });
      }
      var userDepartmentID = list
        .filter((x) => x.objectType == 'D')
        .map((x) => x.objectID);

      if (userDepartmentID != null && userDepartmentID.length > 0) {
        this.codxDpService
          .getListUserByListOrgUnitIDAsync(userDepartmentID, 'D')
          .subscribe((res) => {
            if (res != null && res.length > 0) {
              if (this.lstOrg != null && this.lstOrg.length > 0) {
                this.lstOrg = this.getUserArray(this.lstOrg, res);
              } else {
                this.lstOrg = res;
              }
            }
          });
      }
      var userPositionID = list
        .filter((x) => x.objectType == 'P')
        .map((x) => x.objectID);
      if (userPositionID != null && userPositionID.length > 0) {
        this.codxDpService
          .getListUserByListOrgUnitIDAsync(userPositionID, 'P')
          .subscribe((res) => {
            if (res != null && res.length > 0) {
              if (this.lstOrg != null && this.lstOrg.length > 0) {
                this.lstOrg = this.getUserArray(this.lstOrg, res);
              } else {
                this.lstOrg = res;
              }
            }
          });
      }

      var userRoleID = list
        .filter((x) => x.objectType == 'R')
        .map((x) => x.objectID);
      if (userRoleID != null && userRoleID.length > 0) {
        this.codxDpService.getListUserByRoleID(userRoleID).subscribe((res) => {
          if (res != null && res.length > 0) {
            if (this.lstOrg != null && this.lstOrg.length > 0) {
              this.lstOrg = this.getUserArray(this.lstOrg, res);
            } else {
              this.lstOrg = res;
            }
          }
        });
      }
      var lstUser = list.filter(
        (x) => x.objectType == 'U' || x.objectType == '1'
      );
      if (lstUser != null && lstUser.length > 0) {
        var tmpList = [];
        lstUser.forEach((element) => {
          var tmp = {};
          if (element != null) {
            tmp['userID'] = element.objectID;
            tmp['userName'] = element.objectName;
            tmpList.push(tmp);
          }
        });
        if (tmpList != null && tmpList.length > 0) {
          this.lstOrg = this.getUserArray(this.lstOrg, tmpList);
        }
      }
    }
  }

  getUserArray(arr1, arr2) {
    const arr3 = arr1.concat(arr2).reduce((acc, current) => {
      const duplicateIndex = acc.findIndex(
        (el) => el.userID === current.userID
      );
      if (duplicateIndex === -1) {
        acc.push(current);
      } else {
        acc[duplicateIndex] = current;
      }
      return acc;
    }, []);
    return arr3;
  }

  outStepInstance(e) {
    if (e) {
      this.stepInstanceDetailStage = e.e;
    }
  }

  getColorReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.colorReasonSuccess = item;
          } else if (item.value === 'F') {
            this.colorReasonFail = item;
          }
        }
      }
    });
  }
}
