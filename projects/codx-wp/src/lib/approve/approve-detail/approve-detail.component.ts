import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthService, CacheService, CallFuncService, CRUDService, DataRequest, DialogModel, FormModel, NotificationsService, RequestOption, VLLPipe } from 'codx-core';
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
  tabAsside = [
    {
      name:"await",
      text:"Chờ duyệt",
      value: "3",
      total:0,
      predicate:"ApproveStatus=@0",
      datavalue:"3",
      active:false
    },
    {
      name:"approve",
      text:"Đã duyệt",
      value: "5",
      total:0,
      predicate:"ApproveStatus=@0",
      datavalue:"5",
      active:false
    },
    {
      name:"cancel",
      text:"Từ chối",
      value: "4",
      total:0,
      predicate:"ApproveStatus=@0",
      datavalue:"4",
      active:false
    },
    {
      name:"all",
      text:"Tất cả",
      value: "0",
      total:0,
      predicate:"",
      datavalue:"",
      active:false
    },
  ]
  ENTITYNAME = {
    WP_News : 'WP_News',
    WP_Comments: 'WP_Comments'
  }
  NEWSTYPE = {
    POST:"1",
    VIDEO:"2"
  }
  data: any;
  acceptApprove = "5";
  cancelApprove  = "4";
  remakeApprove = "2";
  model = new DataRequest();
  service = "WP";
  assemblyName = "ERM.Business.WP";
  className = "NewsBusiness";
  moreFC:any = null;
  constructor(private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFuc:CallFuncService,
    private cache:CacheService,
    private notifySvr: NotificationsService,
    private sanitizer: DomSanitizer

    ) { }
  

  ngOnInit(): void {
    this.getPostInfor();
    this.getMorefunction(this.funcID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.objectID?.currentValue && (changes.objectID?.currentValue != changes.objectID?.previousValue)){
      this.getPostInfor();
    }
  }
  getMorefunction(funcID:string){
    if(funcID){
      this.cache.functionList(funcID).subscribe((func:any) =>{
        if(func){
          let formnName = func.formName;
          let gridViewName = func.gridViewName;
          this.cache.moreFunction(formnName,gridViewName).subscribe((moreFunc:any) =>{
            this.moreFC = moreFunc;
            console.log(moreFunc)
            this.dt.detectChanges();
          });
        }
      });
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
      [this.objectID,this.entityName])
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
        this.data.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.contents);
        this.dt.detectChanges();
      }
    })
  }
  clickUpdatePost(action:string)
  {
    if(action)
    { 
      let recID = this.data.recID;
      let funcID = this.funcID;
      let approveStatus = "";
      let mssgCode = "";
      switch(action){
        case "WPT02121":
          approveStatus = "5";
          mssgCode = "WP005";
          this.notifySvr.alertCode("WP004").subscribe((evt: any) => {
            if (evt.event.status == 'Y'){
              this.updateApprovalSatusAsync(recID,funcID,approveStatus,mssgCode);
            }
          });
          break;
        case "WPT02122":
          approveStatus = "2";
          mssgCode = "WP009";
          this.notifySvr.alertCode("WP008").subscribe((evt: any) => {
            if (evt.event.status == 'Y'){
              this.updateApprovalSatusAsync(recID,funcID,approveStatus,mssgCode);
            }
          });
          break;
        case "WPT02123":
          approveStatus = "4";
          mssgCode = "WP007";
          this.notifySvr.alertCode("WP006").subscribe((evt: any) => {
            if (evt.event.status == 'Y'){
              this.updateApprovalSatusAsync(recID,funcID,approveStatus,mssgCode);
            }
          });
          break;
        default:
          break;  
      }
    }
  }

  updateApprovalSatusAsync(recID:string,funcID:string,approveStatus:string,mssgCode:string){
    if(recID && funcID && approveStatus && mssgCode){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "NewsBusiness",
        "UpdateAprovalStatusAsync",
        [recID,funcID,approveStatus])
        .subscribe((res:boolean) => 
          {
            if(res)
            {
              let oldValue = this.data.approveStatus;
              this.data.approveStatus = approveStatus;
              this.notifySvr.notifyCode("WP005");
              this.evtUpdateApproval.emit({data:this.data,oldValue:oldValue,newValue:approveStatus});
              this.dt.detectChanges();
            }
          }
        );
    }
  }

  cancelPost(e:any,data:any,approveStatus:any){
    if(e.event.status == "Y"){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
        (res) => 
        {
          if(res)
          {
            this.data = null;
            this.tabAsside[0].total--;
            this.tabAsside[2].total++;
            this.notifySvr.notifyCode("WP007");
            this.dt.detectChanges();
          }
        }
      );
    }
  }

  remakePost(e:any,data:any,approveStatus:any){
    if(e.event.status == "Y"){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
        (res) => 
        {
          if(res)
          {
            this.data = null;
            this.tabAsside[0].total--;
            this.notifySvr.notifyCode("WP009");
            this.dt.detectChanges();
          }
        }
      );
    } 
  }


  clickMF(event:any){
    switch(event.functionID){
      case 'SYS02':
        this.deletedPost(this.data);
        break;
      case 'SYS03':
        let option = new DialogModel();
        option.DataService = this.dataService;
        option.FormModel = this.formModel;
        if(this.entityName == "WP_News"){
          option.IsFull = true;
          this.callFuc.openForm(PopupEditComponent,'Cập nhật bài viết',0,0,this.funcID,this.data,'',option);
        }
        else 
        {
          this.api.execSv(this.service,this.assemblyName,"CommentsBusiness","GetPostByIDAsync", this.data.recID)
          .subscribe((res:any) => {
            if(res) {
              let obj = {
                post: res,
                status: 'edit',
                headerText: 'Chỉnh sửa bài viết',
              };
              let option = new DialogModel();
              option.DataService = this.dataService;
              option.FormModel = this.formModel;
              this.callFuc.openForm(PopupAddPostComponent,'',700,550,'',obj,'',option).closed.subscribe((data:any) => {
                if(data.result){
                  console.log(data);
                }
              })
            }});
        }
        break;
      default:
        break;
    }
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
