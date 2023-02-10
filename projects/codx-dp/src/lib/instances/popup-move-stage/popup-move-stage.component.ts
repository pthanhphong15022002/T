import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, FormModel } from 'codx-core';
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
  listStep: any;

  headerText: string = '';
  stepName: string = '';
  viewKanban: string = 'kanban';
  viewClick: string = '';

  instanceStep = new DP_Instances_Steps();
  stepIdOld: string = '';
  //instanceStep = new DP_Instances_Steps;

  readonly fieldCbxStep = { text: 'stepName', value: 'stepID' };

  constructor(
    private codxDpService: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt?.data.formModel;
    this.stepName = dt?.data.stepName;
    this.listStep = JSON.parse(JSON.stringify(dt?.data.listStep));
    this.headerText = 'Chuyển tiếp giai đoạn'; //  gán sau button add
    this.viewClick = this.viewKanban;
    this.instanceStep = JSON.parse(JSON.stringify(dt?.data.instance));
    this.stepIdOld = this.instanceStep.stepID;

    // dataMore:dataMore,
    // stepName: this.process.processName,
    // funcIdMain: this.funcID,
    // formModel: formMD,
  }

  ngOnInit(): void {
    this.autoClickedSteps(this.listStep, this.stepName);
  }

  onSave() {
    this.beforeSave();
  }
  beforeSave() {
    var data = [this.instanceStep, this.stepIdOld];
    this.codxDpService.moveStageByIdInstance(data);
    // return true;
  }

  valueChange($event) {}

  changeTime($event) {}

  autoClickedSteps(listStep: any, stepName: string) {
    for (let i = 0; i < this.listStep.length; i++) {
      if (this.listStep[i].stepName === stepName) {
        this.instanceStep.stepID =
          i === this.listStep.length - 1
            ? this.listStep[i]?.stepID
            : this.listStep[i + 1]?.stepID;
        break;
      }
    }
  }
  cbxChange($event) {}
}
