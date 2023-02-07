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
  selector: 'lib-popup-eassur-tax-bank',
  templateUrl: './popup-eassur-tax-bank.component.html',
  styleUrls: ['./popup-eassur-tax-bank.component.css']
})
export class PopupEAssurTaxBankComponent extends UIComponent implements OnInit {
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
    this.data = JSON.parse(JSON.stringify(dialog?.dataService?.dataSelected))
  }

  onInit(): void {
  }

  ngAfterViewInit() {
    this.dialog.closed.subscribe(res => {
      if(!res.event){
        this.dialog && this.dialog.close(this.data);
      }
    })
  }

  onSaveForm(){
    console.log(this.data);
    
    if(this.form.formGroup.invalid){
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      return;
    }

    this.hrService.updateEmployeeAssurTaxBankAccountInfo(this.data).subscribe(p => {
      if(p =! null){
        this.notify.notifyCode('SYS007')
        this.dialog.close();
      }
      else this.notify.notifyCode('SYS021');
    })
  }
}
