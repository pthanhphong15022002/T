import { FormGroup } from '@angular/forms';
import { CodxHrService } from './../../codx-hr.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
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
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-popup-evisas',
  templateUrl: './popup-evisas.component.html',
  styleUrls: ['./popup-evisas.component.css'],
})
export class PopupEVisasComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  lstVisas: any;
  visaObj;
  actionType;
  headerText: '';
  funcID;
  idField = 'RecID';
  indexSelected;
  employId;
  isAfterRender = false;
  @ViewChild('form') form: CodxFormComponent;
  // @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.employId = data?.data?.employeeId;
    this.visaObj = JSON.stringify(data?.data?.visaObj);
    // this.lstVisas = data?.data?.lstVisas;
    console.log('lst visa constructor', this.lstVisas);

    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

    // if (this.actionType === 'edit' || this.actionType === 'copy') {
    //   this.visaObj = JSON.parse(
    //     JSON.stringify(this.lstVisas[this.indexSelected])
    //   );
    //   // this.formGroup.patchValue(this.visaObj);
    //   // this.formModel.currentData = this.visaObj
    //   // this.cr.detectChanges();
    //   // this.isAfterRender = true;
    // }
  }

  // ngAfterViewInit(){
  //   this.dialog && this.dialog.closed.subscribe(res => {
  //     if(!res.event){
  //       this.dialog.close(this.lstVisas);
  //     }
  //   })
  // }
  initForm() {
    //   this.hrService
    //   .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    //   .then((item) => {
    //     console.log('form group vua lay ra', item);

    //     this.formGroup = item;
    //     if(this.actionType === 'add'){
    //       this.hrService.getEmployeeVisaModel().subscribe(p => {
    //         this.visaObj = p;
    //         this.formModel.currentData = this.visaObj
    //         // this.dialog.dataService.dataSelected = this.data
    //     })
    //     }
    //     this.formGroup.patchValue(this.visaObj)
    //     this.isAfterRender = true
    // });

    if (this.actionType == 'add') {
      this.hrService
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.visaObj = res?.data;
            this.visaObj.employeeID = this.employId;
            //xét null cho field dateTime required
            this.visaObj.effectedDate = null;
            this.visaObj.expiredDate = null;

            this.formModel.currentData = this.visaObj;
            this.formGroup.patchValue(this.visaObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.visaObj);
        this.formModel.currentData = this.visaObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onInit(): void {
    if (!this.formGroup)
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
    else this.initForm();
  }

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrService.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    // if (this.actionType === 'copy' || this.actionType === 'add') {
    //   delete this.visaObj.recID;
    // }
    // this.visaObj.employeeID = this.employId;

    if (this.actionType === 'add' || this.actionType === 'copy') {
      this.hrService.AddEmployeeVisaInfo(this.visaObj).subscribe((p) => {
        if (p != null) {
          this.visaObj.recID = p.recID;
          this.notify.notifyCode('SYS007');
          // this.lstVisas.push(JSON.parse(JSON.stringify(this.visaObj)));
          // if (this.listView) {
          //   (this.listView.dataService as CRUDService)
          //     .add(this.visaObj)
          //     .subscribe();
          // }
          this.dialog && this.dialog.close(p);
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .updateEmployeeVisaInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
            // this.lstVisas[this.indexSelected] = p;
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .update(this.lstVisas[this.indexSelected])
            //     .subscribe();
            // }
            this.dialog && this.dialog.close(p);
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  click(data) {
    this.visaObj = data;
    this.formModel.currentData = JSON.parse(JSON.stringify(this.visaObj));
    this.indexSelected = this.lstVisas.findIndex(
      (p) => p.recID == this.visaObj.recID
    );
    this.actionType = 'edit';
    this.formGroup?.patchValue(this.visaObj);
    this.cr.detectChanges();
  }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }
}
