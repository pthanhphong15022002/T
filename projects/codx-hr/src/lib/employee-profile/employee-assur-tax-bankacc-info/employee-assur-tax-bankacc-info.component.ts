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
  selector: 'lib-employee-assur-tax-bankacc-info',
  templateUrl: './employee-assur-tax-bankacc-info.component.html',
  styleUrls: ['./employee-assur-tax-bankacc-info.component.css']
})
export class EmployeeAssurTaxBankaccInfoComponent extends UIComponent implements OnInit {
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
    console.log('formModel', this.formModel);
    
    this.headerText = data?.data?.headerText;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
  }

  onInit(): void {
  }

  onSaveForm(){
    console.log(this.data);
    
    this.hrService.updateEmployeeAssurTaxBankAccountInfo(this.data).subscribe(p => {
      if(p === "True"){
        this.notify.notifyCode('SYS007')
        this.dialog.close();
      }
    })
  }

}
