import { FormGroup } from '@angular/forms';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
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

@Component({
  selector: 'lib-popup-eassets',
  templateUrl: './popup-eassets.component.html',
  styleUrls: ['./popup-eassets.component.css'],
})
export class PopupEAssetsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  assetObj;
  //lstAssets;
  //indexSelected;
  actionType;
  successFlag = false;
  idField = 'RecID';
  employeeId;
  isAfterRender = false;
  headerText: '';
  @ViewChild('form') form: CodxFormComponent;
  //@ViewChild('listView') listView: CodxListviewComponent;

  onInit(): void {
    this.hrService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
    .then((fg) => {
      if (fg) {
        this.formGroup = fg;
        this.InitForm();
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
    //           this.InitForm();
    //         }
    //       });
    //   }
    // });
  }

  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private cr: ChangeDetectorRef,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);

    // if(this.formModel){
    //   this.isAfterRender = true
    // }
    // this.data = dialog?.dataService?.dataSelected
    // if(!this.formModel){
    //   this.formModel = new FormModel();
    //   this.formModel.formName = 'EAssets'
    //   this.formModel.entityName = 'HR_EAssets'
    //   this.formModel.gridViewName = 'grvEAssets'
    // }
    this.dialog = dialog;
    this.funcID = data?.data?.funcID;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.formModel = dialog?.formModel;
    this.actionType = data?.data?.actionType;
    this.assetObj = data?.data?.assetObj;
    if(this.assetObj){
      console.log('du lieu truyen vao', this.assetObj);
      
    }
    // this.indexSelected =
    //   data?.data?.indexSelected != undefined ? data?.data?.indexSelected : -1;

    // if (this.actionType === 'edit' || this.actionType === 'copy') {
    //   this.assetObj = JSON.parse(
    //     JSON.stringify(this.lstAssets[this.indexSelected])
    //   );
      // console.log('data truyen vao asset', this.assetObj);

      // this.formModel.currentData = this.assetObj
    
  }

  InitForm() {
    // this.hrService
    // .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
    // .then((item) => {
    //   this.formGroup = item;
    //   if(this.actionType == 'add'){
    //     this.hrService.getEmployeeAssetsModel().subscribe(p => {
    //       console.log('thong tin ho chieu', p);
    //       this.assetObj = p;
    //       this.formModel.currentData = this.assetObj
    //       // this.dialog.dataService.dataSelected = this.data
    //       console.log('du lieu formmodel',this.formModel.currentData);
    //     })
    //   }
    //   this.formGroup.patchValue(this.assetObj)
    //   this.isAfterRender = true
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
            this.assetObj = res?.data;
            this.assetObj.employeeID = this.employeeId;
            this.formModel.currentData = this.assetObj;
            this.formGroup.patchValue(this.assetObj);
            this.isAfterRender = true;
            this.cr.detectChanges();
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.assetObj);
        this.formModel.currentData = this.assetObj;
        this.isAfterRender = true;
        this.cr.detectChanges();
      }
    }
  }

  selectAssetId(evt){
    console.log('select tai san', evt);
  }

  // ngAfterViewInit(){
  //   this.dialog && this.dialog.closed.subscribe(res => {
  //     if(!res.event){
  //       if(this.successFlag == true){
  //         this.dialog.close(this.assetObj);
  //       }
  //       else{
  //         this.dialog.close(null);
  //       }
  //     }
  //   })
  // }

  onSaveForm() {
    // if (this.formGroup.invalid) {
    //   this.hrService.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if (this.actionType === 'copy' || this.actionType === 'add') {
      delete this.assetObj.recID;
    }
    this.assetObj.employeeID = this.employeeId;
    if (this.actionType === 'add' || this.actionType === 'copy') {
      console.log(this.assetObj);
      this.hrService.AddEmployeeAssetInfo(this.assetObj).subscribe((p) => {
        if (p != null) {
          this.assetObj.recID = p.recID;
          this.notify.notifyCode('SYS006');
          this.successFlag = true;
          this.dialog && this.dialog.close(this.assetObj);
          // this.lstAssets.push(JSON.parse(JSON.stringify(this.assetObj)));
          // if (this.listView) {
          //   (this.listView.dataService as CRUDService)
          //     .add(this.assetObj)
          //     .subscribe();
          // }
          // this.dialog.close(p)
        } else this.notify.notifyCode('SYS023');
      });
    } else {
      this.hrService
        .UpdateEmployeeAssetInfo(this.formModel.currentData)
        .subscribe((p) => {
          if (p != null) {
            this.notify.notifyCode('SYS007');
          this.successFlag = true;
          this.dialog && this.dialog.close(this.assetObj);
            // this.lstAssets[this.indexSelected] = p;
            // if (this.listView) {
            //   (this.listView.dataService as CRUDService)
            //     .update(this.lstAssets[this.indexSelected])
            //     .subscribe();
            // }
            // this.dialog.close(this.data)
          } else this.notify.notifyCode('SYS021');
        });
    }
  }

  // click(data) {
  //   console.log('formdata', data);
  //   this.assetObj = data;
  //   this.formModel.currentData = JSON.parse(JSON.stringify(this.assetObj));
  //   this.indexSelected = this.lstAssets.findIndex(
  //     (p) => (p.recID = this.assetObj.recID)
  //   );
  //   this.actionType = 'edit';
  //   this.formGroup?.patchValue(this.assetObj);
  //   this.cr.detectChanges();
  // }

  // afterRenderListView(evt) {
  //   this.listView = evt;
  //   console.log(this.listView);
  // }
}
