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
  predicates:string = 'ApproveStatus=@0';
  dataValues:string = '3';
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
      predicate: "ApproveStatus=@0",
      datavalue: "3;5",
      active: false
    },
    {
      name: "approve",
      text: "Đã duyệt",
      value: "5",
      total: 0,
      predicate: "ApproveStatus=@0",
      datavalue: "5",
      active: false
    },
    {
      name: "cancel",
      text: "Từ chối",
      value: "4",
      total: 0,
      predicate: "ApproveStatus=@0",
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
      active: false
    },
  ]
  constructor
    (
      private notifySvr: NotificationsService,
      private auth: AuthService,
      private callFuc: CallFuncService,
      private route: ActivatedRoute,
      private injector: Injector
    ) {
    super(injector);
  }
  onInit(): void {
    this.user = this.auth.userValue;
    this.route.params.subscribe((param) => {
      this.funcID = param["funcID"];
      this.getGridViewSetUp();
      this.loadDataTab(this.predicate, this.dataValue, this.entityName);
      this.detectorRef.detectChanges();
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

  getDataAsync(){
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","GetDataApprovalAsync",[this.funcID,"",""]).subscribe((res:any[]) =>{
      if(res){

      }
    })
  }
  getGridViewSetUp() {
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
  }
  loadDataTab(predicate: string, dataValue: string, entityName: string) {
    let model = new DataRequest();
    model.predicate = predicate;
    model.dataValue = dataValue;
    model.entityName = entityName;
    model.srtColumns = 'CreatedOn';
    model.srtDirections = 'desc';
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "GetApprovalPostAsync", model).subscribe(
      (res: any[]) => {
        if (res.length > 0) {
          this.tabAsside.map((tab: any) => {
            if (tab.value == "0") {
              tab.total = res.length;
              tab.active = true;
            }
            else tab.total = res.filter((x: any) => x == tab.value).length;
          })
          this.detectorRef.detectChanges();
        }
        else {
          this.tabAsside.map((tab: any) => tab.total = 0);
          this.detectorRef.detectChanges();
        }
      }
    );
  }
  loadDataAsync(predicate: string, dataValue: string) {
    this.view.entityName = this.entityName;
    if (predicate && dataValue) {
      this.view.dataService.setPredicates([predicate], [dataValue]).subscribe();
    }
    else {
      this.view.dataService.setPredicates([], []).subscribe();
    }
  }
  selectedChange(event: any) {
    if (!event.data) return;
    this.selectedID = event.data.recID;
    this.detectorRef.detectChanges();
  }
  clickApprovePost(event: any) {
    let approveStatus = event.approveStatus;
    let data = event.data;
    switch (approveStatus) {
      case this.acceptApprove:
        this.notifySvr.alertCode("WP004").subscribe((evt: any) => {
          if (evt.event.status == 'Y') {
            this.approvePost(data, approveStatus);
          }
        });
        break;
      case this.cancelApprove:
        this.notifySvr.alertCode("WP006").subscribe((evt: any) => {
          if (evt.event.status == 'Y')
            this.cancelPost(data, approveStatus);
        });
        break;
      default:
        this.notifySvr.alertCode("WP008").subscribe((evt: any) => {
          if (evt.event.status == 'Y') {
            this.remakePost(data, approveStatus);
          }
        });
        break;
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
    if (!item) {
      this.tabAsside[0].active = true;
    }
    else {
      this.tabAsside.map(x => { if (x.name != item.name) x.active = false; })
      item.active = true;
    }
    this.loadDataAsync(predicate, dataValue);
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
