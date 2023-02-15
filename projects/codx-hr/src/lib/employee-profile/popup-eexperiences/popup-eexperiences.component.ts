
import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { CalendarView, DatePicker } from '@syncfusion/ej2-calendars';
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
  selector: 'lib-popup-eexperiences',
  templateUrl: './popup-eexperiences.component.html',
  styleUrls: ['./popup-eexperiences.component.css'],
})
export class PopupEexperiencesComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  data: any;
  successFlag = false;
  start: CalendarView = 'Year';
  depth: CalendarView = 'Year';
  format: string = 'MM/yyyy';
  //indexSelected;
  //lstExperience: any;
  fromdateVal: any;
  todateVal: any;
  idField = 'RecID';
  funcID: string;
  employId: string;
  actionType: string;
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  //@ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.employId = data?.data?.employeeId;
    this.formModel = dialog.formModel;
    this.actionType = data?.data?.actionType;
    this.data = data?.data?.eExperienceObj;
    this.fromdateVal = this.data.fromDate;
    this.todateVal = this.data.toDate;
    this.funcID = data?.data?.funcID;
    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

    // this.lstExperience = data?.data?.lstExperience;
    // if (this.actionType === 'edit' || this.actionType === 'copy') {
    //   this.data = JSON.parse(
    //     JSON.stringify(this.lstExperience[this.indexSelected])
    //   );
    }
    ngAfterViewInit(){
      this.dialog && this.dialog.closed.subscribe(res => {
        if(!res.event){
          if(this.successFlag == true){
            this.dialog.close(this.data);
          }
          else{
            this.dialog.close(null);
          }
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
            this.data = res?.data;
            this.data.beginDate = null;
            this.data.endDate = null;
            this.data.employeeID = this.employId;
            this.formModel.currentData = this.data;
            this.formGroup.patchValue(this.data);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      this.formModel.currentData = this.data;
      this.formGroup.patchValue(this.data);
      this.cr.detectChanges();
      this.isAfterRender = true;
    }
  }

  onInit(): void {
    this.hrService
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
              this.initForm();
            }
          });
    // this.hrService.getFormModel(this.funcID).then((formModel) => {
    //   if (formModel) {
    //     this.formModel = formModel;
    //     this.hrService
    //       .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    //       .then((fg) => {
    //         if (fg) {
    //           this.formGroup = fg;
    //           this.initForm();
    //         }
    //       });
    //   }
    // });
  }

  onSaveForm() {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    this.data.employeeID = this.employId;
    console.log('employeeId', this.data.employeeID);

    this.data.fromDate = this.fromdateVal;
    this.data.toDate = this.todateVal;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeExperienceInfo(this.data).subscribe((p) => {
        if (p != null) {
          this.data.recID = p.recID;
          this.notify.notifyCode('SYS006');
          this.successFlag = true;
          this.dialog && this.dialog.close(this.data);
          // this.lstExperience.push(JSON.parse(JSON.stringify(this.data)));

          // if (this.listView) {
          //   (this.listView.dataService as CRUDService)
          //     .add(this.data)
          //     .subscribe();
          // }
          // this.dialog.close(p)
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .UpdateEmployeeExperienceInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            this.successFlag = true;
            this.dialog && this.dialog.close(this.data);
            // this.lstExperience[this.indexSelected] = p;
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .update(this.lstExperience[this.indexSelected])
            //     .subscribe();
            // }
            // this.dialog.close(this.data);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  UpdateFromDate(e) {
    this.fromdateVal = e;
  }

  UpdateToDate(e) {
    this.todateVal = e;
  }

  // click(data) {
  //   this.data = data;
  //   this.formModel.currentData = JSON.parse(JSON.stringify(this.data));
  //   this.actionType = 'edit';
  //   this.fromdateVal = this.data.fromDate;
  //   this.todateVal = this.data.toDate;
  //   this.formGroup?.patchValue(this.data);
  //   this.cr.detectChanges();
  // }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }
}
