import { FormGroup } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CodxHrService } from '../../codx-hr.service';
import { Injector, AfterViewInit } from '@angular/core';
import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CalendarView } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'lib-popup-efamilies',
  templateUrl: './popup-efamilies.component.html',
  styleUrls: ['./popup-efamilies.component.css'],
})
export class PopupEFamiliesComponent extends UIComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('imageUpLoad') imageUpLoad: ImageViewerComponent;
  start: CalendarView = 'Year';
  depth: CalendarView = 'Year';
  format: string = 'MM/yyyy';
  fromdateVal: any;
  todateVal: any;
  deadMonthVal : any;
  formModel: FormModel;
  // formGroup: FormGroup;
  employId: string;
  actionType: string;
  disabledInput = false;
  dialog: DialogRef;
  fieldHeaderTexts
  changedInForm = false;
  // lstFamilyMembers;
  // indexSelected;
  isEmployee = false;
  idField = 'RecID';

  familyMemberObj;
  headerText: '';
  // isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('registerFromDatePicker') registerFromDatePicker: ElementRef;
  @ViewChild('registerToDatePicker') registerToDatePicker: ElementRef;
  // @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    if(this.actionType == 'view'){
      this.disabledInput = true;
    }
    this.familyMemberObj = JSON.parse(
      JSON.stringify(data?.data?.familyMemberObj)
    );
    this.formModel = dialog?.formModel;
    console.log('formModel nhan vao e fam', this.formModel);
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    debugger
    if (
      changes['deadMonthVal'] &&
      changes['deadMonthVal']?.currentValue != changes['deadMonthVal']?.previousValue && changes['deadMonthVal']?.previousValue
    ) {
      this.changedInForm = true;
    }
  }

  ngAfterViewInit(): void {

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
            this.familyMemberObj = res?.data;
            if(new Date(this.familyMemberObj.registerFrom).getFullYear() == 1){
              this.familyMemberObj.registerFrom = null;
            }
            if(new Date(this.familyMemberObj.registerTo).getFullYear() == 1){
              this.familyMemberObj.registerTo = null;
            }
            this.familyMemberObj.employeeID = this.employId;
            // this.formModel.currentData = this.familyMemberObj;
            // this.form.formGroup.patchValue(this.familyMemberObj);
            this.cr.detectChanges();
            // this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy' || this.actionType === 'view') {
        if (new Date(this.familyMemberObj.registerFrom).getFullYear() == 1)
        {
          this.familyMemberObj.registerFrom = null;
        }
        if (new Date(this.familyMemberObj.registerTo).getFullYear() == 1)
        {
          this.familyMemberObj.registerTo = null;
        }
        if (this.actionType == 'edit') {
          this.familyMemberObj.modifiedOn = new Date();
        }
        debugger
        // this.form.formGroup.patchValue(this.familyMemberObj);
        // this.formModel.currentData = this.familyMemberObj;
        this.fromdateVal = this.familyMemberObj.registerFrom;
        this.todateVal = this.familyMemberObj.registerTo;
        this.deadMonthVal = this.familyMemberObj.deadMonth;
        // this.isAfterRender = true;
        this.cr.detectChanges();
      }
    }
    // if(this.disabledInput == true){
    //   this.registerToDatePicker.nativeElement.disabled = true;
    //   this.registerFromDatePicker.nativeElement.disabled = true;
    // }
  }
  onInit(): void {
  //   if (!this.formModel) {
  //   //   this.hrService.getFormModel(this.funcID).then((formModel) => {
  //   //     if (formModel) {
  //   //       this.formModel = formModel;
  //   //       this.hrService
  //   //         .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
  //   //         .then((fg) => {
  //   //           if (fg) {
  //   //             this.form.formGroup = fg;
  //   //             this.initForm();
  //   //           }
  //   //         });
  //   //     }
  //   //   });
  //   // } else{
  //   //   this.hrService
  //   //     .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
  //   //     .then((fg) => {
  //   //       if (fg) {
  //   //         this.form.formGroup = fg;
  //   //         this.initForm();
  //   //       }
  //   //     });
  //   //   }
    
  // }
  this.initForm();
  this.hrService.getHeaderText(this.funcID).then((res) => {
    this.fieldHeaderTexts = res;
  })
}

  onSaveForm() {
    debugger
    
    let today = new Date();

    this.familyMemberObj.registerFrom = this.fromdateVal;
    this.familyMemberObj.registerTo = this.todateVal;
    this.familyMemberObj.deadMonth = this.deadMonthVal;

    if (this.form.formGroup.invalid) {
      this.hrService.notifyInvalid(this.form.formGroup, this.formModel);
      this.form.validation(false);
      return;
    }

    if (this.familyMemberObj.birthday >= today.toJSON()) {
      this.notify.notifyCode('HR004');
      return;
    }

    let ddd = new Date();
    if(this.familyMemberObj.passportIssuedOn > ddd.toISOString()){
      this.notify.notifyCode('HR014',0,this.fieldHeaderTexts['PassportIssuedOn']);
      return;
    }

    if(this.familyMemberObj.IDIssuedOn > ddd.toISOString()){
      this.notify.notifyCode('HR014',0,this.fieldHeaderTexts['IDIssuedOn']);
      return;
    }

    if(this.familyMemberObj.isEmergency == true){
      if(!this.familyMemberObj.mobile){
        this.notify.notifyCode('HR013');
        return;
      }
    }

    this.familyMemberObj.employeeID = this.employId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService
        .AddEmployeeFamilyInfo(this.familyMemberObj)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS006');
            if (this.imageUpLoad?.imageUpload?.item) {
              this.imageUpLoad
                .updateFileDirectReload(this.familyMemberObj.recID)
                .subscribe((img) => {
                  this.dialog && this.dialog.close(p);
                });
            } else {
              this.dialog && this.dialog.close(p);
            }
          } else this.notify.notifyCode('SYS023');
        });
    } else {
      this.hrService
        .UpdateEmployeeFamilyInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            if (this.imageUpLoad?.imageUpload?.item) {
              this.imageUpLoad
                .updateFileDirectReload(this.familyMemberObj.recID)
                .subscribe((img) => {
                  this.dialog && this.dialog.close(p);
                });
            } else {
              this.dialog && this.dialog.close(p);
            }
            this.notify.notifyCode('SYS007');
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  saveImageUpload() {}

  changeAvatar(event: any) {
    if (event) {
      this.familyMemberObj['modifiedOn'] = new Date();
    }
  }

  // click(data) {
  //   console.log('formdata', data);
  //   this.familyMemberObj = data;
  //   this.formModel.currentData = JSON.parse(
  //     JSON.stringify(this.familyMemberObj)
  //   );
  //   // this.indexSelected = this.lstFamilyMembers.findIndex(
  //   //   (p) => (p.recID = this.familyMemberObj.recID)
  //   // );
  //   this.fromdateVal = this.familyMemberObj.registerFrom;
  //   this.todateVal = this.familyMemberObj.registerTo;
  //   this.actionType = 'edit';
  //   this.form.formGroup?.patchValue(this.familyMemberObj);
  //   this.cr.detectChanges();
  // }

  focus(evt) {
    debugger
    this.isEmployee = evt.data;
    this.cr.detectChanges();
  }

  onSelectEmployee(evt) {
    debugger
    this.familyMemberObj.relationName =
      evt.component.itemsSelected[0].EmployeeName;
    this.familyMemberObj.gender = evt.component.itemsSelected[0].Gender;
    this.familyMemberObj.birthday = evt.component.itemsSelected[0].Birthday;
    this.familyMemberObj.nationalityID =
      evt.component.itemsSelected[0].NationalityID;
    this.familyMemberObj.mobile = evt.component.itemsSelected[0].Mobile;
    this.familyMemberObj.personalEmail =
      evt.component.itemsSelected[0].PersonalEmail;
    this.familyMemberObj.idIssuedOn = evt.component.itemsSelected[0].IssuedOn;
    this.familyMemberObj.idCardNo = evt.component.itemsSelected[0].IDCardNo;
    this.familyMemberObj.idIssuedBy = evt.component.itemsSelected[0].IssuedBy;
    this.familyMemberObj.pitNumber = evt.component.itemsSelected[0].PITNumber;
    this.familyMemberObj.siRegisterNo =
      evt.component.itemsSelected[0].SIRegisterNo;
    this.form.formGroup.patchValue(this.familyMemberObj);
    this.cr.detectChanges();
  }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }

  UpdateRegisterFrom(e) {
    if(new Date(this.fromdateVal).toJSON() != new Date(e).toJSON() && this.fromdateVal){
      this.changedInForm = true;
    }
    this.fromdateVal = e;
  }
  UpdateRegisterTo(e) {
    if(new Date(this.todateVal).toJSON() != new Date(e).toJSON() && this.todateVal){
      this.changedInForm = true;
    }

    this.todateVal = e;
  }

  UpdateDeadMonth(e){
    if(new Date(this.deadMonthVal).toJSON() != new Date(e).toJSON() && this.deadMonthVal){
      this.changedInForm = true;
    }
    this.deadMonthVal = e;
  }
}
