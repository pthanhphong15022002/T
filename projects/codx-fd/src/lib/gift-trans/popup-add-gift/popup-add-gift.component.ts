import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiHttpService, CacheService, CallFuncService, AuthService, NotificationsService, DialogRef, DialogData } from 'codx-core';

@Component({
  selector: 'lib-popup-add-gift',
  templateUrl: './popup-add-gift.component.html',
  styleUrls: ['./popup-add-gift.component.scss']
})
export class PopupAddGiftComponent implements OnInit {

  user:any = null;
  dialogRef:DialogRef = null;
  form:FormGroup = null;  
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
    private callfc:CallFuncService,
    private auth:AuthService,
    private notifySV:NotificationsService,
    @Optional() dialogRef?: DialogRef,
    @Optional() dd?:DialogData) 
    {
      this.dialogRef = dialogRef;
      this.user = this.auth.userValue;
    }

  ngOnInit(): void {
    this.innitForm();
  }
  
  innitForm(){
    this.form = new FormGroup({
      userID: new FormControl(""),
      userName: new FormControl(""),
      transType:new FormControl(""),
      giftID: new FormControl(""),
      quantity: new FormControl(0),
      amount: new FormControl(0),
      status: new FormControl(""),
      siutuation:new FormControl(""),
      isSharePortal: new FormControl(true)
    });
  }

  resetForm(){}

  valueChange(event:any){
    if(!event || !event.data) return;
  }
}
