import { Component, Input, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef } from 'codx-core';
import { BP_ProcessSteps } from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-pop-add-phase',
  templateUrl: './pop-add-phase.component.html',
  styleUrls: ['./pop-add-phase.component.css'],
})
export class PopAddPhaseComponent implements OnInit {
  @Input() processSteps = new BP_ProcessSteps();

  dialog: any;
  title: '';
  titleActon: any;
  data: any;
  gridViewSetup: any;
  idFrom: any;
  constructor(
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.processSteps = this.data;
    this.dialog = dialog;
    this.titleActon = dt?.data[1];
    this.idFrom = dt.data[2];
    this.title = this.titleActon;
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
  }

  ngOnInit(): void {}

  //#region method
  beforeSave(op) {
    var data = [];
    op.method = 'AddProcessStepAsync';
    op.className = 'ProcessStepsBusiness';
    this.processSteps.stepType = this.idFrom;
    data = [this.processSteps];

    op.data = data;
    return true;
  }
  onSave() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }
  // onSave() {}
  //#endregion

  //#region evt
  valueChange(e) {
    this.processSteps[e.field] = e.data;
  }
  //#endregion
}
