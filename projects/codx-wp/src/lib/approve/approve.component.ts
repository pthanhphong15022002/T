import { T, TAB } from '@angular/cdk/keycodes';
import { ThisReceiver } from '@angular/compiler';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@syncfusion/ej2-angular-buttons';
import { DataRequest, ApiHttpService, NotificationsService, AuthService, ViewModel, ViewType, ViewsComponent, UIComponent, CacheService, CallFuncService, SidebarModel, RequestOption, DialogModel, ButtonModel } from 'codx-core';
import { map } from 'rxjs';
import { PopupAddPostComponent } from '../dashboard/home/list-post/popup-add/popup-add.component';
import { PopupEditComponent } from '../news/popup/popup-edit/popup-edit.component';
import { ApproveDetailComponent } from './approve-detail/approve-detail.component';

@Component({
  selector: 'lib-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApproveComponent extends UIComponent {

  service:string = "WP";
  assemblyName:string = "ERM.Business.WP";
  className:string = "NewsBusiness";
  method:string = "GetDataApprovalAsync";
  entityName:string = "";
  predicate:string = "";
  dataValue:string = "";
  predicates:string = '';
  dataValues:string = '';
  funcID:string = "";
  functionName:string = "";
  user: any;
  dataDetail: any;
  option:string = "";
  acceptApprove:string = "5";
  cancelApprove:string = "4";
  remakeApprove:string = "2";
  views: Array<ViewModel> = [];
  gridViewSetUp: any = null;
  dataSelected: any = null;
  itemSelected: any = null;
  selectedID: string = "";

  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  tabAsside = [
    {
      name: "await",
      text: "Chờ duyệt",
      value: "3",
      total: 0,
      predicate: "ApproveStatus = @0",
      datavalue: "3",
      active: false
    },
    {
      name: "approve",
      text: "Đã duyệt",
      value: "5",
      total: 0,
      predicate: "ApproveStatus = @0",
      datavalue: "5",
      active: false
    },
    {
      name: "cancel",
      text: "Từ chối",
      value: "4",
      total: 0,
      predicate: "ApproveStatus = @0",
      datavalue: "4",
      active: false
    },
    {
      name: "all",
      text: "Tất cả",
      value: "0",
      total: 0,
      predicate: "",
      datavalue: "",
      active: true
    },
  ]
  constructor
    (
      private notifySvr: NotificationsService,
      private auth: AuthService,
      private callFuc: CallFuncService,
      private injector: Injector
    ) {
    super(injector);
  }
  onInit(): void {
    this.user = this.auth.userValue;
    this.router.params.subscribe((param) => {
      this.funcID = param["funcID"];
      this.cache.functionList(this.funcID).subscribe((func: any) => 
      {
        if(func)
        {
          this.functionName = func.customName;
          this.cache.gridViewSetup(func.formName, func.gridViewName).
          subscribe((grd: any) => {
            if (grd) 
            {
              this.gridViewSetUp = grd;
            }
          });
        }
      });
      this.loadDataTab(this.funcID);
    });
  }
  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.listdetail,
      active: true,
      sameData: true,
      model: {
        template: this.itemTemplate,
        panelLeftRef: this.panelLeftRef,
        panelRightRef: this.panelRightRef
      }
    }];
  }

  getGridViewSetUp(funcID:string) {
    if(funcID){
      this.cache.functionList(funcID).subscribe((func: any) => 
      {
        if(func)
        {
          this.functionName = func.customName;
          this.cache.gridViewSetup(func.formName, func.gridViewName).
          subscribe((grd: any) => {
            if (grd) 
            {
              this.gridViewSetUp = grd;
            }
          });
        }
      });
    }
    
  }
  loadDataTab(funcID:string) {
    if(funcID){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "NewsBusiness",
        "GetDataByApproSatusAsync",
        [funcID] )
        .subscribe(
       (res: any) => {
         if (res) {
           this.tabAsside.map((tab: any) => {
            tab.total = res[tab.value];
           });
         }
         this.detectorRef.detectChanges();
       }
     );
    }
  }
  loadDataAsync(predicate: string, dataValue: string) {
    this.view.dataService.setPredicates([], []).subscribe();
  }
  selectedChange(event: any) {
    if (!event.data) return;
    this.selectedID = event.data.recID;
    this.detectorRef.detectChanges();
  }
  updateApprovePost(event: any) {
    if(event && event.status && event.data)
    {
      let oldValue = event.oldValue;
      let newValue = event.newValue;
      let data = event.data;
      this.tabAsside.map((e:any) => {
        if(e.value == oldValue)
        {
          e.total = e.total - 1;
          return ;
        }
      });
      this.tabAsside.map((e:any) => {
        if(e.value == newValue){
          e.total = e.total + 1;
          return;
        }
      });
      this.view.dataService.update(data).subscribe();
      this.detectorRef.detectChanges();
    }
  }

  approvePost(data: any, approveStatus: any) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "ApprovePostAsync",
      [data.entityName, data.recID, approveStatus])
      .subscribe((res) => {
        if (res) {
          this.dataDetail = null;
          this.tabAsside.forEach((t: any) => {
            if (t.value == data.approveStatus) {
              t.total--;
              return;
            }
          });
          this.tabAsside[1].total++;
          this.view.dataService.remove(data).subscribe();
          this.notifySvr.notifyCode("WP005");
          this.detectorRef.detectChanges();
        }
      });
  }


  cancelPost(data: any, approveStatus: any) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "ApprovePostAsync",
      [data.entityName, data.recID, approveStatus])
      .subscribe((res) => {
        if (res) {
          this.dataDetail = null;
          this.tabAsside.map((t: any) => {
            if (t.value == data.approveStatus) t.total--;
          })
          this.tabAsside[2].total++;
          this.view.dataService.remove(data).subscribe();
          this.notifySvr.notifyCode("WP007");
          this.detectorRef.detectChanges();
        }
      }
      );
  }

  remakePost(data: any, approveStatus: any) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "ApprovePostAsync",
      [data.entityName, data.recID, approveStatus])
      .subscribe((res) => {
        if (res) {
          this.dataDetail = null;
          this.notifySvr.notifyCode("WP009");
          this.detectorRef.detectChanges();
        }
      }
      );
  }

  clickTabApprove(item = null, predicate: string, dataValue: string) {
    this.view.dataService.setPredicates([predicate],[dataValue]).subscribe();
  }

  clickMF(event: any, data: any) 
  {
    if(event.functionID && event.text)
    {
      let moreFuncID = event.functionID;
      let action = event.text;
      let headerText = this.functionName + " " + action;
      switch (moreFuncID) {
        case 'SYS02':
          this.deletedPost(data);
          break;
        case 'SYS03':
          let option = new DialogModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          if (this.entityName == "WP_News") 
          {
            option.IsFull = true;
            let popup = this.callFuc.openForm(PopupEditComponent, headerText, 0, 0, this.funcID, data, '', option);
            popup.closed.subscribe((data: any) => {
              if (data.event) 
              {
                let dataUpdate = data.event;
                this.view.dataService.update(dataUpdate).subscribe();
              }
            });
          }
          else {
            this.api.execSv(
              this.service,
              this.assemblyName,
              "CommentsBusiness",
              "GetPostByIDAsync",
              data.recID)
              .subscribe((res: any) => {
                if (res) {
                  let obj = {
                    post: res,
                    status: 'edit',
                    headerText: headerText,
                  };
                  let option = new DialogModel();
                  option.DataService = this.view.dataService;
                  option.FormModel = this.view.formModel;
                  let popup =  this.callfc.openForm(PopupAddPostComponent,headerText, 700, 550, '', obj, '', option);
                  popup.closed.subscribe((data: any) => {
                    if (data.result) {
                      console.log(data);
                    }
                  });
                }
              });
          }
          break;
        default:
          break;
      }
    }
    
  }

  beforDeletedPost(option: RequestOption, data: any) {
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "NewsBusiness";
    if (this.entityName == "WP_News") {
      option.methodName = "DeleteNewsAsync";
    }
    else {
      option.methodName = "DeletePostAsync";
    }
    option.data = data;
    return true;
  }

  deletedPost(data: any) {
    if (!data) return;
    this.view.dataService.delete(
      [data],
      true,
      (opt: any) => this.beforDeletedPost(opt, data)).subscribe();
  }

  clickBtnAdd() {

  }

  setStyles(data:any) {
    let styles = {
      backgroundColor: data,
      color: 'white',
    };
    return styles;
  }
}
