import { extend } from '@syncfusion/ej2-base';
import { CodxHrService } from './../../codx-hr.service';
import { Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-popup-etime-card',
  templateUrl: './popup-etime-card.component.html',
  styleUrls: ['./popup-etime-card.component.css']
})
export class PopupETimeCardComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data;
  isAfterRender = false;
  headerText: ''
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {     
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    console.log('formModel e time', this.formModel);
    
    this.headerText = data?.data?.headerText;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
}

  onInit(): void {
    
  }

  onSaveForm(){
    this.hrService.saveEmployeeSelfInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close()
      }
      else this.notify.notifyCode('SYS021')
    })
  }
}
