import { CodxShareService } from 'projects/codx-share/src/public-api';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChange,
  SimpleChanges,
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
  AuthService,
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
import { LayoutComponent } from '../_layout/layout.component';
import { Observable, finalize, map, filter, firstValueFrom } from 'rxjs';
import { PopupSelectTempletComponent } from './popup-select-templet/popup-select-templet.component';
import { PopupAddDealComponent } from 'projects/codx-cm/src/lib/deals/popup-add-deal/popup-add-deal.component';
import { PopupAddCasesComponent } from 'projects/codx-cm/src/lib/cases/popup-add-cases/popup-add-cases.component';
import { GridModels } from './instance-dashboard/instance-dashboard.component';
import { AddContractsComponent } from 'projects/codx-cm/src/lib/contracts/add-contracts/add-contracts.component';
import { PopupAssginDealComponent } from 'projects/codx-cm/src/lib/deals/popup-assgin-deal/popup-assgin-deal.component';
import { ExportData } from 'projects/codx-share/src/lib/models/ApproveProcess.model';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { PopupPermissionsComponent } from 'projects/codx-cm/src/lib/popup-permissions/popup-permissions.component';

@Component({
  selector: 'codx-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css'],
})
export class InstancesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @Input() showViews = true;
  @Input() autoLoad = true;

  @ViewChild('popupOwnerRolesTemp') popupOwnerRolesTemp: TemplateRef<any>;
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
  @ViewChild('dashBoard') dashBoard!: TemplateRef<any>;
  @ViewChild('toolbarTempDashboad')
  toolbarTempDashboad!: TemplateRef<any>;

  @Output() valueListID = new EventEmitter<any>();
  @Output() listReasonBySteps = new EventEmitter<any>();
  isCreate: boolean = true;
  dialogOwnerStep: DialogRef;
  views: Array<ViewModel> = [];
  showButtonAdd = true;
  button?: ButtonModel[];
  dataSelected: any;
  dataReload: any;
  //Setting load list
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Instances';
  className = 'InstancesBusiness';
  idField = 'recID';
  method = 'GetListInstancesAsync';
  //end
  // data T
  hideMoreFC = false;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  dataObj: any;
  vllStatus = 'DP028';
  vllApprover = 'DP043';
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

  popup: DialogRef;
  reasonStepsObject: any;
  addFieldsControl = '1';
  isLockButton = false;
  esCategory: any;
  colorReasonSuccess: any;
  colorReasonFail: any;
  ownerStepProcess: any;

  isHaveFile: boolean = false;
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
  ownerRoles = '';
  dataVll: any;
  dataCM: any;
  colorDefault = '';
  themeDatas = {
    default: '#005DC7',
    orange: '#f15711',
    sapphire: '#009384',
    green: '#0f8633',
    purple: '#5710b2',
    navy: '#192440',
  };
  // For CM
  categoryCustomer: any = '';
  instanceCM: any;
  crrFunc: any;
  runMode: any; //view detail
  tabControl = '';
  asideMode: string;
  isChangeOwner: boolean = false;
  viewModeType: any;

  constructor(
    inject: Injector,
    private callFunc: CallFuncService,
    private codxDpService: CodxDpService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private authStore: AuthStore,
    private auth: AuthService,

    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(inject);

    this.user = this.authStore.get();
    this.router.params.subscribe((param) => {
      if (!this.funcID) this.funcID = param['funcID'];
      this.cache.functionList(param.funcID).subscribe((fun) => {
        if (fun) this.runMode = fun?.runMode;
      });
      this.showButtonAdd = this.funcID != 'DPT0502';
      if (this.funcID != 'DPT0502') {
        this.processID = param['processID'];
        //data từ service ném qua
        if (this.funcID == 'DPT04') {
          this.codxDpService.dataProcess.subscribe((res) => {
            if (res) {
              this.haveDataService = true;
              if (res.read) this.loadData(res);
              else this.showViews = false;
            } else this.haveDataService = false;
          });
        } else {
          this.haveDataService = false;
        }

        this.cache.functionList(this.funcID).subscribe((f) => {
          this.cache
            .moreFunction(f.formName, f.gridViewName)
            .subscribe((res) => {
              if (res && res.length > 0) {
                this.moreFuncInstance = res;
                this.moreFuncStart = this.moreFuncInstance.filter(
                  (x) => x.functionID == 'DP21'
                )[0];
              }
            });
        });
      } else {
        // this.layoutDP.viewNameProcess(null);
      }
    });

    this.getColorReason();
    this.cache
      .gridViewSetup('DPInstances', 'grvDPInstances')
      .subscribe((grv) => {
        if (grv) {
          this.grvSetup = grv;
          this.vllStatus = grv['Status'].referedValue ?? this.vllStatus;
          this.vllApprover =
            grv['ApproveStatus'].referedValue ?? this.vllStatus;
          this.cache.valueList(this.vllStatus).subscribe((res) => {
            if (res && res.datas) {
              this.dataVll = res.datas;
            }
          });
        }
      });

    let theme = this.auth.userValue.theme.split('|')[0];
    this.colorDefault = this.themeDatas[theme] || this.themeDatas.default;
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        // toolbarTemplate: this.footerButton,
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
        // toolbarTemplate: this.footerButton,
        model: {
          template: this.cardKanban,
          template2: this.viewColumKaban,
          setColorHeader: true,
        },
      },
      {
        type: ViewType.chart,
        active: false,
        sameData: false,
        reportType: 'D',
        // reportView: true,
        showFilter: true,
        // toolbarTemplate: this.toolbarTempDashboad,
        model: {
          panelLeftRef: this.dashBoard,
        },
      },
    ];
    //bua tạm thoi de review
    this.cache.viewSettings(this.funcID).subscribe((res) => {
      let setingViewMode = res;
      this.views.forEach((v, index) => {
        let idx = setingViewMode.findIndex((x) => x.view == v.type);
        if (idx != -1) {
          v.active = setingViewMode[idx].isDefault;
          v.hide = false;
        } else {
          v.hide = true;
          v.active = false;
        }
      });
    });

    this.setColorKanban();
    this.view.dataService.methodDelete = 'DeletedInstanceAsync';
  }

  onInit() {
    this.asideMode = this.codxService.asideMode;

    this.button = [
      {
        id: 'btnAdd',
      },
    ];

    //khac "DPT0502" - func Duyệt
    if (this.funcID != 'DPT0502') {
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
            if (ps && ps?.read && !ps?.deleted) {
              this.loadData(ps);
              this.getListCbxProccess(ps?.applyFor);
              this.showViews = true;
            } else {
              this.showViews = false;
              this.codxService.navigate(null, '/');
            }
            this.detectorRef.detectChanges();
          });
      }

      this.codxDpService
        .createListInstancesStepsByProcess(this.processID)
        .subscribe((dt) => {
          if (dt && dt?.length > 0) {
            this.listSteps = dt;
            this.listStepsCbx = JSON.parse(JSON.stringify(this.listSteps));
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
    if (!this.listHeader || this.listHeader?.length == 0) {
      this.listHeader = this.getPropertyColumn();
    }
    let find = this.listHeader?.find((item) => item.recID === data.keyField);
    return find ? find[type] : '';
  }

  setColorKanban() {
    let listInsStep = this.kanban?.columns?.filter((column) => {
      column?.dataColums?.isSuccessStep && column?.dataColums?.isFailStep;
    });
    // let listInsStep = this.kanban?.columns?.filter((column) =>{column?.dataColums?.isSuccessStep && column?.dataColums?.isFailStep})
    this.kanban?.columns?.forEach((column) => {
      let a = this.hexToRGB(column?.dataColums);
      column.color = this.hexToRGB(column?.dataColums, 5);
    });
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
    // if(this.process.applyFor == '0') {
    this.view.dataService.addNew().subscribe((res) => {
      const funcIDApplyFor = this.checkFunctionID(this.process.applyFor);
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
            option.Width =
              this.addFieldsControl == '1' || this.process.applyFor != '0'
                ? '800px'
                : '550px';
            option.zIndex = 1001;
            this.view.dataService.dataSelected.processID = this.process.recID;
            if (this.process.applyFor == '0') {
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
              } else {
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
                    } else {
                      //truong hop bị xóa mất bảng autoNum
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
                              'add',
                              this.listSteps
                            );
                          }
                        });
                    }
                  });
              }
            }
            // else if (this.process.applyFor == '4') {
            //   this.openPopupContract('add', formMD);
            // }
            else {
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
  }

  copy(data, titleAction) {
    if (data) {
      this.oldIdInstance = data.recID;
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.view.dataService.dataSelected.reCID = Util.uid();
    }
    this.view.dataService.copy().subscribe((res) => {
      // const funcIDApplyFor =
      //   this.process.applyFor === '1' ? 'CM0201' : 'DPT0405';
      const funcIDApplyFor = this.checkFunctionID(this.process.applyFor);
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
              var formMD = new FormModel();
              formMD.funcID = funcIDApplyFor;
              formMD.entityName = fun.entityName;
              formMD.formName = fun.formName;
              formMD.gridViewName = fun.gridViewName;
              option.Width =
                this.addFieldsControl == '1' || this.process.applyFor != '0'
                  ? '800px'
                  : '550px';
              option.zIndex = 1001;

              if (applyFor != '0') {
                var datas = [this.oldIdInstance, applyFor];
                this.codxDpService.getOneDeal(datas).subscribe((dataCM) => {
                  if (dataCM && dataCM[0]) {
                    this.dataCM = dataCM[0];
                    this.dataCM.reCID = Util.uid();
                    this.categoryCustomer = dataCM[1];
                    this.openPopUpAdd(applyFor, formMD, option, 'copy', null);
                  }
                });
              } else {
                this.openPopUpAdd(applyFor, formMD, option, 'copy', null);
              }
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
      //endDate: this.HandleEndDate(this.listStepsCbx, action, null),
      lstParticipants: this.lstOrg,
      oldIdInstance: this.oldIdInstance,
      autoName: this.autoName,
      isAdminRoles: this.isAdminRoles,
      addFieldsControl: this.addFieldsControl,
      isLoad: applyFor != '0',
      processID: this.processID,
      instanceNoSetting: this.process.instanceNoSetting,
      dataCM: this.dataCM,
      categoryCustomer: this.categoryCustomer,
      autoNameTabFields: this.process?.autoNameTabFields,
    };

    let dialogCustomField = this.checkPopupInCM(applyFor, obj, option);
    dialogCustomField.closed.subscribe((e) => {
      if (!e?.event) {
        this.view.dataService.clear();
      }
      if (e && e.event != null) {
        this.dataSelected = JSON.parse(JSON.stringify(e.event));
        this.view?.dataService.update(this.dataSelected, true);
        if (this.kanban) {
          if (this.kanban?.dataSource?.length == 1) {
            this.kanban.refresh();
          } else this.kanban?.updateCard(this.dataSelected);
        }
        if (this.detailViewInstance) {
          this.detailViewInstance.dataSelect = this.dataSelected;
          this.detailViewInstance.getStageByStep();
        }

        if (this.detailViewPopup) {
          this.detailViewPopup.dataSelect = this.dataSelected;
          this.detailViewPopup.loadChangeData();
        }
        this.detectorRef.detectChanges();
      }
    });
  }

  async openPopupEdit(applyFor, formMD, option, titleAction) {
    let ownerIdOld = this.dataSelected?.owner;
    var obj = {
      action: 'edit',
      applyFor: applyFor,
      titleAction: titleAction,
      formMD: formMD,
      // endDate: this.HandleEndDate(
      //   this.listStepsCbx,
      //   'edit',
      //   this.view.dataService?.dataSelected?.createdOn
      // ),
      autoName: this.autoName,
      lstParticipants: this.lstOrg,
      addFieldsControl: this.addFieldsControl,
      isLoad: applyFor != '0',
      dataCM: this.dataCM,
      categoryCustomer: this.categoryCustomer,
      processID: this.processID,
      autoNameTabFields: this.process?.autoNameTabFields,
    };
    let dialogEditInstance = await this.checkPopupInCM(applyFor, obj, option);
    dialogEditInstance.closed.subscribe((e) => {
      if (e && e.event != null) {
        this.dataSelected = JSON.parse(JSON.stringify(e.event));
        this.view.dataService.update(e.event, true).subscribe();
        if (this.kanban) {
          if (this.kanban?.dataSource?.length == 1) {
            this.kanban.refresh();
          } else this.kanban.updateCard(this.dataSelected);
        }

        if (this.detailViewInstance) {
          this.detailViewInstance.dataSelect = this.dataSelected;
          this.detailViewInstance.loadChangeData();
        }

        if (this.detailViewPopup) {
          this.detailViewPopup.dataSelect = this.dataSelected;
          this.detailViewPopup.loadChangeData();
        }
        this.isChangeOwner = ownerIdOld != e?.event?.owner;
        this.detectorRef.detectChanges();
      }
    });
  }

  edit(data, titleAction) {
    if (data) {
      this.view.dataService.dataSelected = data;
      this.oldIdInstance = data.recID;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        const funcIDApplyFor = this.checkFunctionID(this.process.applyFor);
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
              var formMD = new FormModel();
              formMD.funcID = funcIDApplyFor;
              formMD.entityName = fun.entityName;
              formMD.formName = fun.formName;
              formMD.gridViewName = fun.gridViewName;
              option.Width =
                this.addFieldsControl == '1' || applyFor != '0'
                  ? '800px'
                  : '550px';
              option.zIndex = 1001;
              this.view.dataService.dataSelected.processID = this.process.recID;

              if (applyFor != '0') {
                var datas = [
                  this.view.dataService.dataSelected.recID,
                  applyFor,
                ];
                this.codxDpService.getOneDeal(datas).subscribe((dataCM) => {
                  if (dataCM) {
                    this.dataCM = dataCM[0];
                    this.categoryCustomer = dataCM[1];
                    this.openPopupEdit(applyFor, formMD, option, titleAction);
                  }
                });
              } else {
                this.openPopupEdit(applyFor, formMD, option, titleAction);
              }
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
    var datas = [data.recID, this.process?.applyFor];
    this.codxDpService.startInstance(datas).subscribe((res) => {
      if (res) {
        data.status = '2';
        data.startDate = res?.length > 0 ? res[0].startDate : null;
        this.dataSelected = data;
        this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
        this.listInstanceStep = res;

        if (this.detailViewInstance) {
          this.detailViewInstance.loadChangeData();
        }
        if (this.detailViewPopup) {
          this.detailViewPopup.loadChangeData();
        }
        this.notificationsService.notifyCode('SYS007');
        this.view.dataService.update(this.dataSelected).subscribe();
        if (this.kanban) this.kanban.updateCard(this.dataSelected);
      }
      this.detectorRef.detectChanges();
    });
  }

  openOrClosed(data, check) {
    this.notificationsService
      .alertCode('DP018', null, this.titleAction, "'" + data.title + "'")
      .subscribe((info) => {
        if (info?.event?.status == 'Y') {
          this.codxDpService
            .openOrClosedInstance(data.recID, check, this.process.applyFor)
            .subscribe((res) => {
              if (res) {
                this.dataSelected.closed = check;
                this.dataSelected = JSON.parse(
                  JSON.stringify(this.dataSelected)
                );
                this.notificationsService.notifyCode(
                  check ? 'DP016' : 'DP017',
                  0,
                  "'" + data.title + "'"
                );
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
                if (this.kanban) this.kanban.updateCard(this.dataSelected);
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
  clickMoreFunc(e) {
    this.lstStepInstances = e.lstStepCbx;
    this.clickMF(e.e, e.data);
  }
  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  changeDataMF(e, data) {
    if (!data) return;
    if (e != null && data != null) {
      if (data?.approveStatus == '3') {
        e.forEach((res) => {
          if (!['SYS05','DP23'].includes(res.functionID)) {
            res.disabled = true;
          }
        });
      }else if (data.closed){
        e.forEach((res) => {
          if (!['SYS05','DP15'].includes(res.functionID)) {
            res.disabled = true;
          }
        });
      } else {
        if (data.status != '1') {
          e.forEach((res) => {
            switch (res.functionID) {
              case 'SYS001':
              case 'SYS002':
              case 'SYS003':
              case 'SYS003':
              case 'DP14':
                res.disabled = ['3','4','5','6'].includes(data.status);
                break;
              case 'SYS003':
                if (
                  (data.status != '2' && !this.isEditInstance(data)) ||
                  data.closed ||
                  !data.permissionCloseInstances
                )
                  res.disabled = true;
                break;
              case 'SYS103':
              case 'SYS03':
                let isUpdate = data.write;
                if (
                  !isUpdate ||
                  (data.status != '2' && !this.isEditInstance(data)) ||
                  data.closed ||
                  !data.permissionMoveInstances
                )
                  res.disabled = true;
                break;
              case 'DP09':
                if (
                  !this.isReturnInstance(data) &&
                  this.checkMoreReason(data, null)
                ) {
                  res.disabled = true;
                }
                break;
              //Copy
              case 'SYS104':
              case 'SYS04':
                if (!this.isCreate || this.checkMoreReason(data, null))
                  res.disabled = true;
                break;
              //xóa
              case 'SYS102':
              case 'SYS02':
                let isDelete = data.delete;
                if (
                  !isDelete ||
                  data.closed ||
                  (data.status != '2' && !this.isEditInstance(data)) ||
                  !data.permissionMoveInstances
                )
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
              //an khi aprover rule || data.approveStatus == '5' xoa di
              case 'DP17':
                if (!data.write || data.closed) {
                  res.disabled = true;
                } else if (!this.process?.approveRule) {
                  res.isblur = true;
                }
                break;
              // case 'SYS004':
              // case 'SYS002':
              case 'DP18':
                if (
                  (data.refID && data.refID !== this.guidEmpty) ||
                  data.closed ||
                  data.status == '1' ||
                  data.status == '15' ||
                  data.status == '2' ||
                  !this.isMoveProcess(data)
                ) {
                  res.disabled = true;
                }
                break;
              case 'DP21':
                res.disabled = true;
                break;
              case 'DP22':
                if (
                  data.status != '2' ||
                  data.closed ||
                  !data.permissionCloseInstances
                )
                  res.disabled = true;
                break;
              case 'DP23':
                if (data.approveStatus != '3') res.disabled = true;
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
              //edit
              case 'SYS03':
                let isUpdate = data.write;
                if (!isUpdate || data.closed || !data.permissionMoveInstances)
                  mf.disabled = true;
                break;
              //Copy
              case 'SYS04':
                if (!this.isCreate) mf.disabled = true;
                break;
              //xóa
              case 'SYS02':
                let isDelete = data.delete;
                if (!isDelete || data.closed || !data.permissionMoveInstances)
                  mf.disabled = true;
                break;
              case 'DP09':
              case 'DP10':
              // case 'SYS004':
              // case 'SYS002':
              case 'DP02':
              case 'DP14':
              case 'DP15':
              case 'DP23':
              case 'DP18':
                mf.disabled = true;
                break;
            }
          });
        }
      }
    }
  }

  clickMF(e, data?) {
    this.dataSelected = data;
    this.titleAction = e.text;
    this.moreFunc = e.functionID;
    this.stepIdClick = '';
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
      case 'DP18':
        this.moveProcessBack(data);
        break;
      case 'DP21':
        this.handelStartDay(data);
        break;
      case 'DP22':
        this.popupOwnerRoles(data);
        break;
      case 'DP23':
        this.cancelApprover(data);
        break;
      case 'DP34':
        this.popupPermissions(data);
        break;
      //lay datas ra
      case 'SYS002':
        this.exportTemplet(e, data);
        break;
      default: {
        //Biến động tự custom
        //let dataSource = this.getDataSource(data);
        //let dataSource = data.datas;
        // var customData = {
        //   refID: data.processID,
        //   refType: 'DP_Processes',
        //   // dataSource: dataSource,
        // };
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          this.view.formModel,
          this.view.dataService,
          this
          //customData
        );
        this.detectorRef.detectChanges();
        break;
      }
    }
  }
  getDataSource({ datas, permissions, ...dataSource }) {
    let datasArr = datas.substring(2);
    let fix = JSON.stringify(dataSource);
    fix = fix.substring(1, fix.length - 1);
    let formatDat = '[{ ' + fix + ',' + datasArr;
    return formatDat;
  }
  //get datas = datas + model ko có datas
  exportTemplet(e, data) {
    this.api
      .execSv<any>(
        'DP',
        'DP',
        'InstancesBusiness',
        'GetDataSourceExportAsync',
        data.recID
      )
      .subscribe((str) => {
        if (str && str?.length > 0) {
          let dataSource = '[' + str[0] + ']';
          if (str[1]) {
            let datas = str[1];
            if (datas && datas.includes('[{')) datas = datas.substring(2);
            let fix = str[0];
            fix = fix.substring(1, fix.length - 1);
            dataSource = '[{ ' + fix + ',' + datas;
          }

          var customData = {
            refID: data.processID,
            refType: 'DP_Processes',
            dataSource: dataSource,
          };
          this.codxShareService.defaultMoreFunc(
            e,
            data,
            this.afterSave,
            this.view.formModel,
            this.view.dataService,
            this,
            customData
          );
          this.detectorRef.detectChanges();
        }
      });
  }

  afterSave(e?: any, that: any = null) {
    //đợi xem chung sửa sao rồi làm tiếp
  }
  //End
  checkMoreReason(data, isUseReason) {
    if (data.closed) return true;
    if (data.status != '2' || isUseReason) return true;
    if (!data.permissionMoveInstances) return true;
    return false;
  }
  checkMoreReasonCopy(data, isUseReason) {
    if (data.closed) return true;
    if (this.isReturnInstance(data)) return false;
    // if (data.status != '2' || isUseReason) return true;

    if (!data.permissionMoveInstances) return true;
    return false;
  }
  isEditInstance(data) {
    if (data.isAdminAll) {
      return true;
    }
    return (
      data.permissionMoveInstances && this.process.allowEditInstanceControl
    );
  }
  isReturnInstance(data) {
    if (data.closed) return false;
    if (data.isAdminAll) {
      return true;
    }
    return (
      data.permissionMoveInstances && this.process.allowReturnInstanceControl
    );
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

  popupOwnerRoles(data) {
    this.dataSelected = data;
    let ownerIdOld = data?.owner;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      // var formMD = new FormModel();
      // let dialogModel = new DialogModel();
      // formMD.funcID = fun.functionID;
      // formMD.entityName = fun.entityName;
      // formMD.formName = fun.formName;
      // formMD.gridViewName = fun.gridViewName;
      // dialogModel.zIndex = 999;
      // dialogModel.FormModel = formMD;
      // var startControl = this.process.steps.filter(
      //   (x) => x.recID === data.stepID
      // )[0].startControl;
      // var dialog = this.callfc.openForm(
      //   PopupEditOwnerstepComponent,
      //   '',
      //   500,
      //   280,
      //   '',
      //   [this.lstOrg, this.titleAction, data, '0', startControl,this.grvSetup],
      //   '',
      //   dialogModel
      // );
      // dialog.closed.subscribe((e) => {
      //   if (e && e?.event != null) {
      //     this.dataSelected.ownerStepInstances = e.event.owner;
      //     this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
      //     this.detailViewInstance.loadOwnerStep(e.event.owner);
      //     this.view.dataService.update(this.dataSelected).subscribe();
      //     this.detectorRef.detectChanges();
      //   }
      // });
      var formMD = new FormModel();
      let dialogModel = new DialogModel();
      formMD.funcID = fun.functionID;
      formMD.entityName = fun.entityName;
      formMD.formName = fun.formName;
      formMD.gridViewName = fun.gridViewName;
      dialogModel.zIndex = 999;
      dialogModel.FormModel = formMD;
      let startControl = this.process.steps.filter(
        (x) => x.recID === data.stepID
      )[0]?.startControl;
      let obj = {
        recID: data?.recID,
        //refID: data?.recID,
        processID: data?.processID,
        stepID: data?.stepID,
        data: data,
        gridViewSetup: this.grvSetup,
        formModel: this.view.formModel,
        applyFor: this.process.applyFor,
        titleAction: this.titleAction,
        owner: data.owner,
        startControl: startControl,
        applyProcess: true,
        buid: data.buid,
        isCallInstance: this.process?.applyFor == '0',
      };
      var dialog = this.callfc.openForm(
        PopupAssginDealComponent,
        '',
        750,
        400,
        '',
        obj,
        '',
        dialogModel
      );
      dialog.closed.subscribe((e) => {
        if (e && e?.event != null) {
          this.dataSelected.owner = e.event?.owner;
          this.dataSelected = JSON.parse(JSON.stringify(this.dataSelected));
          // this.detailViewInstance.loadOwnerStep(e.event.owner);
          this.isChangeOwner = ownerIdOld != e?.event?.owner;
          this.view.dataService.update(this.dataSelected).subscribe();
          this.detectorRef.detectChanges();
        }
      });
    });
  }

  showInput(data) {}

  //begin code Thao
  dblClick(e, data) {}

  onActions(e) {
    switch (e.type) {
      case 'drop':
        this.dataDrop = e.data;
        this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop?.stepID));
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
    if (!data.edit) {
      this.notificationsService.notifyCode('SYS032');
      return;
    }
    if (data.closed) {
      this.notificationsService.notifyCode('DP039');
      return;
    }

    if (this.moreFuncInstance?.length == 0) {
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status == '1') {
      this.notificationsService.notifyCode('DP038', 0, '"' + data?.title + '"');
      this.changeDetectorRef.detectChanges();
      return;
    }
    if (data.status != '1' && data.status != '2' && !data.isAdminAll) {
      this.notificationsService.notifyCode('DP037', 0, '"' + data.title + '"');
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
          idx = this.moreFuncInstance.findIndex((x) => x.functionID == 'DP09');
          if (idx != -1) {
            if (this.checkMoreReason(data, null)) {
              this.notificationsService.notifyCode('SYS032');
              return;
            }
            this.moveStage(this.moreFuncInstance[idx], data, this.listSteps);
          }
        } else {
          if (stepCrr?.isSuccessStep) {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'DP10'
            );
            if (idx != -1)
              if (this.checkMoreReason(data, !this.isUseSuccess)) {
                this.notificationsService.notifyCode('SYS032');
                return;
              }
            this.moveReason(this.moreFuncInstance[idx], data, true);
          } else {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'DP02'
            );
            if (idx != -1)
              if (this.checkMoreReason(data, !this.isUseFail)) {
                this.notificationsService.notifyCode('SYS032');
                return;
              }
            this.moveReason(this.moreFuncInstance[idx], data, false);
          }
        }
      }
    }
  }

  changeView(e) {
    this.router.params.subscribe((param) => {
      this.funcID = param['funcID'];
      this.processID = param['processID'];
    });

    if (!this.crrFunc || this.crrFunc == this.funcID) {
      if (!this.crrFunc) this.crrFunc = this.funcID;
      this.viewModeType = e?.view.type;
      switch (this.viewModeType) {
        case 2:
          // this.showButtonAdd = true;
          this.viewsCurrent = 'd-';
          break;
        case 6:
          // this.showButtonAdd = true;
          if (this.kanban) (this.view.currentView as any).kanban = this.kanban;
          else this.kanban = (this.view.currentView as any).kanban;
          this.viewsCurrent = 'k-';
          break;
        case 9:
          this.showButtonAdd = false;
          break;
      }
    } else {
      this.codxDpService
        .getProcessByProcessID(this.processID)
        .subscribe((ps) => {
          if (ps && ps.read && !ps?.deleted) {
            this.showViews = true;
            this.loadData(ps, true);
            this.getListCbxProccess(ps?.applyFor);
          } else {
            this.showViews = false;
            this.codxService.navigate(null, '/');
          }
        });
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
    // this.crrStepID = data.stepID;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      this.cache
        .gridViewSetup(fun.formName, fun.gridViewName)
        .subscribe((grvSt) => {
          let formMD = new FormModel();
          formMD.funcID = fun.functionID;
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          let stepReason = {
            isUseFail: this.isUseFail,
            isUseSuccess: this.isUseSuccess,
          };
          if (this.process.applyFor != '0') {
            let datas = [data.recID, this.process.applyFor];
            this.codxDpService.getOneDeal(datas).subscribe((res) => {
              if (res) {
                let dataCM = {
                  refID: data?.recID,
                  processID: this.process.recID,
                  stepID: data?.stepID,
                  nextStep: this.stepIdClick ? this.stepIdClick : '',
                  isCallInstance: false,
                  // listStepCbx: this.lstStepInstances,
                };
                this.instanceCM = res[0];
                this.openPoupMoveStage(
                  data,
                  formMD,
                  null,
                  stepReason,
                  dataMore.defaultName,
                  dataCM
                );
              } else {
                this.notificationsService.notifyCode('SYS001');
              }
            });
          } else {
            this.openPoupMoveStage(
              data,
              formMD,
              listStepCbx,
              stepReason,
              dataMore.defaultName,
              null
            );
          }
        });
      // });
    });
  }
  openPoupMoveStage(
    data,
    formMD,
    listStepCbx,
    stepReason,
    headerTitle,
    dataCM
  ) {
    let obj = {
      formModel: formMD,
      instance: data,
      listStepCbx: listStepCbx,
      stepIdClick: this.stepIdClick,
      stepReason: stepReason,
      headerTitle: headerTitle,
      listStepProccess: this.process.steps,
      lstParticipants: this.lstOrg,
      isDurationControl: this.checkDurationControl(data.stepID),
      applyFor: this.process.applyFor,
      deal: this.instanceCM,
      dataCM: dataCM,
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
      // if (!e || !e.event) {
      //   data.stepID = this.crrStepID;
      //   this.changeDetectorRef.detectChanges();
      // }
      if (e && e.event != null) {
        //xu ly data đổ về
        data = e.event?.instance;
        this.listStepInstances = e.event?.listStep;
        if (!e.event.isMoveBackStage && e.event?.isReason != null) {
          this.moveReason(null, data, e.event.isReason);
        }
        this.view.dataService.update(data).subscribe();
        if (this.kanban) this.kanban.updateCard(data);
        this.dataSelected = data;

        if (this.detailViewInstance) {
          this.detailViewInstance.dataSelect = this.dataSelected;
          this.detailViewInstance.listSteps = this.listStepInstances;
          this.detailViewInstance.loadChangeData();
        }
        if (this.detailViewPopup) {
          this.detailViewPopup.dataSelect = this.dataSelected;
          this.detailViewPopup.listSteps = this.listStepInstances;
          this.detailViewPopup.loadChangeData();
        }

        this.detectorRef.detectChanges();
      }
    });
  }

  moveReason(dataMore, data: any, isMoveSuccess: Boolean) {
    // this.crrStepID = data.stepID;
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

    if (checkTransferControl == '1' && dataInstance.isAuto?.isContinueTaskAll) {
      this.handleMoveStage(dataInstance);
    } else if (checkTransferControl == '2') {
      if (dataInstance.isAuto.isContinueTaskEnd) {
        if (dataInstance.isAuto?.isShowFromTaskEnd) {
          this.openFormForAutoMove(dataInstance);
        } else {
          this.handleMoveStage(dataInstance);
        }
      }
    }
  }

  isCheckAutoMoveStage(checkTransferControl: any, isAuto) {
    if (
      checkTransferControl == '1' &&
      !isAuto.isShowFromTaskAll &&
      isAuto.isContinueTaskAll
    ) {
      return true;
    } else if (
      checkTransferControl == '2' &&
      isAuto.isContinueTaskEnd &&
      !isAuto.isShowFromTaskEnd
    ) {
      return true;
    } else {
      return false;
    }
  }
  isCheckTaskEnd(checkTransferControl: any, isAuto) {
    if (checkTransferControl == '2' && isAuto.isShowFromTaskEnd) {
      return true;
    }
    return false;
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
    } else {
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
              item.actualEnd = new Date();
            }
          }
          dataInstance.instance.stepID = instanceStepId.find(
            (item) => item.stepStatus == '1'
          ).stepID;
          let processId = dataInstance.instance.processID;
          let data = [instanceStepId, processId];
          this.codxDpService.autoMoveStage(data).subscribe((res) => {
            if (res) {
              var stepsUpdate = dataInstance.listStep.map((item1) => {
                let item2 = instanceStepId.find(
                  (item2) => item1.stepID === item2.stepID
                );
                if (item2) {
                  return { ...item2 };
                } else {
                  return item1;
                }
              });
              this.listStepInstances = stepsUpdate;
              this.dataSelected = dataInstance.instance;
              this.view.dataService.update(this.dataSelected).subscribe();
              if (this.kanban) this.kanban.updateCard(this.dataSelected);

              if (this.detailViewInstance) {
                this.detailViewInstance.dataSelect = this.dataSelected;
                this.detailViewInstance.listSteps = this.listStepInstances;
                this.detailViewInstance.loadChangeData();
              }

              if (this.detailViewPopup) {
                this.detailViewPopup.dataSelect = this.dataSelected;
                this.detailViewPopup.listSteps = this.listStepInstances;
                this.detailViewPopup.loadChangeData();
              }

              this.detectorRef.detectChanges();
            }
          });
        }
      });
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
    return fields.some((x) => !x.dataValue && x.isRequired);
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

  async openFormReason(
    data,
    fun,
    isMoveSuccess,
    dataMore,
    listParticipantReason
  ) {
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
      objReason: JSON.parse(JSON.stringify(reason)),
      processID: this.processID,
      applyFor: this.process?.applyFor,
      isMoveProcess: true,
      isCallInstance: this.process?.applyFor == '0',
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
      if (e && e.event != null) {
        //xu ly data đổ về
        data = e.event?.instance;
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

        if (this.detailViewPopup) {
          this.detailViewPopup.dataSelect = this.dataSelected;
          this.detailViewPopup.listSteps = this.listStepInstances;
        }

        if (
          e?.event?.applyForMove &&
          e?.event?.processMove &&
          this.process.applyFor !== e?.event?.applyForMove
        ) {
          this.moreFuncStart = this.moreFuncInstance.filter(
            (x) => x.functionID == 'SYS01'
          )[0];
          this.addMoveProcess(
            e.event?.processMove,
            e.event?.applyForMove,
            e.event?.ownerMove,
            e.event?.title,
            'add'
          );
        }
        this.detailViewInstance.loadChangeData();
        this.detectorRef.detectChanges();
      }
    });
  }

  delete(data: any) {
    if (this.process.applyFor == '1') {
      var datas = [null, data.recID];
      this.codxDpService.isCheckDealInUse(datas).subscribe((res) => {
        if (res[0]) {
          this.notificationsService.notifyCode('CM015');
          return;
        } else if (res[1]) {
          this.notificationsService.notifyCode('CM014');
          return;
        } else {
          this.deleteInstance(data);
        }
      });
    } else {
      this.deleteInstance(data);
    }
    this.changeDetectorRef.detectChanges();
  }

  deleteInstance(data) {
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
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedInstanceAsync';
    opt.data = [itemSelected.recID, this.process.applyFor];
    return true;
  }

  getStepNameById(stepId: string): string {
    return this.listSteps
      .filter((x) => x.stepID === stepId)
      .map((x) => x.stepName)[0];
  }

  getListCbxProccess(applyFor: any) {
    this.cache.valueList('DP031').subscribe((data) => {
      this.codxDpService.getlistCbxProccess('').subscribe((res) => {
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
        day += currentDate.getDay() === 6 && isSaturday ? 1 : 0;
        day += currentDate.getDay() === 0 && isSunday ? 1 : 0;
      }
      let isEndSaturday = endDay.getDay() === 6;
      endDay.setDate(endDay.getDate() + day);

      if (endDay.getDay() === 6 && isSaturday) {
        endDay.setDate(endDay.getDate() + 1);
      }

      if (endDay.getDay() === 0 && isSunday) {
        if (!isEndSaturday) {
          endDay.setDate(endDay.getDate() + (isSaturday ? 1 : 0));
        }
        endDay.setDate(endDay.getDate() + (isSunday ? 1 : 0));
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
    (this.view.dataService as CRUDService).setPredicates(
      [this.filterInstancePredicates],
      [this.dataValueFilterArr.join(';')]
    );

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
    if (e) this.handelStartDay(this.dataSelected);
  }
  //load DATA
  async loadData(ps, reload = false) {
    this.process = ps;
    this.tabControl =
      this.process?.tabControl != null && this.process?.tabControl?.trim() != ''
        ? this.process?.tabControl
        : '1;3;5'; //31 la tat ca.

    this.viewModeDetail = this.process?.viewModeDetail ?? 'S';
    this.loadTabControl();
    this.loadEx();
    this.loadWord();
    this.addFieldsControl = ps?.addFieldsControl;

    //tăt
    //this.layoutDP.viewNameProcess(ps);
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
    //đoi view cần reload = 03/01/2024 => đã bùa nghiệp vụ => đợi core change data tu ngoia vao
    if (reload) {
      // let viewModel: any;
      // this.cache.viewSettings(this.funcID).subscribe((res) => {
      //   let setingViewMode = res;
      //   this.views.forEach((v, index) => {
      //     let idx = setingViewMode.findIndex((x) => x.view == v.type);
      //     if (idx != -1) {
      //       v.active = this.viewMode == v.type;
      //       // v.active = setingViewMode[idx].isDefault;
      //       if (v.active) viewModel = v;
      //       v.hide = false;
      //     } else {
      //       v.hide = true;
      //       v.active = false;
      //     }
      //   });
      //   this.crrFunc = this.funcID;
      //   if (viewModel) {
      //     this.view.viewActiveType = viewModel.type;
      //   } else {
      //     this.view.viewActiveType = 2;
      //     viewModel = this.views.find((x) => x.type == 2);
      //     viewModel.active = true;
      //   }
      //   this.dataObj = {
      //     processID: this.processID,
      //     haveDataService: this.haveDataService ? '1' : '0',
      //     showInstanceControl: this.process?.showInstanceControl
      //       ? this.process?.showInstanceControl
      //       : '2',
      //     hiddenInstanceReason: this.getListStatusInstance(
      //       this.isUseSuccess,
      //       this.isUseFail
      //     ),
      //   };
      //   this.view.views.forEach((x) => {
      //     if (x.type == 6) {
      //       x.request.dataObj = this.dataObj;
      //       x.request2.dataObj = this.dataObj;
      //     }
      //   });
      //   if ((this.view?.currentView as any)?.kanban) this.loadKanban();
      //   this.view.viewChange(viewModel);
      //   this.view.load();
      //   this.kanban.refresh();
      // });
    }

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

  loadTabControl() {
    this.cache.valueList('DP034').subscribe((res) => {
      if (res && res.datas) {
        var tabIns = [];
        const tabs = this.tabControl.split(';');
        for (let item of tabs) {
          let value = item == '1' ? 'S' : item == '3' ? 'F' : 'G';
          let findDatas = res.datas.find((x) => x.value == value);
          if (findDatas) {
            var tab = {};
            tab['viewModelDetail'] = findDatas?.value;
            tab['textDefault'] = findDatas?.text;
            tab['icon'] = findDatas?.icon;
            if (tab['viewModelDetail'] == 'F') {
              tab['textDefault'] =
                this.process?.autoNameTabFields != null &&
                this.process?.autoNameTabFields?.trim() != ''
                  ? this.process?.autoNameTabFields
                  : findDatas?.text;
            }
            tabIns.push(tab);
          }
        }
        this.tabInstances = tabIns;
        if (tabIns?.length > 0) {
          const checkTab = tabIns.some(
            (x) => x.viewModelDetail == this.viewModeDetail
          );
          this.viewModeDetail = checkTab
            ? this.viewModeDetail
            : tabIns[0]['viewModelDetail'];
        }
      }
    });
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

    let obj = {
      data: this.dataSelected,
      formModel: this.view.formModel,
      isFormExport: true,
      refID: this.process.recID,
      refType: 'DP_Processes',
      esCategory: this.esCategory,
      titleAction: this.titleAction,
      loaded: true,
      dataEx: this.dataEx,
      dataWord: this.dataWord,
    };
    this.dialogTemplate = this.callfc.openForm(
      PopupSelectTempletComponent,
      '',
      600,
      500,
      '',
      obj,
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
    this.requestTemp.predicate = 'RefID=@0 && RefType=@1';
    this.requestTemp.dataValue = this.process.recID + ';DP_Processes';
    this.requestTemp.entityName = 'AD_ExcelTemplates';
    this.classNameTemp = 'ExcelTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataEx = item;
    });
  }
  loadWord() {
    this.requestTemp.predicate = 'RefID=@0 && RefType=@1';
    this.requestTemp.dataValue = this.process.recID + ';DP_Processes';
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
          //gui step
          this.codxDpService
            .getDataReleased([this.dataSelected.recID, item.recID]) //data + tranID của esCategory
            .subscribe((dt) => {
              if (dt) {
                let exportData: ExportData = {
                  funcID: this.view.formModel.funcID,
                  recID: this.dataSelected.recID,
                  data: dt[1]?.datas,
                };
                let viewHtml = this.dataSelected.title + ' - ' + dt[0].stepName; //`<div class="d-flex flex-column"><div class="line-clamp line-clamp-2 text-dark">${this.dataSelected.title}</div><div class="text-gray-700 line-clamp">${dt[0].stepName}</div></div>`; // ES ko cho truyền chuỗi html
                this.release(dt[0], this.esCategory, exportData, viewHtml);
              }
            });

          // //gui instance
          // this.codxDpService
          //   .checkApprovalStep(item.recID)
          //   .subscribe((check) => {
          //     if (check) {
          //       this.release(this.dataSelected, item);
          //     } else this.notificationsService.notifyCode('DP036');
          //   });
        }
      });
  }

  // // data?.stepName, => tên theo quy trình
  release(data: any, category: any, exportData: any, viewHtml) {
    this.codxCommonService.codxReleaseDynamic(
      'DP',
      data,
      category,
      'DP_Instances_Steps',
      this.view.formModel.funcID,
      viewHtml, // this.dataSelected.title, //html truyen qua
      this.releaseCallback.bind(this),
      null,
      null,
      'DP_Instances_Steps',
      null,
      null,
      exportData
    );
  }
  //call Back
  releaseCallback(res: any, t: any = null) {
    if (res?.msgCodeError) this.notificationsService.notify(res?.msgCodeError);
    else {
      ///do corre share ko tra ve status
      this.dataSelected.approveStatus = res?.returnStatus ?? '3';
      this.view.dataService.update(this.dataSelected).subscribe();
      if (this.kanban) this.kanban.updateCard(this.dataSelected);
      // this.notificationsService.notifyCode('ES007'); // ES trả về rồi
    }
  }

  releaseInstances(data: any, category: any) {
    this.codxCommonService.codxReleaseDynamic(
      'DP',
      data,
      category,
      this.view.formModel.entityName,
      this.view.formModel.funcID,
      data?.stepName,
      this.releaseCallbackInstances.bind(this)
    );
  }
  //call Back
  releaseCallbackInstances(res: any, t: any = null) {
    if (res?.msgCodeError) this.notificationsService.notify(res?.msgCodeError);
    else {
      this.dataSelected.approveStatus = res?.returnStatus ?? '3';
      this.view.dataService.update(this.dataSelected).subscribe();
      if (this.kanban) this.kanban.updateCard(this.dataSelected);
      // this.notificationsService.notifyCode('ES007');
    }
  }

  //Huy duyet instance
  cancelApprover(dt) {
    this.notificationsService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        //check truoc ben quy trình có thiết lập chưa ?? cos la lam tiep
        this.codxDpService
          .getESCategoryByCategoryID(this.process.processNo)
          .subscribe((res2: any) => {
            if (res2) {
              //Huy duyet instance step
              this.cancelReleaseInstanceStep(dt.stepID, dt.recID);
              //  //Huy duyet instance
              // this.cancelRelease(dt.recID, this.view.formModel.entityName);
            }
          });
      }
    });
  }

  cancelReleaseInstanceStep(stepID, instanceID) {
    this.codxDpService
      .getRecIDInstancesStepsReleased([stepID, instanceID])
      .subscribe((res) => {
        if (res) {
          this.cancelRelease(res, 'DP_Instances_Steps');
        }
      });
  }

  cancelRelease(transID, entityName) {
    this.codxCommonService
      .codxCancel('DP', transID, entityName, null, null)
      .subscribe((res3) => {
        if (res3) {
          this.dataSelected.approveStatus = '0';
          this.view.dataService.update(this.dataSelected).subscribe();
          if (this.kanban) this.kanban.updateCard(this.dataSelected);

          // this.codxDpService
          //   .updateApproverStatus([this.dataSelected.recID, '0'])
          //   .subscribe((res4) => {
          //     if (res4) {
          //       this.view.dataService.update(this.dataSelected).subscribe();
          //       this.notificationsService.notifyCode('SYS007');
          //     } else this.notificationsService.notifyCode('SYS021');
          //   });
        } else this.notificationsService.notifyCode('SYS021');
      });
  }
  //end duyet

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

  checkDurationControl(stepID): boolean {
    var stepsDuration = this.process.steps.find((x) => x.recID === stepID);
    return stepsDuration?.durationControl;
  }

  toolTip(stt) {
    return this.dataVll?.filter((vl) => vl.value == stt)[0]?.text;
  }

  checkPopupInCM(applyFor, obj, option) {
    if (applyFor == '0') {
      return this.callfc.openSide(PopupAddInstanceComponent, obj, option);
    } else if (applyFor == '1') {
      return this.callfc.openSide(PopupAddDealComponent, obj, option);
    } else if (applyFor == '2' || applyFor == '3') {
      return this.callfc.openSide(PopupAddCasesComponent, obj, option);
    } else if (applyFor == '4') {
      obj = {
        ...obj,
        type: 'DP',
        contractRefID: this.oldIdInstance,
        processID: this.processID,
      };
      option.FormModel = obj?.formMD;
      return this.callfc.openSide(AddContractsComponent, obj, option);
    }
    return null;
  }

  checkFunctionID(applyFor) {
    if (applyFor == '0') {
      return this.funcID;
    }
    if (applyFor == '1') {
      return 'CM0201';
    } else if (applyFor == '2') {
      return 'CM0401';
    } else if (applyFor == '3') {
      return 'CM0402';
    } else if (applyFor == '4') {
      return 'CM0204';
    }
    return null;
  }

  //dasboad
  filterChange(e) {
    // this.isLoaded = false;
    const { predicates, dataValues } = e[0];
    const param = e[1];
    this.getDashboardData(predicates, dataValues, param);
    this.detectorRef.detectChanges();
  }
  getDashboardData(predicates?: string, dataValues?: string, params?: any) {
    // load data
    // let model = new GridModels();
    // model.funcID = this.funcID;
    // model.entityName = 'TM_Tasks';
    // model.predicates = predicates;
    // model.dataValues = dataValues;
    // this.api
    //   .exec('DP', 'TaskBusiness', 'GetDataMyDashboardAsync', [model, params])
    //   .subscribe((res) => {
    //     this.dataDashBoard = res;

    //     setTimeout(() => {
    //       this.isLoaded = true;
    //     }, 500);
    //   });

    this.detectorRef.detectChanges();
  }

  hexToRGB(step, countStep = 1) {
    let hex = this.colorDefault;
    let opacityDefault = Number((1 / countStep).toFixed(2));
    let opacity = opacityDefault * Number(step?.stepNo || 1);
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hexLongRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const result = hexLongRegex.exec(hex) || shorthandRegex.exec(hex);
    if (!result) {
      return null;
    }
    const [r, g, b] = result.slice(1).map((value) => parseInt(value, 16));
    if (opacity !== undefined) {
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else {
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  addMoveProcess(processMove, applyForMove, ownerMove, title, titleAction) {
    this.view.dataService.addNew().subscribe((res) => {
      const funcIDApplyFor = this.checkFunctionID(applyForMove);
      const applyFor = applyForMove;
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
        let instanceReason = {
          applyForMove: applyForMove,
          processMove: processMove,
          ownerMove: ownerMove,
          title: title,
          recID: this.dataSelected?.recID,
        };
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
            if (applyFor != '0') {
              this.openPopupMove(
                applyFor,
                formMD,
                option,
                'add',
                instanceReason
              );
            }
          });
      });
    });
  }
  openPopupMove(applyFor, formMD, option, action, instanceReason) {
    var obj = {
      action: action === 'add' ? 'add' : 'copy',
      applyFor: applyFor,
      titleAction: this.titleAction,
      formMD: formMD,
      endDate: this.HandleEndDate(this.listStepsCbx, action, null),
      lstParticipants: this.lstOrg,
      oldIdInstance: this.oldIdInstance,
      autoName: this.autoName,
      isAdminRoles: this.isAdminRoles,
      addFieldsControl: this.addFieldsControl,
      isLoad: applyFor != '0',
      processID: instanceReason?.processMove
        ? instanceReason?.processMove
        : this.processID,
      instanceNoSetting: this.process.instanceNoSetting,
      dataCM: this.dataCM,
      categoryCustomer: this.categoryCustomer,
      instanceReason: instanceReason,
    };
    let dialogCustomField = this.checkPopupInCM(applyFor, obj, option);
    dialogCustomField.closed.subscribe((e) => {
      if (!e?.event) {
        this.view.dataService.clear();
      }
      if (this.kanban && !e?.event) this.kanban.refresh();
      this.detectorRef.detectChanges();
    });
  }
  autoStartInstance() {
    this.startInstance(this.dataSelected);
  }
  openMoveProcess(applyForMove, processMove, title, ownerMove, recId: '') {
    if (applyForMove && processMove && this.process.applyFor !== applyForMove) {
      this.moreFuncStart = this.moreFuncInstance.filter(
        (x) => x.functionID == 'SYS01'
      )[0];
      this.addMoveProcess(processMove, applyForMove, ownerMove, title, 'add');
    }
  }
  isMoveProcess(data) {
    let isOpenForm = false;
    let processID = '';
    if (data.status === '3' || data.status === '4') {
      isOpenForm = true;
      processID = this.stepSuccess?.newProcessID;
    } else if (data.status === '5' || data.status == '6') {
      isOpenForm = true;
      processID = this.stepFail?.newProcessID;
    }
    let applyForMove = this.listProccessCbx.filter(
      (x) => x.recID == processID
    )[0]?.applyFor;
    return applyForMove !== this.process.applyFor;
  }
  moveProcessBack(data) {
    this.dataSelected = data;
    let isOpenForm = false;
    let processID = '';
    if (data.status === '3' || data.status === '4') {
      isOpenForm = true;
      processID = this.stepSuccess?.newProcessID;
    } else if (data.status === '5' || data.status == '6') {
      isOpenForm = true;
      processID = this.stepFail?.newProcessID;
    }
    if (isOpenForm && processID !== this.guidEmpty) {
      let applyForMove = this.listProccessCbx.filter(
        (x) => x.recID == processID
      )[0]?.applyFor;
      if (applyForMove != this.process.applyFor) {
        this.addMoveProcess(processID, applyForMove, '', data.title, 'add');
      }
    }
  }

  loadKanban() {
    if (!this.kanban) this.kanban = (this.view?.currentView as any)?.kanban;

    let kanban = (this.view?.currentView as any)?.kanban;

    let settingKanban = kanban.kanbanSetting;
    settingKanban.isChangeColumn = true;
    settingKanban.formName = this.view?.formModel?.formName;
    settingKanban.gridViewName = this.view?.formModel?.gridViewName;
    this.api
      .exec<any>('DP', 'ProcessesBusiness', 'GetColumnsKanbanAsync', [
        settingKanban,
        this.dataObj,
      ])
      .subscribe((resource) => {
        if (resource?.columns && resource?.columns.length)
          kanban.columns = resource.columns;
        kanban.kanbanSetting.isChangeColumn = false;
        kanban.dataObj = this.dataObj;
        kanban.loadDataSource(
          kanban.columns,
          kanban.kanbanSetting?.swimlaneSettings,
          false
        );

        kanban.refresh();
        this.kanban = kanban;
      });
  }

  popupPermissions(data) {
    let dialogModel = new DialogModel();
    let formModel = new FormModel();
    formModel.formName = 'CMPermissions';
    formModel.gridViewName = 'grvCMPermissions';
    formModel.entityName = 'CM_Permissions';
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    let obj = {
      data: data,
      title: this.titleAction,
      entityName: this.view.formModel.entityName,
    };
    this.callfc
      .openForm(
        PopupPermissionsComponent,
        '',
        950,
        650,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.view.dataService.update(e?.event, true).subscribe();
          this.detectorRef.detectChanges();
        }
      });
  }
}
