import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CallFuncService, DataRequest, DialogData, DialogRef, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Observable, isObservable } from 'rxjs';
import { CodxFdService } from '../codx-fd.service';
import { EvoucherDetailComponent } from './evoucher-detail/evoucher-detail.component';
import { E } from '@angular/cdk/keycodes';
import { EvoucherAddComponent } from './evoucher-add/evoucher-add.component';

@Component({
  selector: 'lib-evouchers',
  templateUrl: './evouchers.component.html',
  styleUrls: ['./evouchers.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EVouchersComponent extends UIComponent implements AfterViewInit{
  @ViewChild('voucherInFor') voucherInFor: TemplateRef<any>;
  @ViewChild('tmpInfor') tmpInfor: TemplateRef<any>;
  @ViewChild('voucherName') voucherName: TemplateRef<any>;
  @ViewChild('brandName') brandName: TemplateRef<any>;
  @ViewChild('productImg', { static: true }) productImg: TemplateRef<any>;

  dialog?: any;
  columnsGrid: any[] = [];
  data: any[] = [];
  request:any = {};
  isLoad = true;
  viewList : Array<ViewModel> = [];
  viewId = 1;
  hList = 0;
  constructor(
    private inject: Injector,
    private FDService: CodxFdService,
    private callFunc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
  }
  ngAfterViewInit(): void {
    this.columnsGrid = [
      {
        headerTemplate: this.voucherInFor,
        template:this.tmpInfor,
        width: 500,
      },
      {
        field: 'productNm',
        headerTemplate: this.voucherName,
        textAlign: 'center',
      },
      {
        field: 'brandNm',
        headerTemplate: this.brandName,
        textAlign: 'center',
      },
      {
        field: 'productImg',
        headerText: 'Hình ảnh',
        template: this.productImg,
        textAlign: 'center',
      },
    ];
  }
  onInit(): void {
    this.setting();
    this.getCount();
    this.loadData();
  }

  setting()
  {
    this.request.page = 1;
    this.request.pageSize = 20;
    this.request.categoryID = 0;
    this.request.brandID = 0;
    this.viewList = 
    [
      {
        id: '1',
        type: ViewType.card,
        active: true,
        sameData: true,
      },
      {
        id: '2',
        type: ViewType.list,
        active: false,
        sameData: true,
      },
    ];
  
  }

  getCount()
  {
    var w = window.innerWidth;
    var h = window.innerHeight;

    var cw = w / 225;
    var ch = h / 222;

    var count = ch * cw;

    this.hList = h - 153;
    this.request.pageSize = Math.round(count);
  }

  loadData() {
    this.api
      .execSv<any>('FD', 'FD', 'VouchersBusiness', 'GotITProductList', [
        0,
        0,
        this.request.categoryID,
        'asc',
        this.request.brandID,
        this.request.pageSize,
        this.request.page,
      ])
      .subscribe((data) => {
        if (data) {
          if(data?.productList && data?.productList.length > 0) this.data = this.data.concat(data.productList);
          else this.isLoad = false;
        }
      });
  }

  openFormDetail(productID:any , name:any)
  {
    this.callFunc.openForm(EvoucherDetailComponent,"",900 , 800 , "" , {
      productID : productID,
      headerText: "Chi tiết thẻ quà tặng"
    })
  }
  GetAllCategory()
  {
    this.api.execSv("FD","FD","VouchersBusiness","GotITGetAllBrandsSave").subscribe();
  }
 
  scrollData(event:any)
  {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop < dcScroll.scrollHeight - dcScroll.clientHeight ||
      dcScroll.scrollTop == 0
    ) return;

    this.request.page ++;
    if(this.isLoad) this.loadData();
  }

  changeValue(e:any)
  {
    if(e?.data)
    {
      if(e?.field == "categories")  this.request.categoryID = e?.data;
      else if(e?.field == "brands") this.request.brandID = e?.data;
      this.data = [];
      this.request.page = 1;
      this.isLoad = true;
      this.loadData();
    }
  }

  viewChanged(e:any)
  {
    this.viewId = e?.id;
    this.viewList.forEach(element => {
     if(element.id == e?.id) element.active = true;
     else element.active = false;
   });
  }

  onClickSave()
  {
    this.callFunc.openForm(EvoucherAddComponent,"",900,800)
  }
}
