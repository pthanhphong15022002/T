import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthService, CacheService, CallFuncService, CRUDService, DataRequest, DialogModel, FormModel, NotificationsService, RequestOption } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add.component';
import { WP_News } from '../../models/WP_News.model';
import { PopupEditComponent } from '../../news/popup/popup-edit/popup-edit.component';
import { ApproveComponent } from '../approve.component';

@Component({
  selector: 'app-view-detail',
  templateUrl: './approve-detail.component.html',
  styleUrls: ['./approve-detail.component.css']
})
export class ApproveDetailComponent implements OnInit,OnChanges {

  @Input() objectID: any;
  @Input() funcID: any;
  @Input() entityName: any;
  @Input() formModel : any;
  @Input() dataService:CRUDService;
  @Output() evtApproval = new EventEmitter();
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
  constructor(private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFuc:CallFuncService,
    private cache:CacheService,
    private notifySvr: NotificationsService,
    private sanitizer: DomSanitizer

    ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.objectID?.currentValue && (changes.objectID?.currentValue != changes.objectID?.previousValue)){
      this.getPostInfor();
    }
  }

  ngOnInit(): void {
    if(this.objectID){
       this.getPostInfor();
    }
  }
  getPostInfor(){
    if(!this.objectID){
      this.data = null;
      return;
    }
    this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","GetPostInfoAsync",[this.objectID,this.entityName])
    .subscribe((res) => {
      if(res){
        this.data = res;
        this.data.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.contents);
        this.dt.detectChanges();
      }
    })
  }
  getEntityName(){
    this.cache.functionList(this.formModel.funcID).subscribe((res:any) => {
      if(res){
        this.entityName
      }
    })
  }
  clickApprovePost(data:any,approveStatus:any){
    this.evtApproval.emit({data:data,approveStatus:approveStatus})
  }

  approvePost(e:any,data:any,approveStatus:any){
    if(e.event.status == "Y"){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
        (res) => 
        {
          if(res)
          {
            this.data = null;
            this.tabAsside[0].total--;
            this.tabAsside[1].total++;
            this.notifySvr.notifyCode("WP005");
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

  valueChange(event:any){

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
