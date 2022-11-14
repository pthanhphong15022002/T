import { Component, OnInit, Injector, Optional, ViewEncapsulation } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'app-sort-session',
  templateUrl: './sort-session.component.html',
  styleUrls: ['./sort-session.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SortSessionComponent extends UIComponent implements OnInit {
  formModel: any;
  dialog: DialogRef;
  recID: any;
  data: any;
  constructor(
    private injector: Injector,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.recID = dt.data.data;
  }

  onInit(): void {
    this.loadData();
  }

  loadData() {
    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'GeSessionAsync', [
        this.recID,
      ])
      .subscribe((res) => {
        if (res) this.data = res;
      });
  }

  onSave() {}
}
