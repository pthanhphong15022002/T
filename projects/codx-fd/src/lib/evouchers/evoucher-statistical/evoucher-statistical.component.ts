import { AfterViewInit, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, ViewModel, ViewType, ViewsComponent } from 'codx-core';
import { ViewDetailPopupComponent } from './view-detail-popup/view-detail-popup.component';

@Component({
  selector: 'lib-evoucher-statistical',
  templateUrl:'./evoucher-statistical.component.html',
  styleUrls: ['./evoucher-statistical.component.css']
})
export class EvoucherStatisticalComponent implements OnInit , AfterViewInit {
  @ViewChild('view') view: ViewsComponent;
  @ViewChild('itemTmp') template!: TemplateRef<any>;
  @ViewChild('tmpRight') tmpRight!: TemplateRef<any>;
  @ViewChild('tmpTree') tmpTree!: TemplateRef<any>;
  
  dialog:any;
  listPayment:any;
  views: Array<ViewModel> | any = [];
  recID:any;
  functionList:any;
  sMssg:any
  dataTree:any; 
  constructor(
    private cache: CacheService,
    private api : ApiHttpService,
    private callFunc : CallFuncService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.template,
          //panelLeftRef: this.tmpRight,
          panelRightRef: this.tmpRight,
          contextMenu: '',
        },
      },
      {
        type: ViewType.content,
        active: false,
        sameData: false,
        text: 'Cây',
        icon: 'icon-account_tree',
        model: {
          panelLeftRef: this.tmpTree,
        },
      },
      // {
      //   id: '2',
      //   type: ViewType.kanban,
      //   active: false,
      //   sameData: false,
      //   request: this.request,
      //   request2: this.resourceKanban,
      //   model: {
      //     template: this.cardKanban,
      //   },
      // },
    ];

    this.getEntity();

  }

  getEntity()
  {
    this.cache.functionList(this.view.formModel.funcID).subscribe(item=>{
      this.functionList = item;
    });
  }
  
  ngOnInit(){
    this.getDataTree()
  }

  close()
  {
    this.dialog.close();
  }

  valueChange(e:any)
  {
    this.recID = e?.data.recID;
  }

  getDataTree()
  {
    this.api.execSv("FD","FD","PaymentsBusiness","GetListGiftTransGroupAsync").subscribe(item=>{this.dataTree = item})
  }

  selectionChange(e:any)
  {
    if(e?.data?.isCollapse && !e?.data?.formDate && (!Array.isArray(e?.data?.items) ||  (Array.isArray(e?.data?.items) && e?.data?.items.length == 0)))
    {
      this.api.execSv("FD","FD","PaymentsBusiness","GetListPaymentByYearAsync",e?.data?.yearNo).subscribe(item=>{e.data.items = item})
    }
  }

  openFormDetail(recID:any)
  {
    this.callFunc.openForm(ViewDetailPopupComponent,"",700,600,"",recID)
  }
  
}
