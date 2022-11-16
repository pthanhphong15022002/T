import { UIComponent, FormModel, DialogService, DialogRef, CodxFormComponent, NotificationsService, DialogData } from 'codx-core';
import { Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-employee-disciplines-detail',
  templateUrl: './employee-disciplines-detail.component.html',
  styleUrls: ['./employee-disciplines-detail.component.css']
})
export class EmployeeDisciplinesDetailComponent extends UIComponent implements OnInit {
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
    this.data = dialog?.dataService?.dataSelected
  }

  onInit(): void {
    console.log('data', this.data);
    
  }
  
  onSaveForm(){
    if(this.data.fromDate > this.data.toDate){
      this.notify.notifyCode('HR002');
      return;
    }
  }

}
