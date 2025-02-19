import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ComponentRef,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { AESCryptoService, AlertConfirmInputConfig, AuthStore, CallFuncService, CodxMoreFunctionComponent, DialogModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxSvService } from '../codx-sv.service';
import { SV_Questions } from '../models/SV_Questions';
import { SV_Surveys } from '../models/SV_Surveys';
import { CopylinkComponent } from '../copylink/copylink.component';
import { SharelinkComponent } from '../sharelink/sharelink.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { isObservable } from 'rxjs';
import moment from 'moment';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-add-survey',
  templateUrl: './add-survey.component.html',
  styleUrls: ['./add-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddSurveyComponent extends UIComponent {
  dataSV: any;
  isModeAdd = true;
  functionList: any;
  recID: any;
  views: Array<ViewModel> = [];
  viewType = ViewType;
  mode: any = 'Q';
  seletedQ = false;
  seletedA = false;
  seletedS = false;
  sv:any;
  title: any ;
  signal: any = null;
  user: any;
  titleNull = "Mẫu không có tiêu đề";
  questions: SV_Questions = new SV_Questions();
  surveys: SV_Surveys = new SV_Surveys();
  primaryColor:any;
  backgroudColor:any;
  width= "200px";
  isChangeTmp = false;
  email:any = {};
  @ViewChild('itemTemplate') panelLeftRef: TemplateRef<any>;
  @ViewChild('app_question') app_question: ComponentRef<any>;
  @ViewChild('screen', { static: true }) screen: any;
  @ViewChild('mf') mfTmp?: CodxMoreFunctionComponent;
  constructor(
    private injector: Injector, 
    private SvService: CodxSvService,
    private auth : AuthStore,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService,
    private aesCrypto: AESCryptoService
  ) {
    super(injector);
    this.router.queryParams.subscribe((queryParams) => {
      this.title = this.titleNull;
      if(queryParams?._k)
      {
        var key = JSON.parse(this.aesCrypto.decode(queryParams?._k));
        this.funcID = key?.funcID;
        if (key?.recID) {
          this.recID = key.recID;
          this.getSV();
        }
      }
    
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });

    this.getAlertRule();
  }
  getSV()
  {
    this.SvService.getSV(this.recID).subscribe((item :any)=>{
      if(item) {
        this.dataSV = item;
        this.title = !item.title ?"Mẫu không có tiêu đề" : item.title;
        this.getAvatar(this.dataSV);
      }
      else this.title = this.titleNull;
      var widthBody = document.body.clientWidth;
      this.width = widthBody * 0.7 + "px";
    })
  }
  onInit(): void {

    this.user = this.auth.get();

    if (!this.funcID) this.codxService.navigate('SVT01');
    //this.getSV();
    this.getSignalAfterSave();
  }

  getAvatar(data:any)
  {
    if(data && data.settings) {
      data.settings = JSON.parse(data.settings);
      if(data?.settings?.primaryColor) this.primaryColor = data?.settings?.primaryColor;
      if(data?.settings?.backgroudColor) {
        this.backgroudColor = data?.settings?.backgroudColor;
      }
    }
  }

  // getAvatar()
  // {
  //   this.SvService.getSV(this.recID).subscribe((item :any)=>{
  //     if(item) {
  //       this.dataSV = item;
  //       this.title = !item.title ?"Mẫu không có tiêu đề" : item.title;
  //     }
  //     else this.title = this.titleNull;
  //   })
  //   if(this.dataSV && this.dataSV.settings) {
  //     this.dataSV.settings = JSON.parse(this.dataSV.settings);
  //     if(this.dataSV?.settings?.image) this.avatar = this.dataSV?.settings?.image;
  //     if(this.dataSV?.settings?.primaryColor) this.primaryColor = this.dataSV?.settings?.primaryColor;
  //     if(this.dataSV?.settings?.backgroudColor) {
  //       this.backgroudColor = this.dataSV?.settings?.backgroudColor;
  //       document.getElementById("bg-color-sv").style.backgroundColor = this.backgroudColor
  //     }
  //   }
  // }
  generateGUID() {
    var d = new Date().getTime(); //Timestamp
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0; //Time in microseconds since page-load or 0 if unsupported
    var GUID;
    return (GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
          //Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          //Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    ));
  }

  addSV() {
    this.surveys.title = 'Đăng ký sự kiện';
    this.surveys.memo = 'Đăng ký sự kiện';
    this.api
      .exec('ERM.Business.SV', 'SurveysBusiness', 'SaveAsync', [
        this.surveys,
        null,
        true,
      ])
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  //Click morefunc
  clickMF(e:any)
  {
    if(this.SvService.signalSave.getValue() == "saving") 
    {
      this.notifySvr.notifyCode("SV005");
      return;
    }
    switch(e?.functionID)
    {
      //Copy link
      case "SVT0101":
        {
          var option = new DialogModel();
          option.FormModel = this.view.formModel;
          this.callfunc.openForm(
            CopylinkComponent,
            "",
            700, 
            280, 
            "" , 
            {
              headerText : e?.data?.customName,
              funcID: this.funcID,
              recID: this.recID
            },
            "",
            option
          );
          break;
        }
      //Đóng khảo sát 
      case "SVT0104":
        {
          this.dataSV.title = this.title;
          this.dataSV.status = "4";
          this.dataSV.expiredOn = new Date();
          if(this.dataSV?.settings && typeof this.dataSV?.settings == "object") this.dataSV.settings = JSON.stringify(this.dataSV?.settings);
          this.SvService.updateSV(this.recID,this.dataSV).subscribe(item=>{
            if(item) {
              var dks = this.mfTmp?.arrMf.filter(x=>x.functionID == e?.functionID);
              //var ph = this.mfTmp?.arrMf.filter(x=>x.functionID == "SVT0100");
              dks[0].disabled = true;
              //ph[0].disabled = false;
              this.notifySvr.notifyCode("SV003");
            }
            else this.notifySvr.notifyCode("SV004");
          })
          break;
        }
      //Phát hành
      case "SVT0100":
        {
          var config = new AlertConfirmInputConfig();
          config.type = 'YesNo';
          var message = "Thời gian thực hiện khảo sát : " + formatDate(new Date(), 'dd/MM/yyyy', 'en-US'); 
          if(this.dataSV?.expiredOn) message += " - " + formatDate(this.dataSV?.expiredOn, 'dd/MM/yyyy', 'en-US'); 
          
          this.notifySvr
            .alert("Thông báo",message, config).closed
            .subscribe((x) => {
              if (x.event.status == 'Y') {
                this.dataSV.stop = false;
                this.dataSV.status = "3";
                this.dataSV.startedOn =  new Date();
                if(this.dataSV?.settings && typeof this.dataSV?.settings == "object") this.dataSV.settings = JSON.stringify(this.dataSV?.settings);
                this.SvService.updateSV(this.recID,this.dataSV).subscribe(item=>{
                  if(item) 
                  {
                    if(this.mfTmp?.arrMf)
                    {
                      //var ph = this.mfTmp?.arrMf.filter(x=>x.functionID == e?.functionID);
                      var dks = this.mfTmp?.arrMf.filter(x=>x.functionID == "SVT0104");
                      //ph[0].disabled = true;
                      dks[0].disabled = false;
                    }
                    this.notifySvr.notifyCode("SV001");
                  }
                  else this.notifySvr.notifyCode("SV002");
                })
              }
          });
          
          break;
        }
      //Share link
      case "SVT0102":
        {
          // var obj = 
          // {
          //   funcID : this.funcID,
          //   recID: this.recID
          // }
          // var key = JSON.stringify(obj);
          // key = this.aesCrypto.encode(key);
          // var link =  window.location.protocol + "//" + window.location.host + "/" + this.user.tenant +  "/sv/review?_k="+key;

          // if(this.dataSV?.settings)
          // {
          //   if(typeof this.dataSV?.settings == "string") this.dataSV.settings = JSON.parse(this.dataSV.settings);
          //   if(this.dataSV?.settings?.isPublic == "1") link =  window.location.protocol + "//" + window.location.host + "/" + this.user.tenant +  "/forms?_k="+key;
          // }
         
          // this.callfc.openForm(SharelinkComponent,"",900,600,"",
          //   {
          //     headerText: e?.data?.customName,
          //     funcID: this.funcID,
          //     recID: this.recID,
          //     link: link
          //   }
          // );
          // service?: string;
          // assembly?: string;
          // className?:string;
          // method?:string;
          // data?:string
          var options =
          {
            service : "SV",
            assembly :"SV",
            className : "SurveysBusiness",
            method: "SendMailAsync",
            data : [this.recID,this.funcID]
          }
          var data = 
          {
            email : this.email,
            option : options
          }
         
          let popEmail = this.callfunc.openForm(
            CodxEmailComponent,
            '',
            800,
            screen.height,
            '',
            data
          );
          break;
        }
    }
  }

  getLink()
  {
    //this.dataSV
  }
  
  getAlertRule()
  {
    var alertRule = this.SvService.loadAlertRule("SV_0001") as any;
    if(isObservable(alertRule))
    {
      alertRule.subscribe((item:any)=>{
        this.getEmailTemplate(item.emailTemplate)
      })
    }
    else this.getEmailTemplate(alertRule?.emailTemplate)
  }

  getEmailTemplate(recID:any)
  {
    var emailTemplate = this.SvService.loadEmailTemplate(recID) as any;
    if(isObservable(emailTemplate))
    {
      
      emailTemplate.subscribe((item:any)=>{ 
        this.email.subject = item[0]?.subject;
        this.email.message = item[0]?.message;
      });
    }
    else {
      this.email.subject = emailTemplate[0]?.subject;
      this.email.message = emailTemplate[0]?.message;
    }
  }

  changeDataMF(e:any , data:any)
  {
    //Đã phát hành
    if(data?.status == "3")
    {
      // var release = e.filter(
      //   (x: { functionID: string }) =>
      //     x.functionID == 'SVT0100'
      // );
      var close = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'SVT0104'
      );
      //if(release && release[0]) release[0].disabled = true;
      if(close && close[0]) close[0].disabled = false;
    }
    else
    {
      var close = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'SVT0104'
      );
  
      if(close && close[0]) close[0].disabled = true;
    }

    if(data?.stop)
    {
      var close = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'SVT0104'
      );
  
      if(close && close[0]) close[0].disabled = true;
    }
  }
  
  //Phát hành khảo sát
  release()
  {
    var mf = 
    {
      functionID: "SVT0100"
    }
    this.clickMF(mf);
  }

  getSignalAfterSave() {
    this.SvService.signalSave.subscribe((res) => {
      if (res) {
        this.signal = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  onLoading(e) {
    if (this.view.formModel) {
      this.views = [
        {
          active: true,
          type: ViewType.content,
          sameData: true,
          model: {
            panelLeftRef: this.panelLeftRef,
          },
        },
      ];
      this.detectorRef.detectChanges();
    }
  }

  onChangeMode(mode) {
    this.mode = mode;
    this.detectorRef.detectChanges();
  }

  onSelected(e: any) {
    if (e.selectedIndex == 0 && !this.seletedQ) {
      this.seletedQ = true;
      this.mode = 'Q';
    }
    else if (e.selectedIndex == 1 && !this.seletedA){
      this.seletedA = true;
      this.mode = 'A';
    } 
    else if (e.selectedIndex == 2 && !this.seletedS) {
      this.seletedS = true;
      this.mode = 'S';
    }
    this.getSV();
  }

  onSubmit() {}

  back() {
    // this.captureService.getImage(this.screen.nativeElement, true)
    // .pipe(
    //   tap(img => {
    //     var name = 'Capture_' + this.makeid(10) + '.jpg';
    //     var file = this.dataURLtoFile(img,name);
    //     this.ShareService.uploadFileAsync(file,this.user.tenant,this.dmSV.ChunkSizeInKB).then(result=>{
    //       var fileItem = new FileUpload();
    //       fileItem.objectID = this.recID;
    //       fileItem.objectType = this.functionList.entityName;
    //       fileItem.thumbnail = result.Data?.RelUrlThumb;
    //       fileItem.uploadId = result.Data?.UploadId; 
    //       fileItem.urlPath = result.Data?.RelUrlOfServerPath; 
    //       fileItem.fileSize = file.size;
    //       fileItem.folderID = "";
    //       fileItem.fileName = file.name;
    //       fileItem.extension = "jpg";
    //       fileItem.permissions = [];
    //       fileItem.referType = 'avt'
    //       this.ShareService.addFile(fileItem,"",this.functionList.entityName);
          
    //     })
    //   })
    // ).subscribe();
    if(this.SvService.signalSave.getValue() == "saving") this.notifySvr.notifyCode("SV005");
    else this.codxService.navigate('SVT01',"",null,null,true);
  }

  review() {
    if(this.SvService.signalSave.getValue() == "saving") 
    {
      this.notifySvr.notifyCode("SV005");
      return;
    }
    var obj = 
    {
      funcID : this.funcID,
      recID : this.recID
    }
    var key = JSON.stringify(obj);
    var k = this.aesCrypto.encode(key);
    this.codxService.openUrlNewTab('', 'sv/review', {
      _k: k
    });
  }

  changeAvatar(e:any)
  {
    this.dataSV.setting = e;
  }
  valueChange(e:any)
  {
    if(e?.field == "title") this.title = e?.data;
    this.dataSV[e?.field] = e?.data;
    
    this.SvService.signalSave.next('saving');
    if(this.dataSV?.settings && typeof this.dataSV?.settings == "object") this.dataSV.settings = JSON.stringify(this.dataSV?.settings);
    
    this.SvService.updateSV(this.recID,this.dataSV,this.isChangeTmp).subscribe(item=> { 
      if(item) {
        this.SvService.signalSave.next('done');
      }
    });
  }
  saveTemplate()
  {
    if(this.SvService.signalSave.getValue() == "saving") 
    {
      this.notifySvr.notifyCode("SV005");
      return;
    }
    this.SvService.signalSave.next('saving');
    this.SvService.updateSV(this.recID,this.dataSV,true).subscribe(item=> { 
      if(item) {
        this.SvService.signalSave.next('done');
        this.notifySvr.notify("Đã lưu thành mẫu.")
      }
    });
  }
  updateSV()
  {
    this.SvService.getSV(this.recID)
  }

  dataURLtoFile(dataurl : any, filename : any) {
 
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
  }

  makeid(length:any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  changeSetting(e:any)
  {
    this.dataSV.settings = e;
  }
 
}
