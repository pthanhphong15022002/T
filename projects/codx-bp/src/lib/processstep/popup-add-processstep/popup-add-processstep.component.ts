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
  action:any
  titleActon: any;
  idForm: any;
  readOnly = false;
  dialog: DialogRef;
  showLabelAttachment = false;
  funcID: any;

  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.master = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.titleActon = dt?.data[2] ;
    this.action =dt?.data[1];
    this.idForm =[3]
    this.dialog = dialog ;
    
    this.funcID = this.dialog.formModel.funcID;
    this.title = this.titleActon ;
  }
  
  ngOnInit(): void {
   
  }



  saveData(data) {}
  //#region action form
  valueChange(e){
    this.master[e.fied] = e.data
  }

 //endregion

  //#region Func
  addFile(e) {}
  getfileCount(e) {}
  fileAdded(e) {}
  //endregion
}
