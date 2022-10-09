import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, CacheService } from 'codx-core';
import { BP_ProcessSteps } from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-popup-add-processsteps',
  templateUrl: './popup-add-processsteps.component.html',
  styleUrls: ['./popup-add-processsteps.component.css']
})
export class PopupAddProcessStepsComponent implements OnInit {
  @Input() processSteps = new BP_ProcessSteps();

  data: any;
  dialog: any;
  title = '';
  titleAction = '';
  gridViewSetup: any;
  constructor(
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.processSteps = this.data;
    this.dialog = dialog;
    this.titleAction = dt.data[1];
    this.title = this.titleAction;
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

  ngOnInit(): void {
  }

  //#region method


  onSave(){
  }
  //#endregion

  //#region event
  valueChange(e){
    this.processSteps[e.field] = e.data;
  }
  addFile(e) {}

  //#endregion
}
