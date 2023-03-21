import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-add-crm-partner',
  templateUrl: './popup-add-crm-partner.component.html',
  styleUrls: ['./popup-add-crm-partner.component.scss']
})
export class PopupAddCrmPartnerComponent implements OnInit {

  // type any
  dialog:any;
  funcID:any;
  entity:any;
  linkAvatar:any;
  imageAvatar:any;


  //type string
  headerText:string;
  action:string;

  // type object
  partner:any;
  data:any;
  constructor(

  private cache: CacheService,
  private callfc: CallFuncService,
  private authStore: AuthStore,
  private notiService: NotificationsService,
  private api: ApiHttpService,
  private changeDetectorRef: ChangeDetectorRef,
  @Optional() dt?: DialogData,
  @Optional() dialog?: DialogRef
  ) {
  debugger;
  this.dialog = dialog;
  this.funcID = this.dialog.formModel.funcID;
  this.entity = this.dialog.formModel.entityName;

  this.headerText = dt.data.headerText;
  this.action = dt.data.action;

  }

  ngOnInit(): void {

  }

  valueChangeTag($event){

  }
  onSave(){

  }

  valueChange(e) {
    this.partner[e.field] = e.data;
  }
  openPopupAddress(){

  }

  fileImgAdded(e) {
    if (e?.data && e?.data?.length > 0) {
      var countListFile = e.data.length;
      this.linkAvatar = e?.data[countListFile - 1].avatar;

      this.changeDetectorRef.detectChanges();
    }
  }
  addAvatar() {
    this.imageAvatar.referType = 'avt';
    this.imageAvatar.uploadFile();
  }
}
