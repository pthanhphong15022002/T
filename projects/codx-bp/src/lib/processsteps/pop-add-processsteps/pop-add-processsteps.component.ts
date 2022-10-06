import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, CacheService } from 'codx-core';
import { BP_ProcessSteps } from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-pop-add-processsteps',
  templateUrl: './pop-add-processsteps.component.html',
  styleUrls: ['./pop-add-processsteps.component.css']
})
export class PopAddProcessstepsComponent implements OnInit {
  @Input() processSteps = new BP_ProcessSteps();

  data: any;
  dialog: any;
  title = ' Bước công việc';
  titleAction = '';
  gridViewSetup: any;
  constructor(
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.titleAction = dt.data[1];
    this.title = this.titleAction + this.title;
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

  }
  addFile(e) {}

  //#endregion
}
