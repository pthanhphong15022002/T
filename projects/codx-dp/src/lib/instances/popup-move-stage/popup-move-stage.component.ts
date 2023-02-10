import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { DP_Instances, DP_Instances_Steps } from '../../models/models';

@Component({
  selector: 'lib-popup-move-stage',
  templateUrl: './popup-move-stage.component.html',
  styleUrls: ['./popup-move-stage.component.css']
})
export class PopupMoveStageComponent implements OnInit {
  dialog: any;
  formModel:any;
  listStep:any;

  headerText: string = '';
  stepName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';


  instanceStep = new DP_Instances_Steps;
  instance = new DP_Instances;

  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };

  constructor(

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef

  ) {

    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.stepName = dt?.data.stepName;
    this.listStep = dt?.data.listStep;
    this.headerText = 'Chuyển tiếp giai đoạn'; //  gán sau button add
    this.viewClick = this.viewKanban;
    this.instance = dt?.data.instance


    // dataMore:dataMore,
    // stepName: this.process.processName,
    // funcIdMain: this.funcID,
    // formModel: formMD,


  }

  ngOnInit(): void {
    this.stageRemoveStep(this.listStep,this.stepName);
    this.autoClickedSteps();
  }


  onSave(){

  }

  valueChange($event){

  }

  changeTime($event){

  }

  stageRemoveStep(listStep:any,stepName:string){
    for(let i = 0; i < listStep.length; i++){
      if(listStep[i].stepName === stepName )
      {
        delete listStep[i];
        break;
      }
      delete listStep[i];
    }
  }
  autoClickedSteps(){
    this.instance.stepID = this.listStep[0].stepID;
  }
  cbxChange($event){

  }
}

