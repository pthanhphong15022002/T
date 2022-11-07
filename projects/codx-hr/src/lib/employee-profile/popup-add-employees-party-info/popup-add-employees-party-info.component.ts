import { Component, OnInit } from '@angular/core';
import {} from '@angular/router';
import{
  FormModel
} from 'codx-core';
import { CodxEsService } from 'projects/codx-es/src/lib/codx-es.service';

@Component({
  selector: 'lib-popup-add-employees-party-info',
  templateUrl: './popup-add-employees-party-info.component.html',
  styleUrls: ['./popup-add-employees-party-info.component.css']
})
export class PopupAddEmployeesPartyInfoComponent implements OnInit {

  formModel: FormModel
  dialog: any;
  form: any;
  headerText: ''
  private esService: CodxEsService

  constructor() { }

  ngOnInit(): void {
    this.formModel = new FormModel();
    this.formModel.entityName = 'HR_Employees'
    this.formModel.formName = 'Employees'
    this.formModel.gridViewName = 'grvEmployees'
  }


  // onSaveForm() {
  //   if (this.form?.formGroup?.invalid == true) {
  //     this.esService.notifyInvalid(this.form?.formGroup, this.formModel);
  //     return;
  //   }

  //   this.dialog.dataService.dataSelected = this.data;
  //   this.dialog.dataService
  //     .save((opt: any) => this.beforeSave(opt), 0)
  //     .subscribe((res) => {
  //       if (res.update || res.save) {
  //         let result = res.save;

  //         this.isSaveSuccess = true;

  //         if (res.update) {
  //           result = res.update;
  //         }
  //         this.data = result;
  //         // if (
  //         //   this.imgSignature1.imageUpload?.item ||
  //         //   this.imgSignature2.imageUpload?.item ||
  //         //   this.imgStamp.imageUpload?.item
  //         // ) {
  //         //   var i = 0;
  //         //   if (this.imgSignature1.imageUpload?.item) i++;
  //         //   if (this.imgSignature2.imageUpload?.item) i++;
  //         //   if (this.imgStamp.imageUpload?.item) i++;

  //         //   this.imgSignature1.imageUpload?.item &&
  //         //     this.imgSignature1
  //         //       .updateFileDirectReload(this.data.recID)
  //         //       .subscribe((img) => {
  //         //         if (img) i--;
  //         //         else {
  //         //           this.notification.notifyCode(
  //         //             'DM006',
  //         //             0,
  //         //             this.imgSignature1.imageUpload?.fileName
  //         //           );
  //         //         }
  //         //         if (img && this.data.signature1 == null) {
  //         //           result.signature1 = (img[0] as any).recID;
  //         //           this.data.signature1 = (img[0] as any).recID;
  //         //           this.updateAfterUpload(i);
  //         //         }

  //         //         if (i <= 0) this.dialog && this.dialog.close(this.data);
  //         //       });
  //         //   this.imgSignature2.imageUpload?.item &&
  //         //     this.imgSignature2
  //         //       .updateFileDirectReload(this.data.recID)
  //         //       .subscribe((img) => {
  //         //         if (img) i--;
  //         //         else {
  //         //           this.notification.notifyCode(
  //         //             'DM006',
  //         //             0,
  //         //             this.imgSignature2.imageUpload?.fileName
  //         //           );
  //         //         }
  //         //         if (img && this.data.signature2 == null) {
  //         //           result.signature2 = (img[0] as any).recID;

  //         //           this.data.signature2 = (img[0] as any).recID;
  //         //           this.updateAfterUpload(i);
  //         //         }

  //         //         if (i <= 0) this.dialog && this.dialog.close(this.data);
  //         //       });
  //         //   this.imgStamp.imageUpload?.item &&
  //         //     this.imgStamp
  //         //       .updateFileDirectReload(this.data.recID)
  //         //       .subscribe((img) => {
  //         //         if (img) i--;
  //         //         else {
  //         //           this.notification.notifyCode(
  //         //             'DM006',
  //         //             0,
  //         //             this.imgStamp.imageUpload?.fileName
  //         //           );
  //         //         }
  //         //         if (img && this.data.stamp == null) {
  //         //           result.stamp = (img[0] as any).recID;

  //         //           this.data.stamp = (img[0] as any).recID;
  //         //           this.updateAfterUpload(i);
  //         //         }

  //         //         if (i <= 0) this.dialog && this.dialog.close(this.data);
  //         //       });
  //         // } else {
  //         this.dialog && this.dialog.close(result);
  //         // }
  //       }
  //     });
  // }




}
