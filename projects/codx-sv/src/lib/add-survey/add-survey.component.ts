import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ComponentRef,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { AuthStore, CallFuncService, CodxMoreFunctionComponent, DialogModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxSvService } from '../codx-sv.service';
import { SV_Questions } from '../models/SV_Questions';
import { SV_Surveys } from '../models/SV_Surveys';
import { NgxCaptureService } from 'ngx-capture';
import { tap } from 'rxjs';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { FileUpload } from '@shared/models/file.model';
import { environment } from 'src/environments/environment';
import { CopylinkComponent } from '../copylink/copylink.component';
@Component({
  selector: 'app-add-survey',
  templateUrl: './add-survey.component.html',
  styleUrls: ['./add-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddSurveyComponent extends UIComponent {
  dataSV: any;
  isModeAdd = true;
  funcID = '';
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
  url: any;
  user: any;
  titleNull = "Mẫu không có tiêu đề";
  questions: SV_Questions = new SV_Questions();
  surveys: SV_Surveys = new SV_Surveys();
  @ViewChild('itemTemplate') panelLeftRef: TemplateRef<any>;
  @ViewChild('app_question') app_question: ComponentRef<any>;
  @ViewChild('screen', { static: true }) screen: any;
  @ViewChild('mf') mfTmp?: CodxMoreFunctionComponent;
  constructor(
    private injector: Injector, 
    private SvService: CodxSvService,
    private captureService: NgxCaptureService,
    private auth : AuthStore,
    private dmSV: CodxDMService,
    private change: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private callfunc: CallFuncService
  ) {
    super(injector);
    this.router.queryParams.subscribe((queryParams) => {
      this.title = this.titleNull;
      if (queryParams?.funcID) this.funcID = queryParams.funcID;
      if (queryParams?.recID) {
        this.recID = queryParams.recID;
        this.getSV();
        this.change.detectChanges();
      }
      this.url = queryParams;
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }
  getSV()
  {
    this.SvService.getSV(this.recID).subscribe((item :any)=>{
      if(item) {
        this.dataSV = item;
        this.title = !item.title ?"Mẫu không có tiêu đề" : item.title;
      }
      else this.title = this.titleNull;
    })
  }
  onInit(): void {

    this.user = this.auth.get();

    if (!this.funcID) this.codxService.navigate('SVT01');
    //this.getSV();
    this.getSignalAfterSave();
  }

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
              "headerText" : e?.data?.customName,
              "funcID": this.funcID,
              "recID": this.recID
            },
            "",
            option
          );
          break;
        }
      //Đóng khảo sát 
      case "SVT0104":
        {
          var obj = 
          {
            title: this.title,
            stop: true,
            expiredOn: new Date()
          }
          this.SvService.updateSV(this.recID,obj).subscribe(item=>{
            if(item) {
              var dks = this.mfTmp?.arrMf.filter(x=>x.functionID == e?.functionID);
              var ph = this.mfTmp?.arrMf.filter(x=>x.functionID == "SVT0100");
              dks[0].disabled = true;
              ph[0].disabled = false;
              this.notifySvr.notifyCode("SV003");
            }
            else this.notifySvr.notifyCode("SV004");
          })
          break;
        }
      //Phát hành
      case "SVT0100":
        {
          var obj2 = 
          {
            stop: false,
            status: '5',
            startedOn: new Date()
          }
          this.SvService.updateSV(this.recID,obj2).subscribe(item=>{
            if(item) 
            {
              if(this.mfTmp?.arrMf)
              {
                var ph = this.mfTmp?.arrMf.filter(x=>x.functionID == e?.functionID);
                var dks = this.mfTmp?.arrMf.filter(x=>x.functionID == "SVT0104");
                ph[0].disabled = true;
                dks[0].disabled = false;
              }
              this.change.detectChanges();
              this.notifySvr.notifyCode("SV001");
            }
            else this.notifySvr.notifyCode("SV002");
          })
          break;
        }
    }
  }
  
  changeDataMF(e:any , data:any)
  {
    
    if(data?.status == "5")
    {
      var release = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'SVT0100'
      );
      var close = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'SVT0104'
      );
      if(release && release[0]) release[0].disabled = true;
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
  }
  // add() {
  //   var dataAnswerTemp = [
  //     {
  //       seqNo: 0,
  //       answer: `Tùy chọn 1`,
  //     },
  //   ];
  //   this.questions.transID = 'dced3e82-8d71-11ed-9499-00155d035517';
  //   this.questions.seqNo = 0;
  //   this.questions.category = 'S';
  //   this.questions.question = 'Câu hỏi session 1';
  //   this.questions.answers = null;
  //   this.questions.answerType = null;
  //   this.questions.parentID = null;

  //   this.api
  //     .exec('ERM.Business.SV', 'QuestionsBusiness', 'SaveAsync', [
  //       'dced3e82-8d71-11ed-9499-00155d035517',
  //       [this.questions],
  //       true,
  //     ])
  //     .subscribe((res) => {
  //       if (res) {
  //       }
  //     });
  // }

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
    this.codxService.navigate('SVT01',"",null,null,true);
  }

  review() {
    this.codxService.openUrlNewTab('', 'sv/review', {
      funcID: this.funcID,
      recID: this.recID,
    });
  }

  valueChange(e:any)
  {
    if(e?.field == "title") this.title = e?.data;
    this.dataSV[e?.field] = e?.data;
    this.SvService.signalSave.next('saving');
    this.SvService.updateSV(this.recID,this.dataSV).subscribe(item=>{ if(item) this.SvService.signalSave.next('done');});
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

}
