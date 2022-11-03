import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthService, CacheService, CallFuncService, CRUDService, DataRequest, DialogModel, FormModel, NotificationsService, RequestOption, VLLPipe } from 'codx-core';
import { Observable } from 'rxjs';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add.component';
import { WP_News } from '../../models/WP_News.model';
import { PopupEditComponent } from '../../news/popup/popup-edit/popup-edit.component';
import { ApproveComponent } from '../approve.component';

@Component({
  selector: 'approve-view-detail',
  templateUrl: './approve-detail.component.html',
  styleUrls: ['./approve-detail.component.css']
})
export class ApproveDetailComponent implements OnInit,OnChanges {

  @Input() objectID: any;
  @Input() funcID: any;
  @Input() entityName: any;
  @Input() formModel : any;
  @Input() dataService:CRUDService;
  @Output() evtUpdateApproval = new EventEmitter();
  ENTITYNAME = {
    WP_News : 'WP_News',
    WP_Comments: 'WP_Comments'
  }
  NEWSTYPE = {
    POST:"1",
    VIDEO:"2"
  }
  data: any = null;
  model = new DataRequest();
  service = "WP";
  assemblyName = "ERM.Business.WP";
  className = "NewsBusiness";
  functionName:string = "";

  constructor(private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFuc:CallFuncService,
    private cache:CacheService,
    private notifySvr: NotificationsService,
    private sanitizer: DomSanitizer

    ) { }
  

  ngOnInit(): void {
    this.getPostInfor();
    this.cache.functionList(this.funcID).subscribe((func: any) => 
      {
        if(func)
        {
          this.functionName = func.customName;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.objectID?.currentValue && (changes.objectID?.currentValue != changes.objectID?.previousValue)){
      this.getPostInfor();
    }
  }
  getPostInfor(){
    if(!this.objectID){
      this.data = null;
      return;
    }
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "GetPostInfoAsync",
      [this.objectID,this.funcID])
      .subscribe((res:any) => {
        if(res)
        {
          this.data = res;
          console.log(this.data)
          this.data.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.contents);
          this.dt.detectChanges();
        }
      });
  }
  clickMF(event:any){
    if(event?.functionID){
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
                data: this.data
              }
              this.callFuc.openForm(PopupEditComponent,"",0,0,this.funcID,object,'',option);
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
        case "WPT02121": // duyệt
            this.notifySvr.alertCode("WP004")
            .subscribe((option:any) =>{
              if(option?.event?.status == "Y")
              {
                this.updateApprovalStatus(this.data.recID, "5").subscribe((res:any) => {
                    if(res)
                    {
                      this.data.approveStatus = "5";
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
              this.updateApprovalStatus(this.data.recID, "2").subscribe((res:any) => {
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
              this.updateApprovalStatus(this.data.recID, "4").subscribe((res:any) => {
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

  updateApprovalStatus(recID:string,approvalStatus):Observable<any>{
    return this.api.execSv(
      this.service,
      this.assemblyName,
      this.className,
      "UpdateAprovalStatusAsync",
      [recID,approvalStatus]);
  }
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
    if(this.entityName == "WP_News"){
      option.methodName = "DeleteNewsAsync";
    }
    else 
    {
      option.methodName = "DeletePostAsync";
    }
    option.data = data;
    return true;
  }

}
