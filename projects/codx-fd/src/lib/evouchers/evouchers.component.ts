import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CallFuncService, DataRequest, DialogData, DialogModel, DialogRef, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Observable, isObservable } from 'rxjs';
import { CodxFdService } from '../codx-fd.service';
import { EvoucherDetailComponent } from './evoucher-detail/evoucher-detail.component';
import { E } from '@angular/cdk/keycodes';
import { EvoucherAddComponent } from './evoucher-add/evoucher-add.component';
import { EvoucherStatisticalComponent } from './evoucher-statistical/evoucher-statistical.component';

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
  checkGotit = false;
  settingModule:any;
  constructor(
    private inject: Injector,
    private FDService: CodxFdService,
    private callFunc: CallFuncService,
    private codxFdService: CodxFdService,
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
      // {
      //   id: '2',
      //   type: ViewType.list,
      //   active: false,
      //   sameData: true,
      // },
    ];


    let paras = ["fdparameters","apikey"];
    let keyRoot = "FDSettingValue" + paras.join(";");
    var dt = this.codxFdService.loadData(paras,keyRoot,"SYS","SYS","SettingValuesBusiness","GetByModuleAsync") as any
    if(isObservable(dt))
    {
      dt.subscribe((item:any)=>{
        this.settingModule = item;
        var dataValue = JSON.parse(item.dataValue);
        if(dataValue?.GOTIT && dataValue?.GOTIT == "0") this.checkGotit = true;
      })
    }
    else
    {
      this.settingModule = dt;
      var dataValue = JSON.parse(dt.dataValue);
      if(dataValue?.GOTIT && dataValue?.GOTIT == "0") this.checkGotit = true;
    }
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
      headerText: "Chi tiết thẻ quà tặng",
      type: 'detail'
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
    let dialog = this.callFunc.openForm(EvoucherAddComponent,"",900,800);
    dialog.closed.subscribe(res=>{
      if (res && res?.event) this.updateSettingModule();
    })
  }

  updateSettingModule()
  {
    this.api.execSv("SYS","SYS","SettingValuesBusiness","UpdateFieldAsync",["fdparameters","apikey","1","GOTIT","0"]).subscribe(item=>{
      if(item)
      {
        var dataValue = JSON.parse(this.settingModule.dataValue);
        dataValue.GOTIT = "0";
        this.settingModule.dataValue = JSON.stringify(dataValue);
        let paras = ["fdparameters","apikey"];
        let keyRoot = "FDSettingValue" + paras.join(";");
        let key = JSON.stringify(paras).toLowerCase();
        this.codxFdService.updateCache(keyRoot,key,this.settingModule);
        this.checkGotit = true;
      }
    });
    
  }

  statistical()
  {
    this.api.execSv("FD","FD","PaymentsBusiness","PaymentVouchersAsync").subscribe();
  }

  openFormStatistical()
  {
    var option = new DialogModel();
    option.IsFull = true;
    this.callFunc.openForm(EvoucherStatisticalComponent,"",900,800,"",null,"",option);
  }
}
