import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-popup-bp-tasks',
  templateUrl: './popup-bp-tasks.component.html',
  styleUrls: ['./popup-bp-tasks.component.css']
})
export class PopupBpTasksComponent implements OnInit  {
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialog: any;
  formModel: any;
  data: any;
  user: any;
  isHaveFile: boolean = false;
  info: any;
  constructor(
    private authstore: AuthStore,
    private shareService: CodxShareService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData){
      this.dialog = dialog;
      this.formModel = this.dialog?.formModel;
      this.data = JSON.parse(JSON.stringify(dt?.data?.data));
      this.user = this.authstore.get();
  }
  ngOnInit(): void {
    this.getInfo();
  }



  getInfo()
  {
    let paras = [this.data.createdBy];
    let keyRoot = 'UserInfo' + this.data.createdBy;
    let info = this.shareService.loadDataCache(paras,keyRoot,"SYS","AD",'UsersBusiness','GetOneUserByUserIDAsync');
    if(isObservable(info))
    {
      info.subscribe(item=>{
        this.info = item;
      })
    }
    else this.info = info;

  }

  onSave(){

  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
  }
}
