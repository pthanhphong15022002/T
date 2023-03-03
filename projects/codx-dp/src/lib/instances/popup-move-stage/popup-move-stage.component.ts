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
  styleUrls: ['./popup-move-stage.component.css'],
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
    this.listStep = JSON.parse(JSON.stringify(dt?.data.instanceStep));
    this.listStepsCbx = JSON.parse(JSON.stringify(dt?.data?.listStepCbx));
    this.instancesStepOld = this.listStepsCbx.filter(
      (x) => x.stepID === this.stepIdOld
    )[0];
    this.IdFail = this.listStep[this.listStep.findIndex(x=>x.isFailStep)].stepID ?? '';
    this.IdSuccess = this.listStep[this.listStep.findIndex(x=>x.isSuccessStep)].stepID ?? '';
    this.stepIdClick = JSON.parse(JSON.stringify(dt?.data?.stepIdClick));
    this.getStepByStepIDAndInID(this.instance.recID, this.stepIdOld);
    this.dpSv.getFirstIntance(this.instance.processID).subscribe((res) => {
      if (res) {
        this.firstInstance = res;
      }
    });
    // this.loadListUser(this.instance.permissions);
  }

  ngOnInit(): void {
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
            index = this.listStep.findIndex(
              (x) => x.stepID == this.stepIdClick
            );
            this.owner = this.listStep[index].owner;
            // if (this.owner != null) this.getNameAndPosition(this.owner);

            break;
          //Giữ nguyên phụ trách trước
          case '2':
            i = this.listStep.findIndex(
              (x) => x.stepID == this.stepCurrent.stepID
            );
            this.stepOld = this.listStep[i - 1].owner;
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

  onSave() {
    if (this.stepIdClick === this.stepIdOld) {
      this.notiService.notifyCode('DP001');
      return;
    } else {
      this.beforeSave();
    }
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
    // if ($event) {
    //   this.instancesStepOld[$event.field] = $event.data;
    // }
    this.changeDetectorRef.detectChanges();
  }

  changeTime($event) {}

  autoClickedSteps(listStep: any, stepName: string) {
    let idx = listStep.findIndex((x) => x.stepID === this.stepIdOld);
    this.stepIdClick = listStep[idx + 1]?.stepID;
  }
  cbxChange($event) {
    if ($event) {
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
}
