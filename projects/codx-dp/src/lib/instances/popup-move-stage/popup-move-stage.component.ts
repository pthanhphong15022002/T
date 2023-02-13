import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxInputComponent, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { log } from 'console';
import { CodxDpService } from '../../codx-dp.service';
import { DP_Instances, DP_Instances_Steps } from '../../models/models';

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
  @ViewChild("memoDF")memoDF :CodxInputComponent ;

  headerText: string = '';
  stepName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';
  isLockStep: boolean = false;
  memo = '';
  instanceSteps: DP_Instances_Steps[];
  instance = new DP_Instances_Steps();
  stepIdOld: string = '';
  instancesStepOld = new DP_Instances_Steps();
  IdStepEnd: any;
  //instanceStep = new DP_Instances_Steps;

  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };

  constructor(
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.stepName = dt?.data.stepName;
    //this.listStep = JSON.parse(JSON.stringify(dt?.data.listStep));
    this.headerText = 'Chuyển tiếp giai đoạn'; //  gán sau button add
    this.viewClick = this.viewKanban;
    this.instance = JSON.parse(JSON.stringify(dt?.data.instance));
   this.stepIdOld = this.instance.stepID; 
    this.listStep = JSON.parse(JSON.stringify(dt?.data.instanceStep));
    this.listStepsCbx = JSON.parse(JSON.stringify(this.listStep));
    this.deleteListReason(this.listStepsCbx);
   // this.stepIdOld = this.listStepsCbx[this.listStepsCbx.length-1]?.stepID;
    this.instancesStepOld = this.listStepsCbx.filter(x => x.stepID === this.stepIdOld)[0];
    this.IdStepEnd = this.listStepsCbx[this.listStepsCbx.length - 1]?.stepID;

  }

  ngOnInit(): void {
    this.autoClickedSteps(this.listStepsCbx, this.stepName);
  }

  onSave() {
    this.beforeSave();
  }
  beforeSave() {
    var data = [this.instance.recID,this.stepIdOld ,this.instancesStepOld];
    this.codxDpService.moveStageByIdInstance(data).subscribe((res)=> {
      if(res){
        this.listStep = res;
        var obj ={
          listStep: this.listStep,
          instance: this.instance
        };
        this.dialog.close(obj);
        this.dialog.dataService.clear();
        this.notiService.notifyCode('Chuyển tiếp oke nha');
        this.changeDetectorRef.detectChanges();
      }
    })


  }

  valueChange($event) {
    if($event){
      this.instancesStepOld[$event.field] = $event.data;
    }
    this.changeDetectorRef.detectChanges();
  }

  changeTime($event) {}

  autoClickedSteps(listStep: any, stepName: string) {
    for (let i = 0; i < listStep.length; i++) {
      if (listStep[i].stepName === stepName) {
       if(i === this.listStep.length - 1) {
          this.instance.stepID = listStep[i]?.stepID;
          this.autoLockStepEnd();
       }
       else {
         this.instance.stepID = listStep[i + 1]?.stepID;
       }
        break;
      }
    }
  }

  autoLockStepEnd(){

    this.isLockStep = true;
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }
  cbxChange($event) {
    if($event){
        this.instance.stepID = $event;
        this.isLockStep = this.stepIdOld === this.IdStepEnd && $event === this.IdStepEnd ? true:false;
        this.instancesStepOld = this.listStepsCbx.filter(x => x.stepID === this.instance.stepID)[0];
        this.changeDetectorRef.detectChanges();
    }
  }

  
}
