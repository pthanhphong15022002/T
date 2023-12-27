import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AESCryptoService, ApiHttpService, AuthStore, CodxService, NotificationsService } from 'codx-core';
import { CodxShareService } from '../../codx-share.service';
import { isObservable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'codx-auth-file',
  templateUrl: './codx-auth-file.component.html',
  styleUrls: ['./codx-auth-file.component.scss']
})
export class CodxAuthFileComponent implements OnInit{
  data:any;
  authGroup: FormGroup;
  otpTimeout:number = 0;
  otpMinutes:number = 0;
  otpReSend = false;
  isSend = false;
  sessionID = "";

  @Input() recID:any;
  @Output() resultEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private api: ApiHttpService,
    private router: ActivatedRoute,
    private aesCrypto: AESCryptoService,
    private shareService: CodxShareService,
    private notifySvr: NotificationsService,
    private ref: ChangeDetectorRef,
    private auth: AuthStore,
    private codxService: CodxService
  )
  {
    this.authGroup = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });
  }

  ngOnInit(): void {
    this.getParams();
  }

  multiPaste(e:any)
  {
    navigator.clipboard.readText()
    .then(text => {
      var data = text.split('');
      [].forEach.call(document.querySelectorAll(".ws-input"), (node, index) => {
         node.value = data[index];
       });
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
   
  }

  inputInsideOtpInput(el) {
    if (el.value.length > 1){
        el.value = el.value[el.value.length - 1];
    }
    try {
        if(el.value == null || el.value == ""){
            this.focusOnInput(el.previousElementSibling);
        }else {
            this.focusOnInput(el.nextElementSibling);
        }
    }catch (e) {
        console.log(e);
    }
}

  focusOnInput(ele){
    ele.focus();
    let val = ele.value;
    ele.value = "";
    // ele.value = val;
    setTimeout(()=>{
        ele.value = val;
    })
  }

  getParams()
  {
    if(!this.recID)
    {
      this.router.queryParams.subscribe((queryParams) => {
        if (queryParams?._k) {
          let recID = this.aesCrypto.decode(queryParams?._k);
          this.loadData(recID);
        }
      });
    }
    else this.loadData(this.recID);
  }

  loadData(recID:any)
  {
    let paras = [recID];
    let keyRoot = "AuthFile" + recID;
    let share = this.shareService.loadDataCache(paras,keyRoot,"BG","BG","SharingsBusiness","GetItemSharingAsync");
    if(isObservable(share))
    {
      share.subscribe((item:any)=>{
        this.data = item;
        if(this.data.shareType == "0" && this.data.pwType == "0") this.resultEvent.emit(this.data);
      })
    }
    else {
      this.data = share;
      if(this.data.shareType == "0" && this.data.pwType == "0") this.resultEvent.emit(this.data);
    }
  }

  //Gửi OTP
  sendOTP()
  {
    //Kiểm tra xem đã nhập mail chưa?
    if((!this.otpReSend && this.isSend) || !this.validate()) return;
    
    //shareType : 1 - Kiểm tra đối tượng có nằm trong danh sách được chia sẻ không?
    if(this.data.shareType == "1")
    {
      var validateSO = this.validateSO();
      if(isObservable(validateSO))
      {
        validateSO.subscribe(item=>{
          if(item) this.generateOTP(); 
          else this.notifySvr.notifyCode("BG001");
        })
      }
    }
    else this.generateOTP();
  }

  generateOTP() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'GenOTPLoginAsync',
        [this.authGroup.controls['email'].value,true]
      )
      .subscribe((success) => {
        if (success) {
          this.isSend = true;
          this.sessionID = success;
          this.otpTimeout = 180;
          let id = setInterval(
            () => {
              this.otpReSend = false;
              this.otpTimeout -= 1;
              this.otpMinutes = Math.floor(this.otpTimeout / 60);
              this.ref.detectChanges();
              if (this.otpTimeout === 0) {
                clearInterval(id);
                this.otpReSend = true;
                this.ref.detectChanges();
              }
            },
            1000,
            this.otpTimeout
          );
        }
      });
  }

  //validate
  validate()
  {
    var arr = [];
    if(!this.authGroup.value?.email) arr.push("Email");
    else if(!this.validateEmail(this.authGroup.value?.email))
    {
      this.notifySvr.notifyCode('SYS037');
      return false;
    } 

    if(arr.length> 0)
    {
      var name = arr.join(' , ');
      this.notifySvr.notifyCode('SYS009', 0, name);
      return false;
    }

    return true;
  }

  //Kiểm tra có nằm trong danh sách đối tượng cụ thể
  validateSO()
  {
    if(!this.authGroup.value?.email) return this.notifySvr.notifyCode('SYS009', 0, "Email");
    else if(!this.validateEmail(this.authGroup.value?.email)) return this.notifySvr.notifyCode('SYS037');
    
    return this.api.execSv("BG","BG","SharingsBusiness","ValidatePermisstionAsync",[this.data.recID,this.authGroup.value?.email])

    // if(Array.isArray(this.data.permissions))
    // {
    //   let index = this.data.permissions.findIndex(x=>x.objectID == this.authGroup.value?.email && x.objectType == "Email");
    //   if(index >= 0) return true;
    // }
    // this.notifySvr.notifyCode("BG001");
    // return false;
  }

  validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  
  validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  confirm()
  {
    if(this.data?.shareType == '1' && this.data?.pwType == '0') this.confirmNoPW();
    else if(this.data?.pwType == '1') this.confirmOTP();
    else if(this.data?.pwType == '2') this.confirmPW();
  }

  confirmOTP()
  {
    var inputs = document.getElementsByClassName( 'ws-input' );
    var otp  = [].map.call(inputs, function( input ) {
        return input.value;
    }).join( '' );

    if(!otp) 
    {
      this.notifySvr.notifyCode('SYS009', 0, 'Mã xác thực');
      return;
    }

    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.AD',
        'UsersBusiness',
        'VerifyAuthOTP',
        [otp,this.authGroup.controls['email'].value,this.sessionID]
      )
      .subscribe((res) => {
        if(!res) this.notifySvr.notifyCode("ES014");
        else this.loginGuest();
      })
  }

  loginGuest()
  {
    this.api.execSv("SYS","AD","UsersBusiness","CreateUserNoLoginAsync","").subscribe((item:any)=>{
      if(item) {
        this.auth.set(item);
        if(this.validURL(this.data.url)) window.location = this.data.url;
        else this.resultEvent.emit(this.data);
        //this.codxService.navigate('', this.data.url);
      }
    });
  }
  confirmNoPW()
  {
    if(!this.authGroup.value?.email) return this.notifySvr.notifyCode('SYS009', 0, "Email");
    
    var validateSO = this.validateSO();
    if(isObservable(validateSO))
    {
      validateSO.subscribe(item=>{
        if(item) this.loginGuest();
        else this.notifySvr.notifyCode("BG001");
      })
    }
  }
  
  confirmPW()
  {
    if(!this.authGroup.value?.password) this.notifySvr.notifyCode('SYS009', 0, 'Mật khẩu xác thực');
    else if(this.data?.shareType == "1")
    {
      var validateSO = this.validateSO();
      if(isObservable(validateSO))
      {
        validateSO.subscribe(item=>{
          if(item) this.confirmValiPw();
          else this.notifySvr.notifyCode("BG001");
        })
      }
    }
    else this.confirmValiPw();
  }

  confirmValiPw()
  {
    this.api
    .execSv<any>(
      'BG',
      'ERM.Business.BG',
      'SharingsBusiness',
      'VerifyAuthAsync',
      [this.data?.recID,this.authGroup.controls['password'].value]
    )
    .subscribe((res) => {
      if(!res) this.notifySvr.notifyCode("ES014");
      else this.loginGuest();
    })
  }
}
