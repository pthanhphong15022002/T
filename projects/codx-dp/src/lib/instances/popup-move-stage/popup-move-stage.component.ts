import { DP_Instances_Permissions } from './../../models/models';
import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxInputComponent, DialogData, DialogRef, FormModel, NotificationsService, CallFuncService } from 'codx-core';
import { log, table } from 'console';
import { CodxDpService } from '../../codx-dp.service';
import { DP_Instances, DP_Instances_Steps, DP_Instances_Steps_Reasons } from '../../models/models';
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
  idTest:any;
  //instanceStep = new DP_Instances_Steps;
  lstParticipants = [];
  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };

  lstRoles = [];

  fieldCbxRole = {text: 'objectName', value: 'objectID'}

  constructor(
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
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
    this.stepIdOld = this.instance.stepID;
    this.listStep = JSON.parse(JSON.stringify(dt?.data.instanceStep));
    this.listStepsCbx = JSON.parse(JSON.stringify(this.listStep));
    this.instancesStepOld = this.listStepsCbx.filter(x => x.stepID === this.stepIdOld)[0];
    this.IdFail = this.listStepsCbx[this.listStepsCbx.length - 1]?.stepID;
    this.IdSuccess = this.listStepsCbx[this.listStepsCbx.length - 2]?.stepID;
    this.stepIdClick = JSON.parse(JSON.stringify(dt?.data?.stepIdClick))
    // this.loadListUser(this.instance.permissions);
  }

  ngOnInit(): void {
   this.autoClickedSteps(this.listStepsCbx, this.stepName);

  }

  loadListUser(permissions = []){
    var idO = '';
    var idD = '';
    var idP = '';
    permissions.forEach(element => {
      switch(element.objectType){
        case 'O':
          idO = idO != '' ? idO + ';' + element.objectID : element.objectID ;
          break;
        case 'D':
          idD = idD != '' ? idD + ';' + element.objectID : element.objectID ;
          break;
        case 'P':
          idP = idP != '' ? idP + ';' + element.objectID : element.objectID ;
      }
    });
    if(idO != ''){
      this.dpSv.GetListUserIDByListTmpEmpIDAsync([idO, 'O']).subscribe(res=>{
        if(res){
          var test = res;
        }
      })
    }
    if(idD != ''){
      this.dpSv.GetListUserIDByListTmpEmpIDAsync([idD, 'D']).subscribe(res=>{
        if(res){
          var test1 = res;
        }
      })
    }

    if(idP != ''){
      this.dpSv.GetListUserIDByListTmpEmpIDAsync([idP, 'P']).subscribe(res=>{
        if(res){
          var test2 = res;
        }
      })
    }
  }

  onSave() {
    if(this.stepIdClick === this.stepIdOld) {
      this.notiService.notifyCode('DP001');
      return;
    }
    else {
      this.beforeSave();
    }

  }
  beforeSave() {
    if(this.stepIdClick === this.IdSuccess || this.stepIdClick === this.IdFail ) {
      this.instance.stepID = this.stepIdOld;
      this.instancesStepOld.stepID = this.stepIdOld;
      this.stepIdOld = '';
      this.isReason = this.stepIdClick === this.IdFail ? false:true;
    }
    else {
      this.instancesStepOld.stepID = this.stepIdClick;
    }


    var data = [this.instance.recID,this.stepIdOld ,this.instancesStepOld];
    this.codxDpService.moveStageByIdInstance(data).subscribe((res)=> {
      if(res){
        this.instance = res[0];
        this.listStep = res[1];
        var obj ={
          listStep: this.listStep,
          instance: this.instance,
          isReason: this.isReason,
        };
        this.dialog.close(obj);
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

    let idx = listStep.findIndex(x=> x.stepID === this.stepIdOld);
    this.stepIdClick = listStep[idx + 1]?.stepID;
  }
  cbxChange($event) {
    if($event){
        this.stepIdClick = $event;

        this.changeDetectorRef.detectChanges();
    }
  }


  openPopupParticipants(popupParticipants) {
    this.callfc.openForm(popupParticipants, '', 950, 650);
  }

  eventUser(e){

  }
}
