import { T, TAB } from '@angular/cdk/keycodes';
import { ThisReceiver } from '@angular/compiler';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@syncfusion/ej2-angular-buttons';
import { tab } from '@syncfusion/ej2-angular-grids';
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
      private auth: AuthService,
      private callFuc: CallFuncService,
      private injector: Injector
    ) {
    super(injector);
  }
  onInit(): void {
    // this.deleteData();
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
    this.detectorRef.detectChanges();
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
  selectedChange(event: any) {
    if (event?.data)
    {
      this.selectedID = event.data.recID;
      this.detectorRef.detectChanges();
    }
  }
  realoadData(event: any) {
    this.loadDataTab(this.view.funcID);
  }
  clickTabApprove(item, predicate: string, dataValue: string) {
    this.view.dataService.setPredicates([predicate],[dataValue]).subscribe();
    this.tabAsside.forEach(e => {
      if(e.value == item.value){
        e.active = true;
      }
      else
      {
        e.active = false;
      }
    });
  }

  clickMF(event: any, data: any) 
  {
    if(event.functionID)
    {
      let headerText = event.text + " " + this.functionName;
      switch (event.functionID) {
        case 'SYS02': //delete
          this.deletedPost(data);
          break;
        case 'SYS03': //edit
          let option = new DialogModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          if (this.view.funcID == "WPT0211" || this.view.funcID == "WPT0212")  // tin tức sự kiện
          {
            option.IsFull = true;
            let object = {
              headerText: headerText,
              data: data
            }
            let popup = this.callFuc.openForm(PopupEditComponent,"", 0, 0, this.view.funcID, object, '', option);
            popup.closed.subscribe((res: any) => {
              if (res?.event) 
              {
                this.view.dataService.update(res.event).subscribe();
              }
            });
          }
          else // MXH
          {
            this.api.execSv(
              this.service,
              this.assemblyName,
              "CommentsBusiness",
              "GetPostByIDAsync",
              [data.recID]).subscribe((res: any) => {
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
                  popup.closed.subscribe((res: any) => {
                    if (res?.event) 
                    {
                      this.view.dataService.update(res.event).subscribe();
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
    if (this.view.funcID == "WPT0211" || this.view.funcID == "WPT0212") 
    {
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
    this.view.dataService.delete([data],true,(opt: any) => this.beforDeletedPost(opt, data)).subscribe();
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

  deleteData(){
    this.api.execSv("WP","ERM.Business.WP","NewsBusiness","DeleteAllDataAsync").subscribe()
  }
}
