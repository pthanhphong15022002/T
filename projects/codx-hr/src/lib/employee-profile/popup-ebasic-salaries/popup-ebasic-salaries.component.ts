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
  EBasicSalaryObj: any;
  lstEBSalary
  indexSelected
  idField = 'RecID';
  actionType: string
  funcID: string
  employeeId: string
  isAfterRender = false
  headerText: ' '
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  onInit(): void {
    this.hrService.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrService
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
              this.initForm();
            }
          });
      }
    });
  }

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector)
    // if(!this.formModel){
    //   this.formModel = new FormModel();
    //   this.formModel.formName = 'EBasicSalaries'
    //   this.formModel.entityName = 'HR_EBasicSalaries'
    //   this.formModel.gridViewName = 'grvEBasicSalaries'
    // }
    this.dialog = dialog
    this.headerText = data?.data?.headerText
    this.funcID = data?.data?.funcID;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstEBSalary = data?.data?.lstEBSalary;
    this.indexSelected =
    data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;
    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.EBasicSalaryObj = JSON.parse(
        JSON.stringify(this.lstEBSalary[this.indexSelected])
      );
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
            this.EBasicSalaryObj = this.listView.dataService.data[i];
            break;
          }
        }
        this.dialog && this.dialog.close(this.EBasicSalaryObj);
      }
    })
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.EBasicSalaryObj = res?.data;
            this.EBasicSalaryObj.employeeID = this.employeeId;
            this.formModel.currentData = this.EBasicSalaryObj;
            this.formGroup.patchValue(this.EBasicSalaryObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.EBasicSalaryObj);
        this.formModel.currentData = this.EBasicSalaryObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }


  click(data) {
    console.log(data);
    this.EBasicSalaryObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.EBasicSalaryObj)) 
    this.actionType ='edit'
    this.formGroup?.patchValue(this.EBasicSalaryObj);
    this.cr.detectChanges();
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log('lst view data', this.listView);
  }

  onSaveForm() {
    console.log('du lieu salari', this.listView.dataService.data);
    
    if (this.EBasicSalaryObj.expiredDate < this.EBasicSalaryObj.effectedDate) {
      // this.notify.notifyCode('HR003');

      this.hrService.notifyInvalidFromTo('ExpiredDate', 'EffectedDate', this.formModel)
      return;
    }
    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.EBasicSalaryObj.recID;
    }
    this.EBasicSalaryObj.employeeID = this.employeeId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeBasicSalariesInfo(this.EBasicSalaryObj).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS006');
          if(this.EBasicSalaryObj){
            if(this.EBasicSalaryObj.effectedDate < p.effectedDate){
              this.EBasicSalaryObj.isCurrent = 'false';
              (this.listView.dataService as CRUDService).update(this.EBasicSalaryObj).subscribe();
              this.EBasicSalaryObj = p;
            }
          }
          else{
            this.EBasicSalaryObj = p;
          }

          if (this.listView) {
            (this.listView.dataService as CRUDService).add(p).subscribe();
          }
        } else this.notify.notifyCode('SYS023');
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
        } else this.notify.notifyCode('SYS021');
      });
    }
  }
}
