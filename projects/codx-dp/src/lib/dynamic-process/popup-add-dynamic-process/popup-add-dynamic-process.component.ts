import {
  DP_Steps_Reasons,
  DP_Steps_Roles,
  DP_Steps_TaskGroups_Roles,
  DP_Steps_Tasks,
} from './../../models/models';
import { CodxDpService } from './../../codx-dp.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PopupJobComponent } from './step-task/popup-step-task/popup-step-task.component';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  CallFuncService,
  SidebarModel,
  Util,
  NotificationsService,
  FormModel,
  CacheService,
  AuthStore,
  CRUDService,
  AlertConfirmInputConfig,
  DialogModel,
  DataRequest,
  CodxService,
  AuthService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { PopupAddCustomFieldComponent } from './popup-add-custom-field/popup-add-custom-field.component';
import {
  DP_Processes,
  DP_Processes_Permission,
  DP_Steps,
  DP_Steps_Fields,
  DP_Steps_TaskGroups,
} from '../../models/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { ViewJobComponent } from './step-task/view-step-task/view-step-task.component';
import { StepTaskGroupComponent } from './step-task/step-task-group/step-task-group.component';
import { PopupRolesDynamicComponent } from '../popup-roles-dynamic/popup-roles-dynamic.component';
import { firstValueFrom, Observable, finalize, map } from 'rxjs';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';
import { CodxApproveStepsComponent } from 'projects/codx-share/src/lib/components/codx-approve-steps/codx-approve-steps.component';
import { CodxTypeTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-type-task/codx-type-task.component';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';

@Component({
  selector: 'lib-popup-add-dynamic-process',
  templateUrl: './popup-add-dynamic-process.component.html',
  styleUrls: ['./popup-add-dynamic-process.component.scss'],
})
export class PopupAddDynamicProcessComponent implements OnInit {
  @ViewChild('status') status: ElementRef;
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;
  @ViewChild('setJobPopup') setJobPopup: TemplateRef<any>;
  @ViewChild('addGroupJobPopup') addGroupJobPopup: TemplateRef<any>;
  @ViewChild('popupAddStep') popupAddStep: TemplateRef<any>;
  @ViewChild('addReasonPopup') addReasonPopup: TemplateRef<any>;
  @ViewChild('emptyTemplate') emptyTemplate: TemplateRef<any>;
  @ViewChild('autoNumberSetting') autoNumberSetting: any;
  process = new DP_Processes();
  permissions = [];
  dialog: any;
  currentTab = 0; //Bước hiện tại
  processTab = 0; // Tổng bước đã đi qua
  lstParticipants = [];
  newNode: number; //vị trí node mới
  oldNode: number; // Vị trí node cũ
  funcID: any;
  entityName: any;
  isShow = false; //Check mở form
  action = '';
  attachment: any;
  linkAvatar = '';
  vllShare = 'ES014';
  typeShare = '';
  multiple = true;
  showID = true;
  listJobType = [];
  //!--ID SHOW FORM !--//
  general = true;
  role = true;
  settingProcess = true;
  memoProcess = true;
  listCombobox = {};
  //!--ID SHOW FORM !--//

  // create value initialize
  viewStepCrr: string = 'custom';
  titleViewStepCrr: string = '';
  isTurnOnYesSuccess: boolean = false;
  isTurnOnNoSuccess: boolean = true;
  isSwitchReason: boolean = false;
  isTurnOnYesFailure: boolean = false;
  isTurnOnNoFailure: boolean = true;
  listRoleInStep: DP_Processes_Permission[] = [];
  userPermissions: DP_Processes_Permission[] = [];
  stepReaSuccess: DP_Steps_Reasons = new DP_Steps_Reasons();
  stepReaFail: DP_Steps_Reasons = new DP_Steps_Reasons();
  stepFail: DP_Steps = new DP_Steps();
  stepSuccess: DP_Steps = new DP_Steps();
  gridViewSetupStep: any;
  gridViewSetupStepReason: any;
  listDayoff: any;
  popupAddReason: DialogRef;
  reasonList: DP_Steps_Reasons[] = [];
  reason: DP_Steps_Reasons = new DP_Steps_Reasons();
  listCbxProccess: any;

  titleCheckBoxSat: string = '';
  titleCheckBoxSun: string = '';
  valueCheckBoxSat: string = '';
  valueCheckBoxSun: string = '';
  checkedSat: boolean = false;
  checkedSun: boolean = false;
  isClick: boolean = false;
  stepNameSuccess: string = '';
  stepNameFail: string = '';
  stepNameReason: string = '';
  reasonName: string = '';
  reasonId: string = '';
  dataValueview: string = '';
  reasonAction: any;
  totalInstance: number = 0;
  titleRadioYes: string = '';
  titleRadioNo: string = '';
  noteSuccess: string = '';
  noteFail: string = '';
  noteResult: string = '';
  isUpdatePermiss = false;
  systemProcess: string = '0'; //0 từ process, 1 - từ quy trình mặc định, 2 - từ dynamic form
  // const value string
  readonly strEmpty: string = '';
  readonly viewStepCustom: string = 'custom';
  readonly viewStepReasonSuccess: string = 'reasonSuccess';
  readonly viewStepReasonFail: string = 'reasonFail';
  readonly radioYes: string = 'yes';
  readonly radioNo: string = 'no';
  readonly viewSaturday: string = '7';
  readonly viewSunday: string = '8';
  readonly formNameSteps: string = 'DPSteps';
  readonly gridViewNameSteps: string = 'grvDPSteps';
  readonly formNameStepReason: string = 'DPStepsReasons';
  readonly gridViewNameStepsReason: string = 'grvDPStepsReasons';
  readonly formDurationCtrl: string = 'DurationControl';
  readonly formLeaTimeCtrl: string = 'LeadtimeControl';
  readonly formStepsRoleCtrl: string = 'StepsRoleCtrl';
  readonly formTaskRoleCtrl: string = 'TaskRoleCtrl';
  readonly formEdit: string = 'edit'; // form edit for poup reason
  readonly formAdd: string = 'add'; // form add for poup reason
  readonly fieldCbxProccess = { text: 'processName', value: 'recID' };
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  dayMax: any;
  dayOld: any;
  textDay: any;

  // for hour
  hourMax: any;
  hourOld: any;
  textHour: any;

  //stage-nvthuan
  user: any;
  userId: string;
  taskGroup: DP_Steps_TaskGroups;
  step: DP_Steps; //data step dc chọn
  stepNew: DP_Steps; //data step dc chọn
  stepEdit: DP_Steps; //data step dc chọn
  stepList: DP_Steps[] = []; //danh sách step
  taskList: DP_Steps_Tasks[] = [];
  taskGroupList: DP_Steps_TaskGroups[] = [];
  roleGroupTaskOld: DP_Steps_Roles[] = [];
  grvStep: FormModel;
  grvTaskGroups: FormModel;
  grvMoreFunction: FormModel;
  formGroup: FormGroup;
  popupJob: DialogRef;
  popupGroupJob: DialogRef;
  popupAddStage: DialogRef;
  listFileTask: string[] = [];
  listIconReason = [];
  iconReasonSuccess: any;
  iconReasonFail: any;

  listStepAdd = [];
  listStepDelete = [];
  listStepEdit = [];
  listStepDrop = [];

  dayStep = 0;
  hourStep = 0;
  isContinues = false;
  refValue = 'DP018';
  gridViewSetup: any;
  userGroupJob = [];
  listTypeTask = [];
  nameStage = '';
  isAddStage = true;
  headerText = '';
  headerFiedName = '';
  groupTaskID = null;
  stepRoleOld: any;
  typeTask: any;
  actionStep = '';
  isSaveStep = false;
  processNameBefore = '';
  strDay = '';
  strHour = '';
  noteDay = '';
  noteHour = '';
  headerStep = {
    add: ['Thêm Giai Đoạn', 'headerAddStep'],
    edit: ['Sửa giai đoạn', 'headerEditStep'],
  };
  headerTextStepName = '';
  //end stage-nvthuan
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    delete: true,
  };
  //data test Thao
  isChange = false;
  formModelField: FormModel;
  formModelGroup: FormModel;
  fieldCrr: DP_Steps_Fields;
  stepOfFields: any;
  isHover = '';
  vllType = 'DP022';
  dataChild = [];
  instanceNoEx: string = '';
  listTemp = [];
  tempCrr: any;
  type = 'excel';
  request = new DataRequest();
  optionEx = new DataRequest();
  optionWord = new DataRequest();
  services = 'DP';
  idField = 'RecID';
  service: string = 'SYS';
  assemblyName: string = 'AD';
  className: string = 'ExcelTemplatesBusiness';
  method: string = 'GetByEntityAsync';
  submitted = false;
  moreFunction = [
    {
      id: 'edit',
      icon: 'icon-edit',
      text: 'Chỉnh sửa',
      textColor: '#307CD2',
    },
    {
      id: 'delete',
      icon: 'icon-delete',
      text: 'Xóa',
      textColor: '#F54E60',
    },
  ];
  dataEx = [];
  dataWord = [];
  active = '1';
  exportGroup: FormGroup;
  recIDCategory = ''; //recID khi sinh categoryES
  //end data Test
  isShowstage = true;
  titleAdd = '';
  objectIDRoles: any;
  titleDefaultCF = '';
  instanceNoSetting = '';
  listClickedCoppy: any;
  titleAction: any;
  oldIdProccess: any;
  newIdProccess: any;
  listValueCopy: any;
  adAutoNumber: any;
  vllDateFormat: any;
  lstGroup = [];
  checkGroup = true;
  errorMessage = '';
  listPermissions: any;
  listPermissionsSaved: any;
  lstTmp: DP_Processes_Permission[] = [];
  listStepApproverView = []; //view thôi ko có quyền gì cả
  listStepApprover: any;
  listStepApproverDelete = [];
  viewApproverStep: any;
  languages: any;
  toolTipSetting: any = '';
  poper: any;
  colorDefault = '';
  themeDatas = {
    default: '#005DC7',
    orange: '#f15711',
    sapphire: '#009384',
    green: '#0f8633',
    purple: '#5710b2',
    navy: '#192440',
  };
  isEditReason = false;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private dpService: CodxDpService,
    private authStore: AuthStore,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private codxService: CodxService,

    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.user = this.authStore.get();
    this.languages = this.auth.userValue?.language?.toLowerCase();
    this.entityName = this.dialog.formModel.entityName;
    this.systemProcess = dt?.data?.systemProcess ?? '0';
    this.action = dt?.data?.action;
    this.showID = dt?.data?.showID;

    this.userId = this.user?.userID;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.titleAction = dt?.data?.titleAction;
    this.lstGroup = dt?.data?.lstGroup;
    //copy
    this.listClickedCoppy = dt?.data?.conditionCopy;
    this.oldIdProccess = dt?.data?.oldIdProccess;
    this.newIdProccess = dt?.data?.newIdProccess;
    this.listValueCopy = dt?.data?.listValueCopy;

    this.formModelField = JSON.parse(JSON.stringify(dialog.formModel));
    this.formModelField.formName = 'DPStepsFields';
    this.formModelField.gridViewName = 'grvDPStepsFields';
    this.formModelField.entityName = 'DP_Steps_Fields';
    this.formModelField.funcID = 'DPT0301';

    this.process =
      this.systemProcess == '0'
        ? JSON.parse(JSON.stringify(dialog.dataService.dataSelected))
        : JSON.parse(JSON.stringify(dt?.data?.data));

    this.cache.moreFunction('CoDXSystem', null).subscribe((mf) => {
      if (mf) {
        let mfAdd = mf.find((f) => f.functionID == 'SYS01');
        if (mfAdd) this.titleAdd = mfAdd?.customName;
      }
    });
    this.cache.functionList('DPT03').subscribe((fun) => {
      if (fun) {
        this.titleDefaultCF = fun.customName || fun.description;
      }
    });
    this.loadDefault();
  }

  async ngOnInit() {
    this.loading();
    this.formModelGroup = await this.getFormModel('DPS0105');
  }

  async loading(): Promise<void> {
    //Tạo formGroup
    this.exportGroup = this.formBuilder.group({
      dataExport: ['all', Validators.required],
      format: ['excel', Validators.required],
    });
    this.grvMoreFunction = await this.getFormModel('DPT040102');
    this.grvStep = await this.getFormModel('DPS0103');
    this.getTitleStepViewSetup();
    this.initForm();
    this.checkedDayOff(this.step?.excludeDayoff);
    if (this.action != 'add' && this.action != 'copy') {
      this.getStepByProcessID();
    }
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
    this.cache
      .gridViewSetup(this.grvStep?.formName, this.grvStep?.gridViewName)
      .subscribe((res) => {
        this.headerTextStepName = res['StepName']['headerText'];
      });
    this.getTypeTask();
    // document.addEventListener("keydown", this.handleKeyDown);
  }

  loadDefault() {
    this.getGrvStep();
    this.getGrvStepReason();
    this.getValListDayoff();
    // this.autoHandleStepReason();
    this.loadCbxProccess();
    this.getVllFormat();
    this.getIconReason();
    this.getValueYesNo();
    this.getValueDayHour();

    //action form
    switch (this.action) {
      case 'add':
        if (this.lstGroup != null && this.lstGroup.length > 0) {
          this.process.groupID = this.lstGroup[0].groupID;
        }
        this.process.autoName =
          this.languages == 'vn' ? 'Nhiệm vụ' : 'Instance';
        this.setDefaultOwner();
        break;
      case 'edit':
        this.loadEx();
        this.loadWord();
        this.loadListApproverStep();
        // this.showID = true;
        this.checkGroup = this.lstGroup.some(
          (x) => x.groupID == this.process?.groupID
        );
        this.processNameBefore = this.process?.processName;
        this.permissions = this.process.permissions;
        if (this.permissions.length > 0) {
          let perm = this.permissions.filter((x) => x.roleType == 'P');
          this.lstParticipants = perm;
        }
        this.processTab = 3;
        this.getAvatar(this.process);
        this.instanceNoSetting = this.process.instanceNoSetting;
        break;
      case 'copy':
        this.process.category = '1';
        this.listPermissions = [];
        this.listPermissions = JSON.parse(
          JSON.stringify(this.process.permissions)
        );
        this.process.permissions = [];
        this.instanceNoSetting = this.process.instanceNoSetting;
        let valueListStr = this.listValueCopy.join(';');
        this.getAvatar(this.process);
        if (
          this.listValueCopy.includes('2') &&
          !this.listValueCopy.includes('3')
        ) {
          this.process.permissions = this.listPermissions;
          this.permissions = this.process.permissions;
          this.setDefaultOwner();
        }
        if (this.listValueCopy.includes('3')) {
          this.getListStepByProcessIDCopy(
            this.oldIdProccess,
            this.newIdProccess,
            valueListStr
          );
        }
        break;
    }

    let theme = this.auth.userValue.theme.split('|')[0];
    this.colorDefault = this.themeDatas[theme] || this.themeDatas.default;
  }

  ngAfterViewInit(): void {}

  setDefaultOwner() {
    let perm = new DP_Processes_Permission();
    perm.objectID = this.user?.userID;
    perm.objectName = this.user?.userName;
    perm.objectType = '1';
    perm.full = true;
    perm.create = true;
    perm.read = true;
    perm.assign = true;
    perm.edit = true;
    perm.delete = true;
    perm.roleType = 'O';
    this.permissions = this.checkUserPermission(this.permissions, perm);
    this.process.permissions = this.permissions;
  }

  GetListProcessGroups() {
    this.dpService.getListProcessGroups().subscribe((res) => {
      if (res && res.length > 0) {
        this.lstGroup = res;
      }
    });
  }

  //#region setup formModels and formGroup
  async initForm() {
    this.dpService
      .getFormGroup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then(async (fg) => {
        this.formGroup = fg;
      });
  }
  //#endregion
  //#region onSave

  async onSaveNow() {
    let check = await this.checkExitsName();
    if (check) {
      this.notiService.notifyCode('DP021');
      return;
    } else {
      this.onSave();
    }
  }

  async onSave() {
    let check = this.process.permissions.some((x) => x.roleType === 'P');
    if (!check) {
      this.notiService.notifyCode('DP014');
      return;
    }
    if (!this.checkValidStepReason()) {
      return;
    }
    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((res) => {
        // save file
        if (res) {
          this.handlerSave();
        }
      });
    } else {
      this.handlerSave();
    }
  }

  handlerSave() {
    this.addStepsBeforeSave();
    if (this.action == 'add' || this.action == 'copy') {
      if (this.process.applyFor != '0') {
        this.setAutoName(this.process.applyFor);
      }
      this.onAdd();
    } else if (this.action == 'edit') {
      this.onUpdate();
    }
  }

  beforeSave(op) {
    let data = [];
    op.className = 'ProcessesBusiness';
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddProcessAsync';
      data = [this.process, this.recIDCategory];
    } else {
      op.methodName = 'UpdateProcessAsync';
      const listStepDrop = this.convertListStepDrop();
      data = [
        this.process,
        this.recIDCategory,
        this.listStepAdd || [],
        this.listStepEdit || [],
        this.listStepDelete || [],
        listStepDrop || [],
        this.lstTmp,
        this.isUpdatePermiss,
      ];
    }
    op.data = data;
  }

  setAutoName(applyFor) {
    if (this.languages) {
      if (this.languages == 'vn') {
        this.process.autoName =
          applyFor == '1'
            ? 'Cơ hội'
            : applyFor == '2'
            ? 'Sự cố'
            : applyFor == '3'
            ? 'Yêu cầu'
            : applyFor == '4'
            ? 'Hợp đồng'
            : applyFor == '5'
            ? 'Tiềm năng'
            : '';
      } else {
        this.process.autoName =
          applyFor == '1'
            ? 'Deal'
            : applyFor == '2'
            ? 'Case'
            : applyFor == '3'
            ? 'Request'
            : applyFor == '4'
            ? 'Contract'
            : applyFor == '5'
            ? 'Lead'
            : '';
      }
    }
  }

  convertListStepDrop() {
    let listDrop = [];
    if (this.listStepEdit?.length == 0 && this.listStepDelete?.length == 0)
      return this.listStepDrop;
    for (let id of this.listStepDrop) {
      let check = this.listStepEdit.some((idEdit) => idEdit === id);
      let checkDelete = this.listStepDelete.some((idDelete) => idDelete === id);
      if (!check && !checkDelete) {
        listDrop.push(id);
      }
    }
    return listDrop;
  }

  onAdd() {
    if (this.systemProcess == '0') {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe((res) => {
          this.attachment?.clearData();
          this.imageAvatar.clearData();
          if (res) {
            this.dialog.close(res.save);
            this.dpService.upDataApprovalStep(
              this.listStepApprover,
              this.listStepApproverDelete
            );
            // } else {
            //   this.dialog.close();
            //   //xoa Aprover
            //   if (this.recIDCategory) {
            //     this.dpService.removeApprovalStep(this.recIDCategory).subscribe();
            //   }
          }
        });
    } else {
      let data = [this.process, this.recIDCategory];

      this.api
        .execSv<any>(
          'DP',
          'ERM.Business.DP',
          'ProcessesBusiness',
          'AddProcessAsync',
          data
        )
        .subscribe((res) => {
          if (res) {
            this.dpService.upDataApprovalStep(
              this.listStepApprover,
              this.listStepApproverDelete
            );
            if (this.systemProcess == '1')
              this.codxService.navigate('', `shared/settings/CMS`);
            this.dialog.close(res);
            this.notiService.notifyCode('SYS006');
          }
        });
    }
  }

  onUpdate() {
    if (this.systemProcess == '0') {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option))
        .subscribe((res) => {
          this.attachment?.clearData();
          this.imageAvatar.clearData();
          if (res && res.update) {
            this.dpService.upDataApprovalStep(
              this.listStepApprover,
              this.listStepApproverDelete
            );

            (this.dialog.dataService as CRUDService)
              .update(res.update)
              .subscribe();
            res.update.modifiedOn = new Date();

            let isUseSuccess = this.stepSuccess.isUsed;
            let isUseFail = this.stepFail.isUsed;
            let dataCountInstance = [res.update.recID, isUseSuccess, isUseFail];
            this.dpService
              .countInstanceByProccessId(dataCountInstance)
              .subscribe((totalInstance) => {
                if (totalInstance) {
                  res.update.totalInstance = totalInstance;
                  this.dialog.close(res.update);
                } else {
                  res.update.totalInstance = 0;
                  this.dialog.close(res.update);
                }
              });
          }
        });
    } else {
      const listStepDrop = this.convertListStepDrop();
      let data = [
        this.process,
        this.recIDCategory,
        this.listStepAdd || [],
        this.listStepEdit || [],
        this.listStepDelete || [],
        listStepDrop || [],
        this.lstTmp,
        this.isUpdatePermiss,
      ];
      this.api
        .execSv<any>(
          'DP',
          'ERM.Business.DP',
          'ProcessesBusiness',
          'UpdateProcessAsync',
          data
        )
        .subscribe((res) => {
          if (res) {
            this.dpService.upDataApprovalStep(
              this.listStepApprover,
              this.listStepApproverDelete
            );
            if (this.systemProcess == '1')
              this.codxService.navigate('', `shared/settings/CMS`);
            this.dialog.close(res);
            this.notiService.notifyCode('SYS007');
          }
        });
    }
  }

  addStepsBeforeSave() {
    this.addReasonInStep(this.stepList, this.stepSuccess, this.stepFail);
    let stepListSave = JSON.parse(JSON.stringify(this.stepList));
    if (stepListSave.length > 0) {
      stepListSave.forEach((step) => {
        if (step && step['taskGroups']?.length > 0) {
          let index = step['taskGroups']?.findIndex((x) => !x['recID']);
          step['taskGroups']?.splice(index, 1);
          step['taskGroups']?.forEach((element) => {
            delete element['task'];
          });
        }
        let color = this.setColorTestStep(step);
        let background = this.setColorStep(step);
        step.backgroundColor = background;
        step.textColor = color;
        step.iconColor = color;
      });
    }
    this.process['steps'] = stepListSave;
  }

  valueChange(e) {
    if (this.process[e.field] != e.data && !this.isChange) this.isChange = true;
    let value = e.data;
    if (typeof value == 'string') {
      value = value.trim();
    }
    this.process[e.field] = value;
    if (this.action === 'add' || this.action === 'copy') {
      if (this.process.applyFor) {
        this.loadCbxProccess();
      }
    }
    if (e.field === 'groupID') {
      if (!this.process.groupID) {
        this.cache.message('SYS028').subscribe((res) => {
          if (res) this.errorMessage = res.customName || res.defaultName;
          this.checkGroup = false;
        });
      } else {
        this.checkGroup = this.lstGroup.some(
          (x) => x.groupID == this.process.groupID
        );
        if (!this.checkGroup) {
          this.cache.message('DP015').subscribe((res) => {
            if (res) this.errorMessage = res.customName || res.defaultName;
          });
        }
      }
    }
  }

  valueChangeAutoNoCode(e) {
    this.instanceNoSetting = e?.data;
  }
  //#endregion

  closePopup() {
    //dung bat dong bo rjx
    // let x = await firstValueFrom(this.notiService.alertCode('DP013'));
    // if (x?.event?.status == 'Y') {
    //       this.dialog.close();
    // } else return;
    if (!this.isChange && this.action == 'edit') {
      this.isChange =
        this.listStepAdd?.length > 0 ||
        this.listStepEdit?.length > 0 ||
        this.listStepDelete?.length > 0 ||
        this.listStepDrop?.length > 0;
    }
    if (this.isChange) {
      this.notiService.alertCode('DP013').subscribe((e) => {
        if (e?.event?.status == 'Y') {
          if (this.listFileTask?.length > 0) {
            this.dpService
              .deleteFileTask([this.listFileTask])
              .subscribe((rec) => {});
          }
          // if (this.action == 'add' || this.action == 'copy') {
          //   //xoa Aprover hoi lai cach xu ly nay
          //   if (this.recIDCategory) {
          //     this.dpService.removeApprovalStep(this.recIDCategory).subscribe();
          //   }
          // } else {
          //   // if (this.listStepAproveRemove?.length > 0)
          //   //   this.dpService
          //   //     .removeListApprovalStep(this.listStepAproveRemove)
          //   //     .subscribe();
          // }
          //yeu cau doi view ngay 13/06/2023
          if (this.action == 'add' || this.action == 'copy') {
            //xoa Aprover
            this.dpService.removeApprovalStep(this.recIDCategory).subscribe();
            if (this.listStepApproverView?.length > 0)
              this.dpService
                .removeListApprovalStep(this.listStepApproverView)
                .subscribe();
          }

          if (this.systemProcess == '1') {
            this.codxService.navigate('', `shared/settings/CMS`);
          }
          this.dialog.close();
        } else return;
      });
    } else {
      if (this.systemProcess == '1') {
        this.codxService.navigate('', `shared/settings/CMS`);
      }

      this.dialog.close();
    }
  }

  //#region Change Tab
  //Click từng tab - mặc định thêm mới = 0
  clickTab(tabNo) {
    //if (tabNo <= this.processTab && tabNo != this.currentTab) {
    let newNo = tabNo;
    let oldNo = this.currentTab;
    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      if (
        this.process?.processName == null ||
        this.process?.processName.trim() == ''
      ) {
        return;
      }

      // if (
      //   tabNo != 0 &&
      //   this.currentTab == 0 &&
      //   (!this.process.instanceNoSetting ||
      //     (this.process.instanceNoSetting &&
      //       this.process.instanceNoSetting != this.instanceNoSetting))
      // ) {
      //   this.notiService.alertCode('DP009').subscribe((e) => {
      //     let input: any;
      //     if (this.autoNumberSetting.nativeElement) {
      //       let ele = this.autoNumberSetting.nativeElement.querySelectorAll(
      //         'codx-input[type="text"]'
      //       );
      //       if (ele) {
      //         let htmlE = ele[0] as HTMLElement;
      //         input = htmlE.querySelector('input.codx-text') as HTMLElement;
      //       }
      //     }
      //     if (e?.event?.status == 'Y') {
      //       this.updateNodeStatus(oldNo, newNo);
      //       this.currentTab = tabNo;
      //       if (input) {
      //         input.style.removeProperty('border-color', 'red', 'important');
      //       }
      //     } else {
      //       if (input) {
      //         input.focus();
      //         input.style.setProperty('border-color', 'red', 'important');
      //         return;
      //       }
      //     }
      //   });
      // } else {
      //   this.updateNodeStatus(oldNo, newNo);
      //   this.currentTab = tabNo;
      // }

      this.updateNodeStatus(oldNo, newNo);
      this.currentTab = tabNo;
    }
  }
  //#region Open form
  show() {
    this.isShow = !this.isShow;
  }
  //#endregion
  //Setting class status Active
  updateNodeStatus(oldNode: number, newNode: number) {
    let nodes = Array.from(
      (this.status.nativeElement as HTMLElement).childNodes
    );
    let newClassName = (nodes[newNode] as HTMLElement).className;
    switch (newClassName) {
      case 'stepper-item':
        (nodes[newNode] as HTMLElement).classList.add('active');

        break;
      case 'stepper-item approve-disabled':
        (nodes[newNode] as HTMLElement).classList.remove('approve-disabled');
        (nodes[newNode] as HTMLElement).classList.add('approve');
        break;
    }

    let oldClassName = (nodes[oldNode] as HTMLElement).className;
    switch (oldClassName) {
      case 'stepper-item approve':
        (nodes[oldNode] as HTMLElement).classList.remove('approve');
        break;
      case 'stepper-item active':
        (nodes[oldNode] as HTMLElement).classList.remove('active');
        break;
    }
    if (
      oldNode > newNode &&
      this.currentTab == this.processTab &&
      this.action != 'edit'
    ) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }

  async checkExitsName() {
    if (this.processNameBefore.trim() == this.process?.processName.trim()) {
      return false;
    }
    let check = await this.checkExitsProcessName(
      this.process?.processName,
      this.process?.recID
    );
    return check ? true : false;
  }

  //Tiếp tục qua tab
  async continue(currentTab) {
    if (currentTab == 0) {
      let check = await this.checkExitsName();
      if (check) {
        this.notiService.notifyCode('DP021');
        return;
      } else {
        this.processNameBefore = this.process?.processName;
      }
    }
    if (this.currentTab > 2) return;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0:
        if (
          this.process?.groupID == null ||
          this.process?.groupID.trim() == ''
        ) {
          this.checkGroup = false;
          this.cache.message('DP015').subscribe((res) => {
            if (res) this.errorMessage = res.customName || res.defaultName;
          });
          return;
        }

        // if (
        //   !this.process.instanceNoSetting ||
        //   (this.process.instanceNoSetting &&
        //     this.process.instanceNoSetting != this.instanceNoSetting)
        // ) {
        //   this.notiService.alertCode('DP009').subscribe((e) => {
        //     let input: any;
        //     if (this.autoNumberSetting.nativeElement) {
        //       let ele = this.autoNumberSetting.nativeElement.querySelectorAll(
        //         'codx-input[type="text"]'
        //       );
        //       if (ele) {
        //         let htmlE = ele[0] as HTMLElement;
        //         input = htmlE.querySelector('input.codx-text') as HTMLElement;
        //       }
        //     }
        //     if (e?.event?.status == 'Y') {
        //       this.updateNodeStatus(oldNode, newNode);
        //       this.currentTab++;
        //       this.processTab == 0 && this.processTab++;
        //       if (input) {
        //         input.style.removeProperty('border-color', 'red', 'important');
        //       }
        //     } else {
        //       if (input) {
        //         input.focus();
        //         input.style.setProperty('border-color', 'red', 'important');
        //       }
        //       return;
        //     }
        //   });
        // } else {
        //   this.updateNodeStatus(oldNode, newNode);
        //   this.currentTab++;
        //   this.processTab == 0 && this.processTab++;
        // }

        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      case 1:
        if (!this.checkValidStepReason()) {
          return;
        }
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
        this.currentTab++;
        break;
      case 2:
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab++;
        break;
      case 3:
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab++;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  previous(currentTab) {
    let oldNode = currentTab;
    let newNode = oldNode - 1;
    this.updateNodeStatus(oldNode, newNode);
    this.currentTab--;
  }
  saveAndClose() {}

  //#region THÔNG TIN QUY TRÌNH - PHÚC LÀM
  checkContinue() {}
  //Avt
  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }
  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      let countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;
      if (!this.isChange) this.isChange = true;
      this.changeDetectorRef.detectChanges();
    }
  }

  getAvatar(process) {
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'DP_Processes',
      'inline',
      1000,
      process?.processName,
      'avt',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  //end

  //Control share
  sharePerm(share, type) {
    this.listCombobox = {};
    this.multiple = true;
    switch (type) {
      case 'supervisor':
        this.vllShare = 'DP0331';
        this.typeShare = '1';
        this.multiple = true;
        break;
      case 'participants':
        this.vllShare = 'DP0331';
        this.typeShare = '2';
        this.multiple = true;
        break;
      case 'followers':
        this.vllShare = 'DP0332';
        this.typeShare = '3';
        this.multiple = true;
        break;
      case 'participants-2':
        this.vllShare = 'DP0331';
        this.typeShare = '4';
        this.multiple = false;
        this.listCombobox = {
          U: 'Share_Users_Sgl',
          P: 'Share_Positions_Sgl',
          R: 'Share_UserRoles_Sgl',
          D: 'Share_Departments_Sgl',
          O: 'Share_OrgUnits_Sgl',
        };
        break;
      case 'involved':
        this.vllShare = 'DP0331';
        this.typeShare = '5';
        this.multiple = true;
        break;
    }
    this.callfc.openForm(share, '', 420, 600);
  }

  openPopupParticipants(popupParticipants) {
    this.callfc.openForm(popupParticipants, '', 950, 650);
  }

  applyShare(e, type) {
    if (e?.length > 0) {
      if (!this.isChange) this.isChange = true;
      if (!this.isUpdatePermiss) this.isUpdatePermiss = true;
      let value = e;
      switch (type) {
        //Người giám sát
        case '1':
          for (let i = 0; i < value.length; i++) {
            let data = value[i];
            let perm = new DP_Processes_Permission();
            perm.objectName =
              data.text == null && data.text == '' && data.objectType == 'U'
                ? data.dataSelected.EmployeeName
                : ((data.text == null || data.text == '') &&
                    data.objectType == '9') ||
                  data.objectType == '0'
                ? data.objectName
                : data.text;
            perm.objectID = data.id != null || data.id != '' ? data.id : null;
            perm.objectType = data.objectType;
            perm.full = true;
            perm.create = true;
            perm.read = true;
            perm.assign = true;
            perm.edit = true;
            // perm.publish = true;
            perm.delete = true;
            perm.isActive = true;
            perm.roleType = 'O';
            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.process.permissions = this.permissions;
          this.updateStepChange(this.step?.recID);
          break;
        //Người tham gia
        case '2':
          for (let i = 0; i < value.length; i++) {
            let data = value[i];
            let perm = new DP_Processes_Permission();
            perm.objectName =
              data.text == null && data.text == '' && data.objectType == 'U'
                ? data.dataSelected.EmployeeName
                : ((data.text == null || data.text == '') &&
                    data.objectType == '9') ||
                  data.objectType == '0'
                ? data.objectName
                : data.text;
            perm.objectID = data.id != null ? data.id : null;
            perm.objectType = data.objectType;
            perm.roleType = 'P';
            perm.full = false;
            perm.read = true;
            perm.create = true;
            perm.assign = false;
            perm.edit = false;
            perm.isActive = true;

            // perm.publish = false;
            perm.delete = false;

            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.lstParticipants = this.permissions.filter(
            (x) => x.roleType == 'P'
          );
          this.process.permissions = this.permissions;
          this.updateStepChange(this.step?.recID);
          break;
        //Người theo dõi
        case '3':
          for (let i = 0; i < value.length; i++) {
            let data = value[i];
            let perm = new DP_Processes_Permission();
            perm.objectName =
              data.text == null && data.text == '' && data.objectType == 'U'
                ? data.dataSelected.EmployeeName
                : ((data.text == null || data.text == '') &&
                    data.objectType == '9') ||
                  data.objectType == '0'
                ? data.objectName
                : data.text;
            perm.objectID = data.id != null ? data.id : null;
            perm.objectType = data.objectType;
            perm.roleType = 'F';
            perm.full = false;
            perm.read = true;
            perm.create = false;
            perm.assign = false;
            perm.edit = false;
            perm.isActive = true;
            // perm.publish = false;
            perm.delete = false;
            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.process.permissions = this.permissions;
          this.updateStepChange(this.step?.recID);
          break;
        //Người giám sát giai đoạn
        case '4':
          let tmpRole = [];
          for (let i = 0; i < value.length; i++) {
            let data = value[i];
            let roles = new DP_Steps_Roles();
            roles.objectName =
              data.text == null && data.text == '' && data.objectType == 'U'
                ? data.dataSelected.EmployeeName
                : ((data.text == null || data.text == '') &&
                    data.objectType == '9') ||
                  data.objectType == '0'
                ? data.objectName
                : data.text;
            roles.objectID = data.id != null ? data.id : null;
            roles.objectType = data.objectType;
            roles.roleType = 'S';
            tmpRole = this.checkRolesStep(this.step.roles, roles);
            let perm = new DP_Processes_Permission();
            perm.objectName =
              data.text == null && data.text == '' && data.objectType == 'U'
                ? data.dataSelected.EmployeeName
                : ((data.text == null || data.text == '') &&
                    data.objectType == '9') ||
                  data.objectType == '0'
                ? data.objectName
                : data.text;
            perm.objectID = data.id != null ? data.id : null;
            perm.objectType = data.objectType;
            perm.roleType = 'P';
            perm.full = false;
            perm.read = true;
            perm.create = true;
            perm.assign = false;
            perm.isActive = true;
            perm.edit = false;
            // perm.publish = false;
            perm.delete = false;
            this.permissions = this.checkUserPermissionPar(
              this.permissions,
              perm
            );
          }
          this.step.roles = tmpRole;
          this.process.permissions = this.permissions;
          this.updateStepChange(this.step?.recID);
          break;
        //Người liên quan
        case '5':
          value.forEach((element) => {
            let role = {
              objectID: element.id,
              objectName: element.text,
              objectType: element.objectType,
              roleType: 'R',
            };
            this.addRole(role);
          });
          this.updateStepChange(this.step?.recID);
          break;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  eventUser(event) {
    let tmpRole = [];
    let roles = new DP_Steps_Roles();
    roles.objectID = event.id;
    roles.objectName = event.name;
    roles.objectType = event.type;
    roles.roleType = 'S';
    tmpRole = this.checkRolesStep(this.step.roles, roles);
    if (!this.isChange) this.isChange = true;
    if (!this.isUpdatePermiss) this.isUpdatePermiss = true;
    this.step.roles = tmpRole;
  }

  checkUserPermission(
    listPerm: DP_Processes_Permission[],
    perm: DP_Processes_Permission
  ) {
    let index = -1;
    if (listPerm != null) {
      if (perm != null && listPerm.length > 0) {
        index = listPerm.findIndex(
          (x) =>
            (x.objectID != null &&
              x.objectID === perm.objectID &&
              x.roleType == perm.roleType) ||
            (x.objectID == null &&
              x.objectType == perm.objectType &&
              x.roleType == perm.roleType)
        );
      }
    } else {
      listPerm = [];
    }

    if (index == -1) {
      listPerm.push(Object.assign({}, perm));
    }

    return listPerm;
  }

  checkUserPermissionPar(
    listPerm: DP_Processes_Permission[],
    perm: DP_Processes_Permission
  ) {
    let index = -1;
    if (listPerm != null) {
      if (perm != null && listPerm.length > 0) {
        index = listPerm.findIndex(
          (x) =>
            (x.objectID != null &&
              x.objectID === perm.objectID &&
              x.roleType == perm.roleType) ||
            (x.objectID == null &&
              x.objectType == perm.objectType &&
              x.roleType == perm.roleType)
        );
      }
    } else {
      listPerm = [];
    }
    let count = 0;
    let i = this.lstParticipants.filter(
      (x) => x.objectID == this.stepRoleOld?.objectID && x.roleType == 'P'
    );
    let check = -1;
    if (this.stepRoleOld != null) {
      count = this.countRoleSteps(this.stepRoleOld?.objectID);
      check = listPerm.findIndex(
        (x) => x.objectID == this.stepRoleOld?.objectID && x.roleType == 'P'
      );
    }

    if (index == -1) {
      if (i.length == 0) {
        if (count == 0) {
          if (check > -1) {
            listPerm.splice(check, 1);
          }
        }
      }
      listPerm.push(Object.assign({}, perm));
    } else {
      if (i.length == 0) {
        if (count == 0) {
          if (check > -1) {
            listPerm.splice(check, 1);
          }
        }
      }
    }
    return listPerm;
  }

  checkRolesStep(listPerm: DP_Steps_Roles[], perm: DP_Steps_Roles) {
    let index = -1;
    let indexOld = -1;
    if (listPerm != null) {
      if (perm != null && listPerm.length > 0) {
        index = listPerm.findIndex(
          (x) => x.objectID == perm.objectID && x.roleType == 'S'
        );

        this.stepRoleOld = listPerm.filter((x) => x.roleType == 'S')[0];
        if (this.stepRoleOld)
          indexOld = listPerm.findIndex(
            (x) => x.objectID == this.stepRoleOld?.objectID && x.roleType == 'S'
          );
      }
    } else {
      listPerm = [];
    }
    if (this.stepRoleOld != null || this.stepRoleOld == '') {
    }
    if (index == -1) {
      if (indexOld > -1) listPerm.splice(indexOld, 1);
      listPerm.push(Object.assign({}, perm));
    }
    return listPerm;
  }

  checkRoleType(lst = []) {
    return lst.filter((x) => x.roleType == 'S').map((x) => x.objectID)[0];
  }

  removeUser(index) {
    let config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        let i = -1;
        let tmp = this.process.permissions[index];
        let checkDelete = this.lstTmp?.some(
          (x) => x.objectID == tmp.objectID && x.roleType == 'F'
        );

        i = this.lstParticipants.findIndex(
          (x) => x.objectID === this.process.permissions[index].objectID
        );
        if (this.process.permissions[index].roleType === 'P') {
          let check = this.countRoleSteps(
            this.process.permissions[index].objectID
          );
          if (check > 0) {
            this.notiService.alertCode('DP011').subscribe((res) => {
              if (res.event.status == 'Y') {
                for (let i = 0; i < this.stepList.length; i++) {
                  let roles = this.stepList[i].roles;
                  for (let j = 0; j < roles.length; j++) {
                    if (
                      roles[j].objectID ==
                        this.process.permissions[index].objectID &&
                      roles[j].roleType == 'S'
                    ) {
                      roles.splice(j, 1);
                      j--;
                    }
                  }
                }
                this.process.permissions.splice(index, 1);
                if (!checkDelete) {
                  if (tmp.roleType != 'F') this.lstTmp.push(tmp);
                }
                if (i > -1) {
                  this.lstParticipants.splice(i, 1);
                }
              }
            });
          } else {
            this.process.permissions.splice(index, 1);
            if (!checkDelete) {
              if (tmp.roleType != 'F') this.lstTmp.push(tmp);
            }
            if (i > -1) {
              this.lstParticipants.splice(i, 1);
            }
          }
        } else {
          this.process.permissions.splice(index, 1);
          if (!checkDelete) {
            if (tmp.roleType != 'F') this.lstTmp.push(tmp);
          }
          if (i > -1) {
            this.lstParticipants.splice(i, 1);
          }
        }
        if (!this.isChange) this.isChange = true;
        if (!this.isUpdatePermiss) this.isUpdatePermiss = true;

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  removeRole(objectID: any) {
    let config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        let i = 0;
        i = this.countRoleSteps(objectID);
        let check = this.lstParticipants.filter((x) => x.objectID == objectID);
        let indexPerm = this.process.permissions.findIndex(
          (x) => x.objectID == objectID && x.roleType == 'P'
        );
        let index = this.step.roles.findIndex(
          (x) => x.objectID == objectID && x.roleType == 'S'
        );
        if (index > -1) {
          this.step.roles.splice(index, 1);
          if (check.length == 0) {
            if (i <= 1) {
              if (indexPerm != -1) {
                this.process.permissions.splice(indexPerm, 1);
                if (!this.isUpdatePermiss) this.isUpdatePermiss = true;
              }
            }
          }
          this.updateStepChange(this.step?.recID);
        }
      }
    });
  }

  countRoleSteps(objectID) {
    let count = 0;
    for (let i = 0; i < this.stepList.length; i++) {
      let roles = this.stepList[i].roles;
      for (let j = 0; j < roles.length; j++) {
        if (roles[j].objectID == objectID && roles[j].roleType == 'S') {
          count++;
        }
      }
    }
    return count;
  }

  checkAssignRemove(i) {
    if (
      this.user.userID == this.process.permissions[i].objectID &&
      this.process.permissions[i].roleType == 'O'
    )
      return false;
    return true;
  }

  addFile(e) {
    this.attachment.uploadFile();
  }

  //Popup roles process
  clickRoles(roleType) {
    let title = this.gridViewSetup?.Permissions?.headerText;
    let formModel = new FormModel();
    formModel.formName = 'DPProcessesPermissions';
    formModel.gridViewName = 'grvDPProcessesPermissions';
    formModel.entityName = 'DP_Processes_Permissions';
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 999;
    dialogModel.FormModel = formModel;
    let dialog = this.callfc.openForm(
      PopupRolesDynamicComponent,
      '',
      950,
      650,
      '',
      [this.process, title, this.action === 'copy' ? 'copy' : 'add', roleType],
      '',
      dialogModel
    );

    dialog.closed.subscribe((e) => {
      if (e?.event && e?.event.length > 0) {
        if (!this.isChange) this.isChange = true;
        this.process.permissions = e.event;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  valueRadioInfo($event, view) {
    if (view === 'AllowCopyView') {
      if ($event.field === 'yes' && $event.component.checked === true) {
        this.process.allowCopy = true;
      } else if ($event.field == 'no' && $event.component.checked === true) {
        this.process.allowCopy = false;
      }
    } else if (view === 'ApproveRuleView') {
      if ($event.field === 'yes' && $event.component.checked === true) {
        this.process.approveRule = true;
      } else if ($event.field == 'no' && $event.component.checked === true) {
        this.process.approveRule = false;
      }
    }
  }

  //end
  //#endregion THÔNG TIN QUY TRÌNH - PHÚC LÀM ------------------------------------------------------------------ >>>>>>>>>>

  //Popup setiing autoNumber - Thao lam dung sua Please
  async openAutoNumPopup() {
    // if (!this.instanceNoSetting || this.instanceNoSetting.trim() == '') {
    //   if (this.autoNumberSetting.nativeElement) {
    //     let ele = this.autoNumberSetting.nativeElement.querySelectorAll(
    //       'codx-input[type="text"]'
    //     );
    //     if (ele) {
    //       let htmlE = ele[0] as HTMLElement;
    //       let input = htmlE.querySelector('input.codx-text') as HTMLElement;
    //       if (input) input.focus();
    //     }
    //   }
    //   return;
    // }

    //view new
    if (!this.process?.processNo) {
      this.process.processNo = await firstValueFrom(
        this.dpService.genAutoNumber(this.funcID, this.entityName, 'ProcessNo')
      );
    }
    this.instanceNoSetting = this.process.processNo;

    let obj = {};
    if (!this.process?.instanceNoSetting) {
      //save new autoNumber
      obj = {
        autoNoCode: this.instanceNoSetting,
        description: 'DP_Instances',
        newAutoNoCode: this.instanceNoSetting,
        isSaveNew: '1',
      };
    } else {
      //cap nhật
      obj = {
        autoNoCode: this.instanceNoSetting,
        description: 'DP_Instances',
      };
    }
    let op = new DialogModel();
    op.IsFull = true;
    let popupAutoNum = this.callfc.openForm(
      PopupAddAutoNumberComponent,
      '',
      0,
      0,
      '',
      obj,
      '',
      op
    );
    popupAutoNum.closed.subscribe((res) => {
      if (res?.event) {
        if (
          this.process.instanceNoSetting != res?.event?.autoNoCode &&
          !this.isChange
        )
          this.isChange = true;
        this.process.instanceNoSetting = res?.event?.autoNoCode;
        this.setViewAutoNumber(res?.event);

        //bo canh bao
        // let input: any;
        // if (this.autoNumberSetting.nativeElement) {
        //   let ele = this.autoNumberSetting.nativeElement.querySelectorAll(
        //     'codx-input[type="text"]'
        //   );
        //   if (ele) {
        //     let htmlE = ele[0] as HTMLElement;
        //     input = htmlE.querySelector('input.codx-text') as HTMLElement;
        //   }
        //   if (input) {
        //     input.style.removeProperty('border-color', 'red', 'important');
        //   }
        // }
      }
    });
  }

  setViewAutoNumber(data) {
    if (this.vllDateFormat?.datas.length > 0) {
      let dateFormat = '';
      if (data?.dateFormat != '0') {
        dateFormat =
          this.vllDateFormat.datas.filter((p) => p.value == data?.dateFormat)[0]
            ?.text ?? '';
      }

      let lengthNumber;
      let strNumber = '';
      this.instanceNoEx = data?.fixedString + data?.separator + dateFormat;
      lengthNumber = data?.maxLength - this.instanceNoEx.length;
      strNumber = '#'.repeat(lengthNumber);
      switch (data?.stringFormat) {
        // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
        case '0': {
          this.instanceNoEx =
            data?.fixedString + dateFormat + data?.separator + strNumber;
          break;
        }
        // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
        case '1': {
          this.instanceNoEx =
            data?.fixedString + strNumber + data?.separator + dateFormat;
          break;
        }
        // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
        case '2':
          this.instanceNoEx =
            strNumber + data?.separator + data?.fixedString + dateFormat;
          break;
        // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
        case '3':
          this.instanceNoEx =
            strNumber + data?.separator + dateFormat + data?.fixedString;
          break;

        // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
        case '4': {
          this.instanceNoEx =
            dateFormat + data?.separator + strNumber + data?.fixedString;
          break;
        }
        // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
        case '5': {
          this.instanceNoEx = data?.fixedString + dateFormat;
          lengthNumber = data?.maxLength - this.instanceNoEx.length;
          strNumber = '#'.repeat(lengthNumber);
          this.instanceNoEx = dateFormat + data?.fixedString + strNumber;
          break;
        }
        // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
        case '6': {
          this.instanceNoEx = data?.fixedString + data?.separator + dateFormat;
          break;
        }
        // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
        case '7': {
          this.instanceNoEx = dateFormat + data?.separator + data?.fixedString;
          break;
        }
      }

      this.instanceNoEx = this.instanceNoEx.substring(0, data?.maxLength);
      this.changeDetectorRef.detectChanges();
    }
  }

  async getVllFormat() {
    this.vllDateFormat = await firstValueFrom(this.cache.valueList('L0088'));
    if (!this.adAutoNumber && this.action != 'add') {
      if (this.process.instanceNoSetting) {
        this.adAutoNumber = await firstValueFrom(
          this.dpService.getADAutoNumberByAutoNoCode(
            this.process.instanceNoSetting
          )
        );
        if (this.adAutoNumber) this.setViewAutoNumber(this.adAutoNumber);
      }
    }
  }

  //Setting gửi duyệt
  async clickSettingApprove() {
    let category;
    if (this.action == 'edit')
      category = await firstValueFrom(
        this.dpService.getESCategoryByCategoryID(this.process.processNo)
      );
    if (category) {
      //this.actionOpenFormApprove(category.recID);
      this.actionOpenFormApprove2(category);
    } else {
      //let transID = Util.uid();
      // this.actionOpenFormApprove(transID);
      this.api
        .execSv<any>('ES', 'Core', 'DataBusiness', 'GetDefaultAsync', [
          'ESS22',
          'ES_Categories',
        ])
        .subscribe(async (res) => {
          if (res && res?.data) {
            if (!this.process.processNo) {
              this.process.processNo = await firstValueFrom(
                this.dpService.genAutoNumber(
                  this.funcID,
                  this.entityName,
                  'ProcessNo'
                )
              );
            }
            category = res.data;
            category.recID = res?.recID ?? Util.uid();
            category.eSign = false;
            category.Category = 'DP_Processes';
            category.categoryID = this.process.processNo;
            category.categoryName = this.process.processName;
            category.createdBy = this.user.userID;
            category.owner = this.user.userID;
            category.FunctionApproval = 'DP01';
            this.actionOpenFormApprove2(category, true);
          }
        });
    }
  }

  actionOpenFormApprove(transID) {
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    let data = {
      transID: transID,
      type: '0',
      isRequestListStep: true,
      lstStep: this.listStepApprover,
    };

    let popupApprover = this.callfc.openForm(
      CodxApproveStepsComponent,
      '',
      screen.width,
      screen.height,
      '',
      data,
      '',
      dialogModel
    );
    popupApprover.closed.subscribe((res) => {
      if (res?.event) {
        if (!this.isChange) this.isChange = true;
        this.listStepApprover = res?.event?.listStepApprover;
        this.listStepApproverDelete = res?.event?.listStepApproverDelete;
        this.listStepApproverView = this.listStepApprover;
        this.getUserByApproverStep(res?.event?.listStepApprover);
        this.recIDCategory = transID;
      } else this.recIDCategory = '';
    });
  }

  getUserByApproverStep(listStepApprover) {
    if (listStepApprover?.length > 0) {
      let listAppover = [];
      listStepApprover.forEach((x) => {
        listAppover = listAppover.concat(x.approvers);
      });
      //Hoi khanh xu ly thế nào
      console.log(listAppover);
    }
  }
  //lay danh sách view
  loadListApproverStep() {
    this.dpService
      .getListAproverStepByCategoryID(this.process.processNo)
      .subscribe((res) => {
        if (res) {
          this.listStepApproverView = res;
        }
      });
  }
  popoverApproverStep(p, data) {
    if (!data) {
      p.close();
      return;
    }
    if (p.isOpen()) p.close();
    this.viewApproverStep = data;
    p.open();
  }
  //Bieu mau
  clickViewTemp(temp) {}
  onScroll(e: any) {}

  navChanged(e: any) {
    switch (e?.nextId) {
      case '1': {
        this.type = 'excel';
        break;
      }
      case '2': {
        this.type = 'word';
        break;
      }
    }
    // this.exportGroup.controls['format'].setValue(id);
  }
  openFormTemplet(val: any, data: any) {
    switch (val) {
      case 'add':
      case 'edit': {
        let option = new DialogModel();
        option.FormModel = this.dialog.formModel;
        option.DataService = data;
        this.callfc
          .openForm(
            CodxExportAddComponent,
            null,
            900,
            700,
            null,
            {
              action: val,
              type: this.type,
              refID: this.process.recID,
              refType: 'DP_Processes',
            },
            '',
            option
          )
          .closed.subscribe((item) => {
            if (item.event && item.event.length > 0) {
              let typeR = item.event[1];
              if (typeR == 'excel') {
                if (val == 'add') this.loadEx();
                else if (val == 'edit') {
                  let index = this.dataEx.findIndex(
                    (x) => x.recID == item.event[0]?.recID
                  );
                  if (index >= 0) {
                    this.dataEx[index] = item.event[0];
                  }
                }
              } else if (typeR == 'word') {
                if (val == 'add') this.loadWord();
                else if (val == 'edit') {
                  let index = this.dataWord.findIndex(
                    (x) => x.recID == item.event[0]?.recID
                  );
                  if (index >= 0) {
                    this.dataWord[index] = item.event[0];
                  }
                }
              }
            }
          });
        break;
      }
      case 'delete': {
        let config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
        //SYS003
        this.notiService.alertCode('SYS003').subscribe((x) => {
          if (x.event.status == 'Y') {
            let method =
              this.type == 'excel' ? 'AD_ExcelTemplates' : 'AD_WordTemplates';
            this.api
              .execActionData<any>(method, [data], 'DeleteAsync')
              .subscribe((item) => {
                if (item[0] == true) {
                  this.notiService.notifyCode('SYS008');
                  if (this.type == 'excel')
                    this.dataEx = this.dataEx.filter(
                      (x) => x.recID != item[1][0].recID
                    );
                  else if (this.type == 'word')
                    this.dataWord = this.dataWord.filter(
                      (x) => x.recID != item[1][0].recID
                    );
                } else this.notiService.notifyCode('SYS022');
              });
          }
        });
        break;
      }
    }
  }
  loadEx() {
    this.request.predicate = 'RefID=@0 && RefType=@1';
    this.request.dataValue = this.process.recID + ';DP_Processes';
    this.request.entityName = 'AD_ExcelTemplates';
    this.className = 'ExcelTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataEx = item;
    });
  }
  loadWord() {
    this.request.predicate = 'RefID=@0 && RefType=@1';
    this.request.dataValue = this.process.recID + ';DP_Processes';
    this.request.entityName = 'AD_WordTemplates';
    this.className = 'WordTemplatesBusiness';
    this.fetch().subscribe((item) => {
      this.dataWord = item;
    });
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
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
  //#region Trường tùy chỉnh
  clickShow(e, id) {
    let children = e.currentTarget.children[0];
    let element = document.getElementById(id);
    if (element) {
      let isClose = element.classList.contains('hidden-main');
      let isShow = element.classList.contains('show-main');
      if (isClose) {
        children.classList.add('icon-expand_less');
        children.classList.remove('icon-expand_more');
        element.classList.remove('hidden-main');
        element.classList.add('show-main');
      } else if (isShow) {
        element.classList.remove('show-main');
        element.classList.add('hidden-main');
        children.classList.remove('icon-expand_less');
        children.classList.add('icon-expand_more');
      }
    }
  }

  //add trường tùy chỉnh
  changeMFFields(e, item) {
    //bi gọi 2 lần
    var arEvent = this.uniqueMore(e);
    if (arEvent?.length == e?.length) return;
    e.forEach((x, index) => {
      if (index >= arEvent?.length) {
        x.disabled = true;
      }
    });
  }

  uniqueMore(arr) {
    var newArr = [];
    newArr = arr.filter(function (item) {
      return newArr.some((x) => x.functionID == item.functionID)
        ? ''
        : newArr.push(item);
    });
    return newArr;
  }

  clickMFFields(e, data, enabled) {
    console.log(e.functionID);
    switch (e.functionID) {
      case 'SYS02':
        this.deleteCustomField(data);
        break;
      case 'SYS03':
        this.editCustomField(data, e.text, enabled);
        break;
      case 'SYS04':
        this.copyCustomField(data, e.text, enabled);
        break;
    }
  }

  addCustomField(stepID, processID, enabled) {
    this.cache.gridView('grvDPStepsFields').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
        .subscribe((res) => {
          this.fieldCrr = new DP_Steps_Fields();
          this.fieldCrr.stepID = stepID;
          this.fieldCrr.processID = processID;
          this.fieldCrr.isRequired = false;
          this.fieldCrr.rank = 5;

          let option = new SidebarModel();
          option.FormModel = this.formModelField;
          option.Width = '550px';
          option.zIndex = 1010;
          let object = {
            field: this.fieldCrr,
            action: 'add',
            titleAction:
              this.titleAdd +
              ' ' +
              this.titleDefaultCF.charAt(0).toLocaleLowerCase() +
              this.titleDefaultCF.slice(1),
            stepList: this.stepList,
            grvSetup: res,
            enabled: enabled,
          };
          let dialogCustomField = this.callfc.openSide(
            PopupAddCustomFieldComponent,
            object,
            option
          );
          dialogCustomField.closed.subscribe((e) => {
            if (e && e.event != null) {
              //xu ly data đổ về
              this.fieldCrr = e.event;
              this.fieldCrr.sorting = this.step.fields.length + 1;
              // if (this.step.recID == this.fieldCrr.stepID) {
              //   this.step.fields.push(this.fieldCrr);
              // }
              this.stepList.forEach((x) => {
                if (x.recID == this.fieldCrr.stepID) {
                  x.fields.push(this.fieldCrr);
                  if (this.action == 'edit') {
                    let check = this.listStepEdit.some((id) => id == x?.recID);
                    if (!check) {
                      this.listStepEdit.push(x?.recID);
                    }
                  }
                }
              });
              if (!this.isChange) this.isChange = true;
              this.changeDetectorRef.detectChanges();
            }
          });
        });
    });
  }

  copyCustomField(field, textTitle, enabled) {
    this.fieldCrr = field;
    this.cache.gridView('grvDPStepsFields').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
        .subscribe((res) => {
          let option = new SidebarModel();
          option.FormModel = this.formModelField;
          option.Width = '550px';
          option.zIndex = 1010;
          let object = {
            field: this.fieldCrr,
            action: 'copy',
            titleAction:
              textTitle +
              ' ' +
              this.titleDefaultCF.charAt(0).toLocaleLowerCase() +
              this.titleDefaultCF.slice(1),
            stepList: this.stepList,
            grvSetup: res,
            enabled: enabled,
          };
          let dialogCustomField = this.callfc.openSide(
            PopupAddCustomFieldComponent,
            object,
            option
          );
          dialogCustomField.closed.subscribe((e) => {
            if (e && e.event != null) {
              //xu ly data đổ về
              this.fieldCrr = e.event;
              this.fieldCrr.sorting = this.step.fields.length;
              this.stepList.forEach((x) => {
                if (x.recID == this.fieldCrr.stepID) {
                  x.fields.push(this.fieldCrr);
                  if (this.action == 'edit') {
                    let check = this.listStepEdit.some((id) => id == x?.recID);
                    if (!check) {
                      this.listStepEdit.push(x?.recID);
                    }
                  }
                }
              });
              this.changeDetectorRef.detectChanges();
            }
          });
        });
    });
  }

  editCustomField(field, textTitle, enabled) {
    let oldStepID = field?.stepID;
    this.fieldCrr = field;
    this.cache.gridView('grvDPStepsFields').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
        .subscribe((res) => {
          let option = new SidebarModel();
          option.FormModel = this.formModelField;
          option.Width = '550px';
          option.zIndex = 1010;
          let object = {
            field: this.fieldCrr,
            action: 'edit',
            titleAction:
              textTitle +
              ' ' +
              this.titleDefaultCF.charAt(0).toLocaleLowerCase() +
              this.titleDefaultCF.slice(1),
            stepList: this.stepList,
            grvSetup: res,
            enabled: enabled,
          };
          let dialogCustomField = this.callfc.openSide(
            PopupAddCustomFieldComponent,
            object,
            option
          );
          dialogCustomField.closed.subscribe((e) => {
            if (e && e.event != null) {
              //xu ly data đổ về
              this.fieldCrr = e.event;
              if (oldStepID == this.fieldCrr.stepID) {
                this.stepList.forEach((obj) => {
                  if (obj.recID == this.fieldCrr.stepID) {
                    let index = obj.fields.findIndex(
                      (x) => x.recID == this.fieldCrr.recID
                    );
                    if (index != -1) {
                      obj.fields[index] = this.fieldCrr;
                    }
                    if (this.action == 'edit') {
                      let check = this.listStepEdit.some(
                        (id) => id == obj?.recID
                      );
                      if (!check) {
                        this.listStepEdit.push(obj?.recID);
                      }
                    }
                  }
                });
              } else {
                this.stepList.forEach((obj) => {
                  if (obj.recID == oldStepID) {
                    let index = obj.fields.findIndex(
                      (x) => x.recID == this.fieldCrr.recID
                    );
                    if (index != -1) {
                      obj.fields.splice(index, 1);
                    }
                  }
                  if (obj.recID == this.fieldCrr.stepID)
                    obj.fields.push(this.fieldCrr);
                  if (this.action == 'edit') {
                    let check = this.listStepEdit.some(
                      (id) => id == obj?.recID
                    );
                    if (!check) {
                      this.listStepEdit.push(obj?.recID);
                    }
                  }
                });
              }

              this.changeDetectorRef.detectChanges();
            }
          });
        });
    });
  }

  deleteCustomField(field) {
    this.fieldCrr = field;
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        // this.step.fields.splice(field.sorting - 1, 1);
        // this.step.fields.forEach((x) => {
        //   if (x.sorting > field.sorting) x.sorting = x.sorting - 1;
        // });
        this.stepList.forEach((obj) => {
          if (obj.recID == this.fieldCrr.stepID) {
            obj.fields.splice(field.sorting - 1, 1);
            obj.fields.forEach((x) => {
              if (x.sorting > field.sorting) x.sorting = x.sorting - 1;
            });
            if (this.action == 'edit') {
              let check = this.listStepEdit.some((id) => id == obj?.recID);
              if (!check) {
                this.listStepEdit.push(obj?.recID);
              }
            }
          }
        });
        // if(!this.isChange) this.isChange=true ;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  changeRequired(e, field) {
    this.fieldCrr = field;
    this.fieldCrr.isRequired = e.data;
    if (this.step.recID == this.fieldCrr.stepID) {
      let index = this.step.fields.findIndex(
        (x) => x.recID == this.fieldCrr.recID
      );
      if (index != -1) {
        this.step.fields[index] = this.fieldCrr;
      }
    }
    this.stepList.forEach((obj) => {
      if (obj.recID == this.fieldCrr.stepID) {
        let index = obj.fields.findIndex((x) => x.recID == this.fieldCrr.recID);
        if (index != -1) {
          obj.fields[index] = this.fieldCrr;
        }
      }
    });

    if (this.action == 'edit') {
      let check = this.listStepEdit.some((id) => id == this.fieldCrr?.stepID);
      if (!check) {
        this.listStepEdit.push(this.fieldCrr?.stepID);
      }
    }
  }
  popoverSelectView(p, data) {
    if (this.poper && this.poper.isOpen()) this.poper.close();
    this.stepOfFields = data;
    p.open();
    this.poper = p;
  }
  selectView(showColumnControl) {
    this.stepList.forEach((x) => {
      if (x.recID == this.stepOfFields.recID)
        x.showColumnControl = showColumnControl;
    });
    //this.changeDetectorRef.detectChanges();
  }

  dropFields(event: CdkDragDrop<string[]>, recID) {
    if (event.previousIndex == event.currentIndex) return;
    let crrIndex = this.stepList.findIndex((x) => x.recID == recID);
    if (crrIndex == -1) return;
    this.dataChild = this.stepList[crrIndex].fields;
    if (this.action == 'edit') {
      let check = this.listStepEdit.some((id) => id == recID);
      if (!check) {
        this.listStepEdit.push(recID);
      }
    }
    moveItemInArray(this.dataChild, event.previousIndex, event.currentIndex);
    this.changeDetectorRef.detectChanges();
  }

  checkBackground(i) {
    if (this.isHover == i) return true;
    return false;
  }
  dropCustomFile(event: CdkDragDrop<string[]>, stepID) {
    if (event.previousContainer === event.container) {
      this.dropFields(event, stepID);
    } else {
      this.dropFieldsToStep(event, stepID);
    }
  }
  dropFieldsToStep(event, stepID) {
    let stepIDContain = event.container.id;
    let stepIDPrevious = event.previousContainer.id;
    if (stepIDContain[0] == 'v' && stepIDContain[1] == '-') {
      stepIDContain = stepIDContain.substring(2);
    }

    if (stepIDPrevious[0] == 'v' && stepIDPrevious[1] == '-') {
      stepIDPrevious = stepIDPrevious.substring(2);
    }
    // let data = event.item?.data;
    if (this.action == 'edit') {
      let check = this.listStepEdit.some((id) => id == stepIDContain);
      if (!check) {
        this.listStepEdit.push(stepIDContain);
      }
    }
    if (this.action == 'edit') {
      let check = this.listStepEdit.some((id) => id == stepIDPrevious);
      if (!check) {
        this.listStepEdit.push(stepIDPrevious);
      }
    }

    event.item.data.stepID = stepIDContain;

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
  //#endregion

  //#Step - taskGroup - task -- nvthuan
  getStepByProcessID() {
    let data = this.process?.steps;
    if (data) {
      this.editTest(data);
      data.forEach((step) => {
        if (!step['isSuccessStep'] && !step['isFailStep']) {
          const taskGroupList = step?.tasks.reduce((group, product) => {
            const { taskGroupID } = product;
            group[taskGroupID] = group[taskGroupID] ?? [];
            group[taskGroupID].push(product);
            return group;
          }, {});
          const taskGroupConvert = step['taskGroups'].map((taskGroup) => {
            let task = taskGroupList[taskGroup['recID']] ?? [];
            return {
              ...taskGroup,
              task: task.sort((a, b) => a['indexNo'] - b['indexNo']),
            };
          });
          step['taskGroups'] = taskGroupConvert;

          if (step['taskGroups']?.length > 0 || step['tasks']?.length > 0) {
            let taskGroup = new DP_Steps_TaskGroups();
            taskGroup['task'] =
              taskGroupList['null']?.sort(
                (a, b) => a['indexNo'] - b['indexNo']
              ) || [];
            taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
            step['taskGroups'].push(taskGroup);
          }
          this.stepList.push(step);
        }
      });
      this.stepList.sort((a, b) => a['stepNo'] - b['stepNo']);
      this.viewStepSelect(this.stepList[0]); // gán listStep[0] cho step
    }
  }

  copyStep(step) {
    let stepCopy = JSON.parse(JSON.stringify(step));
    stepCopy['recID'] = Util.uid();
    stepCopy['stepNo'] = this.stepList.length + 1;
    stepCopy['createdOn'] = new Date();
    stepCopy['createdBy'] = this.userId;
    stepCopy['modifiedOn'] = null;
    stepCopy['modifiedBy'] = null;
    let taskCopy = [];
    // copy groups and tasks
    if (stepCopy['taskGroups']?.length > 0) {
      stepCopy['taskGroups'].forEach((groupTask) => {
        groupTask['recID'] = groupTask['recID'] ? Util.uid() : null;
        groupTask['stepID'] = this.step['recID'];
        groupTask['createdOn'] = new Date();
        groupTask['createdBy'] = this.userId;
        groupTask['modifiedOn'] = null;
        groupTask['modifiedBy'] = null;
        groupTask['roles']?.forEach((role) => {
          role['recID'] = Util.uid();
          role['taskGroupID'] = groupTask['recID'];
        });
        if (groupTask['task']?.length > 0) {
          groupTask['task'].forEach((task) => {
            task['recID'] = Util.uid();
            task['stepID'] = this.step['recID'];
            task['taskGroupID'] = groupTask['recID'];
            task['createdOn'] = new Date();
            task['createdBy'] = this.userId;
            task['parentID'] = '';
            task['modifiedOn'] = null;
            task['modifiedBy'] = null;
            task['roles']?.forEach((role) => {
              role['recID'] = Util.uid();
              role['taskID'] = task['recID'];
            });
            taskCopy.push(task);
          });
        }
      });
    }
    // copy fields
    if (stepCopy['fields']?.length > 0) {
      stepCopy['fields']?.forEach((fields) => {
        fields['recID'] = Util.uid();
        fields['stepID'] = stepCopy['recID'];
        fields['createdOn'] = new Date();
        fields['createdBy'] = this.userId;
        fields['modifiedOn'] = null;
        fields['modifiedBy'] = null;
      });
    }

    stepCopy['tasks'] = taskCopy;
    this.openPopupStep('copy', stepCopy);
  }

  changeNameStep(event, data) {
    // this.stepName = event?.data;
    data[event?.field] = event?.data;
  }

  changeProgress(e, data) {
    data.instanceProgress = e?.value ? e?.value : 0;
  }
  openPopupStep(type, step?: DP_Steps) {
    this.actionStep = type;
    this.isSaveStep = false;
    this.isEditReason = false;
    if (type === 'add') {
      this.stepNew = null;
      let countStep = this.stepList?.length || 0;
      this.stepNew = new DP_Steps();
      this.stepNew['processID'] = this.process?.recID;
      this.stepNew['stepNo'] = countStep + 1;
      this.stepNew['createdBy'] = this.userId;
      this.stepNew['instanceProgress'] =
        this.stepList[countStep - 1]?.instanceProgress || 0;
      this.stepNew['iconColor'] = '#808080';
      this.stepNew['textColor'] = '#808080';
      this.stepNew['backgroundColor'] = '#fff';
    } else if (type === 'copy') {
      this.stepNew = step;
    } else {
      this.stepNew = JSON.parse(JSON.stringify(step));
      this.stepEdit = step;
    }
    this.popupAddStage = this.callfc.openForm(this.popupAddStep, '', 500, 550);
  }

  saveStep() {
    if (
      this.actionStep !== 'edit' ||
      this.stepEdit['stepName']?.trim() != this.stepNew?.stepName?.trim()
    ) {
      let isRepeatName = this.checkStepName(this.stepNew);
      if (isRepeatName) {
        this.notiService.notifyCode('DP029', 0, this.headerTextStepName);
        return;
      }
    }
    this.isSaveStep = true;
    if (!this.stepNew?.stepName.trim()) {
      this.notiService.notifyCode('SYS009', 0, this.headerTextStepName);
      this.isSaveStep = false;
      return;
    }
    if (this.actionStep == 'add' || this.actionStep == 'copy') {
      // this.stepNew['stepName'] = this.stepName;
      this.stepList.push(JSON.parse(JSON.stringify(this.stepNew)));
      this.viewStepSelect(this.stepList[this.stepList?.length - 1 || 0]);
      if (this.action == 'edit') {
        this.listStepAdd.push(this.stepNew.recID);
      }
    } else {
      this.stepEdit['backgroundColor'] = this.stepNew['backgroundColor'];
      this.stepEdit['textColor'] = this.stepNew?.textColor;
      this.stepEdit['icon'] = this.stepNew?.icon;
      this.stepEdit['iconColor'] = this.stepNew?.iconColor;
      this.stepEdit['stepName'] = this.stepNew?.stepName;
      this.stepEdit['instanceProgress'] = this.stepNew?.instanceProgress;
      this.stepEdit['modifiedOn'] = new Date();
      this.stepEdit['modifiedBy'] = this.userId;
      if (this.action == 'edit' && this.stepNew.recID) {
        this.listStepEdit.push(this.stepNew.recID);
      }
      if (this.step?.recID == this.stepEdit?.recID) {
        this.titleViewStepCrr = this.stepEdit?.stepName;
      }
    }
    this.popupAddStage.close();
    // this.isSaveStep = false;
  }

  checkStepName(stepCheck): boolean {
    if (stepCheck?.stepName) {
      let nameCheck = stepCheck?.stepName?.toLocaleLowerCase()?.trim();
      if (this.stepList?.length > 0 && nameCheck) {
        let check = this.stepList?.some(
          (step) =>
            step.stepName?.toLocaleLowerCase()?.trim() == nameCheck &&
            step?.recID != stepCheck?.recID
        );
        return check;
      }
    }
    return false;
  }

  async deleteStep(data) {
    let check = await firstValueFrom(
      this.dpService.checkExitsInstancesStep([data.recID])
    );
    if (check) {
      this.notiService.alertCode('DP008').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.handelDeleteStep(data);
        } else {
          return;
        }
      });
    } else {
      this.notiService.alertCode('SYS030').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.handelDeleteStep(data);
        }
      });
    }
  }

  handelDeleteStep(data) {
    let id = data['recID'] || '';
    let stepNo = data['stepNo'];
    let index = this.stepList.findIndex((step) => step.recID == id);
    if (index >= 0) {
      let stepDelete = JSON.parse(JSON.stringify(this.stepList[index]));
      this.stepList.splice(index, 1);
      this.setIndex(this.stepList, 'stepNo');
      this.viewStepSelect(
        this.stepList.length > 0
          ? this.stepList[this.stepList?.length - 1 || 0]
          : []
      );

      if (stepDelete?.taskGroups?.length > 0) {
        stepDelete?.taskGroups?.forEach((group) => {
          if (group?.roles?.length > 0) {
            group?.roles?.forEach((role) => {
              this.deleteRoleInProcess(role, 'O');
            });
          }
        });
      }

      if (stepDelete?.tasks?.length > 0) {
        stepDelete?.tasks?.forEach((task) => {
          if (task?.roles?.length > 0) {
            task?.roles?.forEach((role) => {
              this.deleteRoleInProcess(role, 'O');
            });
          }
        });
      }
      // cập nhật thay đổi
      if (this.action == 'edit') {
        let index = this.listStepAdd.findIndex((stepID) => stepID == id);
        if (index >= 0) {
          this.listStepAdd.splice(index, 1);
        } else {
          this.listStepDelete.push(id);
          let listIDEdit = this.stepList
            ?.filter((step) => step.stepNo >= stepNo)
            ?.map((stepFind) => {
              return stepFind.recID;
            });
          if (listIDEdit?.length > 0) {
            listIDEdit.forEach((id) => {
              let check = this.listStepAdd?.some((step) => step == id);
              if (!check) {
                this.listStepEdit.push(id);
              }
            });
          }
        }
      }
    }
  }
  //taskGroup
  async openTaskGroup(data?: any, type?: string) {
    let taskGroup = new DP_Steps_TaskGroups();
    let timeStep = this.dayStep * 24 + this.hourStep;
    let differenceTime = this.getHour(this.step) - timeStep;
    if (data) {
      this.roleGroupTaskOld = JSON.parse(JSON.stringify(data?.roles)) || [];
      taskGroup = JSON.parse(JSON.stringify(data));
      if (type === 'copy') {
        taskGroup['recID'] = null;
      }
    } else {
      this.roleGroupTaskOld = [];
      taskGroup['createdBy'] = this.userId;
      taskGroup['stepID'] = this.step['recID'];
      taskGroup['task'] = [];
      taskGroup['durationDay'] = 1;
    }
    this.popupGroupJob = this.callfc.openForm(
      StepTaskGroupComponent,
      '',
      500,
      500,
      '',
      {
        taskGroup: taskGroup,
        differenceTime,
        step: this.step,
        form: this.formModelGroup,
      }
    );
    this.popupGroupJob.closed.subscribe((res) => {
      if (res?.event && res?.event?.taskGroupName) {
        this.saveGroupTask(type, taskGroup, data);
        // check the change of step
        let check = this.listStepEdit.some((id) => id == data?.stepID);
        if (!check && data?.stepID) {
          this.listStepEdit.push(data?.stepID);
        }
      }
    });
  }

  async saveGroupTask(type: string, taskGroup, taskGroupOld) {
    this.popupGroupJob.close();
    if (taskGroup['roles']?.length == 0) {
      let role = new DP_Steps_TaskGroups_Roles();
      await this.setRole(role);
      taskGroup['roles'] = [role];
    }
    // create a new
    if (!taskGroup['recID']) {
      taskGroup['recID'] = Util.uid();
      taskGroup?.roles.forEach((role) => {
        role['taskGroupID'] = taskGroup['recID'];
      });
      let index = this.taskGroupList.length;
      if (type === 'copy' && taskGroup['task'].length > 0) {
        if (index === 0) {
          let taskGroupNull = new DP_Steps_TaskGroups();
          taskGroupNull['task'] = [];
          taskGroupNull['recID'] = null; // group task rỗng để kéo ra ngoài
          this.taskGroupList.push(taskGroupNull);
        }
        for (let task of taskGroup['task']) {
          task['recID'] = Util.uid();
          task['taskGroupID'] = taskGroup['recID'];
          task['createdOn'] = new Date();
          task['createdBy'] = this.userId;
          task['roles'].forEach((role) => {
            role['recID'] = Util.uid();
            role['taskID'] = task['recID'];
          });
          this.taskList.push(task);
        }
      }
      taskGroup['indexNo'] = index + 1;
      let isGroupNull = this.taskGroupList?.some(
        (taskGroup) => !taskGroup?.recID
      );
      if (isGroupNull) {
        // nếu có group rỗng thì thêm sau nó
        this.taskGroupList.splice(index - 1, 0, taskGroup);
      } else {
        this.taskGroupList.push(taskGroup);
      }

      this.sumTimeStep();
      // add role vào step
      this.addRole(taskGroup['roles'][0]);
    } else {
      taskGroup['modifiedOn'] = new Date();
      taskGroup['modifiedBy'] = this.userId;
      let index = this.taskGroupList?.findIndex(
        (x) => x.recID === taskGroup.recID
      );
      if (index >= 0) {
        this.taskGroupList.splice(index, 1, taskGroup);
      }
      if (
        taskGroup?.roles[0]['objectID'] != this.roleGroupTaskOld[0]['objectID']
      ) {
        this.addRole(taskGroup['roles'][0], this.roleGroupTaskOld[0]);
      }
      this.sumTimeStep();
    }
    this.updateStepChange(taskGroup?.stepID);
  }

  deletepGroupTask(data) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        let index = this.taskGroupList.findIndex(
          (step) => step.recID == data.recID
        );
        if (index >= 0) {
          this.taskGroupList.splice(index, 1);
          this.sumTimeStep();
        }
        for (let i = 0; i < this.taskList.length; ) {
          if (this.taskList[i]['taskGroupID'] === data['recID']) {
            const task = JSON.parse(JSON.stringify(this.taskList[i]));
            this.taskList.splice(i, 1);
            if (task?.roles?.length > 0) {
              task?.roles.forEach((role) => {
                this.deleteRoleInstep(this.step, role);
                this.deleteRoleInProcess(role, role?.roleType);
              });
            }
          } else {
            i++;
          }
        }
        let check = this.listStepEdit.some((id) => id == data?.stepID);
        if (!check && data?.stepID) {
          this.listStepEdit.push(data?.stepID);
        }

        if (data?.roles?.length > 0) {
          data?.roles.forEach((role) => {
            this.deleteRoleInstep(this.step, role);
            this.deleteRoleInProcess(role, role?.roleType);
          });
        }
        this.updateStepChange(data?.stepID);
      }
    });
  }

  //Task -- nvthuan
  openPopupChooseTask() {
    this.popupJob = this.callfc.openForm(CodxTypeTaskComponent, '', 450, 580);
    this.popupJob.closed.subscribe(async (value) => {
      if (value?.event && value?.event['value']) {
        if (value?.event['value'] == 'G') {
          this.openTaskGroup();
        } else {
          this.typeTask = value?.event;
          this.handleTask('add');
        }
      }
    });
  }

  handleTask(action: string, data?: any) {
    let roleOld;
    let taskGroupIdOld = '';
    let taskInput = {};
    if (action === 'add') {
      this.popupJob.close();
    } else if (action === 'copy') {
      taskInput = JSON.parse(JSON.stringify(data));
    } else {
      taskGroupIdOld = data['taskGroupID'];
      roleOld = JSON.parse(JSON.stringify(data['roles']));
      taskInput = JSON.parse(JSON.stringify(data));
    }

    let dataInput = {
      action,
      typeTask: this.typeTask,
      taskInput,
      step: this.step,
      listGroup: this.taskGroupList,
      listTask: this.taskList,
      groupTaskID: this.groupTaskID,
      listFileTask: this.listFileTask,
    };
    let functionID = 'DPT0206'; //id tuy chojn menu ne
    this.cache.functionList(functionID).subscribe((f) => {
      this.cache
        .gridViewSetup(f.formName, f.gridViewName)
        .subscribe(async (grv) => {
          let option = new SidebarModel();
          let formModel = this.dialog?.formModel;
          formModel.formName = f.formName;
          formModel.gridViewName = f.gridViewName;
          formModel.entityName = f.entityName;
          formModel.funcID = functionID;
          option.FormModel = formModel;
          option.Width = '550px';
          option.zIndex = 1001;
          let dialog = this.callfc.openSide(
            PopupJobComponent,
            dataInput,
            option
          );
          dialog.closed.subscribe((e) => {
            if (e?.event) {
              let taskData = e?.event?.data;
              if (e.event?.status === 'add' || e.event?.status === 'copy') {
                this.addTassk(taskData);
              } else {
                this.editTask(taskData, taskGroupIdOld, roleOld);
              }
              let check = this.listStepEdit.some(
                (id) => id == taskData?.stepID
              );
              if (!check && taskData?.stepID) {
                this.listStepEdit.push(taskData?.stepID);
              }
              this.sumTimeStep();
              this.changeDetectorRef.detectChanges();
            }
          });
          this.groupTaskID = null;
        });
    });
  }

  addTassk(taskData) {
    let index = this.taskGroupList.findIndex(
      (group) => group.recID == taskData.taskGroupID
    );
    if (
      this.taskGroupList?.length == 0 ||
      (index < 0 && !this.taskGroupList?.some((group) => !group.recID))
    ) {
      let taskGroupNull = new DP_Steps_TaskGroups();
      taskGroupNull['task'] = [taskData];
      taskGroupNull['recID'] = null; // group task rỗng để kéo ra ngoài
      this.taskGroupList.push(taskGroupNull);
    } else {
      this.taskGroupList[index]['task']?.push(taskData);
    }
    this.taskList?.push(taskData);
    taskData['roles']?.forEach((role) => {
      this.addRole(role);
    });
    this.updateStepChange(taskData?.stepID);
  }

  editTask(taskData, taskGroupIdOld, roleOld) {
    let indexTask = this.taskList?.findIndex(
      (task) => task.recID == taskData.recID
    );
    let indexGroup = this.taskGroupList?.findIndex(
      (group) => group.recID == taskData.taskGroupID
    );
    let indexGroupOld =
      taskData?.taskGroupID != taskGroupIdOld
        ? this.taskGroupList?.findIndex(
            (group) => group.recID == taskGroupIdOld
          )
        : -1;
    let indexTaskGroup = this.taskGroupList[indexGroup]['task']?.findIndex(
      (task) => task.recID == taskData.recID
    );

    taskData['modifiedOn'] = new Date();
    taskData['modifiedBy'] = this.userId;

    if (indexGroupOld >= 0) {
      let indexTaskGroupOld = this.taskGroupList[indexGroupOld][
        'task'
      ]?.findIndex((task) => task.recID == taskData.recID);
      this.taskGroupList[indexGroupOld]['task']?.splice(indexTaskGroupOld, 1);
      this.taskGroupList[indexGroup]['task']?.push(taskData);
    } else {
      this.taskGroupList[indexGroup]['task']?.splice(
        indexTaskGroup,
        1,
        taskData
      );
    }
    this.taskList.splice(indexTask, 1, taskData);

    taskData['roles']?.forEach((role, index) => {
      this.addRole(taskData['roles'][index], roleOld[index]);
    });

    this.updateStepChange(taskData?.stepID);
  }

  deleteTask(taskList, task) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        // delete view
        let indexView = taskList.findIndex(
          (taskGroup) => taskGroup.recID == task.recID
        );
        if (indexView >= 0) {
          taskList.splice(indexView, 1);
        }
        this.setIndex(taskList, 'indexNo');
        let indexDb = this.taskList.findIndex(
          (taskFind) => taskFind.recID == task.recID
        );
        if (indexDb >= 0) {
          this.taskList.splice(indexDb, 1);
        }
        this.sumTimeStep();

        if (task?.roles?.length > 0) {
          task?.roles.forEach((role) => {
            this.deleteRoleInstep(this.step, role);
            this.deleteRoleInProcess(role, role?.roleType);
          });
        }
        this.updateStepChange(task?.stepID);
      }
    });
  }

  updateStepChange(stepID, isChangeTime = false) {
    if (stepID) {
      let checkEdit = this.listStepEdit?.some((id) => id == stepID);
      let checkAdd = this.listStepAdd?.some((id) => id == stepID);
      let checkDelete = this.listStepDelete?.some((id) => id == stepID);

      if (!checkEdit && !checkAdd && !checkDelete) {
        this.listStepEdit.push(stepID);
      }
      let step = this.stepList.find((x) => x.recID == stepID);
      if (step) {
        let listDrop = this.stepList.filter((x) => x.stepNo > step.stepNo);
        if (listDrop?.length > 0) {
          listDrop.forEach((stepDrop) => {
            let check = this.listStepDrop.some((id) => stepDrop.recID == id);
            if (!check) {
              this.listStepDrop.push(stepDrop.recID);
            }
          });
        }
      }
    }
  }

  changeGroupTaskOfTask(taskData, taskGroupIdOld) {
    let tastClone = JSON.parse(JSON.stringify(taskData));
    let indexNew = this.taskGroupList.findIndex(
      (group) => group.recID == taskData.taskGroupID
    );
    let index = this.taskGroupList.findIndex(
      (group) => group.recID == taskGroupIdOld
    );
    let listTaskOld = this.taskGroupList[index]['task'] || [];
    let listTaskNew = this.taskGroupList[indexNew]['task'] || [];

    listTaskNew.push(tastClone);
    listTaskOld.forEach((element, i) => {
      if (element?.taskGroupID !== taskGroupIdOld) {
        this.taskGroupList[index]['task'].splice(i, 1);
      }
    });

    this.setIndex(listTaskOld, 'indexNo');
    this.setIndex(listTaskNew, 'indexNo');
  }
  // More function
  clickMFTask(e: any, taskList?: any, task?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(taskList, task);
        break;
      case 'SYS03':
        this.typeTask = this.listJobType?.find(
          (type) => type.value == task.taskType
        );
        this.handleTask('edit', task);
        break;
      case 'SYS04':
        this.typeTask = this.listJobType?.find(
          (type) => type.value == task.taskType
        );
        this.handleTask('copy', task);
        break;
      case 'DP07':
        this.typeTask = task.taskType;
        this.viewTask(task);
        break;
    }
  }

  clickMFTaskGroup(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deletepGroupTask(data);
        break;
      case 'SYS03':
        this.openTaskGroup(data);
        break;
      case 'SYS04':
        this.openTaskGroup(data, 'copy');
        break;
      case 'DP08':
        this.groupTaskID = data?.recID;
        this.openPopupChooseTask();
        break;
      case 'DP12':
        this.viewTask(data, 'G');
        break;
    }
  }

  clickMFStep(e: any, data: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteStep(data);
        break;
      case 'SYS03':
        this.openPopupStep('edit', data);
        break;
      case 'SYS04':
        this.copyStep(data);
        break;
    }
  }

  async changeDataMF(e, type, step?) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02':
          case 'SYS03':
          case 'SYS04':
            if (step && (step?.isSuccessStep || step?.isFailStep)) {
              res.disabled = true;
            }
            break;
          case 'DP12':
            if (type != 'group') res.disabled = true;
            break;
          case 'DP08':
            if (type != 'group') res.disabled = true;
            break;
          case 'DP07':
            if (type == 'group' || type == 'step') res.disabled = true;
            break;
          case 'DP13':
            res.disabled = true;
            break;
          case 'DP25':
          case 'DP20':
          case 'DP24':
          case 'DP26':
          case 'DP27':
          case 'SYS003':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          case 'DP31':
          case 'DP30':
          case 'DP29':
          case 'DP28':
            res.disabled = true;
            break;
        }
      });
    }
  }

  // drop
  async drop(event: CdkDragDrop<string[]>, data = null, isGroup = false) {
    if (event.previousContainer === event.container) {
      // kéo ở trong
      if (event.previousIndex == event.currentIndex) return;
      if (data && isGroup) {
        moveItemInArray(data, event.previousIndex, event.currentIndex);
        this.setIndex(data, 'indexNo');
      } else {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.setIndex(event.container.data, 'indexNo');
      }
    } else {
      // kéo ra ngoài
      let groupTaskIdOld = '';
      let dataDrop = event.previousContainer.data[event.previousIndex];
      if (data['recID']) {
        let maxHour = this.calculateTimeTaskInGroup(
          event.container.data,
          dataDrop['recID'],
          dataDrop
        );
        if (this.getHour(data) < maxHour) {
          let check = await this.setTimeGroup(data, dataDrop, maxHour);
          if (!check) {
            return;
          }
        }
      }

      if (event.previousContainer.data.length > 0) {
        //
        groupTaskIdOld =
          event.previousContainer.data[event.previousIndex]['taskGroupID'];
        dataDrop['taskGroupID'] = data?.recID;
      }
      if (data?.recID) {
        dataDrop['parentID'] = '';
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.setIndex(event.previousContainer.data, 'indexNo');
      this.setIndex(event.container.data, 'indexNo');
      let check = this.listStepEdit.some((id) => id == dataDrop['stepID']);
      if (!check && dataDrop['stepID']) {
        this.listStepEdit.push(dataDrop['stepID']);
      }
    }
  }

  dropStep(event: CdkDragDrop<string[]>) {
    if (event.previousIndex == event.currentIndex) return;
    moveItemInArray(this.stepList, event.previousIndex, event.currentIndex);
    this.setIndex(this.stepList, 'stepNo');
    let start =
      event.previousIndex < event.currentIndex
        ? event.previousIndex + 1
        : event.currentIndex + 1;
    let end =
      event.previousIndex > event.currentIndex
        ? event.previousIndex + 1
        : event.currentIndex + 1;
    let listID = this.stepList
      ?.filter((step) => step.stepNo >= start)
      .map((stepFind) => {
        return stepFind.recID;
      });

    if (listID?.length > 0) {
      listID?.forEach((id) => {
        let checkAdd = this.listStepAdd?.some((idAdd) => idAdd == id);
        let checkEdit = this.listStepDrop?.some((idDrop) => idDrop == id);
        if (!checkAdd && !checkEdit) {
          this.listStepDrop.push(id);
        }
      });
    }
  }

  // Common
  deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    let newObj = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
      newObj[key] = this.deepCopy(obj[key]);
    }
    return newObj;
  }
  setIndex(data: any, value: string) {
    if (data.length > 0) {
      data.forEach((item, index) => {
        item[value] = index + 1;
      });
    }
  }

  getHour(data) {
    let hour =
      Number(data['durationDay'] || 0) * 24 + Number(data['durationHour'] || 0);
    return hour;
  }

  viewStepSelect(step) {
    this.viewStepCrr = this.viewStepCustom;
    if (step) {
      this.titleViewStepCrr = step?.stepName || '';
      this.isSwitchReason = false;
      this.step = step;
      this.checkedDayOff(this.step?.excludeDayoff);
      this.taskGroupList = this.step['taskGroups'];
      this.taskList = this.step['tasks'];
      this.sumTimeStep();
    }
  }

  checkSaveNow() {
    let checkGroup = this.lstGroup?.some(
      (x) => x.groupID == this.process?.groupID
    );
    return (
      this.process.processName?.trim() &&
      this.process?.groupID &&
      checkGroup &&
      this.stepList?.length > 0
    );
  }

  checkButtonContinue() {
    if (this.currentTab == 0) {
      return (
        this.process.processName &&
        this.process.processName.trim() != '' &&
        this.process?.groupID &&
        this.checkGroup
      );
    } else {
      return this.stepList?.length > 0;
    }
  }

  setRole<T>(role: T) {
    role['recID'] = Util.uid();
    role['objectName'] = this.user['userName'];
    role['objectID'] = this.user['userID'];
    role['roleType'] = 'P';
    role['createdOn'] = new Date();
    role['createdBy'] = this.user['userID'];
    return role;
  }

  sumTimeStep() {
    let timeGroup = this.sumHourGroupTask();
    let timeTackNoGroup = 0;
    let taskNoGroup = this.taskList?.filter((task) => !task['taskGroupID']);
    taskNoGroup?.forEach((task) => {
      let time = this.calculateTimeTaskNoGroup(task['recID']);
      timeTackNoGroup = Math.max(time, timeTackNoGroup);
    });
    let timeMax = Math.max(timeGroup, timeTackNoGroup);
    this.dayStep = Math.floor(timeMax / 24);
    this.hourStep = Math.floor(timeMax % 24);
  }

  async setTimeGroup(group, task, maxHour) {
    let x = await firstValueFrom(this.notiService.alertCode('DP010'));
    if (x['event'] && x['event']['status'] == 'Y') {
      let time = this.getHour(task) || 0;
      group['durationDay'] = Math.floor(maxHour / 24);
      group['durationHour'] = maxHour % 24;
      let hourStep = this.sumHourGroupTask();
      this.step['durationDay'] = Math.floor(hourStep / 24);
      this.step['durationHour'] = hourStep % 24;
      let parentID = [];
      if (group['task']?.length > 0 && task['parentID'].trim()) {
        group['task'].forEach((item) => {
          if (task['parentID']?.includes(item['recID'])) {
            parentID.push(item['recID']);
          }
        });
      }
      task['parentID'] = parentID?.length > 0 ? parentID.join(';') : '';
      return true;
    } else {
      return false;
    }
  }

  calculateTimeTaskNoGroup(taskId) {
    let task = this.taskList.find((t) => t['recID'] === taskId);
    if (!task) return 0;
    if (task['dependRule'] != '1' || !task['parentID']?.trim()) {
      let groupFind = task['taskGroupID']
        ? this.taskGroupList.find((x) => x['recID'] === task['taskGroupID'])
        : null;
      let hourGroup = groupFind
        ? this.sumHourGroupTask(groupFind['indexNo'] - 1)
        : 0;
      return hourGroup + this.getHour(task);
    } else {
      const parentIds = task.parentID.split(';');
      let maxTime = 0;
      parentIds?.forEach((parentId) => {
        const parentTime = this.calculateTimeTaskNoGroup(parentId);
        maxTime = Math.max(maxTime, parentTime);
      });
      const completionTime = this.getHour(task) + maxTime;
      return completionTime;
    }
  }

  calculateTimeTaskInGroup(taskList, taskId, taskInput?) {
    let task = taskInput
      ? taskInput
      : taskList.find((t) => t['recID'] === taskId);
    if (!task) return 0;
    if (task['dependRule'] != '1' || !task['parentID']?.trim()) {
      return this.getHour(task);
    } else {
      const parentIds = task.parentID.split(';');
      let maxTime = 0;
      parentIds?.forEach((parentId) => {
        const parentTime = this.calculateTimeTaskInGroup(taskList, parentId);
        maxTime = Math.max(maxTime, parentTime);
      });
      const completionTime = this.getHour(task) + maxTime;
      return completionTime;
    }
  }

  sumHourGroupTask(index?: number) {
    //tính theo vị trí group và tính tất cả
    let sum = 0;
    if (this.taskGroupList?.length > 0) {
      if (index >= 0) {
        for (let group of this.taskGroupList) {
          if (Number(group['indexNo']) <= index) {
            sum += this.getHour(group);
          }
        }
      } else {
        sum = this.taskGroupList?.reduce((sumHour, group) => {
          return (sumHour += this.getHour(group));
        }, 0);
      }
    }
    return sum;
  }

  getTypeTask() {
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listJobType = res?.datas;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {}

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'F5') {
      // xử lý sự kiện nhấn F5 ở đây
    }
  }

  // add role to permissions process
  addRole(role: object, roleOld?: object) {
    if (role) {
      let roleStep = new DP_Steps_Roles();
      roleStep = {
        ...roleStep,
        ...role,
        roleType: 'R',
        stepID: this.step?.recID,
      };

      let rolePermission = new DP_Processes_Permission();
      rolePermission = {
        ...rolePermission,
        ...role,
        read: true,
        roleType: 'R',
      };

      let checkStep = this.step?.roles?.some(
        (role) =>
          role.objectID == roleStep.objectID &&
          role.roleType == roleStep.roleType
      );
      if (!checkStep) {
        this.step?.roles?.push(roleStep);
      }
      // add the role to the permissions process
      let checkPermissions = this.process['permissions'].some(
        (x) =>
          x.objectID == rolePermission['objectID'] &&
          x.roleType == rolePermission.roleType
      );
      if (!checkPermissions) {
        this.process['permissions'].push(rolePermission);
        if (!this.isUpdatePermiss) this.isUpdatePermiss = true;
      }

      if (roleOld) {
        // kiểm tra user có trong các groups khác không nếu thì xóa mà thì thôi.
        this.deleteRoleInstep(this.step, roleOld);
        this.deleteRoleInProcess(roleOld, 'O');
      }
    }
  }

  deleteRoleInstep(step, role, action = false) {
    let check = this.checkExistUserInStep(step, role, 'O');
    if (check) {
      if (action) {
        this.notiService.notifyCode('DP027', 0, role?.objectName);
      }
    } else {
      let index = step?.roles?.findIndex(
        (r) => r.objectID == role.objectID && r.roleType == 'R'
      );
      if (index >= 0) {
        step?.roles?.splice(index, 1);
        this.updateStepChange(this.step?.recID);
      }
    }
  }

  deleteRoleInProcess(role, type) {
    let isExitRoleStep = this.checkRoleInProcess(role, type);
    if (!isExitRoleStep) {
      let index = this.process['permissions'].findIndex(
        (permissions) =>
          permissions.objectID == role['objectID'] &&
          permissions.roleType == 'R'
      );
      if (index > -1) {
        let tmp = this.process.permissions[index];
        let checkDelete = this.lstTmp?.some(
          (x) => x.objectID == tmp.objectID && x.roleType != 'F'
        );
        if (!checkDelete) {
          this.lstTmp.push(tmp);
        }
        this.process['permissions']?.splice(index, 1);
        if (!this.isUpdatePermiss) this.isUpdatePermiss = true;
      }
    }
  }
  //test user exists in step
  checkExistUserInStep(step: any, role: any, type: string): boolean {
    if (step?.taskGroups?.length > 0) {
      for (let element of this.step?.taskGroups) {
        let check = element['roles'].some(
          (x) => x.objectID == role.objectID && x.roleType == type
        );
        if (check) {
          return true;
        }
      }
    }
    if (step?.tasks?.length > 0) {
      for (let element of this.step?.tasks) {
        let check = element['roles'].some(
          (x) => x.objectID == role.objectID && x.roleType == type
        );
        if (check) {
          return true;
        }
      }
    }
    return false;
  }

  checkRoleInProcess(role, type) {
    let isExist = false;
    for (let step of this.stepList) {
      let check = this.checkExistUserInStep(step, role, type);
      if (check) {
        isExist = true;
        break;
      }
    }
    return isExist;
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let model = this.dialog?.formModel;
    let formModel = JSON.parse(JSON.stringify(model));
    formModel.formName = f?.formName;
    formModel.gridViewName = f?.gridViewName;
    formModel.entityName = f?.entityName;
    formModel.funcID = functionID;
    return formModel;
  }
  //View task
  viewTask(data?: any, type?: string) {
    let listTaskConvert = this.taskList?.map((item) => {
      return {
        ...item,
        refID: item.recID,
        name: item?.taskName,
        type: item?.taskType,
      };
    });
    let value = JSON.parse(JSON.stringify(data));
    value['name'] = value['taskName'] || value['taskGroupName'];
    value['type'] = value['taskType'] || type;
    value['refID'] = value['recID'];
    if (data) {
      let frmModel: FormModel = {
        entityName: 'DP_Instances_Steps_Tasks',
        formName: 'DPInstancesStepsTasks',
        gridViewName: 'grvDPInstancesStepsTasks',
      };
      let listData = {
        value: value,
        listValue: listTaskConvert,
        step: this.step,
      };
      let option = new SidebarModel();
      option.Width = '550px';
      option.zIndex = 1011;
      option.FormModel = frmModel;
      let dialog = this.callfc.openSide(ViewJobComponent, listData, option);
    }
  }

  getIconTask(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return color?.icon;
  }
  getColor(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return { 'background-color': color?.color };
  }

  toggleTask(e, id) {
    let elementGroup = document.getElementById('group' + id.toString());
    let children = e.currentTarget.children[0];
    let isClose = elementGroup.classList.contains('hiddenTask');
    if (isClose) {
      elementGroup.classList.remove('hiddenTask');
      elementGroup.classList.add('showTask');
      children.classList.remove('icon-add');
      children.classList.add('icon-horizontal_rule');
    } else {
      elementGroup.classList.remove('showTask');
      elementGroup.classList.add('hiddenTask');
      children.classList.remove('icon-horizontal_rule');
      children.classList.add('icon-add');
    }
  }

  async checkExitsProcessName(processName, processID) {
    let check = await firstValueFrom(
      this.dpService.checkExitsName([processName, processID])
    );
    return check;
  }

  chanvalueColor(event, data) {
    if (event?.data && event.field) {
      data[event.field] = event?.data;
    }
  }

  changeIcon(event, data) {
    if (event) {
      data[event.field] = event.data;
    }
  }
  getRoleName(task) {
    let role =
      task?.roles.find((role) => role.objectID == task?.owner) ||
      task?.roles[0];
    return role?.objectName;
  }

  checkOverflow(event: any, popup: any) {
    let parent = event.currentTarget.parentElement;
    let child = event.currentTarget;
    if (child.scrollWidth >= parent.scrollWidth) {
      popup.open();
    }
  }
  //#End stage -- nvthuan

  //#region for reason successful/failed
  valueChangeRadio($event, view: string) {
    if (view === this.viewStepReasonSuccess) {
      if ($event.field === 'yes' && $event.component.checked === true) {
        this.step.reasonControl = true;
      } else if ($event.field == 'no' && $event.component.checked === true) {
        this.step.reasonControl = false;
      }
    } else {
      if ($event.field == 'yes' && $event.component.checked === true) {
        this.step.reasonControl = true;
      } else if ($event.field == 'no' && $event.component.checked === true) {
        this.step.reasonControl = false;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  turnOnReason($event, view: string) {
    if (view === this.viewStepReasonSuccess) {
      if ($event.field === 'isUsed' && $event.component.checked === true) {
        this.stepSuccess.isUsed = true;
      } else if (
        $event.field == 'isUsed' &&
        $event.component.checked === false
      ) {
        this.stepSuccess.isUsed = false;
        this.stepSuccess.reasonControl = false;
        this.stepSuccess.newProcessID = this.guidEmpty;
      }
    } else {
      if ($event.field === 'isUsed' && $event.component.checked === true) {
        this.stepFail.isUsed = true;
      } else if (
        $event.field == 'isUsed' &&
        $event.component.checked === false
      ) {
        this.stepFail.isUsed = false;
        this.stepFail.reasonControl = false;
        this.stepFail.newProcessID = this.guidEmpty;
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  clickViewStep($event: any, view: any, data: any) {
    if ($event && $event != null) {
      if (
        view === this.viewStepReasonSuccess ||
        view === this.viewStepReasonFail
      ) {
        // Click view reason change
        this.viewStepCrr =
          view === this.viewStepReasonSuccess
            ? this.viewStepReasonSuccess
            : this.viewStepReasonFail;

        // Title view reason change
        this.titleViewStepCrr =
          view === this.viewStepReasonSuccess
            ? this.stepNameSuccess
            : this.stepNameFail;

        // Show swtich reason change
        this.isSwitchReason = true;

        this.step =
          view === this.viewStepReasonSuccess
            ? this.stepSuccess
            : this.stepFail;
        this.dataValueview = view;
      } else {
        this.viewStepCrr = this.viewStepCustom;
        if (data) {
          // gán tạm name để test
          this.titleViewStepCrr = data.stepName;
          // hidden swtich reason change
          this.isSwitchReason = false;
          // this.crrDataStep = data;
          this.step = data;
          this.checkedDayOff(this.step?.excludeDayoff);
          this.taskGroupList = this.step['taskGroups'];
          this.taskList = this.step['tasks'];
          this.sumTimeStep();
        }
      }
    }
  }
  getTitleStepViewSetup() {
    if (this.stepList.length > 0) {
      this.titleViewStepCrr = this.step?.stepName;
    }
  }

  getGrvStep() {
    this.cache
      .gridViewSetup(this.formNameSteps, this.gridViewNameSteps)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetupStep = res;
          this.toolTipSetting =
            this.gridViewSetupStep['ShowColumnControl'].headerText ??
            'Setting Show Column';
        }
      });
  }
  getGrvStepReason() {
    this.cache
      .gridViewSetup(this.formNameStepReason, this.gridViewNameStepsReason)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetupStepReason = res;
        }
      });
  }
  getValListDayoff() {
    this.cache.valueList('DP026').subscribe((res) => {
      if (res) {
        this.listDayoff = res.datas;
        this.titleCheckBoxSat = this.listDayoff[0].default;
        this.valueCheckBoxSat = this.listDayoff[0].value;
        this.titleCheckBoxSun = this.listDayoff[1].default;
        this.valueCheckBoxSun = this.listDayoff[1].value;
      }
    });
  }
  valueChangeAssignCtrl($event) {
    if ($event && $event != null) {
      this.step.assignControl = $event.data;
      this.updateStepChange(this.step?.recID);
    }
    this.changeDetectorRef.detectChanges();
  }
  valueChangeTransferCtrl($event) {
    if ($event && $event != null) {
      this.step.transferControl = $event.data;
      this.updateStepChange(this.step?.recID);
    }
  }
  valueChangeDuration($event) {
    if ($event && $event != null) {
      this.step.durationDay = $event?.valueDay;
      this.step.durationHour = $event?.valueHour;
      this.updateStepChange(this.step?.recID);
    }
  }

  valueChangeStartCtrl($event) {
    if ($event && $event != null) {
      this.step.startControl = $event.data;
      this.updateStepChange(this.step?.recID);
    }
  }
  valueChangeDuraCtrl($event, form: string) {
    let checked = $event.component.checked;
    if ($event) {
      if (form === this.formDurationCtrl) {
        if ($event.field === this.radioYes && checked) {
          this.step.durationControl = true;
        } else if ($event.field === this.radioNo && checked) {
          this.step.durationControl = false;
        }
        this.updateStepChange(this.step?.recID);
      } else {
        if ($event.field === this.radioYes && checked) {
          this.step.leadtimeControl = true;
        } else if ($event.field === this.radioNo && checked) {
          this.step.leadtimeControl = false;
        }
        this.updateStepChange(this.step?.recID);
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  valueChangeApproveRoleCtrl($event, form: string) {
    let checked = $event.component.checked;
    if ($event) {
      if (form === this.formStepsRoleCtrl) {
        if ($event.field === this.radioYes && checked) {
          this.step.progressStepControl = true;
        } else if ($event.field === this.radioNo && checked) {
          this.step.progressStepControl = false;
        }
        this.updateStepChange(this.step?.recID);
      } else {
        if ($event.field === this.radioYes && checked) {
          this.step.progressTaskGroupControl = true;
        } else if ($event.field === this.radioNo && checked) {
          this.step.progressTaskGroupControl = false;
        }
        this.updateStepChange(this.step?.recID);
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  valueChangeMemo($event) {
    if ($event && $event != null) {
      this.step.memo = $event.data;
      this.updateStepChange(this.step?.recID);
    }
  }
  valueChangeDayoff($event, view: any, value: any) {
    if ($event && $event != null) {
      if ($event.data) {
        if (view == value && $event?.component.checked) {
          if (
            !this.step?.excludeDayoff ||
            this.step?.excludeDayoff?.trim() == ''
          ) {
            this.step.excludeDayoff = value;
          } else {
            this.step.excludeDayoff = this.step?.excludeDayoff
              .split(';')
              .includes(value)
              ? this.step?.excludeDayoff
              : this.step?.excludeDayoff + ';' + value;
          }
        }
      } else {
        if (view == value && !$event.component.checked) {
          if (
            (!this.step?.excludeDayoff &&
              this.step?.excludeDayoff?.trim() == '') ||
            !this.step?.excludeDayoff?.split(';').includes(value)
          )
            return;
          let arr = this.step?.excludeDayoff
            .split(';')
            .filter((x) => x != value);
          arr.sort();
          this.step.excludeDayoff = arr.join(';') ?? '';
        }
      }
    }
    this.checkedDayOff(this.step?.excludeDayoff);
    this.updateStepChange(this.step?.recID);
    this.changeDetectorRef.detectChanges();
  }
  checkedDayOff(value: string) {
    if (value !== '' && value) {
      this.checkedSat =
        (value?.split(';').length == 1 &&
          value?.split(';')[0] == this.valueCheckBoxSat) ||
        value?.split(';').length > 1;
      this.checkedSun =
        (value?.split(';').length == 1 &&
          value?.split(';')[0] == this.valueCheckBoxSun) ||
        value?.split(';').length > 1;
    } else {
      this.checkedSat = false;
      this.checkedSun = false;
    }
  }

  autoHandleStepReason() {
    if (this.action === 'add' || this.action === 'copy') {
      this.stepSuccess = this.handleStepReason(this.stepSuccess, '1');
      this.stepFail = this.handleStepReason(this.stepFail, '2');
    } else if (this.action === 'edit') {
      this.stepSuccess = this.stepList.find((x) => x.isSuccessStep == true);
      this.stepFail = this.stepList.find((x) => x.isFailStep == true);
    }
  }
  editTest(data) {
    this.stepSuccess = data.find((x) => x.isSuccessStep == true);
    this.stepFail = data.find((x) => x.isFailStep == true);
    this.changeDetectorRef.detectChanges();
  }
  handleReason(
    reason: DP_Steps_Reasons,
    reasonValue: string,
    step: any,
    idProccess: any
  ) {
    reason.reasonType = reasonValue;
    reason.stepID = step.recID;
    // cbx proccess get id
    reason.processID = idProccess;
    reason.createdBy = this.userId;
    return reason;
  }

  handleStepReason(stepReason: DP_Steps, stepReaValue: string) {
    stepReason.stepName =
      stepReaValue == '1' ? this.stepNameSuccess : this.stepNameFail;
    stepReason.isSuccessStep = stepReaValue == '1' ? true : false;
    stepReason.isFailStep = stepReaValue == '2' ? true : false;
    stepReason.processID = this.process?.recID;
    stepReason.stepNo = 0;
    stepReason.excludeDayoff = '';
    stepReason.newProcessID = this.guidEmpty;
    return stepReason;
  }

  addReasonInStep(stepList: any, stepReason: any, stepFail: any): void {
    stepList.push(stepReason);
    stepList.push(stepFail);
  }

  addReason() {
    if (!this.isClick) {
      this.isClick = true;
      this.step.reasons = [
        ...new Set(this.step.reasons.map((x) => x.recID)),
      ].map((recID) => this.step.reasons.find((x) => x.recID === recID));
      setTimeout(() => {
        this.isClick = false;
      }, 500);
      if (this.reasonName === null || this.reasonName?.trim() === '') {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewSetupStepReason['ReasonName']?.headerText + '"'
        );
        return;
      }
      let inxIsExist = this.step.reasons.findIndex(
        (x) =>
          x.reasonName.trim().toLowerCase() ===
            this.reasonName.trim().toLowerCase() && x.recID !== this.reasonId
      );
      if (inxIsExist !== -1) {
        this.notiService.notifyCode(
          'DP026',
          0,
          '"' + this.gridViewSetupStepReason['ReasonName']?.headerText + '"'
        );
        return;
      }

      if (this.reasonAction === this.formAdd) {
        this.reason = this.handleReason(
          this.reason,
          this.dataValueview === this.viewStepReasonSuccess ? '1' : '2',
          this.step,
          this.process?.recID
        );
        this.reason.reasonName = this.reasonName.trim();
        this.step.reasons.push(this.reason);
        this.step.reasons = [
          ...new Set(this.step.reasons.map((x) => x.recID)),
        ].map((recID) => this.step.reasons.find((x) => x.recID === recID));
      } else if (this.reasonAction === this.formEdit) {
        this.reason.reasonName = this.reasonName.trim();
      }
      this.popupAddReason.close();
      this.changeDetectorRef.detectChanges();
    }
  }
  changeValueReaName($event, recid) {
    if ($event) {
      this.reasonName = $event?.data;
      this.reasonId = recid;
    }
  }

  clickMFReason(e, reason, viewStepReason) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteReason(reason);
        break;
      case 'SYS03':
        this.openPopupReason(viewStepReason, reason, e.data);
        break;
      case 'SYS04':
        //this.openPopupReason(viewStepReason,data,e.data);
        break;
    }
  }

  // method for edit reason or copy reason
  openPopupReason(viewReason, reason, clickMore) {
    this.headerText =
      viewReason === this.viewStepReasonSuccess
        ? (clickMore?.customName ?? this.titleAdd) +
          ' ' +
          this.LowercaseFirstPipe(
            this.joinTwoString(this.stepNameReason, this.stepNameSuccess)
          )
        : (clickMore?.customName ?? this.titleAdd) +
          ' ' +
          this.LowercaseFirstPipe(
            this.joinTwoString(this.stepNameReason, this.stepNameFail)
          );
    if (
      clickMore?.functionID === 'SYS03' ||
      clickMore?.functionID === 'SYS04'
    ) {
      this.reasonAction = this.formEdit;
      this.reason = reason;
    } else {
      this.reason = new DP_Steps_Reasons();
      this.reasonAction = this.formAdd;
    }
    this.popupAddReason = this.callfc.openForm(
      this.addReasonPopup,
      '',
      500,
      280
    );

    this.changeDetectorRef.detectChanges();
  }

  deleteReason(data) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.step.reasons = this.step.reasons.filter(
          (x) => x.recID !== data.recID
        );
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  changeReasonMF(e) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02':
          case 'SYS03':
            break;
          default:
            res.disabled = true;
            break;
        }
      });
    }
  }

  loadCbxProccess() {
    this.cache.valueList('DP031').subscribe((data) => {
      this.dpService
        .getlistCbxProccess(this.process?.applyFor)
        .subscribe((res) => {
          if (res) {
            this.listCbxProccess = res[0];
            let obj = {
              recID: this.guidEmpty,
              processName: data.datas[0].default,
              // 'Không chuyển đến quy trình khác'
            };
            this.listCbxProccess.unshift(obj);
            if (this.action === 'edit') {
              this.listCbxProccess = this.listCbxProccess.filter(
                (x) => x.recID !== this.process?.recID
              );
            }
          }
        });
    });
  }

  defaultCbxProccess() {}

  cbxChange($event, view) {
    if (view === this.viewStepReasonSuccess) {
      this.stepSuccess.newProcessID = $event;
    } else if (view === this.viewStepReasonFail) {
      this.stepFail.newProcessID = $event;
    }
  }

  getListStepByProcessIDCopy(oldProccesID, newProccessID, valueListStr) {
    let data = [oldProccesID, newProccessID, valueListStr];

    this.dpService.getListStepByIdProccessCopy(data).subscribe((data) => {
      if (data) {
        let res = data[0];
        let listObjectId = data[1];
        this.editTest(res);
        res.forEach((step) => {
          if (!step['isSuccessStep'] && !step['isFailStep']) {
            const taskGroupList = step?.tasks.reduce((group, product) => {
              const { taskGroupID } = product;
              group[taskGroupID] = group[taskGroupID] ?? [];
              group[taskGroupID].push(product);
              return group;
            }, {});
            const taskGroupConvert = step['taskGroups'].map((taskGroup) => {
              return {
                ...taskGroup,
                task: taskGroupList[taskGroup['recID']] ?? [],
              };
            });
            step['taskGroups'] = taskGroupConvert;

            let taskGroup = new DP_Steps_TaskGroups();
            taskGroup['task'] = taskGroupList['null'] || [];
            taskGroup['recID'] = null;
            step['taskGroups'].push(taskGroup);

            this.stepList.push(step);
          }
        });
        if (
          !this.listValueCopy.includes('2') &&
          !this.listValueCopy.includes('4')
        ) {
          this.listPermissions = [];
        }
        if (!this.listValueCopy.includes('2')) {
          this.listPermissions = this.listPermissions.filter(
            (element) =>
              (element.roleType === 'P' &&
                listObjectId.includes(element.objectID)) ||
              (element.roleType !== 'P' && element.roleType !== 'F')
          );

          this.listPermissions = this.listPermissions.filter(
            (x) => x.roleType != 'O'
          );
        }
        this.process.permissions = this.listPermissions;
        this.permissions = this.process.permissions;
        this.setDefaultOwner();
        this.viewStepSelect(this.stepList[0]);
      }
    });
  }
  getIconReason() {
    this.cache.valueList('DP036').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'S') {
            this.iconReasonSuccess = item;
          } else if (item.value === 'F') {
            this.iconReasonFail = item;
          } else if (item.value === 'R') {
            var reasonValue = item;
          } else if (item.value == '0') {
            this.noteSuccess = item.text;
          } else if (item.value == '1') {
            this.noteFail = item.text;
          } else if (item.value == '2') {
            this.noteResult = item.text;
          }
        }
        this.stepSuccess.icon = this.iconReasonSuccess?.icon;
        this.stepFail.icon = this.iconReasonFail?.icon;

        this.stepSuccess.backgroundColor = null;
        this.stepFail.backgroundColor = null;

        this.stepSuccess.textColor = null;
        this.stepFail.textColor = null;

        this.stepSuccess.iconColor = null;
        this.stepFail.iconColor = null;

        this.stepSuccess.stepName = this.iconReasonSuccess?.text;
        this.stepFail.stepName = this.iconReasonFail?.text;

        this.stepNameSuccess = this.iconReasonSuccess?.text;
        this.stepNameFail = this.iconReasonFail?.text;
        this.stepNameReason = reasonValue?.text;
        this.autoHandleStepReason();
      }
    });
  }
  getValueYesNo() {
    this.cache.valueList('DP039').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'Y') {
            this.titleRadioYes = item.text;
          } else if (item.value === 'N') {
            this.titleRadioNo = item.text;
          }
        }
      }
    });
  }
  getValueDayHour() {
    this.cache.valueList('DP040').subscribe((res) => {
      if (res.datas) {
        for (let item of res.datas) {
          if (item.value === 'D') {
            this.strDay = ' ' + item.text + ' ';
          } else if (item.value === 'H') {
            this.strHour = ' ' + item.text + ' ';
          } else if (item.value == '1') {
            this.noteDay = item.text;
          } else if (item.value === '2') {
            this.noteHour = item.text;
          }
        }
      }
    });
  }
  joinTwoString(valueFrist, valueTwo) {
    valueTwo = this.LowercaseFirstPipe(valueTwo);
    if (!valueFrist || !valueTwo) return '';
    return valueFrist + ' ' + valueTwo;
  }
  LowercaseFirstPipe(value) {
    if (!value) return '';
    return value.charAt(0).toLowerCase() + value.slice(1);
  }

  ischeckDurationTime(stepList) {
    let findExistDuration = stepList.find(
      (x) =>
        this.isInvalidDuration(x?.durationDay) &&
        this.isInvalidDuration(x?.durationHour)
    );
    if (findExistDuration) {
      this.notiService.notifyCode(
        'DP025',
        0,
        '"' + findExistDuration.stepName + '"'
      );
      return true;
    }
    return false;
  }
  isInvalidDuration(duration) {
    return !duration || duration <= 0;
  }

  checkValidStepReason() {
    if (
      this.stepSuccess.reasons.length === 0 &&
      this.stepSuccess.reasonControl
    ) {
      this.notiService.notifyCode('DP005', 0, '"' + this.stepNameSuccess + '"');
      return false;
    }
    if (this.stepFail.reasons.length === 0 && this.stepFail.reasonControl) {
      this.notiService.notifyCode('DP005', 0, '"' + this.stepNameFail + '"');
      return false;
    }
    if (this.ischeckDurationTime(this.stepList)) {
      return false;
    }
    return true;
  }
  moveProccessIsNull(newProccessID) {
    let index = this.listCbxProccess.findIndex((x) => x.recID == newProccessID);
    if (index > -1) {
      return newProccessID;
    }
    return this.guidEmpty;
  }

  getNameReasonControl(view: any) {
    let reason = this.LowercaseFirstPipe(this.stepNameFail);
    if (view === this.viewStepReasonSuccess) {
      let reason = this.LowercaseFirstPipe(this.stepNameSuccess);
    }
    return this.gridViewSetupStep['ReasonControl']?.headerText.replace(
      '{0}',
      reason
    );
  }
  // new setting
  //setting trình kí - lần 2
  actionOpenFormApprove2(item, isAdd = false) {
    // this.dpService
    //   .getESCategoryByCategoryID(categoryID)
    //   .subscribe((item: any) => {
    //     if (item) {
    //gọi ko ra
    this.cache.functionList('ESS22').subscribe((f) => {
      if (f) {
        if (!f || !f.gridViewName || !f.formName) return;
        this.cache.gridView(f.gridViewName).subscribe((gridview) => {
          this.cache
            .gridViewSetup(f.formName, f.gridViewName)
            .subscribe((grvSetup) => {
              let formES = new FormModel();
              formES.funcID = f?.functionID;
              formES.entityName = f?.entityName;
              formES.formName = f?.formName;
              formES.gridViewName = f?.gridViewName;
              formES.currentData = item;
              let option = new SidebarModel();
              option.Width = '550px';
              option.FormModel = formES;
              let popupEditES = this.callfc.openSide(
                PopupAddCategoryComponent,
                {
                  disableCategoryID: '1',
                  data: item,
                  isAdd: isAdd,
                  headerText: this.titleAction,
                  dataType: 'auto',
                },
                option
              );

              popupEditES.closed.subscribe((res) => {
                if (res?.event) {
                  this.loadListApproverStep();
                  this.recIDCategory = res?.event?.recID;
                }
              });
            });
        });
      }
    });
  }
  //  });
  // }

  clickPopover(e, p, item) {
    this.popoverSelectView(p, item);
  }

  //#region color step

  setColorTestStep(step) {
    if (this.process?.stepsColorMode) {
      if (step?.isFailStep || step?.isSuccessStep) {
        return '#ffffff';
      } else {
        let countStep = this.stepList?.length || 0;
        let medium = Math.round(countStep / 2);
        if (step?.stepNo < medium) {
          return '#000000';
        } else {
          return '#ffffff';
        }
      }
    } else {
      return step?.textColor || 'gray';
    }
  }

  setColorStep(step: DP_Steps) {
    if (this.process?.stepsColorMode) {
      if (step?.isFailStep) {
        return this.iconReasonFail?.color;
      } else if (step?.isSuccessStep) {
        return this.iconReasonSuccess?.color;
      } else {
        let countStep = this.stepList?.length || 0;
        let opacityDefault = Number((1 / countStep).toFixed(2));
        let opacity = opacityDefault * Number(step?.stepNo || 1);
        opacity = opacity > 1 ? 1 : opacity;
        let color = this.hexToRGB(this.colorDefault, opacity);
        return color;
      }
    } else {
      return step?.backgroundColor;
    }
  }

  hexToRGB(hex, opacity) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hexLongRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const result = hexLongRegex.exec(hex) || shorthandRegex.exec(hex);
    if (!result) {
      return null;
    }
    const [r, g, b] = result.slice(1).map((value) => parseInt(value, 16));
    return this.rgba2hex(r, g, b, opacity);
  }

  rgba2hex(r, g, b, alpha = 1) {
    const toHex = (num) => formatHex(num.toString(16));
    const formatHex = (str) => (str.length === 1 ? `0${str}` : str);

    const alphaHex = formatHex(Math.round(alpha * 255).toString(16));
    const rHex = toHex(r);
    const gHex = toHex(g);
    const bHex = toHex(b);

    return `#${rHex}${gHex}${bHex}${alphaHex}`;
  }
  //#endregion

  //#region edit Reason
  async changeDataMFReason(e) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS03':
            break;
          default:
            res.disabled = true;
        }
      });
    }
  }

  clickReason(e: any, data: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.customerReason(data);
        break;
    }
  }

  customerReason(reason: DP_Steps) {
    this.isSaveStep = false;
    this.stepNew = JSON.parse(JSON.stringify(reason));
    this.stepEdit = reason;
    this.isEditReason = true;
    this.action = 'edit';
    this.popupAddStage = this.callfc.openForm(this.popupAddStep, '', 500, 550);
  }

  editReason() {
    this.isSaveStep = true;
    this.stepEdit['backgroundColor'] = this.stepNew['backgroundColor'];
    this.stepEdit['textColor'] = this.stepNew['textColor'];
    this.stepEdit['icon'] = this.stepNew['icon'];
    this.stepEdit['iconColor'] = this.stepNew['iconColor'];
    this.stepEdit['modifiedOn'] = new Date();
    this.stepEdit['modifiedBy'] = this.userId;
    if (this.action == 'edit' && this.stepNew.recID) {
      this.listStepEdit.push(this.stepNew.recID);
    }
    this.isEditReason = false;
    this.popupAddStage.close();
  }
  //#endregion

  valueChangeChecked(event, data) {
    if (event) {
      data[event.field] = event?.data || false;
    }
  }
}
