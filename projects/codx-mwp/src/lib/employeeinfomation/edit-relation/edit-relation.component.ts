import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';

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

  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) { 
    this.data = dialog.dataService!.dataSelected;
    this.dataBind = this.data;
    this.dialog = dialog;

  }

  ngOnInit(): void {
    if(this.action==='edit'){
      this.title = 'Cập nhật thông tin';
    }
  }

  changeTime(data){
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

  beforeSave(op: any) {
    var data = [];
    op.method = 'UpdateEmployeeRelationAsync';
    data = [
      this.dataBind,
   
    ];
    op.data = data;
    return true;
  }

  OnSaveForm(){
    // this.dialog.dataService
    // .save((option: any) => this.beforeSave(option))
    // .subscribe((res) => {
    //   if (res.save) {
    //     this.dialog.close();
    //     this.notiService.notifyCode('MWP00206'); 
    //   }
    // });

    // this.api.exec("ERM.Business.HR", "EmployeesBusiness", "UpdateEmployeeRelationAsync", this.dataBind).subscribe((res: any) => {


    //   if (res) {
    //     if (this.avatar) {
    //       var objRes = res;
    //       this.imageAvatar.setDb(this.dataBind.recID, this.avatar.data);
    //       this.api.execSv<any>("DM", "DM", "FileBussiness", "UploadAvatarAsync", this.avatar).subscribe(res => {
    //         this.ngxService.stopBackground();
    //         this.isSaving = false;
    //         this.profilesv.profileOverviewComponent.updateRelation({ Relationship: objRes });
    //         this.closeForm();
    //       });
    //     }
    //     else {
    //       this.profilesv.profileOverviewComponent.updateRelation({ Relationship: res });
    //       this.ngxService.stopBackground();
    //       this.isSaving = false;
    //       this.closeForm();
    //     }
    //   }
    //   else {
    //     this.ngxService.stopBackground();
    //     this.isSaving = false;
    //     this.notificationsService.notify("Error");
    //   }
  }
}
