import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CRUDService, DataRequest, ApiHttpService, CallFuncService, CacheService, NotificationsService, DialogModel, RequestOption, ImageViewerComponent, AuthStore } from 'codx-core';
import { PopupAddComponent } from '../../popup/popup-add/popup-add.component';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { PopupAddCommentComponent } from '../../popup/popup-add-comment/popup-add-comment.component';

@Component({
  selector: 'wp-appropval-detail',
  templateUrl: './appropval-news-detail.component.html',
  styleUrls: ['./appropval-news-detail.component.scss']
})
export class AppropvalNewsDetailComponent implements OnInit {

  @Input() function: any;
  @Input() objectID: any;
  @Input() formModel : any;
  @Input() dataService:CRUDService;
  @Output() evtApprovalPost = new EventEmitter();
  @ViewChild("codx_img") codx_img:ImageViewerComponent;
  
  NEWSTYPE = {
    POST:"1",
    VIDEO:"2"
  }
  data: any = null;
  hideMFC:boolean = false;
  imgOn:DateTime = new DateTime();
  user: import("codx-core").UserModel;
  constructor
  (
    private auth: AuthStore,
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFuc:CallFuncService,
    private cache:CacheService,
    private notifySvr: NotificationsService,
    private sanitizer: DomSanitizer) 
  { 
    this.user = this.auth.get();
  }
  ngOnInit(): void {
    this.getPostInfo(this.objectID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes["objectID"] && !changes["objectID"].firstChange && changes["objectID"].previousValue != changes["objectID"].currentValue)
    {
      this.getPostInfo(this.objectID);
    }
  }
  
  // get data detail
  getPostInfo(objectID:string)
  {
    if(objectID == "")
    {
      this.data = null;
      return;
    }
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "GetPostInfoApprovalAsync",
      [this.objectID,this.function.entityName])
      .subscribe((res:any) => {
        if(res)
        {
          this.data = JSON.parse(JSON.stringify(res));
          this.hideMFC = res.approveStatus == "5";    
        }
        else
        {
          this.data = null;
          this.hideMFC = true;
        }
        this.imgOn = new DateTime();
        this.dt.detectChanges();
      });
  }

  //  click morefunction
  clickMF(event:any){
    if(event?.functionID){
      switch(event.functionID){
        case "SYS02": //delete
          this.deletedPost(this.data);
          break;
        case "SYS03": // edit
          this.editPost(event,this.data);
          break;
        case "WPT02121": 
        case "WPT02131": // duyệt
            this.notifySvr.alertCode("WP004")
            .subscribe((option:any) =>{
              if(option?.event?.status == "Y")
              {
                this.approvalPost("5","WP005");
              }
            });
          break;
        case "WPT02122": // làm lại
          this.notifySvr.alertCode("WP008")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost("2","WP009");
            }
          });
          break;
        case "WPT02123":
        case "WPT02133": // từ chối
          this.notifySvr.alertCode("WP006")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost("4","WP007");
            }
          });
          break;
        default:
          break;
      }
    }
  }

  //xét duyệt bài viết
  approvalPost(approvalStatus:string, mssg:string){
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "ApprovalPostAsync",
    [this.function.entityName,this.data.recID,approvalStatus])
    .subscribe((res:any) => {
      if(res)
      {
        this.data.approveStatus = approvalStatus;
        this.data.status = approvalStatus =='5' ? '2' : this.data.status;
        this.hideMFC = true;
        this.notifySvr.notifyCode(mssg);
        this.evtApprovalPost.emit(this.data);
        this.dt.detectChanges();
      }
      else
        this.notifySvr.notifyCode("SYS019");
    });
  }
  
  // xóa bài viết
  deletedPost(data:any){
    if(!data)return;
    this.dataService.delete(
      [data],
      true,
      (opt:any)=>this.beforDeletedPost(opt,data)).subscribe();
  }

  beforDeletedPost(option:RequestOption,data:any){
    option.service = 'WP';
    option.assemblyName = 'ERM.Business.WP';
    if(this.function.functionID == "WPT0213")
    {
      option.className = "CommentsBusiness";
      option.methodName =  "DeletePostAsync";
    }
    else
    {
      option.className = "NewsBusiness";
      option.methodName =  "DeleteAsync";
    }
    option.data = data.recID;
    return true;
  }

  //edit post
  editPost(evt:any,data:any){
    let headerText = evt.text + " " + this.function.customName;
    let option = new DialogModel();
    option.DataService = this.dataService;
    option.FormModel = this.formModel;
    option.zIndex = 100;
    if(this.function.entityName !== "WP_AprovalComments")
    {
      option.IsFull = true;
      let object = {
        headerText: headerText,
        data: data,
        isAdd:false
      }
      this.callFuc.openForm(PopupAddComponent,"",0,0,this.function.functionID,object,'',option)
      .closed.subscribe((res: any) => {
        if (res?.event)
        {
          this.data = JSON.parse(res.event);
          this.dt.detectChanges();
        }
      });
    }
    else 
    {
      this.api
        .execSv(
          "WP",
          "ERM.Business.WP",
          'CommentsBusiness',
          'GetPostByIDAsync',
          [data.recID])
          .subscribe((res1: any) => {
          if (res1) {
            let obj = {
              data: res1,
              status: 'edit',
              headerText: evt.text,
            };
            this.callFuc.openForm(
              PopupAddCommentComponent,
              "",
              700,
              650,
              '',
              obj,
              '',
              option
            ).closed.subscribe((res2:any) => {
              if (res2?.event)
              {
                this.data = JSON.parse(res2.event);
                this.dt.detectChanges();
              }
            });
          }
        });
    }
  }

  //change data moreFC
  changeDataMF(evt:any[],data:any){
    evt.map(x => {
      if((x.functionID == "SYS02" || x.functionID == "SYS03") && this.function.functionID =='WPT0211')
      {
        x.disabled = true;
        //Ko duyệt
        if(data.approveControl == "0"){
          if(data?.status =="1" ){
            x.disabled = false;
          }
          else if(data?.status =="2" ){
            if(this.user.administrator && x.functionID == "SYS02"){
              x.disabled = false;
            }
          }
        }        
        //Có duyệt
        else if(data.approveControl == "1"){
          if(data?.approveStatus =="1" ){
            x.disabled = false;
          }
          else if(this.user.administrator && x.functionID == "SYS02")
          {
            x.disabled = false;    
          }
        }
      }
      else if(x.functionID == "WPT02131" || x.functionID == "WPT02132" || x.functionID == "WPT02133")
        x.disabled = data.approveControl == "0" || (data.approveControl == "1" && data.approveStatus == "5");
      else if (
        x.functionID == 'WPT02131' ||
        x.functionID == 'WPT02133' ||
        x.functionID == 'WPT02121' ||
        x.functionID == 'WPT02123'
      )
        x.disabled =
          data.approveControl == '0' ||
          (data.approveControl == '1' && data.approveStatus != '3');
      else x.disabled = true;

      
    });
  }
}
