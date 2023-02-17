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
  selector: 'lib-popup-ecalculate-salary',
  templateUrl: './popup-ecalculate-salary.component.html',
  styleUrls: ['./popup-ecalculate-salary.component.css']
})
export class PopupECalculateSalaryComponent extends UIComponent implements OnInit {
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
    this.headerText = data?.data?.headerText;
    if(this.formModel){
      this.isAfterRender = true
  }
  this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected))
}
  onInit(): void{

  }

  onSaveForm(){
    this.hrService.saveEmployeeSelfInfo(this.data).subscribe(p => {
      if(p != null){
        this.notify.notifyCode('SYS006')
        this.dialog && this.dialog.close(p);
      }
      else this.notify.notifyCode('SYS023')
    })
  }
}
