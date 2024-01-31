import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CallFuncService,
  CodxInputComponent,
  CRUDService,
  DialogData,
  DialogRef,
  NotificationsService,
  UserModel,
  Util,
} from 'codx-core';
import { FD_Permissions } from '../../models/FD_Permissionn.model';
import { FED_Card } from '../../models/FED_Card.model';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { tmpPost } from '../../models/tmpPost.model';
import { CodxFdService } from '../../codx-fd.service';
import { zip } from 'rxjs';

@Component({
  selector: 'lib-popup-add-cards',
  templateUrl: './popup-add-cards.component.html',
  styleUrls: ['./popup-add-cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAddCardsComponent implements OnInit {
  @ViewChild('popupViewCard') popupViewCard: TemplateRef<any>;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('inputReceiver') inputReceiver: CodxInputComponent;

  dialog: DialogRef;
  form: FormGroup;

  lstPattern: any[] = [];
  behavior: any[] = [];
  lstShare: any[] = [];
  gifts: any[] = [];
  giftIDs: string;
  slides: any[] = [];

  patternSelected: any;
  user: UserModel;
  wallet: any;
  lstRating: any = null;
  myWallet: any = null;
  parameter: any = null;

  ratingVll: string = '';
  objectType: string = '';
  mssgNoti: string = '';
  userReciver: string = '';
  userReciverName: string = '';
  title: string = '';
  cardType: string = '';
  situation: string = '';
  rating: string = '';
  industry: string = '';
  funcID: string = '';
  gridViewName: string = '';
  formName: string = '';
  shareControl: string = 'U';
  entityName: string = 'FD_Cards';
  refValue: string = 'Behaviors_Grp';
  createNewfeed: boolean = false;

  countCardReive: number = 0;
  countCardSend: number = 0;
  countPointSend: number = 0;
  giftCount: number;
  givePoint: number = 0;
  quantity: number = 0;
  quantityOld: number = 0;
  amount: number = 0;
  amountEvoucher: number = 0;
  price: number = 0;
  totalRecorItem: number = 4;
  width = 720;
  widthEvoucher = 747;
  height = window.innerHeight;
  exchangeRateEVoucher: number = 1;

  isWalletReciver: boolean = false;
  showNavigationArrows: boolean = false;
  showPopupGift: boolean = false;
  showPopupEvoucher: boolean = false;

  MEMBERTYPE = {
    CREATED: '1',
    SHARE: '2',
    TAGS: '3',
  };

  SHARECONTROLS = {
    OWNER: '1',
    MYGROUP: '2',
    MYTEAM: '3',
    MYDEPARMENTS: '4',
    MYDIVISION: '5',
    MYCOMPANY: '6',
    EVERYONE: '9',
    OGRHIERACHY: 'O',
    DEPARMENTS: 'D',
    POSITIONS: 'P',
    ROLES: 'R',
    GROUPS: 'G',
    USER: 'U',
  };

  CARDTYPE_EMNUM = {
    Commendation: '1',
    Thankyou: '2',
    CommentForChange: '3',
    SuggestionImprovement: '4',
    Share: '5',
    Congratulation: '6',
    Radio: '7',
  };

  SETTINGVALUES_COINS_TRANSTYPE = {
    Coins: 'ActiveCoins',
    CoCoins: 'ActiveCoCoins',
  };
  card = new FED_Card();
  isHaveFile = false;
  showLabelAttachment = false;
  type = 'add';
  reduceCoCoins = 0;
  cointsError = '';
  evoucher: any[] = [];
  evoucherSelected: any[] = [];
  isSaving = false;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private auth: AuthService,
    private notifySV: NotificationsService,
    private fdService: CodxFdService,
    @Optional() dialogRef?: DialogRef,
    @Optional() dd?: DialogData
  ) {
    this.funcID = dd.data.funcID;
    this.card = dd.data.data;
    this.title = dd.data.title;
    this.type = dd.data.type;
    this.dialog = dialogRef;
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDataAsync(this.funcID);
    this.getMessageNoti('SYS009');
    this.getMyWallet(this.user.userID);
    if (this.type == 'add') {
      this.setUserReportInListShare();
    }
    if (this.type == 'detail') {
      this.getCardInfor();
    }
  }

  getCardInfor() {
    this.api
      .execSv('FD', 'ERM.Business.FD', 'CardsBusiness', 'GetCardInforAsync', [
        this.card.recID,
      ])
      .subscribe((res: any) => {
        if (res) {
          console.log(res);
          this.evoucher = res.gifts?.filter((x: any) => x.category == '4');
          this.gifts = res.gifts?.filter((x: any) => x.category == '1');
          this.givePoint = res.point;
          this.form.patchValue({ coins: this.givePoint });
          this.lstShare = res.listShare;
          this.dt.detectChanges();
        }
      });
  }

  loadDataAsync(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
        if (
          func &&
          func?.formName &&
          func?.gridViewName &&
          func?.entityName &&
          func?.description
        ) {
          this.cardType = func.dataValue;
          this.formName = func.formName;
          this.gridViewName = func.gridViewName;
          this.entityName = func.entityName;
          if (this.type === 'copy') {
            this.title = this.title + ' ' + func.description;
          } else {
            this.title = func.description;
          }
          this.CheckAvalidMaxPointPeriod();
          this.cache
            .gridViewSetup(this.formName, this.gridViewName)
            .subscribe((grdSetUp: any) => {
              if (grdSetUp && grdSetUp?.Rating?.referedValue) {
                console.log(grdSetUp);
                this.ratingVll = grdSetUp.Rating.referedValue;
                this.cache.valueList(this.ratingVll).subscribe((vll: any) => {
                  if (vll) {
                    this.lstRating = vll.datas;
                  }
                });
              }
            });
          this.loadParameter(this.cardType);
          if (
            this.cardType != this.CARDTYPE_EMNUM.Share &&
            this.cardType != this.CARDTYPE_EMNUM.Radio
          ) {
            this.loadDataPattern(this.cardType);
          }
          if (!this.card) {
            this.api
              .execSv<any>('FD', 'Core', 'DataBusiness', 'GetDefaultAsync', [
                funcID,
                'FD_Cards',
              ])
              .subscribe((response: any) => {
                if (response) {
                  var data = response.data;
                  this.card = {
                    ...data,
                  };
                }
              });
          }
        }
      });
    }
  }

  loadParameter(cardType: string) {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetParameterAsync',
        ['FDParameters', cardType]
      )
      .subscribe((res: any) => {
        if (res) {
          this.parameter = JSON.parse(res);
          const createNewfeedStr = this.parameter.createNewfeed || '0';
          this.createNewfeed = createNewfeedStr == '1';
          if (this.parameter.MaxSendControl === '1') {
            this.getCountCardSend(this.user.userID, this.cardType);
          }
          if (this.parameter.MaxPointControl === '1') {
            this.api
              .execSv(
                'SYS',
                'ERM.Business.SYS',
                'SettingValuesBusiness',
                'GetParameterAsync',
                ['FDParameters', this.SETTINGVALUES_COINS_TRANSTYPE.CoCoins]
              )
              .subscribe((resCoins: any) => {
                if (resCoins) {
                  const setting = JSON.parse(resCoins);
                  if (setting.ActiveCoCoins == '1') {
                    this.getCountPointSend(
                      this.user.userID,
                      this.cardType,
                      '0'
                    );
                  } else {
                    this.getCountPointSend(
                      this.user.userID,
                      this.cardType,
                      '1'
                    );
                  }
                }
              });
            this.api
              .execSv<any>(
                'SYS',
                'SYS',
                'SettingValuesBusiness',
                'GetByModuleAsync',
                ['FDParameters', 'ActiveCoins']
              )
              .subscribe((res) => {
                if (res) {
                  let data = JSON.parse(res.dataValue);
                  if (data) {
                    // tỷ lệ giữa 1 xu và 1.000 vnđ
                    this.exchangeRateEVoucher = parseInt(
                      data.ExchangeRateEVoucher
                    );
                  }
                }
              });
            // if (this.parameter.ActiveCoins) {
            //   this.getCountPointSend(this.user.userID, this.cardType, this.parameter.ActiveCoins);
            // }
          }
          this.dt.detectChanges();
        }
      });
  }

  getCountCardSend(senderID: string, cardType: string) {
    this.api
      .execSv(
        'FD',
        'ERM.Business.FD',
        'CardsBusiness',
        'GetCountCardSendAsync',
        [senderID, cardType]
      )
      .subscribe((res: number) => {
        if (res >= 0) {
          this.countCardSend = res;
        }
      });
  }

  getCountCardRecive(reciverID: string, cardType: string) {
    this.api
      .execSv(
        'FD',
        'ERM.Business.FD',
        'CardsBusiness',
        'GetCountCardReciveAsync',
        [reciverID, cardType]
      )
      .subscribe((res: number) => {
        if (res >= 0) {
          this.countCardReive = res;
        }
      });
  }

  getCountPointSend(userID: string, cardType: string, activeCoins: string) {
    this.api
      .execSv(
        'FD',
        'ERM.Business.FD',
        'CardsBusiness',
        'GetCountPointSendAsync',
        [userID, cardType, activeCoins]
      )
      .subscribe((res: number) => {
        if (res >= 0) {
          this.countPointSend = res;
        }
      });
  }

  loadDataPattern(cardType: string) {
    this.api
      .execSv('FD', 'ERM.Business.FD', 'PatternsBusiness', 'GetPatternsAsync', [
        cardType,
      ])
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.lstPattern = res;
          let patternDefault = this.lstPattern.find(
            (e: any) => e.isDefault == true
          );
          this.patternSelected = patternDefault
            ? patternDefault
            : this.lstPattern[0];
          if (this.card?.pattern) {
            const temp = this.lstPattern.find(
              (e: any) => e.recID === this.card.pattern
            );
            if (temp) {
              this.patternSelected = temp;
            }
          }
          this.createSlides();
          this.dt.detectChanges();
        }
      });
  }

  createSlides() {
    let slideIndex = this.slides.length;
    for (let index = 0; index < this.lstPattern.length; index += 4) {
      this.slides[slideIndex] = [];
      this.slides[slideIndex] = this.lstPattern.slice(index, index + 4);
      slideIndex++;
    }
  }

  getMyWallet(userID: string) {
    this.api
      .execSv('FD', 'ERM.Business.FD', 'WalletsBusiness', 'GetWalletsAsync', [
        userID,
      ])
      .subscribe((res: any) => {
        if (res) {
          this.myWallet = res;
        }
      });
  }

  initForm() {
    this.form = new FormGroup({
      receiver: new FormControl(
        this.card?.receiver ? this.card?.receiver : null
      ),
      behavior: new FormControl(
        this.card?.behavior ? this.card?.behavior : null
      ),
      situation: new FormControl(
        this.card?.situation ? this.card?.situation : ''
      ),
      industry: new FormControl(
        this.card?.industry ? this.card?.industry : ''
      ),
      patternID: new FormControl(''),
      rating: new FormControl(''),
      giftID: new FormControl(''),
      quantity: new FormControl(0),
      coins: new FormControl(0),
    });
  }

  valueChange(e: any) {
    this.form.get(e.field).setValue(e.data);
    //this.form.controls[e.field].value = e.data;
    // if (!e?.field || !e?.data) {
    //   return;
    // }

    let data = e.data;
    let field = e.field;
    switch (field) {
      case 'rating':
        this.rating = data;
        this.form.patchValue({ rating: data });
        break;

      case 'giftID':
        this.getGiftInfor(data.value);
        break;

      // case 'quantity':
      //   if (
      //     !this.gifts[0] ||
      //     !this.gifts[0]?.availableQty ||
      //     this.gifts[0]?.price == null
      //   ) {
      //     // this.form.patchValue({ quantity: 0 });
      //     this.notifySV.notify('Vui lòng chọn quà tặng');
      //     return;
      //   } else if (data > this.gifts[0].availableQty) {
      //     this.quantity = 1;
      //     this.amount = this.quantity * this.gifts[0].price;
      //     this.gifts[0].quantity = this.quantity;
      //     this.form.patchValue({ quantity: this.quantity });
      //     this.notifySV.notify('Vượt quá số dư quà tặng');
      //     return;
      //   } else {
      //     // this.quantityOld = data - 1;
      //     this.quantity = data;
      //     this.amount = this.quantity * this.gifts[0].price;
      //     this.gifts[0].quantity = this.quantity;
      //     this.form.patchValue({ quantity: data });
      //   }
      //   break;

      case 'behavior':
        this.behavior = data;
        this.form.patchValue({ behavior: this.behavior });
        break;

      case 'industry':
        // this.industry = data;
        // let obj = {};
        // obj[field] = this.industry;
        // this.api
        //   .execSv(
        //     'BS',
        //     'ERM.Business.BS',
        //     'IndustriesBusiness',
        //     'GetListByID',
        //     this.industry
        //   )
        //   .subscribe((res: any) => {
        //     if (res) {
        //       this.userReciver = res[0].description;
        //       this.api
        //         .callSv(
        //           'SYS',
        //           'ERM.Business.AD',
        //           'UsersBusiness',
        //           'GetAsync',
        //           this.userReciver
        //         )
        //         .subscribe((res2) => {
        //           if (res2.msgBodyData.length) {
        //             this.userReciverName = res2.msgBodyData[0].userName;
        //             this.form.patchValue({ receiver: this.userReciver });
        //           }
        //         });
        //     }
        //   });
        // this.form.patchValue(obj);
        this.industry = data;
        const onwer = e?.component.itemsSelected[0]?.Owner;
        if (onwer) {
          this.fdService
            .CheckAvalidReceiver(this.cardType, onwer)
            .subscribe((res: any) => {
              if (res.error) {
                this.userReciver = null;
                this.userReciverName = null;
                this.form.patchValue({ receiver: this.userReciver });
                this.notifySV.notifyCode('FD002');
              } else {
                this.userReciver = onwer;
                this.api
                  .callSv(
                    'SYS',
                    'ERM.Business.AD',
                    'UsersBusiness',
                    'GetAsync',
                    this.userReciver
                  )
                  .subscribe((res2) => {
                    if (res2.msgBodyData.length) {
                      this.userReciverName = res2.msgBodyData[0].userName;
                      this.form.patchValue({ receiver: this.userReciver });
                    }
                  });
              }
            });
        }
        break;

      case 'situation':
        this.situation = data;
        this.form.patchValue({ situation: this.situation });
        break;

      case 'receiver':
        if (data) {
          this.fdService
            .CheckAvalidReceiver(this.cardType, data)
            .subscribe((res: any) => {
              if (res.error) {
                this.userReciver = null;
                this.userReciverName = null;
                this.form.patchValue({ receiver: this.userReciver });
                this.inputReceiver.value = null;
                this.notifySV.notifyCode('FD002');
              } else {
                this.userReciver = data;
                this.userReciverName = e.component.itemsSelected[0].UserName;
              }
            });
          // this.userReciver = data;
          // this.userReciverName = e.component.itemsSelected[0].UserName;
          // this.form.patchValue({ receiver: this.userReciver });
          // if (this.parameter.MaxReceiveControl == '1') {
          //   this.getCountCardRecive(data, this.cardType);
          // }
          // this.checkValidateWallet(this.userReciver);
        }
        break;
      case 'coins':
        this.cointsError = '';
        if (data) {
          if (this.checkPolicyPoint(data)) {
            this.givePoint = data;
          }
        } else {
          this.givePoint = 0;
        }
        break;
      default:
        break;
    }
    this.dt.detectChanges();
  }

  CheckAvalidMaxPointPeriod() {
    this.api
      .execSv<any>(
        'FD',
        'ERM.Business.FD',
        'CardsBusiness',
        'CheckAvalidMaxPointPeriod',
        ['FDParameters', this.cardType, this.user.userID]
      )
      .subscribe((res) => {
        if (res) {
          this.reduceCoCoins = res;
        }
      });
  }

  checkValidateWallet(receiverID: string) {
    this.api
      .execSv<any>(
        'FD',
        'ERM.Business.FD',
        'WalletsBusiness',
        'CheckWallet',
        receiverID
      )
      .subscribe((res) => {
        if (res) {
          this.isWalletReciver = true;
        } else {
          this.isWalletReciver = false;
          this.notifySV.notify('Người nhận chưa tích hợp ví', '3');
        }
      });
  }

  getMessageNoti(mssgCode: string) {
    this.cache.message(mssgCode).subscribe((mssg: any) => {
      if (mssg) {
        this.mssgNoti = mssg.defaultName;
        this.dt.detectChanges();
      }
    });
  }

  async Save() {
    if (
      !this.form.controls['receiver'].value &&
      this.cardType != this.CARDTYPE_EMNUM.Radio
    ) {
      let mssg = Util.stringFormat(this.mssgNoti, 'Người nhận');
      this.notifySV.notify(mssg, '3');
      return;
    } else if (!this.form.controls['situation'].value) {
      let mssg = Util.stringFormat(this.mssgNoti, 'Nội dung');
      this.notifySV.notify(mssg, '3');
      return;
    }
    if (this.parameter) {
      switch (this.parameter.RuleSelected) {
        case '0':
          break;
        case '1':
          if (!this.form.controls['behavior'].value) {
            let mssg = Util.stringFormat(this.mssgNoti, 'Qui tắc ứng xử');
            this.notifySV.notify(mssg, '3');
            return;
          }
          break;
        case '2':
          if (!this.form.controls['behavior'].value) {
            let mssg = Util.stringFormat(this.mssgNoti, 'Hành vi ứng xử');
            this.notifySV.notify(mssg, '3');
            return;
          }
          break;
        default:
          break;
      }
    }
    if (
      (!this.myWallet || this.myWallet?.status != '1') &&
      (this.givePoint > 0 || (this.gifts && this.gifts.length > 0))
    ) {
      this.notifySV.notify('Bạn chưa tích hợp ví', '3');
      return;
    } else if (this.myWallet && this.myWallet?.coins < this.amount) {
      this.notifySV.notify('Số dư ví của bạn không đủ', '3');
      return;
    } else {
      this.card = {
        ...this.card,
        ...this.form.value,
      };
      this.card.functionID = this.funcID;
      this.card.entityPer = this.entityName;
      this.card.cardType = this.cardType;
      this.card.shareControl = this.shareControl;
      this.card.objectType = this.objectType;
      this.card.listShare = this.lstShare;

      if (
        this.cardType != this.CARDTYPE_EMNUM.SuggestionImprovement ||
        this.cardType != this.CARDTYPE_EMNUM.Share
      ) {
        if (this.patternSelected?.patternID) {
          this.card.pattern = this.patternSelected.recID;
        }
      }

      if (
        (this.gifts && this.gifts.length > 0) ||
        (this.evoucher && this.evoucher.length > 0)
      ) {
        this.card.hasGifts = true;
        this.card.gifts = [...this.gifts, ...this.evoucher];
      }
      if (this.givePoint > 0) {
        this.card.hasPoints = true;
      }
      this.card.coins = this.givePoint;

      // if(this.parameter){
      //   // max send
      //   if(this.parameter.MaxSendControl === "1")
      //   {
      //     if(this.countCardSend > this.parameter.MaxSends){
      //       this.notifySV.notify("Bạn đã gửi tối đa số phiểu cho phép");
      //       return;
      //     }
      //   }
      //   // max recive
      //   if(this.parameter.MaxReceiveControl === "1")
      //   {
      //     if(this.countCardReive > this.parameter.MaxReceives){
      //       this.notifySV.notify("Người nhận đã nhận tối đa số phiểu cho phép");
      //       return;
      //     }
      //   }
      //   // max point
      //   if(this.parameter.MaxPointControl === "1")
      //   {
      //     if(this.givePoint > this.parameter.MaxPoints){
      //       this.notifySV.notify("Tặng quá số xu cho phép");
      //       return;
      //     }
      //   }
      // }
      let post: tmpPost = new tmpPost();

      if (this.attachment && this.attachment.fileUploadList.length) {
        this.isSaving = true;
        (await this.attachment.saveFilesObservable()).subscribe((res) => {
          this.isSaving = false;
          if (res) {
            let attachments = Array.isArray(res) ? res.length : 1;
            post.attachments = attachments;
            this.addCardAPI(post);
          }
        });
      } else {
        this.addCardAPI(post);
      }
    }
  }

  addCardAPI(post: tmpPost) {
    if (this.type == 'copy') {
      this.card.recID = undefined;
    }
    const createNewfeedStr = this.createNewfeed ? '1' : '0';
    this.isSaving = true;
    this.api
      .execSv<any>('FD', 'ERM.Business.FD', 'CardsBusiness', 'AddNewAsync', [
        this.card,
        // post,
        createNewfeedStr,
      ])
      .subscribe(async (res: any[]) => {
        this.isSaving = false;
        if (res && res[1]) {
          (this.dialog.dataService as CRUDService).add(res[1], 0).subscribe();
          this.dialog.close();
          this.notifySV.notifyCode('SYS006');
        } else {
          this.notifySV.notify(res[1]);
        }
      });
  }

  openFormShare(content: any) {
    this.callfc.openForm(content, '', 420, window.innerHeight);
  }

  setUserReportInListShare(){
    this.fdService.getReportUserByEmployeeID(this.user.employee?.employeeID).subscribe((emp: any) => {
      if(emp) {
        const obj = new FD_Permissions();
        obj.objectID = emp.domainUser;
        obj.objectName = emp.employeeName;
        obj.objectType ="U";
        this.objectType = "U";
        this.shareControl = "U";
        this.lstShare.push(obj);
      }
    });
  }

  eventApply(event: any) {
    if (!event) {
      return;
    }
    this.lstShare = [];
    let data = event;
    this.shareControl = data[0].objectType;
    this.objectType = data[0].objectType;
    switch (this.shareControl) {
      case this.SHARECONTROLS.OWNER:
      case this.SHARECONTROLS.EVERYONE:
      case this.SHARECONTROLS.MYCOMPANY:
      case this.SHARECONTROLS.MYDEPARMENTS:
      case this.SHARECONTROLS.MYDIVISION:
      case this.SHARECONTROLS.MYGROUP:
      case this.SHARECONTROLS.MYTEAM:
        let p = new FD_Permissions();
        p.objectType = this.objectType;
        this.lstShare.push(p);
        break;
      case this.SHARECONTROLS.DEPARMENTS:
      case this.SHARECONTROLS.GROUPS:
      case this.SHARECONTROLS.ROLES:
      case this.SHARECONTROLS.OGRHIERACHY:
      case this.SHARECONTROLS.POSITIONS:
      case this.SHARECONTROLS.USER:
        data.forEach((x: any) => {
          let p = new FD_Permissions();
          p.objectType = x.objectType;
          p.objectID = x.id;
          p.objectName = x.text;
          this.lstShare.push(p);
        });
        break;
      default:
        break;
    }
    this.dt.detectChanges();
  }

  removeUser(user: any) {
    this.lstShare = this.lstShare.filter(
      (x: any) => x.objectID != user.objectID
    );
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
      this.callfc.openForm(this.popupViewCard, '', 350, 500, '', null, '');
    }
  }

  closeViewCard(dialogRef: DialogRef) {
    dialogRef.close();
  }

  subPoint() {
    if (this.givePoint != 0) {
      this.givePoint--;
      this.dt.detectChanges();
    }
  }

  checkPolicyPoint(data) {
    if (this.parameter.MaxPointPerOnceControl === '1') {
      if (data > this.parameter.MaxPointPerOnce) {
        this.cointsError = 'Vượt quá số xu cho phép tặng trong 1 lần';
        this.givePoint = 0;
        return false;
      }
    }
    if (data && this.parameter.MaxPointControl === '1') {
      let unitName = '';
      switch (this.parameter.MaxPointPeriod) {
        case '1':
          unitName = 'tuần';
          break;
        case '2':
          unitName = 'tháng';
          break;
        case '3':
          unitName = 'quý';
          break;
        case '4':
          unitName = 'năm';
          break;
      }
      if(
          (this.reduceCoCoins + data < 0) ||
          (this.reduceCoCoins + data > Number.parseInt(this.parameter.MaxPoints))
        ) {
        this.cointsError =
          'Vượt quá số xu cho phép tặng: ' +
          this.parameter.MaxPoints +
          ' xu/' +
          unitName + ' (Hiện tại bạn đã tặng: ' + -this.reduceCoCoins + ' xu/' + unitName + ')';
        this.givePoint = 0;
        return false;
      }
    }
    if (data > this.myWallet?.coCoins) {
      this.cointsError =
        'Số dư xu không đủ, số dư hiện tại là: ' +
        this.myWallet?.coCoins +
        ' xu';
      this.givePoint = 0;
      return false;
    }
    return true;
  }

  addPoint() {
    // max points
    let point = this.givePoint + 1;
    if (this.checkPolicyPoint(point)) {
      this.givePoint++;
      this.dt.detectChanges();
    }
  }

  clickAddGift() {
    this.showPopupGift = !this.showPopupGift;
    this.dt.detectChanges();
  }

  clickAddEvoucher() {
    this.showPopupEvoucher = !this.showPopupEvoucher;
    this.dt.detectChanges();
  }

  // get gift infor
  getGiftInfor(e: any) {
    this.showPopupGift = !this.showPopupGift;
    if (!e) return;
    this.giftIDs = e.id;
    let giftIDs = e.id.split(';');

    if (giftIDs?.length > 0) {
      let obs = giftIDs.map((x) =>
        this.api.execSv(
          'FD',
          'ERM.Business.FD',
          'GiftsBusiness',
          'GetGiftAsync',
          [x]
        )
      );
      zip(obs).subscribe((res: any) => {
        if (res) {
          if (this.gifts.length != 0) {
            this.gifts = [];
          }
          res.forEach((gift) => {
            if (gift.availableQty <= 0) {
              this.form.patchValue({ giftID: '' });
              this.notifySV.notify('Số dư quà tặng không đủ', '3');
              this.dt.detectChanges();
            } else {
              gift.quantity = 1;
              this.gifts.push(gift);
            }
          });
          this.updateAmountGift();
        }
      });
    } else {
      this.gifts = [];
      this.form.patchValue({ giftID: '' });
      this.quantity = 0;
      this.amount = 0;
      this.dt.detectChanges();
    }
  }

  updateQuantity(e: any, index: number) {
    let quantity = e?.component?.crrValue || 1;
    let gift = this.gifts[index];
    if (quantity > gift.availableQty) {
      gift.quantity = 1;
      this.notifySV.notify('Vượt quá số dư quà tặng', '3');
      return;
    } else {
      gift.quantity = quantity;
    }
    this.updateAmountGift();
  }

  updateAmountGift() {
    this.amount = this.gifts.reduce((p, c) => {
      return p + c.price * c.quantity;
    }, 0);
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }

  fileAdded(e) {
    console.log(e);
  }

  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  closeEvoucher(event) {
    if (event) {
      this.showPopupEvoucher = false;
      this.dt.detectChanges();
    }
  }

  saveEvoucher(data: any) {
    this.evoucher = [...data.evoucherGift];
    this.amountEvoucher = this.evoucher.reduce((p, c) => {
      return p + c.price * c.quantity;
    }, 0);
    this.evoucherSelected = [...data.dataSelcected];
    this.showPopupEvoucher = false;
  }
}
