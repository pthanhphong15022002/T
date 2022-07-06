import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthService, DataRequest, NotificationsService } from 'codx-core';
import { WP_News } from '../../models/WP_News.model';
import { ApproveComponent } from '../approve.component';

@Component({
  selector: 'app-view-detail',
  templateUrl: './approve-detail.component.html',
  styleUrls: ['./approve-detail.component.css']
})
export class ApproveDetailComponent implements OnInit {

  @Input() data: any;
  @Input() option: string;
  @Input() formModel : any;
  navAsside = [
    {
      name:"await",
      text:"Chờ duyệt",
      value: 0,
      predicate:"&& ApproveStatus=@1",
      datavalue:";3",
      active:false
    },
    {
      name:"approve",
      text:"Đã duyệt",
      value: 0,
      predicate:"&& ApproveStatus=@1",
      datavalue:";5",
      active:false
    },
    {
      name:"cancel",
      text:"Từ chối",
      value: 0,
      predicate:"&& ApproveStatus=@1",
      datavalue:";4",
      active:false
    },
    {
      name:"all",
      text:"Tất cả",
      value: 0,
      predicate:"",
      datavalue:"",
      active:false
    },
  ]
  acceptApprove = "5";
  cancelApprove  = "4";
  remakeApprove = "2";
  model = new DataRequest();
  constructor(private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private notifySvr: NotificationsService
    ) { }

  ngOnInit(): void {
    console.log(this.data);
  }


  clickApprovePost(data:any,approveStatus:any){
    switch(approveStatus)
    {
      case this.acceptApprove:
        this.notifySvr.alertCode("WP004").subscribe((e:any) => {
          if(e.event.status == "Y"){
            this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
              (res) => 
              {
                if(res)
                {
                  this.data = null;
                  this.navAsside[0].value--;
                  this.navAsside[1].value++;
                  this.notifySvr.notifyCode("WP005");
                  this.dt.detectChanges();
                }
              }
            );
          }
        });
        break;
      case this.cancelApprove:
        this.notifySvr.alertCode("WP006").subscribe((e:any) => {
          if(e.event.status == "Y"){
            this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
              (res) => 
              {
                if(res)
                {
                  this.data = null;
                  this.navAsside[0].value--;
                  this.navAsside[2].value++;
                  this.notifySvr.notifyCode("WP007");
                  this.dt.detectChanges();
                }
              }
            );
          }
        });
        break;
      default:
        this.notifySvr.alertCode("WP008").subscribe((e:any) => {
          this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
            (res) => 
            {
              if(res)
              {
                this.data = null;
                this.navAsside[0].value--;
                this.notifySvr.notifyCode("WP009");
                this.dt.detectChanges();
              }
            }
          );
        });
        break;
    }
  }

  approvePost(e:any,data:any,approveStatus:any){
    if(e.event.status == "Y"){
      this.api.execSv("WP", "ERM.Business.WP","NewsBusiness","ApprovePostAsync",[data.entityName,data.recID,approveStatus]).subscribe(
        (res) => 
        {
          if(res)
          {
            this.data = null;
            this.navAsside[0].value--;
            this.navAsside[1].value++;
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
            this.navAsside[0].value--;
            this.navAsside[2].value++;
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
            this.navAsside[0].value--;
            this.notifySvr.notifyCode("WP009");
            this.dt.detectChanges();
          }
        }
      );
    } 
  }

}
