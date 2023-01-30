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

  headerText: string = '';
  processName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';


  instanceStep = new DP_Instances_Steps;
  instance = new DP_Instances;

  constructor(

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef

  ) {

    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.processName = dt?.data.processName;
    this.headerText = 'Chuyển tiếp giai đoạn'; //  gán sau button add
    this.viewClick = this.viewKanban;


  }

  ngOnInit(): void {
  }


  onSave(){

  }

  valueChange($event){

  }

  changeTime($event){

  }
}

