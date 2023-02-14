import {
  DP_Steps_Reasons,
  DP_Steps_Roles,
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
import { PopupRolesDynamicComponent } from './popup-roles-dynamic/popup-roles-dynamic.component';
import { format } from 'path';
import { FormGroup } from '@angular/forms';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { ViewJobComponent } from './step-task/view-job/view-job.component';
import { PopupTypeTaskComponent } from './step-task/popup-type-task/popup-type-task.component';
import { StepTaskGroupComponent } from './step-task/step-task-group/step-task-group.component';
import { paste } from '@syncfusion/ej2-angular-richtexteditor';

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

  grvTaskGroupsForm: FormModel;
  grvTaskGroups: any;

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

  listJobType = [];
  jobType: any;
  //stage-nvthuan
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

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private dpService: CodxDpService,
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

    this.process = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    if (this.action != 'add') {
      // this.showID = true;
      this.permissions = this.process.permissions;
      this.processTab = 2;
      this.getAvatar(this.process);
    } else {
      this.process.processNo = dt.data.processNo;
      this.process.instanceNoSetting = dt.data.instanceNo;
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
    this.getGrvStep();
    this.getValListDayoff();
    this.autoHandleStepReason();
  }

  ngAfterViewInit(): void {
    // if (this.action != 'edit') this.genAutoNumber();
    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'AutoNumberDefaultsBusiness',
        'GetFieldAutoNoAsync',
        [this.funcID, this.entityName]
      )
      .subscribe((res) => {
        if (res && !res.stop && res.autoAssignRule == '1') {
          this.showID = true;
        } else {
          this.showID = false;
        }
      });
  }

  //genAutoNumber
  async genAutoNumber() {
    this.dpService
      .genAutoNumber(this.funcID, 'DP_Processes', 'processNo')
      .subscribe((res) => {
        if (res) {
          this.process.processNo = res;
          this.showID = true;
          this.process.instanceNoSetting = this.process.processNo;
        } else {
          this.showID = false;
        }
      });
  }

  ngOnInit(): void {
    // this.updateNodeStatus(0,1);
    this.getTitleStepViewSetup();
    this.initForm();
    this.checkedDayOff(this.step?.excludeDayoff);
    if (this.action != 'add') {
      this.getStepByProcessID();
    }

    this.cache.gridView('grvDPStepsTaskGroups').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsTaskGroups', 'grvDPStepsTaskGroups')
        .subscribe((res) => {
          this.grvTaskGroups = res;
          this.grvTaskGroupsForm = {
            entityName: 'DP_Steps_TaskGroups',
            formName: 'DPStepsTaskGroups',
            gridViewName: 'grvDPStepsTaskGroups',
          };
        });
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
  beforeSave(op) {
    var data = [];
    op.className = 'ProcessesBusiness';
    if (this.action == 'add') {
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
        this.imageAvatar.clearData();
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.imageAvatar.clearData();
          this.dialog.close(res.update);
        }
      });
  }

  async onSave() {
    if (
      this.process.processName == null ||
      this.process.processName.trim() == ''
    ) {
      this.notiService.notify('Test name');
      return;
    }
    if (this.imageAvatar?.fileUploadList?.length > 0) {
      (await this.imageAvatar.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.handlerSave();
        }
      });
    } else {
      this.handlerSave();
    }
  }

  handlerSave() {
    if (this.action == 'add') {
      this.addReasonInStep(this.stepList, this.stepSuccess, this.stepFail);
      this.onAdd();
      this.handleAddStep();
      this.notiService.notifyCode('SYS006');
    } else if (this.action == 'edit') {
      this.onUpdate();
      this.handleUpdateStep();
      this.notiService.notifyCode('SYS006');
    }
  }

  handleAddStep() {
    let stepListSave = JSON.parse(JSON.stringify(this.stepList));
    if (stepListSave.length > 0) {
      stepListSave.forEach((step) => {
        if (step && step['taskGroups']) {
          delete step['taskGroups']['task'];
        }
      });

      this.dpService.addStep([stepListSave]).subscribe((data) => {
        if (data) {
        }
      });
    }
  }

  handleUpdateStep() {
    this.stepList.push(this.stepSuccess);
    this.stepList.push(this.stepFail);
    let stepListSave = JSON.parse(JSON.stringify(this.stepList));
    if (stepListSave.length > 0 || this.stepListAdd.length > 0) {
      stepListSave.forEach((step) => {
        if (step && step['taskGroups']) {
          delete step['taskGroups']['task'];
        }
      });
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
    if(this.process.applyFor){
      this.loadCbxProccess();
    }
  }
  //#endregion

  //#region Change Tab
  //Click từng tab - mặc định thêm mới = 0
  clickTab(tabNo) {
    //if (tabNo <= this.processTab && tabNo != this.currentTab) {
    let newNo = tabNo;
    let oldNo = this.currentTab;
    if (tabNo <= this.processTab && tabNo != this.currentTab) {
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
          this.process.processNo == null ||
          this.process.processNo == '' ||
          this.process.processName == null ||
          this.process.processName == ''
        ) {
          this.isContinues = true;
        }
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      case 1:
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
    switch (type) {
      case 'supervisor':
        this.vllShare = 'DP0331';
        this.typeShare = '1';
        break;
      case 'participants':
        this.vllShare = 'DP0331';
        this.typeShare = '2';
        break;
      case 'followers':
        this.vllShare = 'DP0332';
        this.typeShare = '3';
        break;
      case 'participants-2':
        this.vllShare = 'DP0331';
        this.typeShare = '4';
        break;
    }
    this.callfc.openForm(share, '', 420, window.innerHeight);
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
            perm.objectName = data.text != null ? data.text : data.objectName;
            perm.objectID = data.id != null ? data.id : null;
            perm.objectType = data.objectType;
            perm.full = true;
            perm.create = true;
            perm.read = true;
            perm.update = true;
            perm.assign = true;
            perm.delete = true;
            perm.share = true;
            perm.upload = true;
            perm.download = true;
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
            perm.objectName = data.text != null ? data.text : data.objectName;
            perm.objectID = data.id != null ? data.id : null;
            perm.objectType = data.objectType;
            perm.roleType = 'P';
            perm.read = true;

            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.process.permissions = this.permissions;
          break;
        case '3':
          var value = e;
          for (var i = 0; i < value.length; i++) {
            var data = value[i];
            var perm = new DP_Processes_Permission();
            perm.objectName = data.text != null ? data.text : data.objectName;
            perm.objectID = data.id != null ? data.id : null;
            perm.objectType = data.objectType;
            perm.roleType = 'F';
            perm.read = true;
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
            roles.objectName = data.text != null ? data.text : data.objectName;
            roles.objectID = data.id != null ? data.id : null;
            roles.objectType = data.objectType;
            roles.roleType = 'S';
            tmpRole = this.checkRolesStep(this.step.roles, roles);
            var perm = new DP_Processes_Permission();
            perm.objectName = data.text != null ? data.text : data.objectName;
            perm.objectID = data.id != null ? data.id : null;
            perm.objectType = data.objectType;
            perm.roleType = 'P';
            perm.read = true;
            this.permissions = this.checkUserPermission(this.permissions, perm);
          }
          this.step.roles = tmpRole;
          this.process.permissions = this.permissions;
          break;
      }
    }
    this.changeDetectorRef.detectChanges();
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

  checkRolesStep(listPerm: DP_Steps_Roles[], perm: DP_Steps_Roles) {
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

  addFile(e) {
    this.attachment.uploadFile();
  }

  //Popup roles process
  clickRoles() {
    var title = 'Phân quyền';
    this.callfc.openForm(
      PopupRolesDynamicComponent,
      '',
      950,
      650,
      '',
      [this.process, title],
      '',
      this.dialog
    );
  }
  //end

  //Popup setiing autoNumber
  openAutoNumPopup() {
    if (this.process.instanceNoSetting != this.process.processNo) {
      //save new autoNumber
      let popupAutoNum = this.callfc.openForm(
        PopupAddAutoNumberComponent,
        '',
        550,
        (screen.width * 40) / 100,
        '',
        {
          formModel: this.dialog.formModel,
          autoNoCode: this.process.processNo,
          description: this.entityName,
          newAutoNoCode: this.process.processNo,
          isSaveNew: '1',
        }
      );
      popupAutoNum.closed.subscribe((res) => {
        if (res?.event) {
        }
      });
    } else {
      //cap
      let popupAutoNum = this.callfc.openForm(
        PopupAddAutoNumberComponent,
        '',
        550,
        (screen.width * 40) / 100,
        '',
        {
          formModel: this.dialog.formModel,
          autoNoCode: this.process.processNo,

          description: this.entityName,
        }
      );
      popupAutoNum.closed.subscribe((res) => {
        if (res?.event) {
          this.process.instanceNoSetting = this.process.processNo;
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

  dropFile(event: CdkDragDrop<string[]>, recID) {
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
            this.stepList.push(step);
          }
        });
        this.stepList.sort((a, b) => a['stepNo'] - b['stepNo']);
        this.viewStepSelect(this.stepList[0]);
        console.log(this.stepList);
      }
    });
  }

  openPopupAddEditStep(type) {
    if (type === 'add') {
      this.step = new DP_Steps();
      this.step['processID'] = this.process?.recID;
      this.step['stepNo'] = this.stepList.length + 1;
      this.stepName = '';
      this.headerText = 'Thêm Giai Đoạn';
    } else {
      this.headerText = 'Sửa Giai Đoạn';
      this.stepName = this.step['stepName'];
    }
    this.popupAddStage = this.callfc.openForm(this.addStagePopup, '', 500, 280);
  }

  addAndEditStep() {
    if (!this.stepName) {
      this.stepList.push(this.step);
      this.viewStepSelect(this.step);
      if (this.action == 'edit') {
        this.stepListAdd.push(this.step);
      }
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

  clickMFStep(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteStep(data);
        break;
      case 'SYS03':
        this.openPopupAddEditStep('edit');
        break;
      case 'SYS04':
        // this.copy(data);
        break;
    }
  }
  
  dropStep(event: CdkDragDrop<string[]>) {
    if (event.previousIndex == event.currentIndex) return;
    moveItemInArray(this.stepList, event.previousIndex, event.currentIndex);
    this.setIndex(this.stepList, 'stepNo');
  }

  //taskGroup
  drop(event: CdkDragDrop<string[]>, data = null) {
    if (event.previousContainer === event.container) {
      if (data) {
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
  clickMFTaskGroup(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deletepGroupJob(data);
        break;
      case 'SYS03':
        this.openTaskGroup(data);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
    }
  }
  openTaskGroup(data?: any) {
    this.taskGroup = new DP_Steps_TaskGroups();
    if (data) {
      this.userGroupJob = data?.roles || [];
      this.taskGroup = data;
    } else {
      this.userGroupJob = [];
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
    this.popupGroupJob.closed.subscribe(res => {
      if(res?.event){
        this.savePopupGroupJob();
      }
    })
  }
  savePopupGroupJob() {
    this.popupGroupJob.close();
    if (!this.taskGroup['recID']) {
      this.taskGroup['recID'] = Util.uid();
      this.taskGroupList.push(this.taskGroup);
      let taskGroupList = JSON.parse(JSON.stringify(this.taskGroup));
      delete taskGroupList['task'];
      this.taskGroupListSave.push(taskGroupList);
    }
    let sumDay = 0;
    let sumHour = 0;
    this.step?.taskGroups?.forEach(taskGroup => {
      sumDay += Number(taskGroup?.durationDay) || 0;
      sumHour += Number(taskGroup?.durationHour) || 0;
    })
    if(sumHour >=24){
      sumDay += Math.floor(sumHour/24);
      sumHour = sumHour%24;
    }
    this.step['durationDay'] = sumDay;
    this.step['durationHour'] = sumHour;
  }
  deletepGroupJob(data) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        let index = this.taskGroupList.findIndex(
          (step) => step.recID == data.recID
        );
        if (index >= 0) {
          this.taskGroupList.splice(index, 1);
        }
      }
    });
  }

  //Task -- nvthuan
  openTypeJob() {
    this.popupJob = this.callfc.openForm(PopupTypeTaskComponent, '', 400, 400);
    this.popupJob.closed.subscribe(async (value) => {
      debugger
      if (value?.event) {
        this.jobType = value?.event;
        this.openPopupJob();
      }
    });
  }
  openPopupJob(data?: any) {
    let taskGroupIdOld = '';
    let status = 'edit';
    let frmModel: FormModel = {
      entityName: 'DP_Steps_Tasks',
      formName: 'DPStepsTasks',
      gridViewName: 'grvDPStepsTasks',
    };
    if (!data) {
      this.popupJob.close();
      status = 'add';
    } else {
      taskGroupIdOld = data['taskGroupID'];
    }
    let listData = [
      status,
      this.jobType,
      this.step?.recID,
      this.taskGroupList,
      data || {},
      this.taskList,
      this.step?.stepName,
    ];

    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1001;
    option.FormModel = frmModel;

    let dialog = this.callfc.openSide(PopupJobComponent, listData, option);

    dialog.closed.subscribe((e) => {
      if (e?.event) {
        let taskData = e?.event?.data;
        if (e.event?.status === 'add') {
          let index = this.taskGroupList.findIndex(
            (task) => task.recID == taskData.taskGroupID
          );
          this.taskGroupList[index]['task'].push(taskData);
          this.taskList.push(taskData);
        } else {
          if (taskData?.taskGroupID != taskGroupIdOld) {
            this.changeGroupTask(taskData, taskGroupIdOld);
          }
        }
      }
    });
  }

  changeGroupTask(taskData, taskGroupIdOld) {
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

  clickMFTask(e: any, taskList?: any, task?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(taskList, task);
        break;
      case 'SYS03':
        this.jobType = task.taskType;        
        this.openPopupJob(task);
        break;
      case 'SYS04':
        // this.copy(data);
        break;
      case 'DP01':
        this.jobType = task.taskType;      
        this.openPopupViewJob(task);
        break;
    }
  }
  deleteTask(taskList, task) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        let index = taskList.findIndex(
          (taskGroup) => (taskGroup.recID = task.recID)
        );
        if (index >= 0) {
          taskList.splice(index, 1);
        }
        this.setIndex(taskList, 'indexNo');
      }
    });
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
  // Common
  setIndex(data: any, value: string) {
    if (data.length > 0) {
      data.forEach((item, index) => {
        item[value] = index + 1;
      });
    }
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
    }
  }
  changeValueInput(event, data) {
    data[event?.field] = event?.data;
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
              this.step?.excludeDayoff.trim() == '') ||
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
    if (this.action === 'add') {
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
    stepReason.reasonControl = true;
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
    reason.modifiedBy = this.userId;
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
    if (this.reasonAction === this.formAdd) {
      this.reason = this.handleReason(
        this.reason,
        this.dataValueview === this.viewStepReasonSuccess ? '1' : '2',
        this.step,
        this.process?.recID
      );
      this.reason.reasonName = this.reasonName;
      this.step.reasons.push(this.reason);
    } else if (this.reasonAction === this.formEdit) {
      this.reason.reasonName = this.reasonName;
    }

    this.changeDetectorRef.detectChanges();
    this.popupAddReason.close();
  }

  changeValueReaName($event) {
    if ($event) {
      this.reasonName = $event.data;
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

  loadCbxProccess() {
    this.cache.valueList('DP031').subscribe((data) => {
      this.dpService.getlistCbxProccess(this.process?.applyFor).subscribe((res) => {
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

  //#endregion
}
