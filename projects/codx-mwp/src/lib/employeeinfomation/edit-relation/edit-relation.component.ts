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
  isAdd = true;
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
    // this.data = dialog.dataService!.dataSelected;
    if (dt && dt.data) {
      this.dataBind = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
      this.isAdd = dt.data.isAdd;
    }

    this.dialog = dialog;

  }

  ngOnInit(): void {
    if (this.isAdd === false) {
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

  OnSaveForm() {
    this.api.exec("ERM.Business.HR", "EmployeesBusiness", "UpdateEmployeeRelationAsync", [this.dataBind, this.isAdd]).subscribe((res: any) => {
      if (res) {
        if (this.avatar) {
          var objRes = res;
          this.imageAvatar.updateFileDirectReload(this.dataBind.recID);
          this.api.execSv<any>("DM", "DM", "FileBussiness", "UploadAvatarAsync", this.avatar).subscribe(res => {
            this.codxMwp.EmployeeInfomation.updateRelation({ Relationship: objRes });
            this.dialog.close(res);
          });
        }
        else {
          this.codxMwp.EmployeeInfomation.updateRelation({ Relationship: res });
          this.dialog.close(res);
        }
      }
      else {
        this.notiService.notify("Error");
      }
    });
  }
}
