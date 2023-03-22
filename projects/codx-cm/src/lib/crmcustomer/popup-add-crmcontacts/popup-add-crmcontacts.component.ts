import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogModel, DialogRef, FormModel } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment.prod';
import { PopupAddressComponent } from '../popup-address/popup-address.component';

@Component({
  selector: 'lib-popup-add-crmcontacts',
  templateUrl: './popup-add-crmcontacts.component.html',
  styleUrls: ['./popup-add-crmcontacts.component.css']
})
export class PopupAddCrmcontactsComponent implements OnInit {
  @ViewChild('imageAvatar') imageAvatar: AttachmentComponent;

  data: any;
  dialog: any;
  title = '';
  action: any;
  linkAvatar = '';
  funcID= '';
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.dialog = dialog;
    this.funcID = this.dialog.formModel.funcID;
    this.action = dt.data[0];
    this.title = dt.data[1];
    if(this.action != 'add'){
      this.getAvatar(this.data.recID);

    }
  }

  ngOnInit(): void {
  }

  valueChange(e) {}

  onSave() {}

  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }

  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;

      this.changeDetectorRef.detectChanges();
    }
  }

  getAvatar(process) {
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'avt',
      false,
    ];

    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvatar = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  openPopupAddress(){
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CRMCustomers';
    dataModel.gridViewName = 'grvCRMCustomers';
    dataModel.entityName = 'CRM_Customers';
    opt.FormModel = dataModel;
    this.callFc.openForm(PopupAddressComponent,'', 500, 550,'','','',opt);
  }
}
