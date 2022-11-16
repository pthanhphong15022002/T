import { CodxHrService } from './../../codx-hr.service'
import { Injector } from '@angular/core';
import { 
  Component, 
  OnInit,
  Optional,
  ViewChild  
} from '@angular/core';

import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
 } from 'codx-core';

@Component({
  selector: 'lib-employee-legal-passport-form',
  templateUrl: './employee-legal-passport-form.component.html',
  styleUrls: ['./employee-legal-passport-form.component.css']
})
export class EmployeeLegalPassportFormComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data;
  headerText;
  funcID;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  onInit(): void {
  }

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel
    this.headerText = data?.data?.headerText;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.funcID = this.dialog.formModel.funcID;
   }

    onSaveForm(){

   }
}
