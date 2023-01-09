import { FormGroup, Validators } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { ChangeDetectorRef, Injector, ViewEncapsulation } from '@angular/core';
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
import { Thickness } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'lib-popup-etraincourse',
  templateUrl: './popup-etraincourse.component.html',
  styleUrls: ['./popup-etraincourse.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupETraincourseComponent extends UIComponent implements OnInit {
  formGroup: FormGroup;
  formModel: FormModel;
  formGroup2: FormGroup;
  formModel2: FormModel;
  dialog: DialogRef;
  headerText: string = '';
  idField: string = 'recID';
  funcID;
  employId;
  IsAfterRender = false;
  data;
  dataForm2;
  actionType: string;
  isSaved: boolean = false;

  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;

    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
  }

  initForm() {
    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res) => {
          if (res) {
            this.data = res?.data;
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

    // this.hrService
    //   .getFormGroup(this.formModel2.formName, this.formModel2.gridViewName)
    //   .then((item) => {
    //     this.formGroup2 = item;
    //     console.log('form2 test', this.formGroup2);
    //     this.hrService
    //       .getEmployeeCertificatesInfoById(this.employId)
    //       .subscribe((p) => {
    //         console.log('thong tin chung chi nhan vien', p);
    //         this.dataForm2 = p;
    //         this.formModel2.currentData = this.dataForm2;
    //         this.formGroup2.patchValue(this.dataForm2);
    //         this.isAfterRender = true;
    //       });
    //   });
  }

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

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  onSaveForm(closeForm: boolean) {
    if (this.actionType == 'add' || this.actionType == 'copy') {
      //Code cung
      this.data.trainCourseID = '123';
      this.data.employeeID = this.employId;

      this.hrService.addETraincourse(this.data).subscribe((res) => {
        if (res) {
          this.notitfy.notifyCode('SYS007');
          this.actionType = 'edit';
          if (this.listView) {
            (this.listView.dataService as CRUDService).add(res).subscribe();
          }
          if (closeForm) {
            this.dialog && this.dialog.close();
          }
        }
      });
    } else {
      this.hrService
        .updateEmployeeTrainCourseInfo(this.data)
        .subscribe((res) => {
          if (res) {
            this.notitfy.notifyCode('SYS007');
            if (this.listView) {
              (this.listView.dataService as CRUDService)
                .update(res)
                .subscribe();
            }
            if (closeForm) {
              this.dialog && this.dialog.close();
            }
          } else this.notitfy.notifyCode('DM034');
        });
    }
  }

  onSaveForm2() {
    this.hrService.AddECertificateInfo(this.dataForm2).subscribe((p) => {
      if (p) {
        this.notitfy.notifyCode('SYS007');
        this.dialog.close();
      } else this.notitfy.notifyCode('DM034');
    });
  }

  afterRenderListView(event) {
    this.listView = event;
    console.log(this.listView);
  }

  click(data) {
    this.data = JSON.parse(JSON.stringify(data));
    this.formGroup.patchValue(this.data);
    this.formModel.currentData = this.data;
    this.actionType = 'edit';
    this.cr.detectChanges();
  }

  insertECertificate() {
    if (this.actionType == 'edit') {
      let modelECertificate = JSON.parse(JSON.stringify(this.data));
      modelECertificate.refTrainCource = this.data.recID;
      delete modelECertificate.recID;

      this.hrService.AddECertificateInfo(this.data).subscribe((res) => {
        if (res) {
          this.data.isUpdateCertificate = true;
          this.formGroup.patchValue({ isUpdateCertificate: true });
          this.hrService
            .updateEmployeeTrainCourseInfo(this.data)
            .subscribe((res) => {});
          this.cr.detectChanges();
        }
      });
    } else if (this.actionType == 'add' && this.isSaved == false) {
      //Thông báo lưu record trainning trước khi cập nhật Chứng chỉ
      this.notitfy.notify(
        'Bạn cần lưu thông tin đào tạo trước khi cập nhật chứng chỉ'
      );
    }
    this.cr.detectChanges();
  }

  setIssuedPlace() {
    if (this.data.trainSupplierID) {
      this.data.issuedPlace = this.data.trainSupplierID;
      this.formGroup.patchValue({ issuedPlace: this.data.issuedPlace });
      this.cr.detectChanges();
    } else {
      //Thông báo chưa chọn nơi đào tạo
      this.notitfy.notify('Chưa chọn nơi đào tạo');
    }
  }
}
