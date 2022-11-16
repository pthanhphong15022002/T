import { CodxHrService } from './../../codx-hr.service';
import { Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import{
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
@Component({
  selector: 'lib-employee-allocated-property-detail',
  templateUrl: './employee-allocated-property-detail.component.html',
  styleUrls: ['./employee-allocated-property-detail.component.css']
})
export class EmployeeAllocatedPropertyDetailComponent extends UIComponent implements OnInit {
  formModel: FormModel
  grvSetup
  dialog: DialogRef
  data
  isAfterRender = false
  headerText: ''
  @ViewChild('form') form: CodxFormComponent;
  
  onInit(): void {
    throw new Error('Method not implemented.');
  }

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector)
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
   }



}
