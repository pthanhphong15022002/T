import { comment } from './../../../../../codx-share/src/lib/components/pdf/model/tmpSignArea.model';
import {
  DP_Instances_Permissions,
  DP_Instances_Steps_Roles,
} from './../../models/models';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  CallFuncService,
  CacheService,
  AuthStore,
} from 'codx-core';
import { CodxDpService } from '../../codx-dp.service';
import {
  DP_Instances,
  DP_Instances_Steps,
  DP_Instances_Steps_Reasons,
} from '../../models/models';
import moment from 'moment';

@Component({
  selector: 'lib-popup-move-stage',
  templateUrl: './popup-move-stage.component.html',
  styleUrls: ['./popup-move-stage.component.scss'],
})
export class PopupMoveStageComponent implements OnInit {
  dialog: any;
  formModel: FormModel;
  listStep: DP_Instances_Steps[];
  listStepsCbx: DP_Instances_Steps[] = [];

  headerText: string = '';
  stepName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';
  isLockStep: boolean = false;
  memo = '';
  instanceSteps: DP_Instances_Steps[];
  instance = new DP_Instances();
  stepIdOld: string = '';
  IdFail: string = '';
  IdSuccess: string = '';
  instancesStepOld = new DP_Instances_Steps();
  IdStepEnd: any;
  isLockReasons: boolean = false;
  isReason: any = null;
  stepReason = new DP_Instances_Steps_Reasons();
  stepIdClick: string = '';
  idTest: any;
  //instanceStep = new DP_Instances_Steps;
  lstParticipants = [];
  listCustomFile = [];
  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };
  5;
  stepCurrent: any;
  lstRoles = [];
  assignControl: any;
  fieldCbxRole = { text: 'objectName', value: 'objectID' };
  positionName = '';
  userName = '';
  owner = '';
  ownerName = '';
  stepOld: any;
  firstInstance: any;
  listTaskGroupDone: any = [];
  listTaskDone: any = [];
  listTypeTask: any = [];
  isShow: boolean = true;
  isCheckAll: boolean = false;
  isUseReason: any;
  gridViewInstanceStep: any;
  isStopData: boolean = true;
  totalRequireCompleted: number = 0;
  totalRequireCompletedChecked: number = 0;
  actionCheck: string = '';
  isSaving: boolean = false;
  listStepProccess: any;
  user: any;

  tmpTasks: any[] = [];
  tmpGroups: any[] = [];
  isMoveNext: boolean = false;
  isDurationControl: boolean = false;
  readonly oneHundredNumber: number = 100;
  readonly viewTask: string = 'Task';
  readonly viewTaskGroup: string = 'TaskGroup';
  fieldsNull = [];
  dateMessage: any;
  applyFor: any;

  progressAll = false;
  progressDefault = false;
  progressAction: string = '';

  // CM
  dataCM: any;
  recID: any;
  processID: any;
  stepID: any;
  probability: any;
  expectedClosed: any = null;
  isLoad: boolean = false;
  formModelDeal: FormModel = {
    formName: 'CMDeals',
    gridViewName: 'grvCMDeals',
    entityName: 'CM_Deals',
  };

  constructor(
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private cache: CacheService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.isUseReason = dt?.data?.stepReason;
    this.headerText = dt?.data?.headerTitle; //  gán sau button add
    this.stepName = dt?.data?.stepName;
    this.applyFor = dt?.data?.applyFor;
    this.viewClick = this.viewKanban;

    if (this.applyFor == '0') {
      this.instance = JSON.parse(JSON.stringify(dt?.data.instance));
      this.listStepsCbx = JSON.parse(JSON.stringify(dt?.data.listStepCbx));
      this.listStepProccess = dt?.data?.listStepProccess;
      this.isDurationControl = dt?.data?.isDurationControl;
      this.stepIdClick = JSON.parse(JSON.stringify(dt?.data?.stepIdClick));
      this.getIdReason();
    } else if (this.applyFor != '0') {
      this.dataCM = JSON.parse(JSON.stringify(dt?.data?.dataCM));
      this.probability = dt?.data?.deal?.probability;
      this.expectedClosed = dt?.data?.deal?.expectedClosed;
      this.stepIdClick = this.dataCM?.nextStep;
      this.executeApiCalls();
      this.isLoad = true;
    }
    this.stepID = this.dataCM ? this.dataCM?.stepID : this.instance?.stepID;
    this.processID = this.dataCM
      ? this.dataCM?.processID
      : this.instance?.processID;
    this.recID = this.dataCM ? this.dataCM?.refID : this.instance?.recID;

    if (!this.isLoad) {
      this.lstParticipants = dt?.data.lstParticipants;
    }
    this.stepIdOld = this.stepID;
    this.codxDpService.getFirstIntance(this.processID).subscribe((res) => {
      if (res) {
        this.firstInstance = res;
      }
    });
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
    this.applyFor == '0' &&
      this.getStepByStepIDAndInID(this.recID, this.stepIdOld);
    this.getGrvInstanceStep();
  }

  ngOnInit(): void {
    if (!this.isLoad) {
      this.removeReasonInSteps(this.listStepsCbx, this.isUseReason);
      this.stepIdClick &&
        this.stepIdClick != this.stepIdOld &&
        this.autoClickedSteps(this.listStepsCbx);
      this.eventAutoClick();
    }
  }
  autoClickedSteps(listStep: any) {
    let idx = listStep.findIndex((x) => x.stepID === this.stepIdOld);
    if (idx > -1 && idx !== listStep.length - 1) {
      this.stepIdClick = listStep[idx + 1]?.stepID;
    } else {
      this.stepIdClick = this.stepIdOld;
    }
  }

  eventAutoClick() {
    this.isMoveNext = this.checkSpaceInStep(this.stepIdClick, this.stepIdOld);
  }

  async executeApiCalls() {
    try {
      await this.getListMoveStage(this.dataCM);
    } catch (error) {}
  }

  async getListMoveStage(data) {
    var datas = [data?.refID, data?.processID, data?.stepID, this.applyFor];
    this.codxDpService.getInstanceStepsMoveStage(datas).subscribe((res) => {
      if (res && res.length > 0) {
        this.isDurationControl = res[0];
        this.listStepsCbx = res[1];
        this.getListParticipants(res[2]);
        this.getIdReason();
        this.eventAutoClick();
        this.removeReasonInStepsAuto(res[3], res[4], res[1]);
        this.getStepByStepIDAndInID(this.recID, this.stepIdOld);
        !this.stepIdClick && this.autoClickedSteps(this.listStepsCbx);
        this.isMoveNext = this.checkSpaceInStep(
          this.stepIdClick,
          this.stepIdOld
        );
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  removeReasonInStepsAuto(isUseSuccess, isUseFail, listStepCbx) {
    !isUseFail && this.removeItemFail(listStepCbx);
    !isUseSuccess && this.removeItemSuccess(listStepCbx);
  }
  getIdReason() {
    this.IdFail =
      this.listStepsCbx[this.listStepsCbx?.findIndex((x) => x.isFailStep)]
        ?.stepID ?? '';
    this.IdSuccess =
      this.listStepsCbx[this.listStepsCbx?.findIndex((x) => x.isSuccessStep)]
        ?.stepID ?? '';
  }

  async getListParticipants(permissions) {
    if (permissions != null && permissions.length > 0) {
      this.lstParticipants = permissions.filter((x) => x.roleType === 'P');
      if (this.lstParticipants != null && this.lstParticipants.length > 0) {
        this.lstParticipants = await this.codxDpService.getListUserByOrg(
          this.lstParticipants
        );
      }
    }
  }

  getNameAndPosition(id) {
    this.codxDpService.getPositionByID(id).subscribe((res) => {
      if (res) {
        this.userName = res.userName;
        this.positionName = res.positionName;
      }
    });
  }

  getStepByStepIDAndInID(insID, stepID) {
    this.codxDpService
      .getStepByStepIDAndInID(insID, stepID)
      .subscribe((res) => {
        if (res) {
          this.stepCurrent = res;
          var i = -1;
          this.assignControl = this.stepCurrent.assignControl;
          switch (this.assignControl) {
            //Phụ trách giai đoạn hiện tại
            case '0':
              if (
                this.stepCurrent?.roles != null &&
                this.stepCurrent?.roles.length > 0
              ) {
                var role = this.stepCurrent?.roles.filter(
                  (x) =>
                    x.objectID == this.stepCurrent?.owner && x.roleType == 'S'
                );
                if (role != null && role.length > 0) {
                  if (role[0].objectType != 'U' && role[0].objectType != '1') {
                    this.getOwnerByListRoles(
                      role.map((x) => x.objectID),
                      role[0].objectType
                    );
                  } else {
                    this.owner = this.stepCurrent?.owner;
                  }
                } else {
                  this.owner = this.stepCurrent?.owner;
                }
              } else {
                this.owner = '';
              }
              // if (this.owner != null) this.getNameAndPosition(this.owner);
              break;
            //Phụ trách giai đoạn chuyển tiếp
            case '1':
              var index = -1;
              index = this.listStepsCbx.findIndex(
                (x) => x.stepID == this.stepIdClick
              );

              if (
                this.listStepsCbx[index]?.roles != null &&
                this.listStepsCbx[index]?.roles.length > 0
              ) {
                var roleClick = this.listStepsCbx[index]?.roles.filter(
                  (x) =>
                    x.objectID == this.listStepsCbx[index]?.owner &&
                    x.roleType == 'S'
                );
                if (roleClick != null && roleClick.length > 0) {
                  if (
                    roleClick[0].objectType != 'U' &&
                    roleClick[0].objectType != '1'
                  ) {
                    this.getOwnerByListRoles(
                      roleClick.map((x) => x.objectID),
                      roleClick[0].objectType
                    );
                  } else {
                    this.owner = this.listStepsCbx[index]?.owner;
                  }
                } else {
                  this.owner = this.listStepsCbx[index]?.owner;
                }
              } else {
                this.owner = '';
              }
              // if (this.owner != null) this.getNameAndPosition(this.owner);

              break;
            //Giữ nguyên phụ trách trước
            case '2':
              i = this.listStepsCbx.findIndex(
                (x) => x.stepID == this.stepCurrent.stepID
              );
              if (
                this.listStepsCbx[i - 1]?.roles != null &&
                this.listStepsCbx[i - 1]?.roles.length > 0
              ) {
                var roleOld = this.listStepsCbx[i - 1]?.roles.filter(
                  (x) =>
                    x.objectID == this.listStepsCbx[i - 1]?.owner &&
                    x.roleType == 'S'
                );
                if (roleOld != null && roleOld.length > 0) {
                  if (
                    roleOld[0].objectType != 'U' &&
                    roleOld[0].objectType != '1'
                  ) {
                    this.getOwnerByListRoles(
                      roleOld.map((x) => x.objectID),
                      roleOld[0].objectType
                    );
                  } else {
                    this.owner = this.listStepsCbx[i - 1]?.owner;
                  }
                } else {
                  this.owner = this.listStepsCbx[i - 1]?.owner;
                }
              } else {
                this.owner = '';
              }
              // if (this.owner != null) this.getNameAndPosition(this.owner);
              break;
            //Người nhận nhiệm vụ đầu tiên
            case '3':
              this.owner = this.firstInstance?.owner;
              // if (this.owner != null) this.getNameAndPosition(this.owner);
              break;
            //Người nhận nhiệm vụ hiện tại
            case '4':
              this.owner = this.instance?.owner;
              // if (this.owner != null) this.getNameAndPosition(this.owner);
              break;
          }

          if (this.isStopData) {
            var data = JSON.parse(JSON.stringify(res));
            this.updateDataInstance(data);
            this.isStopData = false;
          }
        }
      });
  }

  updateDataInstance(data: any) {
    this.instancesStepOld = data;
    this.fieldsNull = this.instancesStepOld.fields.filter((x) => !x.dataValue);
    this.instancesStepOld.actualEnd = this.checkDuration(
      this.isDurationControl,
      this.instancesStepOld?.actualEnd
    );
    this.listTaskDone = this.instancesStepOld.tasks.filter(
      (x) => x.progress < this.oneHundredNumber
    );
    this.listTaskGroupDone = this.instancesStepOld.taskGroups.filter(
      (x) => x.progress < this.oneHundredNumber
    );
  }

  onSave() {
    if (this.isMoveNext) {
      if (this.totalRequireCompletedChecked !== this.totalRequireCompleted) {
        this.notiService.notifyCode('DP022');
        return;
      }
      if (!this.instancesStepOld.actualEnd) {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewInstanceStep['ActualEnd']?.headerText + '"'
        );
        return;
      }
      if (
        this.compareDates(
          this.instancesStepOld.actualStart,
          this.instancesStepOld.actualEnd
        )
      ) {
        this.notiService.notifyCode(
          'DP032',
          0,
          '"' + this.gridViewInstanceStep['ActualEnd']?.headerText + '"',
          '"' + this.dateMessage + '"'
        );
        return;
      }
      if (!this.owner) {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewInstanceStep['Owner']?.headerText + '"'
        );
        return;
      }
      let ischeck = true;
      let ischeckFormat = true;
      let title = '';
      let messageCheckFormat = '';
      for (let item of this.fieldsNull) {
        if (
          item.isRequired &&
          (!item.dataValue || item.dataValue?.toString().trim() == '')
        ) {
          title = item.title;
          ischeck = false;
          break;
        }
        if (item) {
          messageCheckFormat = this.checkFormat(item);
          if (messageCheckFormat) {
            ischeckFormat = false;
            break;
          }
        }
      }
      if (!ischeck) {
        this.notiService.notifyCode('SYS009', 0, '"' + title + '"');
        return;
      }
      if (!ischeckFormat) {
        this.notiService.notifyCode(messageCheckFormat);
        return;
      }

      if (this.isCheckRequiredTask(this.listTaskDone)) {
        return;
      }
    }
    this.beforeSave();
  }
  beforeSave() {
    if (
      this.stepIdClick === this.IdSuccess ||
      this.stepIdClick === this.IdFail
    ) {
      this.instance.stepID = this.stepIdOld;
      this.instancesStepOld.stepID = this.stepIdOld;
      this.stepIdOld = '';
      this.isReason = this.stepIdClick === this.IdFail ? false : true;
    } else {
      this.setRoles();
      this.instancesStepOld.stepID = this.stepIdClick;
    }
    if (
      (!!this.listTaskGroupDone || !!this.listTaskDone) &&
      this.stepIdClick === this.stepIdOld
    ) {
      this.stepIdOld = '';
    }
    if (this.listTaskDone.length > 0 && this.listTaskDone != null) {
      var listTmpTask = this.convertTmpDataInTask(this.listTaskDone, 'T');
    }
    if (this.listTaskDone.length > 0 && this.listTaskDone != null) {
      var listTmpGroup = this.convertTmpDataInTask(this.listTaskGroupDone, 'G');
    }
    var data = [
      this.recID,
      this.stepIdOld,
      this.owner,
      this.ownerName,
      this.instancesStepOld,
      listTmpTask,
      listTmpGroup,
    ];
    this.codxDpService.moveStageByIdInstance(data).subscribe((res) => {
      if (res) {
        this.instance = res[0];
        this.listStep = res[1];
        var obj = {
          listStep: this.listStep,
          instance: this.instance,
          isReason: this.isReason,
          comment: this.instancesStepOld?.note,
          probability: this.probability,
          expectedClosed: this.expectedClosed,
        };
        this.stepIdClick = '';
        this.stepIdOld = '';
        this.dialog.close(obj);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  setRoles() {
    var tmp = this.lstParticipants.find((x) => x.userID == this.owner);
    this.ownerName = tmp?.userName;
  }

  valueChange($event) {
    if ($event) {
      this.instancesStepOld[$event.field] = $event.data;
    }
    this.changeDetectorRef.detectChanges();
  }

  changeTime($event) {
    if ($event) {
      this.instancesStepOld[$event.field] = $event.data.fromDate;
    }
    this.changeDetectorRef.detectChanges();
  }
  valueChangeDataCM($event) {
    if ($event) {
      if ($event.field === 'expectedClosed') {
        this.expectedClosed = $event.data.fromDate;
      } else if ($event.field === 'probability') {
        this.probability = $event.data;
      }
    }
  }

  cbxChange($event) {
    if ($event && this.stepIdClick !== $event) {
      this.stepIdClick = $event;
      this.getStepByStepIDAndInID(this.recID, this.stepIdClick);
      this.isMoveNext = this.checkSpaceInStep(this.stepIdClick, this.stepIdOld);
      this.changeDetectorRef.detectChanges();
    }
  }

  openPopupParticipants(popupParticipants) {
    this.callfc.openForm(popupParticipants, '', 950, 650);
  }

  eventUser(e) {
    this.owner = e?.id;
  }
  removeItemSuccess(list) {
    let idx = list.findIndex((x) => x.isSuccessStep);
    if (idx >= 0) list.splice(idx, 1);
  }
  removeItemFail(list) {
    let idx = list.findIndex((x) => x.isFailStep);
    if (idx >= 0) list.splice(idx, 1);
  }
  removeReasonInSteps(listStepCbx, stepReason) {
    !stepReason.isUseFail && this.removeItemFail(listStepCbx);
    !stepReason.isUseSuccess && this.removeItemSuccess(listStepCbx);
  }
  setToDay() {
    this.instancesStepOld.actualEnd = new Date();
  }

  checkSpaceInStep(stepClick, stepOld) {
    var indexClick = this.listStepsCbx.findIndex((x) => x.stepID == stepClick);
    var indexOld = this.listStepsCbx.findIndex((x) => x.stepID == stepOld);
    var space = indexClick - indexOld;
    if (space > 0) {
      return true;
    }
    return false;
  }

  getGrvInstanceStep() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewInstanceStep = res;
        }
      });
  }
  inputCustomField(e) {
    this.stepIdOld = e;
  }
  actionSaveCustomField(e) {
    this.isSaving = e;
  }

  showColumnControl(stepID) {
    if (this.listStepProccess?.length > 0) {
      var idx = this.listStepProccess.findIndex((x) => x.recID == stepID);
      if (idx == -1) return 1;
      return this.listStepProccess[idx]?.showColumnControl;
    }
    return 1;
  }

  valueChangeCustom(event) {
    //bo event.e vì nhan dc gia trị null
    if (event && event.data) {
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'D':
          result = event.e?.data.fromDate;
          break;
        case 'P':
        case 'R':
        case 'A':
          result = event.e;
          break;
      }
      let index = this.instancesStepOld.fields.findIndex(
        (x) => x.recID == field.recID
      );
      let indexView = this.fieldsNull.findIndex((x) => x.recID == field.recID);
      if (index != -1) {
        this.instancesStepOld.fields[index].dataValue = result;
        if (indexView != -1) {
          this.fieldsNull[index].dataValue = result;
        }
      }
    }
  }

  checkFormat(field) {
    if (field.dataType == 'T') {
      if (field.dataFormat == 'E') {
        var validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (
          !field?.dataValue?.toLowerCase().match(validEmail) &&
          field?.dataValue
        ) {
          return 'SYS037';
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (
          !field?.dataValue?.toLowerCase().match(validPhone) &&
          field?.dataValue
        ) {
          return 'RS030';
        }
      }
    }
    return '';
  }

  updateProgressInstance() {
    if (this.listTaskDone?.length > 0 && this.listTaskGroupDone?.length > 0) {
      if (
        this.listTaskDone.length == this.listTaskDone.length &&
        this.listTaskGroupDone.length == this.listTaskGroupDone.length
      ) {
        this.instancesStepOld.progress = 100;
      }
    }
  }
  getOwnerByListRoles(lstRoles, objectType) {
    var lstOrg = [];
    if (lstRoles != null && lstRoles.length > 0) {
      switch (objectType) {
        case 'O':
          this.codxDpService
            .getListUserByListOrgUnitIDAsync(lstRoles, 'O')
            .subscribe((res) => {
              if (res != null && res.length > 0) {
                lstOrg = res;
                this.owner = lstOrg[0]?.userID;
              } else {
                this.owner = '';
              }
            });
          break;
        case 'D':
          this.codxDpService
            .getListUserByListOrgUnitIDAsync(lstRoles, 'D')
            .subscribe((res) => {
              if (res != null && res.length > 0) {
                lstOrg = res;
                this.owner = lstOrg[0]?.userID;
              } else {
                this.owner = '';
              }
            });
          break;
        case 'P':
          this.codxDpService
            .getListUserByListOrgUnitIDAsync(lstRoles, 'P')
            .subscribe((res) => {
              if (res != null && res.length > 0) {
                lstOrg = res;
                this.owner = lstOrg[0]?.userID;
              } else {
                this.owner = '';
              }
            });
          break;
        case 'R':
          this.codxDpService.getListUserByRoleID(lstRoles).subscribe((res) => {
            if (res != null && res.length > 0) {
              lstOrg = res;
              this.owner = lstOrg[0]?.userID;
            } else {
              this.owner = '';
            }
          });
          break;
      }
    }
  }

  changeProgress(event) {
    // type A = all, D=default, R = required
    if (event) {
      for (let item of event.data) {
        if (item.taskID && item.type === 'T') {
          var task = this.listTaskDone.find((x) => x.recID === item?.taskID);
          var taskNew = {
            progress: item?.progressTask,
            actualEnd: item?.actualEnd,
            isUpdate: item?.isUpdate,
            note: item?.note,
          };
          this.updateDataTask(task, taskNew);
        }
        if (item?.groupTaskID && item.type === 'G') {
          var group = this.listTaskGroupDone.find(
            (x) => x.recID === item?.groupTaskID
          );
          var groupNew = {
            progress: item?.progressGroupTask,
            isUpdate: item?.isUpdate,
            actualEnd: item?.actualEnd,
            note: item?.note,
          };
          this.updateDataGroup(group, groupNew);
        }
      }
    }
  }
  updateDataTask(taskNew: any, taskOld: any) {
    taskNew.actualEnd = taskOld?.actualEnd;
    taskNew.isUpdate = taskOld.isUpdate;
    taskNew.note = taskOld.note;
    taskNew.progress = taskOld.progress;
    taskNew.modifiedOn = new Date();
    taskNew.modifiedBy = this.user.userID;
    taskNew.isUpdate = taskOld.isUpdate;
  }
  updateDataGroup(groupNew: any, groupOld: any) {
    groupNew.progress = groupOld?.progress;
    groupNew.modifiedOn = new Date();
    groupNew.modifiedBy = this.user.userID;
    groupNew.isUpdate = groupOld.isUpdate;
  }

  handleTmpInTask(data, type) {
    var tmpProgressUpdate = {
      stepID: data.stepID,
      recID: data.recID,
      type: type,
      progress: data.progress,
      note: data.note,
      actualEnd: data.actualEnd,
      isUpdate: data.isUpdate,
    };
    return tmpProgressUpdate;
  }

  convertTmpDataInTask(list, type) {
    var listTmp = [];
    for (let item of list) {
      var obj = this.handleTmpInTask(item, type);
      listTmp.push(obj);
    }
    return listTmp;
  }

  isCheckRequiredTask(listTask) {
    if (listTask.length > 0 && listTask) {
      for (let item of listTask) {
        if (item.requireCompleted && item.progress < this.oneHundredNumber) {
          this.notiService.notifyCode('DP022');
          return true;
        }
      }
    }
    return false;
  }

  checkListDoneIsNull(tasks: any, groups: any) {
    if (
      (tasks.length > 0 && tasks != null) ||
      (groups.length > 0 && groups != null)
    ) {
      return true;
    }
    return false;
  }

  compareDates(actualStart, actualEnd) {
    var date1 = new Date(actualStart);
    var date2 = new Date(actualEnd);
    this.dateMessage = new Date(date1).toLocaleDateString('en-AU');
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1 > date2;
  }

  checkDuration(isCheck: boolean, actualEnd: Date): Date {
    if (isCheck) {
      actualEnd = new Date();
      this.isDurationControl = false;
    } else {
      if (!actualEnd) {
        actualEnd = new Date();
      }
      this.isDurationControl = true;
    }
    return actualEnd;
  }

  checkRadioProgress(event) {
    if (event?.field == 'all') {
      if (event?.data) {
        this.progressDefault = false;
      }
      setTimeout(() => {
        this.progressAll = event?.data;
      }, 0);
    }
    if (event?.field == 'required') {
      if (event?.data) {
        this.progressAll = false;
      }
      setTimeout(() => {
        this.progressDefault = event?.data;
      }, 0);
    }
  }
}
