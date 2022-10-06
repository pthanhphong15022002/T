import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-processstep',
  templateUrl: './popup-add-processstep.component.html',
  styleUrls: ['./popup-add-processstep.component.css'],
})
export class PopupAddProcessStepComponent implements OnInit {
  master: any;
  title = '';
  titleActon: any;
  readOnly = false;
  dialog: DialogRef;
  showLabelAttachment = false;
  constructor() {}
  funcID: any;
  ngOnInit(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef): void {
    this.master = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.titleActon = dt?.data[1] ;
    this.funcID = this.dialog.formModel.funcID;

    this.dialog = dialog ;
  }

  saveData(data) {}
  //#region Func
  addFile(e) {}
  getfileCount(e) {}
  fileAdded(e) {}
  //endregion
}
