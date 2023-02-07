import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector } from '@angular/core';
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
  selector: 'lib-popup-ejob-salaries',
  templateUrl: './popup-ejob-salaries.component.html',
  styleUrls: ['./popup-ejob-salaries.component.css'],
})
export class PopupEJobSalariesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  idField = 'RecID';
  currentEJobSalaries: any;
  funcID: string;
  lstJobSalaries
  actionType: string;
  employeeId: string;
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // if (!this.formModel) {
    //   this.formModel = new FormModel();
    //   this.formModel.formName = 'EJobSalaries';
    //   this.formModel.entityName = 'HR_EJobSalaries';
    //   this.formModel.gridViewName = 'grvEJobSalaries';
    // }
    this.dialog = dialog;
    this.funcID = data?.data?.funcID;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.currentEJobSalaries = JSON.parse(JSON.stringify(data?.data?.salarySelected));
      this.formModel.currentData = this.currentEJobSalaries;
    }
  }


  // ngAfterViewInit() {
  //   if(this.listView){
  //   console.log('list salaries', this.listView.dataService.data);
  //   }

  //   this.dialog.closed.subscribe(res => {
  //     console.log('res khi close', res);
  //     if(!res.event){
  //       for(let i = 0; i < this.listView.dataService.data.length; i++){
  //         if(this.listView.dataService.data[i].isCurrent == true){
  //           this.currentEJobSalaries = this.listView.dataService.data[i];
  //           break;
  //         }
  //       }
  //       this.dialog && this.dialog.close(this.currentEJobSalaries);
  //     }
  //   })
  // }

  

  initForm() {
    // this.hrSevice
    //   .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    //   .then((item) => {
    //     this.formGroup = item;
    //     if (this.actionType == 'add') {
    //       this.hrSevice.GetEmployeeJobSalariesModel().subscribe((p) => {
    //         this.data = p;
    //         this.formModel.currentData = this.data;
    //       });
    //     }
    //     this.formGroup.patchValue(this.data);
    //     this.isAfterRender = true;
    //   });

    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.currentEJobSalaries = res?.data;
            this.currentEJobSalaries.employeeID = this.employeeId;
            this.formModel.currentData = this.currentEJobSalaries;
            this.formGroup.patchValue(this.currentEJobSalaries);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.currentEJobSalaries);
        this.formModel.currentData = this.currentEJobSalaries;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onInit(): void {
    this.hrSevice.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrSevice
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

  onSaveForm() {
    if (this.currentEJobSalaries.expiredDate < this.currentEJobSalaries.effectedDate) {
      this.hrSevice.notifyInvalidFromTo('ExpiredDate', 'EffectedDate', this.formModel)
      return;
    }
    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.currentEJobSalaries.recID;
    }
    this.currentEJobSalaries.employeeID = this.employeeId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrSevice.AddEmployeeJobSalariesInfo(this.currentEJobSalaries).subscribe((p) => {
        if (p != null) {
          this.notify.notifyCode('SYS006');
          if(this.currentEJobSalaries){
            if(this.currentEJobSalaries.effectedDate < p.effectedDate){
              this.currentEJobSalaries.isCurrent = 'false';
              (this.listView.dataService as CRUDService).update(this.currentEJobSalaries).subscribe();
              this.currentEJobSalaries = p;
            }
          }
          else{
            this.currentEJobSalaries = p;
          }

          if (this.listView) {
            (this.listView.dataService as CRUDService).add(p).subscribe();
          }
          //this.dialog.close(p);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrSevice.UpdateEmployeeJobSalariesInfo(this.formModel.currentData).subscribe((p) => {
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
        } else this.notify.notifyCode('SYS021');
      });
    }
  }

  click(data) {
    console.log(data);
    this.currentEJobSalaries = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.currentEJobSalaries)) 
    this.actionType ='edit'
    this.formGroup?.patchValue(this.currentEJobSalaries);
    this.cr.detectChanges();
  }

  afterRenderListView(evt) {
    this.listView = evt;
    console.log('lst view data', this.listView);
  }
}
