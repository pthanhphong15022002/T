import { Dialog } from '@syncfusion/ej2-angular-popups';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';
import { Injector } from '@angular/core';
import{
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-employee-family-relationship-detail',
  templateUrl: './employee-family-relationship-detail.component.html',
  styleUrls: ['./employee-family-relationship-detail.component.css']
})
export class EmployeeFamilyRelationshipDetailComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data;
  funcID;
  isAfterRender = false;
  @ViewChild('form') form:CodxFormComponent;

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.FormModel
    if(this.formModel){
      this.isAfterRender = true
    }
    this.funcID = this.dialog.formModel.funcID;
   }

  onInit(): void {
  }

  handleSaveEmployeeFamilyInfo(){

  }

}
