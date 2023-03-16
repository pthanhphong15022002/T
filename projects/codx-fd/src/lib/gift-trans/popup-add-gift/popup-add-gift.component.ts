import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Thickness } from '@syncfusion/ej2-charts';
import { ApiHttpService, CacheService, CallFuncService, AuthService, NotificationsService, DialogRef, DialogData, CRUDService, CodxFormComponent } from 'codx-core';
import { tmpAddGiftTrans } from '../../models/tmpAddGiftTrans.model';

@Component({
  selector: 'lib-popup-add-gift',
  templateUrl: './popup-add-gift.component.html',
  styleUrls: ['./popup-add-gift.component.scss']
})
export class PopupAddGiftComponent implements OnInit {
  @ViewChild("popupViewCard") popupViewCard: TemplateRef<any>;
  giftTrans = new tmpAddGiftTrans();
  dialogRef: DialogRef = null;
  form: FormGroup = null;

  lstPattern: any[] = [];

  isSharePortal: boolean = true;
  showNavigationArrows: boolean = false;

  funcID: string = null;
  title: string = null;
  transType: string = "3";
  cardTypeDefault: string = "6";
  patternIDSeleted: string = null;
  userReciver: string = "";
  userReceiverName: string = "";

  user: any = null;
  myWallet: any = null;
  reciverWallet: any = null;
  gift: any = null;
  patternSelected: any;

  quantity: number = 0;
  amount: number = 0
  maxQuantity: number = 0;
  dg: any;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private auth: AuthService,
    private notifySV: NotificationsService,
    private route: ActivatedRoute,
    private activeRouter: ActivatedRoute,
    @Optional() dialogRef?: DialogRef,
    @Optional() dd?: DialogData) {
    this.dialogRef = dialogRef;
    this.user = this.auth.userValue;
    this.funcID = dd.data;
  }

  ngOnInit(): void {
    this.giftTrans.TransType = "3";
    this.innitForm();
    this.getMyWalletInfor();
    this.getDataPattern(this.cardTypeDefault);
    this.giftTrans.EntityName = "FD_GiftTrans";
    this.giftTrans.EntityPer = "FD_GiftTrans";
    this.giftTrans.FunctionID = this.funcID;

    // this.route.params.subscribe((param: any) => {
    //   if (param) {
    //     this.giftTrans.EntityName = "FD_GiftTrans";
    //     this.giftTrans.EntityPer = "FD_GiftTrans";
    //     this.giftTrans.FunctionID = this.funcID;
    //   }
    // })

    this.cache.functionList(this.funcID)
      .subscribe((func: any) => {
        if (func && func?.formName && func?.gridViewName && func?.entityName && func?.description) {
          this.title = func.description;
        }
      })
  }

  getDataPattern(cardType: string) {
    if (!cardType) return;
    this.api.execSv("FD", "ERM.Business.FD", "PatternsBusiness", "GetPatternsAsync", [cardType])
      .subscribe((res: any) => {
        if (res) {
          console.log('pattern:', res);
          this.lstPattern = res;
          this.dt.detectChanges();
        }
      });
  }

  innitForm() {
    this.form = new FormGroup({
      userID: new FormControl(""),
      transType: new FormControl("3"),
      giftID: new FormControl(""),
      quantity: new FormControl(0),
      amount: new FormControl(0),
      status: new FormControl("1"),
      siutuation: new FormControl(""),
    });
  }

  resetForm() { }

  valueChange(event: any) {
    if (!event) return;
    let data = event.data;
    let field = event.field;
    switch (field) {
      case 'userID':
        this.giftTrans.UserID = data;
        if (data) {
          this.userReciver = data;
          this.userReceiverName = event.component.itemsSelected[0].UserName;
          this.form.patchValue({ receiver: this.userReciver });
        }
        break;

      case 'transType3':
        this.giftTrans.TransType = "3";
        break;

      case 'transType4':
        this.giftTrans.TransType = "4";
        break;

      case 'itemID':
        this.giftTrans.ItemID = data;
        break;

      case 'quantity':
        if (!this.giftTrans || !this.giftTrans.ItemID) {
          this.notifySV.notify("Vui lòng chọn quà tặng");
          return;
        }
        this.giftTrans.Quantity = data;
        break;

      case 'status':
        if (data) {
          this.giftTrans.Status = "3";
        }
        this.giftTrans.Status = "1";
        break;

      case 'situation':
        this.giftTrans.Situation = data;
        this.form.patchValue({ situation: data });
        break;

      case 'isSharePortal':
        this.isSharePortal = data;
        break;

      default:
        break;
    }
    this.dt.detectChanges();
  }

  save() {
    this.api.execSv("FD", "ERM.Business.FD", "GiftTransBusiness", "AddGiftTransAsync", [this.giftTrans, this.isSharePortal])
      .subscribe((res: any) => {
        if (res) {
          let status = res[0];
          if (status) {
            this.notifySV.notify("Thêm thành công!");
          }
          else {
            let message = res[1];
            this.notifySV.notify(message);
          }
        }
        else {
          this.notifySV.notify("Thêm không thành công!")
        }
      });
  }

  getMyWalletInfor() {
    this.api.execSv("FD", "ERM.Business.FD", "WalletsBusiness", "GetWalletsAsync", this.user.userID)
      .subscribe((res: any) => {
        if (res) {
          this.myWallet = res;
          this.dt.detectChanges();
        }
      });
  }

  getReciverWallet(pUserID: string) {
    if (!pUserID) return;
    this.api.execSv("FD", "ERM.Business.FD", "WalletsBusiness", "GetWalletsAsync", pUserID)
      .subscribe((res: any) => {
        if (res) {
          this.reciverWallet = res;
          this.form.patchValue({ reciverID: pUserID });
        }
        else {
          this.notifySV.notify("Người nhận chưa tích hợp ví");
        }
        this.dt.detectChanges();
      });
  }

  getGiftInfor(giftID: string) {
    this.api.execSv("FD", "ERM.Business.FD", "GiftsBusiness", "GetGiftAsync", [giftID])
      .subscribe((res: any) => {
        if (res) {
          this.gift = res;
          this.maxQuantity = Math.floor(this.myWallet.coins / this.gift.price);
          this.form.patchValue({ giftID: this.gift.giftID });
          this.dt.detectChanges();
        }
      });
  }

  selectedPattern(pattern: any) {
    console.log(pattern);
    if (!pattern) return;
    if (this.patternIDSeleted = pattern.patternID) {
      this.patternIDSeleted = "";
    }
    else {
      this.patternIDSeleted = pattern.patternID;
    }
    this.dt.detectChanges();
  }

  selectCard(item) {
    if (!item) {
      return;
    }
    this.patternSelected = item;
    this.dt.detectChanges();
  }

  previewCard() {
    if (this.popupViewCard) {
      this.callfc.openForm(this.popupViewCard, "", 350, 500, "", null, "");
    }
  }

  closeViewCard(dialogRef: DialogRef) {
    dialogRef.close();
  }
}
