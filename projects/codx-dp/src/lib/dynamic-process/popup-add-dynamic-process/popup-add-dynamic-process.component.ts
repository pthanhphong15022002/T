import { DP_Steps_Roles } from './../../models/models';
import { CodxDpService } from './../../codx-dp.service';
import { log } from 'console';
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
import { PopupJobComponent } from './popup-job/popup-job.component';
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
  process = new DP_Processes();
  permissions = [];
  dialog: any;
  currentTab = 1; //Bước hiện tại
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
  viewStepCrr: string = 'custom'; // default view step custom settings
  titleViewStepCrr: string = ''; // default title view step custom settings
  isTurnOnYesSuccess: boolean = false; //Create variable Click yes for reason success
  isTurnOnNoSuccess: boolean = false; //Create variable Click no for reason success
  isSwitchReason: boolean = false; // hidden switch of the reason success/failure
  isTurnOnYesFailure: boolean = false; //Create variable Click yes for reason failure
  isTurnOnNoFailure: boolean = false; //Create variable Click no for reason failure
  listRoleInStep: DP_Processes_Permission[] = []; // creat list user role in step
  userPermissions: DP_Processes_Permission; // create object user in step
  gridViewSetupStep: any; // grid view setup

  // const value string
  readonly strEmpty: string = ''; // value empty for methond have variable is null
  readonly viewStepCustom: string = 'custom'; // const view custom
  readonly viewStepReasonSuccess: string = 'reasonSuccess'; // const reason success
  readonly viewStepReasonFail: string = 'reasonFail'; // const reason fail
  readonly radioYes: string = 'yes'; // const click yes
  readonly radioNo: string = 'no'; // const click yes
  readonly titleRadioYes: string = 'Có'; // title radio button yes for reason success/failure
  readonly titleRadioNo: string = 'Không'; // title radio button no for reason success/failure
  readonly titleViewStepReasonSuccess: string = 'Thành công'; // title form step reason failure
  readonly titleViewStepReasonFail: string = 'Thất bại'; // title form step reason failure
  readonly titlecheckBoxStepReasonSuccess: string = 'Thành công'; // title form step reason failure
  readonly titleCheckBoxSat: string = 'Thứ 7'; // title checkbox saturday form duration
  readonly titleCheckBoxSun: string = 'Chủ nhật'; // title checkbox sunday form duration
  readonly formNameSteps: string = 'DPSteps';
  readonly gridViewNameSteps: string = 'grvDPSteps';

  //stage-nvthuan
  user: any;
  userId: string;

  taskGroup: DP_Steps_TaskGroups;
  taskGroupList: DP_Steps_TaskGroups[] = [];

  step: DP_Steps; //data step dc chọn
  stepList: DP_Steps[] = [];  //danh sách step
  stepName = '';

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

  listJobType = [
    {
      id: 'P',
      icon: 'icon-i-layout-three-columns',
      text: 'Cuộc gọi',
      funcID: 'BPT101',
      color: { background: '#f1ff19' },
    },
    {
      id: 'T',
      icon: 'icon-i-journal-check',
      text: 'Công việc',
      funcID: 'BPT103',
      color: { background: '#ffa319' },
    },
    {
      id: 'E',
      icon: 'icon-i-envelope',
      text: 'Gửi mail',
      funcID: 'BPT104',
      color: { background: '#4799ff' },
    },
    {
      id: 'M',
      icon: 'icon-i-calendar-week',
      text: 'Cuộc họp',
      funcID: 'BPT105',
      color: { background: '#ff9adb' },
    },
    {
      id: 'Q',
      icon: 'icon-i-clipboard-check',
      text: 'Khảo sát',
      funcID: 'BPT106',
      color: { background: '#1bc5bd' },
    },
  ];
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
  fieldNew: DP_Steps_Fields;
  stepOfFields: any;
  isHover = '';
  vllType = 'DP022';
  dataChild = [];
  //end data Test
  isShowstage = true;

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

    this.process = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    if (this.action != 'add') {
      // this.showID = true;
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
    //this.step = JSON.parse(JSON.stringify(this.stepList[0]));
    this.getGrvStep();
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
    // this.isTurnOnYesFailure = true;
    console.log(this.isTurnOnYesFailure);
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
    // if (this.process.processNo == null || this.process.processNo.trim() == '') {
    //   this.notiService.notify('Test mã');
    //   return;
    // }
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
          if (this.action == 'edit') {
            this.onUpdate();
          } else {
            this.onAdd();
          }
        }
      });
    } else {
      if (this.action == 'edit') {
        this.onUpdate();
      } else {
        this.onAdd();
      }
    }
  }

  valueChange(e) {
    this.process[e.field] = e.data;
  }
  //#endregion

  //#region Change Tab
  //Click từng tab - mặc định thêm mới = 0
  clickTab(tabNo) {
    //if (tabNo <= this.processTab && tabNo != this.currentTab) {
    if (tabNo != this.currentTab) {
      this.updateNodeStatus(this.currentTab, tabNo);
      this.currentTab = tabNo;
    }
  }

  //#region Open form
  show() {
    this.isShow = !this.isShow;
  }
  showStage() {
    this.isShowstage = !this.isShowstage;
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
        this.updateNodeStatus(oldNode, newNode);
        this.currentTab++;
        this.processTab == 0 && this.processTab++;
        break;
      case 1:
        this.newNode = newNode;
        this.oldNode = oldNode;
        this.updateNodeStatus(oldNode, newNode);
        this.processTab++;
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
        this.vllShare = 'ES014';
        this.typeShare = '1';
        break;
      case 'participants':
        this.vllShare = 'DM001';
        this.typeShare = '2';
        break;
      case 'followers':
        this.vllShare = 'DM001';
        this.typeShare = '3';
        break;
      case 'participants-2':
        this.vllShare = 'TM003';
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
            perm.create = true;

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
          for (var i = 0; i < value.length; i++) {
            var data = value[i];
            var roles = new DP_Steps_Roles();
            roles.objectName = data.text != null ? data.text : data.objectName;
            roles.objectID = data.id != null ? data.id : null;
            roles.objectType = data.objectType;
            roles.roleType = 'O';
            this.step.roles = this.checkRolesStep(
              this.step.roles,
              roles
            );
          }
          break;
      }
    }
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
  clickRoles(type) {
    this.callfc.openForm(
      PopupRolesDynamicComponent,
      '',
      950,
      650,
      '',
      [this.process.permissions, type],
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
  addCustomField(stepID, processID) {
    this.cache.gridView('grvDPStepsFields').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
        .subscribe((res) => {
          this.fieldNew = new DP_Steps_Fields();
          this.fieldNew.stepID = stepID;
          this.fieldNew.processID = processID;
          let titleAction = '';
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
            [this.fieldNew, 'add', titleAction],
            option
          );
          dialogCustomField.closed.subscribe((e) => {
            if (e && e.event != null) {
              //xu ly data đổ về
              this.fieldNew = e.event;
              if (this.step.recID == this.fieldNew.stepID) {
                this.step.fields.push(this.fieldNew);
              }
              this.stepList.forEach((x) => {
                if (x.recID == this.fieldNew.stepID)
                  x.fields.push(this.fieldNew);
              });
              this.changeDetectorRef.detectChanges();
            }
          });
        });
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

  //#stage -- nvthuan
  async openAddStep(type) {
    if (type === 'add') {
      this.step = new DP_Steps();
      this.step['processID'] = this.process?.recID;
      this.step['stepNo'] = this.stepList.length + 1;
      this.popupAddStage = this.callfc.openForm(
        this.addStagePopup,
        '',
        500,
        280
      );
      this.stepName = '';
      this.headerText = 'Thêm Giai Đoạn';
    } else {
      this.headerText = 'Sửa Giai Đoạn';
      this.stepName = this.step['stepName'];
      this.popupAddStage = this.callfc.openForm(
        this.addStagePopup,
        '',
        500,
        280
      );
    }
  }

  clickMFStep(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS01':
        // this.add();
        break;
      case 'SYS03':
        this.openAddStep('edit');
        break;
      case 'SYS04':
        // this.copy(data);
        this.openAddStep('edit');
        break;
      case 'SYS02':
        // this.delete(data);
        break;
    }
  }

  saveAddStep() {
    if (!this.stepName) {
      this.stepList.push(this.step);
      this.titleViewStepCrr = this.step?.stepName;
    }
    this.popupAddStage.close();
  }

  drop(event: CdkDragDrop<string[]>, data = null) {
    if (event.previousContainer === event.container) {
      if (data) {
        moveItemInArray(data, event.previousIndex, event.currentIndex);
      } else {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  //job -- nvthuan
  openJob() {
    this.popupJob = this.callfc.openForm(this.setJobPopup, '', 400, 400);
  }
  selectJob(id) {
    let btn = document.getElementById(id);
    console.log(btn);
  }
  getTypeJob(e, value) {
    this.jobType = value;
  }
  openPopupJob() {
    this.popupJob.close();
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1001;
    let dialog = this.callfc.openSide(
      PopupJobComponent,
      ['add', this.jobType, this.taskGroupList],
      option
    );
    dialog.closed.subscribe((e) => {
      if (e?.event) {
        let taskData = e?.event;
        let index = this.taskGroupList.findIndex(
          (task) => task.recID == taskData.taskGroupID
        );
        this.taskGroupList[index]['task'].push(taskData);
      }
    });
  }
  //# group job
  openGroupJob() {
    this.taskGroup = new DP_Steps_TaskGroups();
    this.taskGroup['recID'] = Util.uid();
    this.taskGroup['createdOn'] = new Date();
    this.taskGroup['createdBy'] = this.userId;
    this.taskGroup['stepID'] = this.step['recID'];
    this.taskGroup['task'] = [];
    this.popupGroupJob = this.callfc.openForm(
      this.addGroupJobPopup,
      '',
      500,
      500
    );
  }
  savePopupGroupJob() {
    this.popupGroupJob.close();
    this.taskGroupList.push(this.taskGroup);
  }
  changeValueInput(event, data) {
    data[event?.field] = event?.data;
  }
  shareUser(share) {
    this.callfc.openForm(share, '', 500, 500);
  }
  onDeleteOwner(objectID, datas) {
    let index = datas.findIndex((item) => item.id == objectID);
    if (index != -1) datas.splice(index, 1);
  }
  applyUser(event, datas, status) {
    if (!event) return;
    let listUser = event;
    listUser.forEach((element) => {
      if (!datas.some((item) => item.id == element.id)) {
        datas.push({
          id: element.id,
          name: element.text,
          type: element.objectType,
        });
      }
    });
    this.taskGroup[status] = JSON.parse(JSON.stringify(datas));
  }
  //#End stage -- nvthuan

  //#region for reason successful/failed
  valueChangeRadio($event, view: string) {
    if (view === this.viewStepReasonSuccess) {
      if ($event.field === 'yes' && $event.component.checked === true) {
        this.isTurnOnYesSuccess = true;
        this.isTurnOnNoSuccess = false;
      } else if ($event.field == 'no' && $event.component.checked === true) {
        this.isTurnOnYesSuccess = false;
        this.isTurnOnNoSuccess = true;
      }
    } else {
      if ($event.field == 'yes' && $event.component.checked === true) {
        this.isTurnOnYesFailure = true;
        this.isTurnOnNoFailure = false;
      } else if ($event.field == 'no' && $event.component.checked === true) {
        this.isTurnOnNoFailure = true;
        this.isTurnOnYesFailure = false;
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
            ? this.titleViewStepReasonSuccess
            : this.titleViewStepReasonFail;

        // Show swtich reason change
        this.isSwitchReason = true;
      } else {
        this.viewStepCrr = this.viewStepCustom;
        if (data) {
          // gán tạm name để test
          this.titleViewStepCrr = data.stepName;
          // hidden swtich reason change
          this.isSwitchReason = false;
          // this.crrDataStep = data;
          this.step = data;
          this.taskGroupList = this.step['taskGroups'];
        }
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  getTitleStepViewSetup() {
    if (this.stepList.length > 0) {
      this.titleViewStepCrr = this.step?.stepName;
    }

    // test nha
    // for(let i=0; i<10; i++){
    //   this.userPermissions.objectName = 'test123'+i;
    //   this.listRoleInStep.push(this.userPermissions);
    // }
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

  valueMemoSetup($event) {}

  //#endregion
}
