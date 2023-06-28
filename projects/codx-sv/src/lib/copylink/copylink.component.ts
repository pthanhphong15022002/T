import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AESCryptoService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'app-copylink',
  templateUrl: './copylink.component.html',
  styleUrls: ['./copylink.component.scss']
})
export class CopylinkComponent implements OnInit{
  user: any;
  headerText: any;
  formModel: any;
  dialog: any;
  internal: any ;
  public: any;
  copyLinkGroup: FormGroup;
  recID: any;
  funcID: any;
  constructor(
    private auth : AuthStore,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    private aesCrypto: AESCryptoService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = dt?.data?.headerText;
    this.funcID = dt?.data?.funcID;
    this.recID = dt?.data?.recID;
  }

  ngOnInit()
  {
    this.user = this.auth.get();

    var obj = 
    {
      funcID : this.funcID,
      recID: this.recID
    }
    var key = JSON.stringify(obj);
    key = this.aesCrypto.encode(key);
    //Link public 
    this.public = location.host + "/" + this.user.tenant +  "/forms?_k="+key;
    //Link Internal
    this.internal = location.host + "/" + this.user.tenant +  "/sv/review?_k="+key;

    this.copyLinkGroup = this.formBuilder.group({
      link: 'internal',
    });
  }

  copyLink(type:any)
  {
    navigator.clipboard.writeText(type == "public" ? this.public : this.internal);
    this.notifySvr.notifyCode("SYS041")
  }

  onSave()
  {
    this.copyLink(this.copyLinkGroup.value.link);
    this.dialog.close();
  }
}
