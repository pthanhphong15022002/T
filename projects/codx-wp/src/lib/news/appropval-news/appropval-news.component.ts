import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, AuthService, CallFuncService, ViewType, DataRequest, RequestOption, UIComponent, DialogModel } from 'codx-core';
import { PopupAddPostComponent } from '../../dashboard/home/list-post/popup-add/popup-add-post.component';
import { PopupEditComponent } from '../popup/popup-edit/popup-edit.component';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { Z } from '@angular/cdk/keycodes';

@Component({
  selector: 'wp-appropval-news',
  templateUrl: './appropval-news.component.html',
  styleUrls: ['./appropval-news.component.scss']
})
export class AppropvalNewsComponent extends UIComponent {

  service: string = 'WP';
  assemblyName: string = 'ERM.Business.WP';
  entityName: string = '';
  predicate: string = '';
  dataValue: string = '';
  predicates: string = '';
  dataValues: string = '';
  funcID: string = '';
  functionName: string = '';
  user: any;
  dataDetail: any;
  option: string = '';
  acceptApprove: string = '5';
  cancelApprove: string = '4';
  remakeApprove: string = '2';
  views: Array<ViewModel> = [];
  gridViewSetUp: any = null;
  dataSelected: any = null;
  itemSelected: any = null;
  selectedID: string = '';

  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  tabAsside = [
    {
      name: 'await',
      text: 'Chờ duyệt',
      value: '3',
      total: 0,
      active: false,
    },
    {
      name: 'approve',
      text: 'Đã duyệt',
      value: '5',
      total: 0,
      active: false,
    },
    {
      name: 'cancel',
      text: 'Từ chối',
      value: '4',
      total: 0,
      active: false,
    },
    {
      name: 'all',
      text: 'Tất cả',
      value: '',
      total: 0,
      active: true,
    },
  ];
  constructor(
    private auth: AuthService,
    private callFuc: CallFuncService,
    private injector: Injector
  ) 
  {
    super(injector);
    this.user = this.auth.userValue;

  }
  onInit(): void {
    this.router.params.subscribe((param) => {
      if (param['funcID']) {
        this.funcID = param['funcID'];
        this.cache.functionList(this.funcID)
        .subscribe((func: any) => {
          if (func) {
            this.functionName = func.customName;
            this.cache
              .gridViewSetup(func.formName, func.gridViewName)
              .subscribe((grd: any) => {
                  this.gridViewSetUp = grd;
              });
          }
        });
        this.loadDataTab(this.funcID);
      }
    });
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          headerTemplate: this.headerTemplate,
          panelRightRef: this.panelRightRef,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }
  // get data tab list
  loadDataTab(funcID: string) {
    if (funcID){
      this.api
        .execSv(
          this.service,
          this.assemblyName,
          funcID == 'WPT0213'? 'CommentsBusiness' : 'NewsBusiness',
          'GetDataTabApproAsync',
          [funcID])
        .subscribe((res: any) => {
          if (res) 
          {
            this.tabAsside.map((tab: any) => {
              tab.total = res[tab.value];
            });
          }
          this.detectorRef.detectChanges();
        });
    }
  }
  //selected change
  selectedChange(event: any) {
    if (event?.data?.recID) 
    {
      this.selectedID = event.data.recID;
      this.detectorRef.detectChanges();
    }
  }
  
  realoadData(event: any) {
    debugger
    this.loadDataTab(this.view.funcID);
  }
  // click tab approval
  clickTabApprove(item) {
    debugger
    let predicates = [item.value ? "ApproveStatus = @0" : ""];
    let dataValues = [item.value];
    this.view.dataService.page = 0;
    this.view.dataService.setPredicates(predicates, dataValues).subscribe();
    this.tabAsside.forEach((e) => {
        e.active = e.value === item.value ;
    });
  }
  // click moreFunc
  clickMF(event: any, data: any) {
    debugger
    this.itemSelected = data;
    switch (event.functionID) {
      case 'SYS02': //delete
        this.deletedPost(data);
        break;
      case 'SYS03': //edit
        let option = new DialogModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        // WP_News
        if(this.view.funcID !== 'WPT0213') 
        {
          option.IsFull = true;
          option.zIndex = 100;
          let obj = {
            action: event.text,
            isAdd:false,
            data: data
          };
          let popup = this.callFuc.openForm(
            PopupAddComponent,
            '',
            0,
            0,
            this.view.funcID,
            obj,
            '',
            option
          );
          popup.closed.subscribe((res: any) => {
            if (res?.event) {
              this.view.dataService.update(res.event).subscribe();
            }
          });
        } 
        // MXH
        else 
        {
          this.api
            .execSv(
              this.service,
              this.assemblyName,
              'CommentsBusiness',
              'GetPostByIDAsync',
              [data.recID])
              .subscribe((res: any) => {
              if (res) {
                let obj = {
                  data: res,
                  status: 'edit',
                  headerText: event.text,
                };
                let option = new DialogModel();
                option.DataService = this.view.dataService;
                option.FormModel = this.view.formModel;
                let popup = this.callfc.openForm(
                  PopupAddPostComponent,
                  event.text,
                  700,
                  550,
                  '',
                  obj,
                  '',
                  option
                );
                popup.closed.subscribe((res: any) => {
                  if (res?.event) {
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

  beforDeletedPost(option: RequestOption, data: any) {
    option.service = 'WP';
    option.assemblyName = 'ERM.Business.WP';
    option.className = 'NewsBusiness';
    if (this.view.funcID == 'WPT0211' || this.view.funcID == 'WPT0212') 
      option.methodName = 'DeleteNewsAsync';
    else
      option.methodName = 'DeletePostAsync';
    option.data = data;
    return true;
  }

  deletedPost(data: any) {
    if (!data) return;
    this.view.dataService
      .delete([data], true, (opt: any) => this.beforDeletedPost(opt, data))
      .subscribe();
  }


  setStyles(data: any) {
    let styles = {
      backgroundColor: data,
      color: 'white',
    };
    return styles;
  }

  deleteData() {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'DeleteAllDataAsync')
      .subscribe();
  }

}
