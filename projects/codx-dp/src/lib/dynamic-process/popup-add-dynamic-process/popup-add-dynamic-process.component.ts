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
  Input,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PopupJobComponent } from './step-task/popup-job/popup-job.component';
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
import { format } from 'path';
import { FormGroup } from '@angular/forms';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { ViewJobComponent } from './step-task/view-job/view-job.component';
import { PopupTypeTaskComponent } from './step-task/popup-type-task/popup-type-task.component';
import { StepTaskGroupComponent } from './step-task/step-task-group/step-task-group.component';
import { paste } from '@syncfusion/ej2-angular-richtexteditor';
import { PopupRolesDynamicComponent } from '../popup-roles-dynamic/popup-roles-dynamic.component';
import { lastValueFrom, firstValueFrom } from 'rxjs';

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
  @ViewChild('addStage') addStagePopup: TemplateRef<any>;
  @ViewChild('addReasonPopup') addReasonPopup: TemplateRef<any>;
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
  stepNameSuccess: string = 'Thành công';
  stepNameFail: string = 'Thất bại';
  reasonName: string = '';
  dataValueview: string = '';
  reasonAction: any;

  // const value string
  readonly strEmpty: string = '';
  readonly viewStepCustom: string = 'custom';
  readonly viewStepReasonSuccess: string = 'reasonSuccess';
  readonly viewStepReasonFail: string = 'reasonFail';
  readonly radioYes: string = 'yes';
  readonly radioNo: string = 'no';
  readonly titleRadioYes: string = 'Có';
  readonly titleRadioNo: string = 'Không';
  readonly saturday: string = 'Thứ 7';
  readonly sunday: string = 'Chủ nhật';
  readonly viewSaturday: string = '7';
  readonly viewSunday: string = '8';
  readonly formNameSteps: string = 'DPSteps';
  readonly gridViewNameSteps: string = 'grvDPSteps';
  readonly formDurationCtrl: string = 'DurationControl';
  readonly formLeaTimeCtrl: string = 'LeadtimeControl';
  readonly formEdit: string = 'edit'; // form edit
  readonly formAdd: string = 'add'; // form add
  readonly fieldCbxProccess = { text: 'processName', value: 'recID' };
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE

  //stage-nvthuan
  user: any;
  userId: string;

  taskGroup: DP_Steps_TaskGroups;
  taskGroupList: DP_Steps_TaskGroups[] = [];

  taskList: DP_Steps_Tasks[] = [];

  taskListSave: DP_Steps_Tasks[] = [];
  taskGroupListSave: DP_Steps_TaskGroups[] = [];

  step: DP_Steps; //data step dc chọn
  stepList: DP_Steps[] = []; //danh sách step

  stepListAdd: DP_Steps[] = [];
  stepListDelete = [];

  roleGroupTaskOld: DP_Steps_Roles[] = [];

  grvMoreFunction: FormModel;
  grvTaskGroups: FormModel;
  grvStep: FormModel;

  dayStep = 0;
  hourStep = 0;

  stepName = '';
  isContinues = false;
  popupJob: DialogRef;
  popupGroupJob: DialogRef;
  popupAddStage: DialogRef;
  formGroup: FormGroup;
  refValue = 'DP018';
  gridViewSetup: any;
  userGroupJob = [];
  nameStage = '';
  isAddStage = true;
  headerText = '';
  groupTaskID = '';
  stepRoleOld: any;
  listJobType = [];
  jobType: any;
  actionStep = '';
  //end stage-nvthuan
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  //data test Thao
  fieldCrr: DP_Steps_Fields;
  stepOfFields: any;
  isHover = '';
  vllType = 'DP022';
  dataChild = [];
  //end data Test
  isShowstage = true;
  titleAdd = 'Thêm';
  objectIDRoles: any;
  titleDefault = '';
  instanceNoSetting = '';
  listClickedCoppy: any;
  titleAction: any;
  oldIdProccess: any;
  newIdProccess: any;
  listValueCopy: any;
  MESSAGETIME =
    'Thời hạn công việc lớn hơn nhóm công việc bạn có muốn lưu và thay đổi thời hạn nhóm công việc';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private dpService: CodxDpService,
    private CodxDpService: CodxDpService,
    private authStore: AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.entityName = this.dialog.formModel.entityName;
    this.action = dt.data.action;
    this.showID = dt.data.showID;
    this.user = this.authStore.get();
    this.userId = this.user?.userID;
    this.titleAction = dt.data.titleAction;
    this.process = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    if (this.action === 'copy') {
      this.listClickedCoppy = dt.data.conditionCopy;
      (this.oldIdProccess = dt.data.oldIdProccess),
        (this.newIdProccess = dt.data.newIdProccess),
        (this.listValueCopy = dt.data.listValueCopy);
      var valueListStr = this.listValueCopy.join(';');
      this.process.permissions =
        this.listValueCopy.findIndex((x) => x === '2') !== -1
          ? this.process.permissions
          : [];
      // copy file image
      // this.process.recID = this.oldIdProccess;
      this.listValueCopy.findIndex((x) => x === '3') !== -1 &&
        this.getListStepByProcessIDCopy(
          this.oldIdProccess,
          this.newIdProccess,
          valueListStr
        );
    }
    if (this.action == 'edit') {
      // this.showID = true;
      this.permissions = this.process.permissions;
      if (this.permissions.length > 0) {
        var perm = this.permissions.filter((x) => x.roleType == 'P');
        this.lstParticipants = perm;
      }
      this.processTab = 2;
      this.getAvatar(this.process);
      this.instanceNoSetting = this.process.instanceNoSetting;
    } else {
      this.process.instanceNoSetting = dt.data.instanceNo;
      // this.step.owner = this.user.userID;
      // this.process.instanceNoSetting = this.process.processNo;
    }

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.cache.moreFunction('CoDXSystem', null).subscribe((mf) => {
      if (mf) {
        var mfAdd = mf.find((f) => f.functionID == 'SYS01');
        if (mfAdd) this.titleAdd = mfAdd?.customName;
      }
    });
    this.cache.functionList('DPT03').subscribe((fun) => {
      if (fun) this.titleDefault = fun.customName || fun.description;
    });

    this.getGrvStep();
    this.getValListDayoff();
    this.autoHandleStepReason();
    this.loadCbxProccess();
  }

  ngAfterViewInit(): void {
    //tesst
    this.grvStep = {
      entityName: 'DP_Steps',
      formName: 'DPSteps',
      gridViewName: 'grvDPSteps',
    };
  }

  ngOnInit(): void {
    // this.updateNodeStatus(0,1);
    this.grvMoreFunction = JSON.parse(JSON.stringify(this.dialog?.formModel));
    this.grvMoreFunction.entityName = 'DP_InstancesSteps';
    this.grvMoreFunction.formName = 'DPInstancesSteps';
    this.grvMoreFunction.gridViewName = 'grvDPInstancesSteps';
    this.getTitleStepViewSetup();
    this.initForm();
    this.checkedDayOff(this.step?.excludeDayoff);
    if (this.action != 'add' && this.action != 'copy') {
      this.getStepByProcessID();
    }
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
  async onSave() {
    if (
      !this.process.processName ||
      !this.process.processName.trim() ||
      this.stepList?.length === 0
    ) {
      this.notiService.notify('Lưu thất bại ');
      return;
    }
    if (
      (this.stepSuccess.reasons.length === 0 &&
        this.stepSuccess.reasonControl) ||
      (this.stepFail.reasons.length === 0 && this.stepFail.reasonControl)
    ) {
      this.notiService.notifyCode('DP005');
      return;
    }
    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((res) => {
        // save file
        debugger;
        if (res) {
          this.handlerSave();
        }
      });
    } else {
      this.handlerSave();
    }
  }

  handlerSave() {
    if (this.action == 'add' || this.action == 'copy') {
      this.onAdd();
    } else if (this.action == 'edit') {
      this.onUpdate();
    }
  }

  beforeSave(op) {
    var data = [];
    op.className = 'ProcessesBusiness';
    if (this.action == 'add' || this.action == 'copy') {
      op.methodName = 'AddProcessAsync';
    } else {
      op.methodName = 'UpdateProcessAsync';
    }
    data = [this.process];
    op.data = data;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        this.attachment?.clearData();
        this.imageAvatar.clearData();
        if (res) {
          this.addReasonInStep(this.stepList, this.stepSuccess, this.stepFail);
          this.handleAddStep();
          this.dialog.close(res.save);
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.attachment?.clearData();
        this.imageAvatar.clearData();
        if (res && res.update) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.addReasonInStep(this.stepList, this.stepSuccess, this.stepFail);
          this.handleUpdateStep();
          res.update.modifiedOn = new Date();
          this.dialog.close(res.update);
        }
      });
  }

  handleAddStep() {
    let stepListSave = JSON.parse(JSON.stringify(this.stepList));
    if (stepListSave.length > 0) {
      stepListSave.forEach((step) => {
        if (step && step['taskGroups']) {
          this.convertGroupSave(step['taskGroups']);
        }
      });
      this.dpService.addStep([stepListSave]).subscribe((data) => {
        if (data) {
        }
      });
    }
  }

  convertGroupSave(group) {
    if (group && group.length > 0) {
      let index = group?.findIndex((x) => !x['recID']);
      group?.splice(index, 1);
      group?.forEach((element) => {
        delete element['task'];
      });
    }
  }

  handleUpdateStep() {
    let stepListSave = JSON.parse(JSON.stringify(this.stepList));
    if (stepListSave.length > 0) {
      stepListSave.forEach((step) => {
        if (step && step['taskGroups']) {
          this.convertGroupSave(step['taskGroups']);
        }
      });
      if (this.stepListAdd.length > 0) {
        this.stepListAdd.forEach((step) => {
          if (step && step['taskGroups']) {
            this.convertGroupSave(step['taskGroups']);
          }
        });
      }
      this.dpService
        .editStep([stepListSave, this.stepListAdd, this.stepListDelete])
        .subscribe((data) => {
          if (data) {
          }
        });
    }
  }

  valueChange(e) {
    this.process[e.field] = e.data;
    if (this.action === 'add' || this.action === 'copy') {
      if (this.process.applyFor) {
        this.loadCbxProccess();
      }
    }
  }

  valueChangeAutoNoCode(e) {
    this.instanceNoSetting = e?.data;
  }
  //#endregion

  //#region Change Tab
  //Click từng tab - mặc định thêm mới = 0
  clickTab(tabNo) {
    //if (tabNo <= this.processTab && tabNo != this.currentTab) {
    let newNo = tabNo;
    let oldNo = this.currentTab;
    if (tabNo <= this.processTab && tabNo != this.currentTab) {
      if (
        !this.process.instanceNoSetting ||
        (this.process.instanceNoSetting &&
          this.process.instanceNoSetting != this.instanceNoSetting)
      ) {
        this.notiService.alertCode('DP009').subscribe((e) => {
          if (e?.event?.status == 'Y') {
            this.updateNodeStatus(oldNo, newNo);
            this.currentTab = tabNo;
          } else return;
        });
      } else {
        this.updateNodeStatus(oldNo, newNo);
        this.currentTab = tabNo;
      }
    
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
    if (oldNode > newNode && this.currentTab == this.processTab) {
    } else {
      (nodes[oldNode] as HTMLElement).classList.add('approve-disabled');
    }
  }

  //Tiếp tục qua tab
  async continue(currentTab) {
    if (this.currentTab > 2) return;
    let oldNode = currentTab;
    let newNode = oldNode + 1;
    switch (currentTab) {
      case 0:
        if (
          this.process.processName == null ||
          this.process.processName == ''
        ) {
          this.isContinues = true;
        }
        if (
          !this.process.instanceNoSetting ||
          (this.process.instanceNoSetting &&
            this.process.instanceNoSetting != this.instanceNoSetting)
        ) {
          this.notiService.alertCode('DP009').subscribe((e) => {
            if (e?.event?.status == 'Y') {
              this.updateNodeStatus(oldNode, newNode);
              this.currentTab++;
              this.processTab == 0 && this.processTab++;
            } else return;
          });
        } else {
          this.updateNodeStatus(oldNode, newNode);
          this.currentTab++;
          this.processTab == 0 && this.processTab++;
        }

        break;
      case 1:
        // if (
        //   (this.stepSuccess.reasons.length === 0 &&
        //     this.stepSuccess.reasonControl) ||
        //   (this.stepFail.reasons.length === 0 && this.stepFail.reasonControl)
        // ) {
        //   this.notiService.notifyCode('DP005');
        //   return;
        // }
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
        this.currentTab++;
        break;
      case 2:
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
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;

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
          D: 'Departments',
          O: 'Share_OrgUnits',
        };
        break;
    }
    this.callfc.openForm(share, '', 420, 600);
  }

  openPopupParticipants(popupParticipants) {
    this.callfc.openForm(popupParticipants, '', 950, 650);
  }

  applyShare(e, type) {
    if (e.length > 0) {
      console.log(e);
      switch (type) {
        case '1':
          var value = e;
          for (var i = 0; i < value.length; i++) {
            var data = value[i];
            var perm = new DP_Processes_Permission();
            perm.objectName =
              (data.text != null || data.text != '') && data.objectType != 'U'
                ? data.text
                : data.objectType == '9' || data.objectType == '0'
                ? data.objectName
                : data.dataSelected.EmployeeName;
            perm.objectID = data.id != null || data.id != '' ? data.id : null;
            perm.objectType = data.objectType;
            perm.full = true;
            perm.create = true;
            perm.read = true;
            perm.assign = true;
            perm.edit = true;
            // perm.publish = true;
            perm.delete = true;
            perm.roleType = 'O';
            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.process.permissions = this.permissions;
          break;
        case '2':
          var value = e;
          for (var i = 0; i < value.length; i++) {
            var data = value[i];
            var perm = new DP_Processes_Permission();
            perm.objectName = perm.objectName =
              (data.text == null || data.text == '') && data.objectType == 'U'
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
            perm.create = false;
            perm.assign = false;
            perm.edit = false;
            // perm.publish = false;
            perm.delete = false;

            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.lstParticipants = this.permissions.filter(
            (x) => x.roleType == 'P'
          );
          this.process.permissions = this.permissions;
          break;
        case '3':
          var value = e;
          for (var i = 0; i < value.length; i++) {
            var data = value[i];
            var perm = new DP_Processes_Permission();
            perm.objectName =
              (data.text == null || data.text == '') && data.objectType == 'U'
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
            // perm.publish = false;
            perm.delete = false;
            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.process.permissions = this.permissions;
          break;
        case '4':
          var value = e;
          var tmpRole = [];
          for (var i = 0; i < value.length; i++) {
            var data = value[i];
            var roles = new DP_Steps_Roles();
            roles.objectName =
              (data.text == null || data.text == '') && data.objectType == 'U'
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
            var perm = new DP_Processes_Permission();
            perm.objectName =
              (data.text == null || data.text == '') && data.objectType == 'U'
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
            perm.create = false;
            perm.assign = false;
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
          break;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  eventUser(event) {
    var tmpRole = [];
    var roles = new DP_Steps_Roles();
    roles.objectID = event.id;
    roles.objectName = event.name;
    roles.objectType = event.type;
    roles.roleType = 'S';
    tmpRole = this.checkRolesStep(this.step.roles, roles);
    this.step.roles = tmpRole;
  }

  checkUserPermission(
    listPerm: DP_Processes_Permission[],
    perm: DP_Processes_Permission
  ) {
    var index = -1;
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
    var index = -1;
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
    var i = this.lstParticipants.filter(
      (x) => x.objectID == this.stepRoleOld?.objectID
    );
    var check = -1;
    check = listPerm.findIndex((x) => x.objectID == this.stepRoleOld?.objectID);
    if (index == -1) {
      if (i.length == 0) {
        if (check > -1) {
          listPerm.splice(check, 1);
        }
      }
      listPerm.push(Object.assign({}, perm));
    } else {
      if (i.length == 0) {
        if (check > -1) {
          listPerm.splice(check, 1);
        }
      }
    }
    return listPerm;
  }

  checkRolesStep(listPerm: DP_Steps_Roles[], perm: DP_Steps_Roles) {
    var index = -1;
    if (listPerm != null) {
      if (perm != null && listPerm.length > 0) {
        index = listPerm.findIndex(
          (x) => x.objectID != perm.objectID && x.roleType == 'S'
        );
        this.stepRoleOld = listPerm.filter((x) => x.roleType == 'S')[0];
      }
    } else {
      listPerm = [];
    }
    if (index != -1) {
      listPerm.splice(index, 1);
    }
    listPerm.push(Object.assign({}, perm));

    return listPerm;
  }

  checkRoleType(lst = []) {
    return lst.filter((x) => x.roleType == 'S').map((x) => x.objectID)[0];
  }

  addFile(e) {
    this.attachment.uploadFile();
  }

  //Popup roles process
  clickRoles() {
    var title = 'Phân quyền';
    this.callfc
      .openForm(
        PopupRolesDynamicComponent,
        '',
        950,
        650,
        '',
        [this.process, title, this.action === 'copy' ? 'copy' : 'add'],
        '',
        this.dialog
      )
      .closed.subscribe((e) => {
        if (e && e.event != null) {
          this.process.permissions = e.event;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  //end

  //Popup setiing autoNumber
  openAutoNumPopup() {
    if (this.action != 'edit') {
      //save new autoNumber
      let popupAutoNum = this.callfc.openForm(
        PopupAddAutoNumberComponent,
        '',
        550,
        (screen.width * 40) / 100,
        '',
        {
          autoNoCode: this.instanceNoSetting,
          description: 'DP_Instances',
          newAutoNoCode: this.instanceNoSetting,
          isSaveNew: '1',
        }
      );
      popupAutoNum.closed.subscribe((res) => {
        if (res?.event) {
          this.process.instanceNoSetting = res?.event?.autoNoCode;
        }
      });
    } else {
      //cap nhật
      let popupAutoNum = this.callfc.openForm(
        PopupAddAutoNumberComponent,
        '',
        550,
        (screen.width * 40) / 100,
        '',
        {
          autoNoCode: this.instanceNoSetting,
          description: 'DP_Instances',
        }
      );
      popupAutoNum.closed.subscribe((res) => {
        if (res?.event) {
          this.process.instanceNoSetting = res?.event?.autoNoCode;
        }
      });
    }
  }
  //#endregion THÔNG TIN QUY TRÌNH - PHÚC LÀM ------------------------------------------------------------------ >>>>>>>>>>

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

  clickMFFields(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteCustomField(data);
        break;
      case 'SYS03':
        this.editCustomField(data, e.text);
        break;
      case 'SYS04':
        // this.copy(data, e.text);
        break;
    }
  }

  addCustomField(stepID, processID) {
    this.cache.gridView('grvDPStepsFields').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
        .subscribe((res) => {
          this.fieldCrr = new DP_Steps_Fields();
          this.fieldCrr.stepID = stepID;
          this.fieldCrr.processID = processID;
          this.fieldCrr.isRequired = false;
          // this.fieldCrr.rank = 5;
          let titleAction = this.titleAdd;
          let option = new SidebarModel();
          let formModel = this.dialog?.formModel;
          formModel.formName = 'DPStepsFields';
          formModel.gridViewName = 'grvDPStepsFields';
          formModel.entityName = 'DP_Steps_Fields';
          option.FormModel = formModel;
          option.Width = '550px';
          option.zIndex = 1010;
          var dialogCustomField = this.callfc.openSide(
            PopupAddCustomFieldComponent,
            [this.fieldCrr, 'add', titleAction, this.stepList],
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
                if (x.recID == this.fieldCrr.stepID)
                  x.fields.push(this.fieldCrr);
              });
              this.changeDetectorRef.detectChanges();
            }
          });
        });
    });
  }

  editCustomField(field, textTitle) {
    this.fieldCrr = field;
    this.cache.gridView('grvDPStepsFields').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
        .subscribe((res) => {
          let titleAction = textTitle;
          let option = new SidebarModel();
          let formModel = this.dialog?.formModel;
          formModel.formName = 'DPStepsFields';
          formModel.gridViewName = 'grvDPStepsFields';
          formModel.entityName = 'DP_Steps_Fields';
          formModel.funcID = 'DPT0301';
          option.FormModel = formModel;
          option.Width = '550px';
          option.zIndex = 1010;
          var dialogCustomField = this.callfc.openSide(
            PopupAddCustomFieldComponent,
            [this.fieldCrr, 'edit', titleAction, this.stepList],
            option
          );
          dialogCustomField.closed.subscribe((e) => {
            if (e && e.event != null) {
              //xu ly data đổ về
              this.fieldCrr = e.event;
              // if (this.step.recID == this.fieldCrr.stepID) {
              //   let index = this.step.fields.findIndex(
              //     (x) => x.recID == this.fieldCrr.recID
              //   );
              //   if (index != -1) {
              //     this.step.fields[index] = this.fieldCrr;
              //   }
              // }
              this.stepList.forEach((obj) => {
                if (obj.recID == this.fieldCrr.stepID) {
                  let index = obj.fields.findIndex(
                    (x) => x.recID == this.fieldCrr.recID
                  );
                  if (index != -1) {
                    obj.fields[index] = this.fieldCrr;
                  }
                }
              });
              this.changeDetectorRef.detectChanges();
            }
          });
        });
    });
  }

  deleteCustomField(field) {
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
          }
        });
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
  }
  popoverSelectView(p, data) {
    this.stepOfFields = data;
    p.open();
  }
  selectView(showColumnControl) {
    this.stepList.forEach((x) => {
      if (x.recID == this.stepOfFields.recID)
        x.showColumnControl = showColumnControl;
    });
    this.changeDetectorRef.detectChanges();
  }

  dropFields(event: CdkDragDrop<string[]>, recID) {
    if (event.previousIndex == event.currentIndex) return;
    let crrIndex = this.stepList.findIndex((x) => x.recID == recID);
    if (crrIndex == -1) return;
    this.dataChild = this.stepList[crrIndex].fields;
    moveItemInArray(this.dataChild, event.previousIndex, event.currentIndex);
    this.changeDetectorRef.detectChanges();
  }

  checkBackground(i) {
    if (this.isHover == i) return true;
    return false;
  }
  dropCustomFile(event: CdkDragDrop<string[]>, stepID) {
    if (event.previousContainer === event.container) {
      //   // if (stepID) {
      this.dropFields(event, stepID);
      //   //   } else {
      //   //     this.dropSteps(event);
      //   //   }
    } else {
      this.dropFieldsToStep(event, stepID);
    }
  }
  dropFieldsToStep(event, stepID) {
    var stepIDContain = event.container.id;
    var stepIDPrevious = event.previousContainer.id;
    // var data = event.item?.data;
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
    this.dpService.getStep([this.process?.recID]).subscribe((data) => {
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
              return {
                ...taskGroup,
                task: taskGroupList[taskGroup['recID']] ?? [],
              };
            });
            step['taskGroups'] = taskGroupConvert;

            let taskGroup = new DP_Steps_TaskGroups();
            taskGroup['task'] = taskGroupList[this.guidEmpty] || [];
            taskGroup['recID'] = this.guidEmpty; // group task rỗng để kéo ra ngoài
            step['taskGroups'].push(taskGroup);

            this.stepList.push(step);
          }
        });
        this.stepList.sort((a, b) => a['stepNo'] - b['stepNo']);
        this.viewStepSelect(this.stepList[0]);// gán listStep[0] cho step
        
      }
    });
  }

  openPopupStep(type) {
    this.actionStep = type;
    if (type === 'add') {
      this.step = new DP_Steps();
      this.step['processID'] = this.process?.recID;
      this.step['stepNo'] = this.stepList.length + 1;
      this.stepName = '';
      this.headerText = 'Thêm Giai Đoạn';
    } else if (type === 'copy') {
      this.headerText = 'Copy Giai Đoạn';
      this.stepName = this.step['stepName'];
    } else {
      this.headerText = 'Sửa Giai Đoạn';
      this.stepName = this.step['stepName'];
    }
    this.popupAddStage = this.callfc.openForm(this.addStagePopup, '', 500, 280);
  }

  copyStep(step) {
    this.step = JSON.parse(JSON.stringify(step));
    this.stepName = '';
    this.step['recID'] = Util.uid();
    this.step['stepNo'] = this.stepList.length + 1;
    delete this.step['id'];
    let taskCopy = [];
    // copy groups and tasks
    if (this.step['taskGroups']?.length > 0) {
      this.step['taskGroups'].forEach((groupTask) => {
        groupTask['recID'] = groupTask['recID'] ? Util.uid() : null;
        groupTask['stepID'] = this.step['recID'];
        groupTask['createdOn'] = new Date();
        groupTask['createdBy'] = this.userId;
        groupTask['modifiedOn'] = null;
        groupTask['modifiedBy'] = null;
        groupTask['roles']?.forEach(role => {
          role['recID'] = Util.uid();
          role['taskGroupID'] = groupTask['recID']
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
            task['roles']?.forEach(role => {
              role['recID'] = Util.uid();
              role['taskID'] = task['recID'];
            }); 
            taskCopy.push(task);
          });
        }
      });
    }
    // copy fields 
    if(this.step['fields']?.length > 0){
      this.step['fields'].forEach(fields => {
        fields['recID'] = Util.uid();
        fields['stepID'] = this.step['recID'];
        fields['createdOn'] = new Date();
        fields['createdBy'] = this.userId;
        fields['modifiedOn'] = null;
        fields['modifiedBy'] = null;
      });
    }

    this.step['tasks'] = taskCopy;
    this.openPopupStep('copy');
    console.log(step);
  }

  saveStep() {
    if (!this.step['stepName'] || !this.step['stepName'].trim()) {
      this.notiService.notifyCode('SYS009', 0, 'Tên giai đoạn');
      return;
    }
    if (this.actionStep == 'add' || this.actionStep == 'copy') {
      this.stepList.push(this.step);
      this.viewStepSelect(this.step);
      if (this.action == 'edit') {
        // if edit process
        this.stepListAdd.push(this.step);
      }
    } else {
      this.titleViewStepCrr = this.step?.stepName;
    }
    this.popupAddStage.close();
  }

  deleteStep(data) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        let index = this.stepList.findIndex((step) => step.recID == data.recID);
        if (index >= 0) {
          this.stepList.splice(index, 1);
          this.setIndex(this.stepList, 'stepNo');
          this.viewStepSelect(this.stepList.length > 0 ? this.stepList[0] : []);
          // lay danh sach step xoa
          if (this.action == 'edit') {
            let indexDelete = this.stepListAdd.findIndex(
              (step) => (step.recID = data.recID)
            );
            if (indexDelete >= 0) {
              this.stepListAdd.splice(indexDelete, 1);
            } else {
              this.stepListDelete.push(data.recID);
            }
          }
        }
      }
    });
  }
  //taskGroup
  openTaskGroup(data?: any, type?: string) {
    this.taskGroup = new DP_Steps_TaskGroups();
    if (data) {
      this.roleGroupTaskOld = JSON.parse(JSON.stringify(data?.roles)) || [];
      if (type === 'copy') {
        this.taskGroup = JSON.parse(JSON.stringify(data));
        this.taskGroup['recID'] = null;
      } else {
        this.taskGroup = data;
      }
    } else {
      this.roleGroupTaskOld = [];
      this.taskGroup['createdBy'] = this.userId;
      this.taskGroup['stepID'] = this.step['recID'];
      this.taskGroup['task'] = [];
    }
    this.popupGroupJob = this.callfc.openForm(
      StepTaskGroupComponent,
      '',
      500,
      500,
      '',
      this.taskGroup
    );
    this.popupGroupJob.closed.subscribe((res) => {
      if (res?.event) {
        this.saveGroupTask(type);
        this.sumTimeStep();
      }
    });
  }

  async saveGroupTask(type: string) {
    this.popupGroupJob.close();
    if (this.taskGroup['roles']?.length == 0) {
      let role = new DP_Steps_TaskGroups_Roles();
      await this.setRole(role);
      this.taskGroup['roles'] = [role];
    }

    if (!this.taskGroup['recID']) {
      this.taskGroup['recID'] = Util.uid();
      this.taskGroup['roles'].forEach(role => {role['taskGroupID'] = this.taskGroup['recID'];});
      let index = this.taskGroupList.length;
      if (index === 0) {
        let taskGroup = new DP_Steps_TaskGroups();
        taskGroup['task'] = [];
        taskGroup['recID'] = this.guidEmpty; // group task rỗng để kéo ra ngoài
        this.taskGroupList.push(taskGroup);
      }
      this.taskGroupList.splice(index - 1, 0, this.taskGroup);

      if (type === 'copy' && this.taskGroup['task'].length > 0) {
        for (let task of this.taskGroup['task']) {
          task['recID'] = Util.uid();
          task['taskGroupID'] = this.taskGroup['recID'];
          task['createdOn'] = new Date();
          task['createdBy'] = this.userId;
          task['roles'].forEach(role => {
            role['recID'] =  Util.uid();
            role['taskID'] = task['recID'];
          });
          this.taskList.push(task);
        }
      }
      // add role vào step
      this.addRole(this.taskGroup['roles'][0]);
    } else {
      if (
        this.taskGroup?.roles[0]['objectID'] !=
        this.roleGroupTaskOld[0]['objectID']
      ) {
        this.addRole(this.taskGroup['roles'][0], this.roleGroupTaskOld[0]);
      }
    }
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
        for (let i = 0; i < this.taskList.length; i++) {
          if (this.taskList[i]['taskGroupID'] === data['recID']) {
            this.taskList.splice(i, 1);
          }
        }
        console.log(this.taskList);
      }
    });
  }

  //Task -- nvthuan
  openTypeJob() {
    this.popupJob = this.callfc.openForm(PopupTypeTaskComponent, '', 400, 400);
    this.popupJob.closed.subscribe(async (value) => {
      if (value?.event) {
        this.jobType = value?.event;
        this.handleTask('add');
      }
    });
  }

  handleTask(type: string, data?: any) {
    let roleOld;
    let taskGroupIdOld = '';
    let dataInput = {};
    if (type === 'add') {
      this.popupJob.close();
    } else if (type === 'copy') {
      dataInput = JSON.parse(JSON.stringify(data));
    } else {
      taskGroupIdOld = data['taskGroupID'];
      roleOld = JSON.parse(JSON.stringify(data['roles']));
      dataInput = data;
    }

    let listData = [
      type,
      this.jobType,
      this.step,
      this.taskGroupList,
      dataInput || {},
      this.taskList,
      this.groupTaskID || this.guidEmpty,
    ];
    var functionID = "DPT0206" //id tuy chojn menu ne
    this.cache.functionList(functionID).subscribe((f) => {
      this.cache
        .gridViewSetup(f.formName, f.gridViewName)
        .subscribe((grv) => {
          let option = new SidebarModel();
          let formModel = this.dialog?.formModel;
          formModel.formName = f.formName;
          formModel.gridViewName = f.gridViewName;
          formModel.entityName = f.entityName;
          formModel.funcID = functionID;
          option.FormModel = formModel;
          option.Width = '550px';
          option.zIndex = 1010;
          let dialog = this.callfc.openSide(PopupJobComponent, listData, option);

          dialog.closed.subscribe((e) => {
            if (e?.event) {
              this.groupTaskID = this.guidEmpty;
              let taskData = e?.event?.data;
              if (e.event?.status === 'add' || e.event?.status === 'copy') {
                let index = this.taskGroupList.findIndex(
                  (group) => group.recID == taskData.taskGroupID
                );
                this.taskGroupList[index]['task'].push(taskData);
                this.taskList.push(taskData);
                this.addRole(taskData['roles'][0]);
              } else {
                if (taskData?.taskGroupID != taskGroupIdOld) {
                  this.changeGroupTaskOfTask(taskData, taskGroupIdOld);
                }
                this.addRole(taskData['roles'][0], roleOld[0]);
              }
            }
          });
        })})

    // let frmModel: FormModel = {
    //   entityName: 'DP_Steps_Tasks',
    //   formName: 'DPStepsTasks',
    //   gridViewName: 'grvDPStepsTasks',
    // };
    // if (type === 'add') {
    //   this.popupJob.close();
    // } else if (type === 'copy') {
    //   dataInput = JSON.parse(JSON.stringify(data));
    // } else {
    //   taskGroupIdOld = data['taskGroupID'];
    //   roleOld = JSON.parse(JSON.stringify(data['roles']));
    //   dataInput = data;
    // }

    // let listData = [
    //   type,
    //   this.jobType,
    //   this.step,
    //   this.taskGroupList,
    //   dataInput || {},
    //   this.taskList,
    //   this.groupTaskID || this.guidEmpty,
    // ];

    // let option = new SidebarModel();
    // option.Width = '550px';
    // option.zIndex = 1001;
    // option.FormModel = frmModel;

    // let dialog = this.callfc.openSide(PopupJobComponent, listData, option);

    // dialog.closed.subscribe((e) => {
    //   if (e?.event) {
    //     this.groupTaskID = this.guidEmpty;
    //     let taskData = e?.event?.data;
    //     if (e.event?.status === 'add' || e.event?.status === 'copy') {
    //       let index = this.taskGroupList.findIndex(
    //         (group) => group.recID == taskData.taskGroupID
    //       );
    //       this.taskGroupList[index]['task'].push(taskData);
    //       this.taskList.push(taskData);
    //       this.addRole(taskData['roles'][0]);
    //     } else {
    //       if (taskData?.taskGroupID != taskGroupIdOld) {
    //         this.changeGroupTaskOfTask(taskData, taskGroupIdOld);
    //       }
    //       this.addRole(taskData['roles'][0], roleOld[0]);
    //     }
    //   }
    // });
  }

  deleteTask(taskList, task) {
    console.log(this.taskList);
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        // delete view
        let indexView = taskList.findIndex(
          (taskGroup) => (taskGroup.recID = task.recID)
        );
        if (indexView >= 0) {
          taskList.splice(indexView, 1);
        }
        this.setIndex(taskList, 'indexNo');
        let indexDb = this.taskList.findIndex(
          (taskFind) => (taskFind.recID = task.recID)
        );
        if (indexDb >= 0) {
          this.taskList.splice(indexView, 1);
        }
      }
    });
  }

  changeGroupTaskOfTask(taskData, taskGroupIdOld) {
    let tastClone = JSON.parse(JSON.stringify(taskData));
    let indexNew = this.taskGroupList.findIndex(
      (task) => task.recID == taskData.taskGroupID
    );
    let index = this.taskGroupList.findIndex(
      (task) => task.recID == taskGroupIdOld
    );
    let listTaskOld = this.taskGroupList[indexNew]['task'] || [];
    let listTaskNew = this.taskGroupList[indexNew]['task'] || [];

    listTaskOld.push(tastClone);
    listTaskNew.forEach((element, i) => {
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
        this.jobType = task.taskType;
        this.handleTask('edit', task);
        break;
      case 'SYS04':
        this.jobType = task.taskType;
        this.handleTask('copy', task);
        break;
      case 'DP07':
        this.jobType = task.taskType;
        this.openPopupViewJob(task);
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
        this.openTypeJob();
        break;
    }
  }

  clickMFStep(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteStep(data);
        break;
      case 'SYS03':
        this.openPopupStep('edit');
        break;
      case 'SYS04':
        this.copyStep(data);
        break;
    }
  }

  async changeDataMF(e, type) {
    if (e != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02':
          case 'SYS03':
          case 'SYS04':
            break;
          case 'SYS003':
            if (type == 'step') res.disabled = true;
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
          default:
            res.disabled = true;
        }
      });
    }
  }
  // drop
  async drop(event: CdkDragDrop<string[]>, data = null, isGroup = false) {
    if (event.previousContainer === event.container) {
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
        groupTaskIdOld =
          event.previousContainer.data[event.previousIndex]['taskGroupID'];
        dataDrop['taskGroupID'] = data?.recID;
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.setIndex(event.previousContainer.data, 'indexNo');
      this.setIndex(event.container.data, 'indexNo');
    }
  }

  dropStep(event: CdkDragDrop<string[]>) {
    if (event.previousIndex == event.currentIndex) return;
    moveItemInArray(this.stepList, event.previousIndex, event.currentIndex);
    this.setIndex(this.stepList, 'stepNo');
  }

  async setTimeGroup(group, task, maxHour) {
    let x = await firstValueFrom(this.notiService.alertCode(this.MESSAGETIME));
    if (x.event && x.event.status == 'Y') {
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
      task['parentID'] = parentID.length > 0 ? parentID.join(';') : '';
      return true;
    } else {
      return false;
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
    let sum = 0;
    if (this.taskGroupList?.length > 0) {
      if (index >= 0) {
        for (let group of this.taskGroupList) {
          if (Number(group['indexNo']) <= index) {
            sum += this.getHour(group);
          }
        }
      } else {
        sum = this.taskGroupList.reduce((sumHour, group) => {
          return (sumHour += this.getHour(group));
        }, 0);
      }
    }
    return sum;
  }

  // sumHourStep(){
  //   let listStaskNoGroup = this.taskList.filter(task => !task['taskGroupID']);
  //   let maxTimeTask = 0;
  //   listStaskNoGroup?.forEach(task => {
  //     let time = this.calculateTimeTaskNoGroup(task['recID'])
  //     maxTimeTask = time > maxTimeTask ? time : maxTimeTask;
  //   })
  //   let timeStep = this.sumHourGroupTask();
  //   return maxTimeTask > timeStep ? maxTimeTask : timeStep;
  // }

  // Common
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

  changeValueInput(event, data) {
    data[event?.field] = event?.data;
  }

  checkButtonContinue() {
    if (this.currentTab == 0) {
      return this.process.processName ? true : false;
    } else {
      return this.stepList?.length > 0 ? true : false;
    }
  }

  setRole<T>(role: T) {
    role['recID'] = Util.uid();
    role['objectName'] = this.user['userName'];
    role['objectID'] = this.user['userID'];
    role['createdOn'] = new Date();
    role['createdBy'] = this.user['userID'];
    return role;
  }

  sumTimeStep() {
    let time = 0;
    this.step?.taskGroups?.forEach((element) => {
      time +=
        Number(element['durationDay'] || 0) * 24 +
        Number(element['durationHour'] || 0);
    });
    this.dayStep = Math.floor(time / 24);
    this.hourStep = Math.floor(time % 24);
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
      }

      if (roleOld) {
        // kiểm tra user có trong các groups khác không nếu thì xóa mà thì thôi.
        let checkExistStep = this.checkExistUser(this.step, roleOld, 'R');
        if (!checkExistStep) {
          console.log(this.step?.roles);

          let index = this.step?.roles.findIndex(
            (roleFind) => roleFind.objectID === roleOld['objectID']
          );
          if (index > -1) {
            this.step?.roles?.splice(index, 1);
          }
        }

        let checkExistProgress = false;
        for (let step of this.stepList) {
          let check = this.checkExistUser(step, roleOld, 'R');
          if (check) {
            checkExistProgress = true;
            break;
          }
        }
        if (!checkExistProgress) {
          let index = this.process['permissions'].findIndex(
            (permissions) => permissions.objectID == roleOld['objectID']
          );
          if (index > -1) {
            this.process['permissions']?.splice(index, 1);
          }
        }
      }
    }
  }
  //test user exists in step
  checkExistUser(step: any, user: any, type: string) {
    for (let element of step['taskGroups']) {
      let check = element['roles'].some(
        (x) => x.objectID == user.objectID && x.roleType == type
      );
      if (check) {
        return true;
      }
    }
    for (let element of step['tasks']) {
      let check = element['roles'].some(
        (x) => x.objectID == user.objectID && x.roleType == type
      );
      if (check) {
        return true;
      }
    }
    return false;
  }
  //View task
  openPopupViewJob(data?: any) {
    let status = 'edit';
    let frmModel: FormModel = {
      entityName: 'DP_Steps_Tasks',
      formName: 'DPStepsTasks',
      gridViewName: 'grvDPStepsTasks',
    };
    if (!data) {
      this.popupJob.close();
      status = 'add';
    }
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1001;
    option.FormModel = frmModel;
    let dialog = this.callfc.openSide(
      ViewJobComponent,
      [
        status,
        this.jobType,
        this.step?.recID,
        this.taskGroupList,
        data || {},
        this.taskList,
      ],
      option
    );
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
    this.changeDetectorRef.detectChanges();
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
      //  let secleted = $event.data;
      this.step.assignControl = $event.data;
    }
    this.changeDetectorRef.detectChanges();
  }
  valueChangeTransferCtrl($event) {
    if ($event && $event != null) {
      //  let secleted = $event.data;
      this.step.transferControl = $event.data;
    }
  }
  valueChangeDuraDay($event) {
    if ($event && $event != null) {
      this.step.durationDay = $event.data;
    }
  }
  valueChangeDuraHour($event) {
    if ($event && $event != null) {
      this.step.durationHour = $event.data;
    }
  }
  valueChangeStartCtrl($event) {
    if ($event && $event != null) {
      this.step.startControl = $event.data;
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
      } else {
        if ($event.field === this.radioYes && checked) {
          this.step.leadtimeControl = true;
        } else if ($event.field === this.radioNo && checked) {
          this.step.leadtimeControl = false;
        }
      }
    }

    this.changeDetectorRef.detectChanges();
  }

  valueChangeMemo($event) {
    if ($event && $event != null) {
      this.step.memo = $event.data;
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
            !this.step?.excludeDayoff.split(';').includes(value)
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
    this.changeDetectorRef.detectChanges();
  }
  checkedDayOff(value: string) {
    if (value !== '' && value) {
      this.checkedSat =
        (value?.split(';').length == 1 &&
          value?.split(';')[0] == this.valueCheckBoxSat) ||
        value?.split(';').length > 1
          ? true
          : false;
      this.checkedSun =
        (value?.split(';').length == 1 &&
          value?.split(';')[0] == this.valueCheckBoxSun) ||
        value?.split(';').length > 1
          ? true
          : false;
    } else {
      this.checkedSat = false;
      this.checkedSun = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  autoHandleStepReason() {
    if (this.action === 'add' || this.action === 'copy') {
      // create step reason fail with value is 1
      this.createStepReason(this.stepSuccess, '1');

      // create step reason fail with value is 2
      this.createStepReason(this.stepFail, '2');
    }
    // edit step reason success/fail
    else if (this.action === 'edit') {
      this.stepSuccess = this.stepList.find((x) => x.isSuccessStep == true);
      this.stepFail = this.stepList.find((x) => x.isFailStep == true);
    }
  }
  editTest(data) {
    this.stepSuccess = data.find((x) => x.isSuccessStep == true);
    this.stepFail = data.find((x) => x.isFailStep == true);
    this.changeDetectorRef.detectChanges();
  }

  createStepReason(stepReason: any, reasonValue: any) {
    stepReason = this.handleStepReason(stepReason, reasonValue);
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
      if (this.reasonName === null || this.reasonName === '') {
        this.notiService.notifyCode('Vui lòng nhập tên lý do kìa');
        return;
      }
      var inxIsExist = this.step.reasons.findIndex(
        (x) =>
          x.reasonName.trim().toLowerCase() ===
          this.reasonName.trim().toLowerCase()
      );
      if (inxIsExist !== -1) {
        this.notiService.notifyCode(
          'Tên lý do đã tồn tại, vui lòng nhập tên khác.'
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
        this.reason.reasonName = this.reasonName;
        this.step.reasons.push(this.reason);
        this.step.reasons = [
          ...new Set(this.step.reasons.map((x) => x.recID)),
        ].map((recID) => this.step.reasons.find((x) => x.recID === recID));
      } else if (this.reasonAction === this.formEdit) {
        this.reason.reasonName = this.reasonName;
      }
      this.popupAddReason.close();
      this.changeDetectorRef.detectChanges();
    }
  }
  changeValueReaName($event) {
    if ($event) {
      this.reasonName = $event?.data;
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
    // if (!this.isClick) {
    //   return;
    // }
    // this.isClick = false;
    this.headerText =
      viewReason === this.viewStepReasonSuccess
        ? clickMore?.customName ?? 'Thêm' + ' lý do thành công'
        : clickMore?.customName ?? 'Thêm' + ' lý do thất bại';
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
            var obj = {
              recID: this.guidEmpty,
              processName: data.datas[0].default,
              // 'Không chuyển đến quy trình khác'
            };
            this.listCbxProccess.unshift(obj);
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
    var data = [oldProccesID, newProccessID, valueListStr];
    this.CodxDpService.getListStepByIdProccessCopy(data).subscribe((res) => {
      if (res) {
        this.editTest(res);
        res.forEach((step) => {
          if (!step.isSuccessStep && !step.isFailStep) {
            const taskGroupList = step?.tasks.reduce((group, product) => {
              const { taskGroupID } = product;
              group[taskGroupID] = group[taskGroupID] ?? [];
              group[taskGroupID].push(product);
              return group;
            }, {});
            const taskGroupConvert = step.taskGroups.map((taskGroup) => {
              return {
                ...taskGroup,
                task: taskGroupList[taskGroup.recID] ?? [],
              };
            });
            step.taskGroups = taskGroupConvert;

            var taskGroup = new DP_Steps_TaskGroups();
            taskGroup['task'] = taskGroupList['null'] || [];
            taskGroup['recID'] = null;
            step['taskGroups'].push(taskGroup);

            this.stepList.push(step);
          }
        });
        this.stepList.sort((a, b) => a['stepNo'] - b['stepNo']);
        this.viewStepSelect(this.stepList[0]);
      }
    });
  }
  formDataCopyProccess(listValue: any) {}
  //#endregion
}
