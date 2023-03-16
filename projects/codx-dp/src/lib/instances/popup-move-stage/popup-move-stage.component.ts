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
import { log, table } from 'console';
import { CodxDpService } from '../../codx-dp.service';
import {
  DP_Instances,
  DP_Instances_Steps,
  DP_Instances_Steps_Reasons,
} from '../../models/models';
import { InstancesComponent } from '../instances.component';

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
  isUseReason:any;
  isStopData: boolean = true;

  readonly oneHundredNumber: number = 100;
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
    this.headerText = 'Chuyển tiếp giai đoạn'; //  gán sau button add
    this.viewClick = this.viewKanban;
    this.instance = JSON.parse(JSON.stringify(dt?.data.instance));
    if (
      this.instance.permissions != null &&
      this.instance.permissions.length > 0
    ) {
      this.lstParticipants = this.instance.permissions.filter(
        (x) => x.roleType === 'P'
      );
    }
    this.stepIdOld = this.instance.stepID;

    // this.listStep = JSON.parse(JSON.stringify(dt?.data.instanceStep));
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
    // this.loadListUser(this.instance.permissions);
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
  }

  ngOnInit(): void {
    this.removeReasonInSteps(this.listStepsCbx,this.isUseReason);
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
        if(this.isStopData) {
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
            this.owner = this.stepCurrent.owner;
            // if (this.owner != null) this.getNameAndPosition(this.owner);
            break;
          //Phụ trách giai đoạn chuyển tiếp
          case '1':
            var index = -1;
            index = this.listStepsCbx.findIndex(
              (x) => x.stepID == this.stepIdClick
            );
            this.owner = this.listStepsCbx[index]?.owner; // Thêm ? vô dùng cái
            // if (this.owner != null) this.getNameAndPosition(this.owner);

            break;
          //Giữ nguyên phụ trách trước
          case '2':
            i = this.listStepsCbx.findIndex(
              (x) => x.stepID == this.stepCurrent.stepID
            );
            this.stepOld = this.listStepsCbx[i - 1].owner;
            this.owner = this.stepOld;
            // if (this.owner != null) this.getNameAndPosition(this.owner);
            break;
          //Người nhận nhiệm vụ đầu tiên
          case '3':
            this.owner = this.firstInstance.owner;
            // if (this.owner != null) this.getNameAndPosition(this.owner);
            break;
          //Người nhận nhiệm vụ hiện tại
          case '4':
            this.owner = this.instance.owner;
            // if (this.owner != null) this.getNameAndPosition(this.owner);
            break;
        }
      }
    });
  }

  updateDataInstance(data: any) {
    this.instancesStepOld = data;
    this.listTask = this.instancesStepOld.tasks.filter(
      (x) => x.progress < this.oneHundredNumber
    );
    this.listTaskGroup = this.instancesStepOld.taskGroups.filter(
      (x) => x.progress < this.oneHundredNumber
    );
    if((this.listTask.length > 0 && this.listTask) || (this.listTaskGroup.length > 0 && this.listTaskGroup)) {
      this.listTree = this.updateDateForTree(
        this.listTaskGroup,
        this.listTask
      );
    }

  }

  onSave() {
    // if (this.stepIdClick === this.stepIdOld) {
    //   this.notiService.notifyCode('DP001');
    //   return;
    // } else {

    // }
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
    this.upadteProgessIsDone(this.listTaskDone, this.listTask, 'task');
    this.upadteProgessIsDone(this.listTaskGroupDone, this.listTaskGroup, 'taskGroup');

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

  changeTime($event) { }

  autoClickedSteps(listStep: any, stepName: string) {
    let idx = listStep.findIndex((x) => x.stepID === this.stepIdOld);
    if(idx > -1 && idx !== listStep.length-1) {
      this.stepIdClick = listStep[idx + 1]?.stepID;
    }
    else {
      this.stepIdClick = this.stepIdOld;
    }

  }
  cbxChange($event) {
    if ($event && this.stepIdClick !== $event ) {
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
    for(let item of children) {
      if(item?.taskGroupID === null || item?.taskGroupID === undefined || item?.taskGroupID === ''){
        parents.push(item);
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
        this.listTaskGroupDone = this.listTaskGroup;
        this.listTaskDone = this.listTask;
      }
      else {
        this.isCheckAll = $event.target.checked;
        this.listTaskGroupDone = [];
        this.listTaskDone = [];
      }
    }
    else if ($event && view == 'taskGroup') {
      $event.target.checked && this.addItem(this.listTaskGroupDone, data);
      !$event.target.checked && this.removeItem(this.listTaskGroupDone, data.recID);

    }
    else if ($event && view == 'task') {
      $event.target.checked && this.addItem(this.listTaskDone, data);
      !$event.target.checked && this.removeItem(this.listTaskDone, data.recID);
    }
  }

  addItem(list: any, data) {
    list.push(data)
  }

  removeItem(list, id) {
    let idx = list.findIndex((x) => x.recID === id);
    if (idx >= 0) list.splice(idx, 1);
  }
  removeItemSuccess(list) {
    let idx = list.findIndex((x) => x.isSuccessStep);
    if (idx >= 0) list.splice(idx, 1);
  }
  removeItemFail(list) {
    let idx = list.findIndex((x) => x.isFailStep);
    if (idx >= 0) list.splice(idx, 1);
  }
  upadteProgessIsDone(listDone, listNow, view) {
    const map = new Map();
    listDone.forEach(item => {
      map.set(item.recID, item.progress);
    });
    listNow.forEach(item => {
      if (map.has(item.recID)) {
        item.progress = 100;
        item.actualEnd = (new Date()).toISOString()
      }
    });
    if (view === 'task') {
      this.instancesStepOld.tasks = listNow;
    }
    else {

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

  removeReasonInSteps(stepReason, listStepCbx){
    // !stepReason.isUseFail && this.removeItemFail(listStepCbx);
    // !stepReason.isUseSuccess && this.removeItemSuccess(listStepCbx);
  }

}
