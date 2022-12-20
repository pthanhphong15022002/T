import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, inject, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,

} from 'codx-core';

@Component({
  selector: 'lib-popup-ebasic-salaries',
  templateUrl: './popup-ebasic-salaries.component.html',
  styleUrls: ['./popup-ebasic-salaries.component.css']
})
export class PopupEBasicSalariesComponent extends UIComponent implements OnInit {
  formModel: FormModel
  formGroup: FormGroup
  dialog: DialogRef
  data: any
  currentEBasicSalaries: any;
  actionType: string
  funcID: string
  employeeId: string
  isAfterRender = false
  headerText: ' '
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;


  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector)
    if(!this.formModel){
      this.formModel = new FormModel();
      this.formModel.formName = 'EBasicSalaries'
      this.formModel.entityName = 'HR_EBasicSalaries'
      this.formModel.gridViewName = 'grvEBasicSalaries'
    }
    this.dialog = dialog
    this.headerText = data?.data?.headerText
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.data = JSON.parse(JSON.stringify(data?.data?.basicsalarySelected));
      this.formModel.currentData = this.data;
    }
  }

  ngAfterViewInit() {
    if(this.listView){
    console.log('list salaries', this.listView.dataService.data);
    }

    this.dialog.closed.subscribe(res => {
      console.log('res khi close', res);
      if(!res.event){
        for(let i = 0; i < this.listView.dataService.data.length; i++){
          if(this.listView.dataService.data[i].isCurrent == true){
            this.currentEBasicSalaries = this.listView.dataService.data[i];
            break;
          }
        }
        this.dialog && this.dialog.close(this.currentEBasicSalaries);
      }
    })
  }

  initForm() {
    this.hrService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.formGroup = item;
        if (this.actionType == 'add') {
          this.hrService.GetEmployeeBasicSalariesModel().subscribe((p) => {
            this.data = p;
            this.formModel.currentData = this.data;
            console.log('e basic model', p);
            
          });
        }
        this.formGroup.patchValue(this.data);
        this.isAfterRender = true;
      });
  }

  onInit(): void {
    this.initForm();
  }

  click(data) {
    console.log(data);
    this.data = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.data)) 
    this.actionType ='edit'
    this.formGroup?.patchValue(this.data);
    this.cr.detectChanges();
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log('lst view data', this.listView);
  }

  onSaveForm() {
    console.log('du lieu salari', this.listView.dataService.data);
    
    if (this.data.expiredDate < this.data.effectedDate) {
      this.notify.notifyCode('HR002');
      return;
    }
    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.data.recID;
    }
    this.data.employeeID = this.employeeId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeBasicSalariesInfo(this.data).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          if(this.currentEBasicSalaries){
            if(this.currentEBasicSalaries.effectedDate < p.effectedDate){
              this.currentEBasicSalaries.isCurrent = 'false';
              (this.listView.dataService as CRUDService).update(this.currentEBasicSalaries).subscribe();
              this.currentEBasicSalaries = p;
            }
          }
          else{
            this.currentEBasicSalaries = p;
          }

          if (this.listView) {
            (this.listView.dataService as CRUDService).add(p).subscribe();
          }
          //this.dialog.close(p);
        } else this.notify.notifyCode('DM034');
      });
    } else {
      this.hrService.UpdateEmployeeBasicSalariesInfo(this.formModel.currentData).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS007');
          if(p.isCurrent == true){
            var tempCurrent = this.listView.dataService.data.find(p => p.isCurrent == true)
            console.log('temp current', tempCurrent);
            if(tempCurrent.recID != p.recID){
              tempCurrent.isCurrent = false;
              (this.listView.dataService as CRUDService).update(tempCurrent).subscribe();
            };
            
          }
          if (this.listView) {
            (this.listView.dataService as CRUDService).update(p).subscribe();
          }
          // this.dialog.close(this.data);
        } else this.notify.notifyCode('DM034');
      });
    }
  }
}
