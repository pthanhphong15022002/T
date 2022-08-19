import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FileUpload } from '@shared/models/file.model';
import { ApiHttpService, CacheService, DialogData, DialogRef, ImageViewerComponent, NotificationsService } from 'codx-core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CodxMwpService } from '../../codx-mwp.service';

@Component({
  selector: 'lib-edit-relation',
  templateUrl: './edit-relation.component.html',
  styleUrls: ['./edit-relation.component.css']
})
export class EditRelationComponent implements OnInit {
  title = "Thêm mới";
  dataBind: any = {};
  dialog: any;
  data: any;
  action = '';
  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;

  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private codxMwp: CodxMwpService,
    private api: ApiHttpService,
    private ngxService: NgxUiLoaderService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.data = dialog.dataService!.dataSelected;
    this.dataBind = this.data;
    this.dialog = dialog;

  }

  ngOnInit(): void {
    if (this.action === 'edit') {
      this.title = 'Cập nhật thông tin';
    }
  }

  changeTime(data) {
    if (!data.field || !data.data) return;
    this.dataBind[data.field] = data.data?.fromDate;
  }

  dataChange(e: any, field: string) {
    if (e) {
      if (e?.length == undefined) {
        this.dataBind[field] = e?.data;
      } else {
        this.dataBind[field] = e[0];
      }
    }
  }

  avatar: FileUpload = null;

  // beforeSave(op: any) {
  //   var data = [];
  //   op.methodName = 'UpdateEmployeeRelationAsync';
  //   data = [
  //     this.dataBind,

  //   ];
  //   op.data = data;
  //   return true;
  // }

  OnSaveForm() {

    this.api.exec("ERM.Business.HR", "EmployeesBusiness", "UpdateEmployeeRelationAsync", this.dataBind).subscribe((res: any) => {

      if (res) {
        if (this.avatar) {
          var objRes = res;
          this.imageAvatar.updateFileDirectReload(this.dataBind.recID);
          this.api.execSv<any>("DM", "DM", "FileBussiness", "UploadAvatarAsync", this.avatar).subscribe(res => {
            // this.ngxService.stopBackground();
            // this.isSaving = false;
            this.codxMwp.EmployeeInfomation.updateRelation({ Relationship: objRes });
            this.dialog.close();
          });
        }
        else {
          this.codxMwp.EmployeeInfomation.updateRelation({ Relationship: res });
          // this.ngxService.stopBackground();
          // this.isSaving = false;
          this.dialog.close();
        }
      }
      else {
        // this.ngxService.stopBackground();
        // this.isSaving = false;
        this.notiService.notify("Error");
      }
    });
  }
}
