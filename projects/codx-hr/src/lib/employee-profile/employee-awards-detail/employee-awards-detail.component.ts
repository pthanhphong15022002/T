import { UIComponent, FormModel, DialogRef, CodxFormComponent, NotificationsService, DialogData } from 'codx-core';
import { Component, Injector, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-employee-awards-detail',
  templateUrl: './employee-awards-detail.component.html',
  styleUrls: ['./employee-awards-detail.component.css']
})
export class EmployeeAwardsDetailComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  // data;
  isAfterRender = false;
  headerText = ''
  @ViewChild('form') form: CodxFormComponent;

  @Input() data = null
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
  }

  ngAfterViewInit(){
    if(this.data.awardID != null){
      // this.data.awardFormCategory = 
      // this.data.awardLevelCategory = 
    }
  }

  onSaveForm(){

  }

  handleSelectAwardDate(value){
    this.data.inYear = new Date(value).getFullYear();
    this.form?.formGroup.patchValue({inYear: this.data.inYear})

  }

}
