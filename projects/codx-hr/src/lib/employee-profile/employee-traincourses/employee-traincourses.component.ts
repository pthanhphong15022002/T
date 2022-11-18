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
  selector: 'lib-employee-traincourses',
  templateUrl: './employee-traincourses.component.html',
  styleUrls: ['./employee-traincourses.component.css']
})
export class EmployeeTraincoursesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  grvSetup
  dialog: DialogRef;
  data;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
   }

  onInit(): void {
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

}
