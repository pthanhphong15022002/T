import { DP_Instances_Permissions } from './../../models/models';
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
} from 'codx-core';
import { CodxDpService } from '../../codx-dp.service';
import {
  DP_Instances,
  DP_Instances_Steps,
  DP_Instances_Steps_Reasons,
} from '../../models/models';

@Component({
  selector: 'lib-popup-move-stage',
  templateUrl: './popup-move-stage.component.html',
  styleUrls: ['./popup-move-stage.component.scss'],
})
export class PopupMoveStageComponent implements OnInit {
  dialog: any;
  formModel: FormModel;
  listStep: DP_Instances_Steps[];
  listStepsCbx: DP_Instances_Steps[];

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
  stepCurrent: any;
  lstRoles = [];
  assignControl: any;
  fieldCbxRole = { text: 'objectName', value: 'objectID' };
  positionName = '';
  userName = '';
  owner = '';
  stepOld: any;
  firstInstance: any;
  listTaskGroup: any;
  listTask: any;
  listTaskGroupDone: any;
  listTaskDone: any;
  listTree: any;
  listTypeTask: any;
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

  readonly oneHundredNumber: number = 100;
  readonly viewTask: string = 'Task';
  readonly viewTaskGroup: string = 'TaskGroup';
  fieldsNull = [];
  constructor(
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private cache: CacheService,
    private dpSv: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.stepName = dt?.data.stepName;
    this.isUseReason = dt?.data.stepReason;
    this.headerText = dt?.data.headerTitle; //  gán sau button add
    this.viewClick = this.viewKanban;
    this.listStepProccess = dt?.data?.listStepProccess;
    this.instance = JSON.parse(JSON.stringify(dt?.data.instance));

    this.lstParticipants = dt?.data.lstParticipants;

    this.stepIdOld = this.instance.stepID;

    this.listStepsCbx = JSON.parse(JSON.stringify(dt?.data?.listStepCbx));
    this.IdFail =
      this.listStepsCbx[this.listStepsCbx.findIndex((x) => x.isFailStep)]
        ?.stepID ?? '';
    this.IdSuccess =
      this.listStepsCbx[this.listStepsCbx.findIndex((x) => x.isSuccessStep)]
        ?.stepID ?? '';
    this.stepIdClick = JSON.parse(JSON.stringify(dt?.data?.stepIdClick));
    this.getStepByStepIDAndInID(this.instance?.recID, this.stepIdOld);
    this.dpSv.getFirstIntance(this.instance?.processID).subscribe((res) => {
      if (res) {
        this.firstInstance = res;
      }
    });
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
    this.getGrvInstanceStep();
  }

  ngOnInit(): void {
    this.removeReasonInSteps(this.listStepsCbx, this.isUseReason);
    !this.stepIdClick &&
      this.stepIdClick != this.stepIdOld &&
      this.autoClickedSteps(this.listStepsCbx, this.stepName);
  }

  getNameAndPosition(id) {
    this.dpSv.getPositionByID(id).subscribe((res) => {
      if (res) {
        this.userName = res.userName;
        this.positionName = res.positionName;
      }
    });
  }

  getStepByStepIDAndInID(insID, stepID) {
    this.dpSv.getStepByStepIDAndInID(insID, stepID).subscribe((res) => {
      if (res) {
        if (this.isStopData) {
          var data = JSON.parse(JSON.stringify(res));
          this.updateDataInstance(data);
          this.isStopData = false;
        }

        this.stepCurrent = res;
        var i = -1;
        this.assignControl = this.stepCurrent.assignControl;
        switch (this.assignControl) {
          //Phụ trách giai đoạn hiện tại
          case '0':
            if (
              this.stepCurrent.roles != null &&
              this.stepCurrent.roles.length > 0
            ) {
              var role = this.stepCurrent.roles.filter(
                (x) =>
                  x.objectID == this.stepCurrent?.owner && x.roleType == 'S'
              );
              if (role != null && role.length > 0) {
                if (role[0].objectType != 'U' && role[0].objectType != '1') {
                  // this.getOwnerByListRoles(
                  //   role.map((x) => x.objectID),
                  //   role[0].objectType
                  // );
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
              this.listStepsCbx[index].roles != null &&
              this.listStepsCbx[index].roles.length > 0
            ) {
              var roleClick = this.listStepsCbx[index].roles.filter(
                (x) =>
                  x.objectID == this.listStepsCbx[index].owner &&
                  x.roleType == 'S'
              );
              if (roleClick != null && roleClick.length > 0) {
                if (
                  roleClick[0].objectType != 'U' &&
                  roleClick[0].objectType != '1'
                ) {
                  // this.getOwnerByListRoles(
                  //   roleClick.map((x) => x.objectID),
                  //   roleClick[0].objectType
                  // );
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
              this.listStepsCbx[i - 1].roles != null &&
              this.listStepsCbx[i - 1].roles.length > 0
            ) {
              var roleOld = this.listStepsCbx[i - 1].roles.filter(
                (x) =>
                  x.objectID == this.listStepsCbx[i - 1].owner &&
                  x.roleType == 'S'
              );
              if (roleOld != null && roleOld.length > 0) {
                if (
                  roleOld[0].objectType != 'U' &&
                  roleOld[0].objectType != '1'
                ) {
                  // this.getOwnerByListRoles(
                  //   roleOld.map((x) => x.objectID),
                  //   roleOld[0].objectType
                  // );
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
      }
    });
  }

  updateDataInstance(data: any) {
    this.instancesStepOld = data;
    this.fieldsNull = this.instancesStepOld.fields.filter((x) => !x.dataValue);

    !this.instancesStepOld.actualEnd && this.setToDay();
    this.listTask = this.instancesStepOld.tasks.filter(
      (x) => x.progress < this.oneHundredNumber
    );
    this.listTaskGroup = this.instancesStepOld.taskGroups.filter(
      (x) => x.progress < this.oneHundredNumber
    );
    if (
      (this.listTask.length > 0 && this.listTask) ||
      (this.listTaskGroup.length > 0 && this.listTaskGroup)
    ) {
      this.listTree = this.updateDateForTree(this.listTaskGroup, this.listTask);
    }
  }

  onSave() {
    this.instancesStepOld.owner = this.owner;
    var isMoveNext = this.checkSpaceInStep(this.stepIdClick, this.stepIdOld);
    if (isMoveNext) {
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
      if (!this.instancesStepOld.owner) {
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
      this.instancesStepOld.owner = this.owner;
      this.instancesStepOld.stepID = this.stepIdClick;
    }
    if (
      (!!this.listTask || !!this.listTaskGroup) &&
      this.stepIdClick === this.stepIdOld
    ) {
      this.stepIdOld = '';
    }
    this.listTaskDone && this.updateProgressIsDone(this.listTaskDone, this.listTask, this.viewTask);
    this.listTaskGroupDone && this.updateProgressIsDone(this.listTaskGroupDone, this.listTaskGroup,this.viewTaskGroup);
    this.updateProgressInstance();

    var data = [this.instance.recID, this.stepIdOld, this.instancesStepOld];
    this.codxDpService.moveStageByIdInstance(data).subscribe((res) => {
      if (res) {
        this.instance = res[0];
        this.listStep = res[1];
        var obj = {
          listStep: this.listStep,
          instance: this.instance,
          isReason: this.isReason,
        };
        this.stepIdClick = '';
        this.stepIdOld = '';
        this.dialog.close(obj);
        //  this.notiService.notifyCode('SYS007');

        this.changeDetectorRef.detectChanges();
      }
    });
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

  autoClickedSteps(listStep: any, stepName: string) {
    let idx = listStep.findIndex((x) => x.stepID === this.stepIdOld);
    if (idx > -1 && idx !== listStep.length - 1) {
      this.stepIdClick = listStep[idx + 1]?.stepID;
    } else {
      this.stepIdClick = this.stepIdOld;
    }
  }
  cbxChange($event) {
    if ($event && this.stepIdClick !== $event) {
      this.stepIdClick = $event;
      this.getStepByStepIDAndInID(this.instance.recID, this.stepIdClick);
      this.changeDetectorRef.detectChanges();
    }
  }

  openPopupParticipants(popupParticipants) {
    this.callfc.openForm(popupParticipants, '', 950, 650);
  }

  eventUser(e) {
    this.owner = e.id;
    // if (this.owner != null) this.getNameAndPosition(this.owner);
  }

  buildTree(parents, children) {
    const tree = [];

    const lookup = parents.reduce((acc, parent) => {
      acc[parent.refID] = parent;
      parent.children = [];
      return acc;
    }, {});

    children.forEach((child) => {
      const parentId = child.taskGroupID;
      if (parentId in lookup) {
        lookup[parentId].children.push(child);
        this.totalRequireCompleted = this.UpdateRequireCompletedCheck(
          child,
          this.totalRequireCompleted,
          true
        );
      }
    });

    Object.keys(lookup).forEach((key) => {
      const parent = lookup[key];
      if (!parent.taskGroupID) {
        tree.push(parent);
      }
    });
    return tree;
  }

  updateDateForTree(parents, children) {
    for (let item of children) {
      if (
        item?.taskGroupID === null ||
        item?.taskGroupID === undefined ||
        item?.taskGroupID === ''
      ) {
        parents.push(item);
        this.totalRequireCompleted = this.UpdateRequireCompletedCheck(
          item,
          this.totalRequireCompleted,
          true
        );
      }
    }
    return this.buildTree(parents, children);
  }
  myFunction($event, index) {
    let children = document.getElementById('children' + index);
    let parent = document.getElementById('parent' + index);
    if (children.classList[2] === 'show') {
      children.classList.remove('show');
      children.classList.add('hidden');

      parent.classList.remove('icon-remove');
      parent.classList.add('icon-add');
    } else {
      children.classList.remove('hidden');
      children.classList.add('show');
      parent.classList.remove('icon-add');
      parent.classList.add('icon-remove');
    }
  }
  checkAllValue($event, data, view) {
    if ($event && view == 'custom') {
      if ($event.target.checked) {
        this.isCheckAll = $event.target.checked;
        this.listTaskGroupDone = JSON.parse(JSON.stringify(this.listTaskGroup));
        this.listTaskDone = JSON.parse(JSON.stringify(this.listTask));
        this.totalRequireCompletedChecked = this.totalRequireCompleted;
        this.actionCheck = 'custom';
      } else {
        this.isCheckAll = $event.target.checked;
        this.listTaskGroupDone = [];
        this.listTaskDone = [];
        this.totalRequireCompletedChecked = 0;
        this.actionCheck = '';
      }
    } else if ($event && view == this.viewTaskGroup) {
      $event.target.checked && this.addItem(this.listTaskGroupDone, data, this.viewTaskGroup);
      !$event.target.checked && this.removeItem(this.listTaskGroupDone, data.recID);
    } else if ($event && view == this.viewTask) {
      $event.target.checked && this.addItem(this.listTaskDone, data, this.viewTask);
      !$event.target.checked && this.removeItem(this.listTaskDone, data.recID);
    }
  }

  addItem(list: any, data, view) {
    list.push(data);
    this.UpdateRequireCompletedCheck(data, this.totalRequireCompleted, true);
    if (view == this.viewTaskGroup) {
      let children = document.getElementById(`${data.recID}`);
    }
  }

  removeItem(list, id) {
    let idx = list.findIndex((x) => x.recID === id);
    if (idx >= 0) list.splice(idx, 1);
    this.UpdateRequireCompletedCheck(
      list[idx],
      this.totalRequireCompleted,
      false
    );
  }
  removeItemSuccess(list) {
    let idx = list.findIndex((x) => x.isSuccessStep);
    if (idx >= 0) list.splice(idx, 1);
  }
  removeItemFail(list) {
    let idx = list.findIndex((x) => x.isFailStep);
    if (idx >= 0) list.splice(idx, 1);
  }
  updateProgressIsDone(listDone, listNow, view) {
    const map = new Map();
    listDone.forEach((item) => {
      map.set(item.recID, item.progress);
    });
    listNow.forEach((item) => {
      if (map.has(item.recID)) {
        item.progress = 100;
        item.actualEnd = new Date();
      }
    });
    if (view === 'task') {
      this.instancesStepOld.tasks = listNow;
    } else {
      this.instancesStepOld.taskGroups = listNow;
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

  removeReasonInSteps(listStepCbx, stepReason) {
    !stepReason.isUseFail && this.removeItemFail(listStepCbx);
    !stepReason.isUseSuccess && this.removeItemSuccess(listStepCbx);
  }

  UpdateRequireCompletedCheck(item: any, checkValue, isCheck) {
    if (!!item) {
      if (isCheck && item.requireCompleted) {
        checkValue++;
      } else if (!isCheck && item.requireCompleted) {
        checkValue--;
      }
    }
    return checkValue ?? 0;
  }
  setToDay() {
    this.instancesStepOld.actualEnd = new Date();
  }

  checkSpaceInStep(stepClick, stepOld) {
    var indexClick = this.listStepsCbx.findIndex((x) => x.stepID == stepClick);
    var indexOld = this.listStepsCbx.findIndex((x) => x.stepID == stepOld);
    var space = indexClick - indexOld;
    if (space >= 0) {
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
    if (event && event.e && event.data) {
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
        if (!field.dataValue.toLowerCase().match(validEmail)) {
          return 'SYS037';
        }
      }
      if (field.dataFormat == 'P') {
        var validPhone = /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
        if (!field.dataValue.toLowerCase().match(validPhone)) {
          return 'RS030';
        }
      }
    }
    return '';
  }

  updateProgressInstance() {
    if (
      this.listTaskDone?.length > 0 &&
      this.listTask?.length > 0 &&
      this.listTaskGroup?.length > 0 &&
      this.listTaskGroupDone?.length > 0
    ) {
      if (
        this.listTaskDone.length == this.listTask.length &&
        this.listTaskGroupDone.length == this.listTaskGroup.length
      ) {
        this.instancesStepOld.progress = 100;
      }
    }
  }

  checkExitsParentID(item,view): string {
    var check = 'd-none';
    if (item?.requireCompleted) {
      check ='text-danger';
    }
    else if(view == this.viewTask)
    {

      for(let item of this.listTask ) {
        if(item.parentID?.includes(item.recID)) {
          check = 'text-orange'
          break;
        }

      }
    }
    return check;
  }
}
