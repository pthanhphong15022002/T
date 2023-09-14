import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CRUDService, DataRequest, ApiHttpService, CallFuncService, CacheService, NotificationsService, DialogModel, RequestOption, ImageViewerComponent } from 'codx-core';
import { Observable } from 'rxjs';
import { PopupAddPostComponent } from '../../../dashboard/home/list-post/popup-add/popup-add-post.component';
import { PopupAddComponent } from '../../popup/popup-add/popup-add.component';
import { DateTime } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'wp-appropval-news-detail',
  templateUrl: './appropval-news-detail.component.html',
  styleUrls: ['./appropval-news-detail.component.scss']
})
export class AppropvalNewsDetailComponent implements OnInit {

  @Input() objectID: any;
  @Input() funcID: any;
  @Input() entityName: any;
  @Input() formModel : any;
  @Input() dataService:CRUDService;
  @Output() evtUpdateApproval = new EventEmitter();

  @ViewChild("codx_img") codx_img:ImageViewerComponent;
  ENTITYNAME = {
    WP_News : 'WP_News',
    WP_Comments: 'WP_Comments'
  }
  NEWSTYPE = {
    POST:"1",
    VIDEO:"2"
  }
  data: any = null;
  service = "WP";
  assemblyName = "ERM.Business.WP";
  className = "NewsBusiness";
  functionName:string = "";
  hideMFC:boolean = false;
  imgOn:DateTime = new DateTime();
  constructor(private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFuc:CallFuncService,
    private cache:CacheService,
    private notifySvr: NotificationsService,
    private sanitizer: DomSanitizer

    ) { }
  ngOnInit(): void {
    this.getPostInfor(this.objectID);
    this.cache.functionList(this.funcID)
    .subscribe((func: any) => 
      {
        if(func)
          this.functionName = func.defaultName;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.objectID.currentValue != changes.objectID.previousValue && !changes.firstChange)
      this.getPostInfor(this.objectID);
  }
  
  // get data detail
  getPostInfor(objectID:string){
    if(objectID == null || objectID == "")
    {
      this.data = null;
      this.dt.detectChanges();
    }
    else
    {
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "NewsBusiness",
        "GetPostByApprovalAsync",
        [this.objectID,this.funcID])
        .subscribe((res:any) => {
          this.data = JSON.parse(JSON.stringify(res));
          this.imgOn = new DateTime();
          if(this.data)
            this.hideMFC = this.data.approveStatus == "5";            
          this.dt.detectChanges();
        });
    }
    
  }
  //  click morefunction
  clickMF(event:any){
    if(event?.functionID)
    {
      let headerText = event.text + " " + this.functionName;
      switch(event.functionID){
        case "SYS02": //delete
          this.deletedPost(this.data);
          break;
        case "SYS03": // edit
          let option = new DialogModel();
            option.DataService = this.dataService;
            option.FormModel = this.formModel;
            if(this.funcID == "WPT0211" || this.funcID == "WPT0212")
            {
              option.IsFull = true;
              let object = {
                headerText: headerText,
                data: this.data,
                isAdd:false
              }
              this.callFuc.openForm(PopupAddComponent,"",0,0,this.funcID,object,'',option);
            }
            else 
            {
              this.api.execSv(
                this.service,
                this.assemblyName,
                "CommentsBusiness",
                "GetPostByIDAsync", 
                [this.data.recID]).subscribe((res:any) => { 
                  if(res) 
                  {
                    let obj = {
                      post: res,
                      status: 'edit',
                      headerText: headerText,
                    };
                    let option = new DialogModel();
                    option.DataService = this.dataService;
                    option.FormModel = this.formModel;
                    this.callFuc.openForm(PopupAddPostComponent,'',700,550,'',obj,'',option).closed.subscribe((res:any) => {
                      if (res?.event) 
                      {
                        this.dataService.update(res.event).subscribe();
                      }
                    });
                  }
              });
            }
          break;
        case "WPT02121": 
        case "WPT02131": // duyệt
            this.notifySvr.alertCode("WP004")
            .subscribe((option:any) =>{
              if(option?.event?.status == "Y")
              {
                this.approvalPost(this.funcID,this.data.recID, "5")
                .subscribe((res:any) => {
                    if(res)
                    {
                      this.data.approveStatus = "5";
                      this.hideMFC = true;
                      this.dataService.update(this.data).subscribe();
                      this.evtUpdateApproval.emit("5");
                      this.notifySvr.notifyCode("WP005");
                    }
                  });
              }
            });
          break;
        case "WPT02122": // làm lại
          this.notifySvr.alertCode("WP008")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost(this.funcID,this.data.recID, "2")
              .subscribe((res:any) => {
                  if(res)
                  {
                    this.data.approveStatus = "2";
                    this.dataService.update(this.data).subscribe();
                    this.evtUpdateApproval.emit("2");
                    this.notifySvr.notifyCode("WP009");
                  }
                });
            }
          });
          break;
        case "WPT02123": // từ chối
          this.notifySvr.alertCode("WP006")
          .subscribe((option:any) =>{
            if(option?.event?.status == "Y")
            {
              this.approvalPost(this.funcID,this.data.recID, "4").subscribe((res:any) => {
                  if(res)
                  {
                    this.data.approveStatus = "4";
                    this.dataService.update(this.data).subscribe();
                    this.evtUpdateApproval.emit("4");
                    this.notifySvr.notifyCode("WP007");
                  }
                });
            }
          });
          break;
        default:
          break;
      }
    }
  }
  //xét duyệt bài viết
  approvalPost(funcID:string,recID:string,approvalStatus):Observable<any>{
    return this.api.execSv(
      this.service,
      this.assemblyName,
      this.className,
      "ApprovalPostAsync",
      [funcID,recID,approvalStatus]);
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
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "NewsBusiness";
    option.methodName = this.funcID == "WPT0213" ? "DeletePostAsync" : "DeleteNewsAsync";
    option.data = data;
    return true;
  }

}
