import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CodxInputComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { CodxAcService, fmItemsColor, fmItemsProduction, fmItemsPurchase, fmItemsSales, fmItemsSize, fmItemsStyle, fmUMConversion } from '../../../codx-ac.service';
import { toPascalCase } from '../../../utils';
import { ItemsSizeAddComponent } from '../items-size-add/items-size-add.component';
import { ItemsStyleAddComponent } from '../items-style-add/items-style-add.component';
import { ItemsColorAddComponent } from '../items-color-add/items-color-add.component';
import { ItemsConversionAddComponent } from '../items-conversion-add/items-conversion-add.component';

@Component({
  selector: 'lib-items-add',
  templateUrl: './items-add.component.html',
  styleUrls: ['./items-add.component.scss','../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: LayoutAddComponent;
  @ViewChild('imageItem') imageItem?: ImageViewerComponent;
  @ViewChild('eleCbxDimGroupID') eleCbxDimGroupID?: CodxInputComponent;
  dialog!: DialogRef;
  dialogData?: DialogData
  dataDefault: any;
  headerText: any;
  funcName: any;
  fmItemsPurchase:any = fmItemsPurchase;
  fmItemsSales:any = fmItemsSales;
  fmItemsProduction:any = fmItemsProduction;
  fmItemsSize:any = fmItemsSize;
  fmItemsStyle:any = fmItemsStyle;
  fmItemsColor:any = fmItemsColor;
  fmUMConversion:any = fmUMConversion;
  fgItemsPurchase: FormGroup;
  fgItemsSales: FormGroup;
  fgItemsProduction: FormGroup;
  isPreventChange:any = false;
  lstItemSize:any = [];
  lstItemStyle:any = [];
  lstItemColor:any = [];
  lstUMConversion:any = [];
  itemSizeSV:any;
  itemStyleSV:any;
  itemColorSV:any;
  UMConversionSV:any;
  itemsPurchaseSV:any;
  itemsSalesSV:any;
  itemsProductionSV:any;
  tabInfo = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Common information' },
    {
      icon: 'icon-settings',
      text: 'Thiết lập',
      name: 'Settings',
    },
    {
      icon: 'icon-house',
      text: 'Tồn kho',
      name: 'Inventory',
    },
    {
      icon: 'icon-add_shopping_cart',
      text: 'Mua hàng',
      name: 'Purchase',
    },
    {
      icon: 'icon-add_business',
      text: 'Bán hàng',
      name: 'Sales',
    },
    {
      icon: 'icon-build_circle',
      text: 'Sản xuất',
      name: 'Production',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'Other information',
    },
  ];
  lblAdd: any;
  oDimGroup:any;
  itemPurchase:any;
  itemSales:any;
  itemProduction:any;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    override cache: CacheService,
    override api: ApiHttpService,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.funcName = dialogData.data?.funcName;
    this.dataDefault = dialogData?.data?.dataDefault;
    this.fgItemsPurchase = dialogData?.data?.fgItemsPurchase;
    this.fgItemsSales = dialogData?.data?.fgItemsSales;
    this.fgItemsProduction = dialogData?.data?.fgItemsProduction;

    this.itemSizeSV = this.acService.createCRUDService(
      inject,
      this.fmItemsSize,
      'IV'
    );

    this.itemStyleSV = this.acService.createCRUDService(
      inject,
      this.fmItemsStyle,
      'IV'
    );

    this.itemColorSV = this.acService.createCRUDService(
      inject,
      this.fmItemsColor,
      'IV'
    );

    this.UMConversionSV = this.acService.createCRUDService(
      inject,
      this.fmUMConversion,
      'BS'
    );

    this.itemsPurchaseSV = this.acService.createCRUDService(
      inject,
      this.fmItemsPurchase,
      'IV'
    );

    this.itemsSalesSV = this.acService.createCRUDService(
      inject,
      this.fmItemsSales,
      'IV'
    );

    this.itemsProductionSV = this.acService.createCRUDService(
      inject,
      this.fmItemsProduction,
      'IV'
    );

  }
  //#endregion Constructor

  //#region Init
  onInit() {
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });
    if(this.dataDefault.isEdit){
      this.api.exec('IV', 'ItemsBusiness', 'LoadInfoItemAsync', this.dataDefault.itemID).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          this.itemPurchase = res?.itemPurchase || null;
          this.itemSales = res?.itemSales || null;
          this.itemProduction = res?.itemProduction || null;
          this.lstItemSize = res?.lstItemSize || [];
          this.lstItemStyle = res?.lstItemStyle || [];
          this.lstItemColor = res?.lstItemColor || [];
        }
      })

      this.api.exec('BS', 'UMConversionBusiness', 'LoadDataAsync', this.dataDefault.itemID).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res) {
          this.lstUMConversion = res || [];
        }
      })
    }
  }
  ngAfterViewInit() {
    (this.form.form).onAfterInit.subscribe((res:any)=>{
      if(res){
        this.onDisableTab();
      }
    })

    this.itemsPurchaseSV.addNew().subscribe((res: any) => {
      if (res) {
        this.fgItemsPurchase.patchValue(res);
        this.fmItemsPurchase.currentData = res;
        this.detectorRef.detectChanges();
      }
    })

    this.itemsSalesSV.addNew().subscribe((res: any) => {
      if (res) {
        this.fgItemsSales.patchValue(res);
        this.fmItemsSales.currentData = res;
        this.detectorRef.detectChanges();
      }
    })

    this.itemsProductionSV.addNew().subscribe((res: any) => {
      if (res) {
        this.fgItemsProduction.patchValue(res);
        this.fmItemsProduction.currentData = res;
        this.detectorRef.detectChanges();
      }
    })
  }
  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event
  valueChange(event:any){
    let field = event?.field;
    switch(field.toLowerCase()){
      case 'purchase':
      case 'sales':
      case 'production':
        this.onDisableTab();
        break;
      case 'dimgroupid':
        let data = this.eleCbxDimGroupID?.ComponentCurrent?.dataService?.data.find((x) =>x.DimGroupID == this.eleCbxDimGroupID?.ComponentCurrent?.value);
        if(data) this.oDimGroup = data;
        break;
    }    
  }
  //#endregion Event

  //#region Method
  /**
   * *Ham luu hang hoa
   */
  onSave(type) {
    let validate = this.form.form.validation();
    if(validate) return;
    this.dialog.dataService
      .save(
        (o: RequestOption) => {
          o.service = 'IV';
          o.assemblyName = 'IV';
          o.className = 'ItemsBusiness';
          o.methodName = (this.form.form?.data?.isAdd || this.form.form?.data?.isCopy) ? 'SaveAsync' : 'UpdateAsync';
          o.data = [this.form.form.data,
            this.form.form?.data?.purchase ? this.fmItemsPurchase?.currentData : null,
            this.form.form?.data?.sales ? this.fmItemsSales?.currentData : null,
            this.form.form?.data?.production ? this.fmItemsProduction?.currentData : null];
          return true;
        },
        0,
        '',
        '',
        false
      )
      .subscribe((res) => {
        if(!res) return;
        if (res || res.save || res.update) {
          if (res || !res.save.error || !res.update.error) {
            this.dialog.close(true);
            if (this.form.form.data.isAdd || this.form.form.data.isCopy)
              this.notification.notifyCode('SYS006');
            else
              this.notification.notifyCode('SYS007');
          }
        }
      });
  }
  //#endregion Method

  //#region Function
  openFormItemSize(type){
    if(!this.validateItemID()) return;
    let data :any = {
      headerText: (this.lblAdd + ' ' + (type === '1' ? 'quy cách đóng gói' : 'quy cách')).toUpperCase(),
    };
    let option = new DialogModel();
    option.FormModel = this.fmItemsSize;
    option.DataService = this.itemSizeSV;
    this.itemSizeSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        res.sizeType = type;
        data.dataDefault = {...res};
        this.cache.gridViewSetup(this.fmItemsSize.formName,this.fmItemsSize.gridViewName).subscribe((o)=>{
          let dialog = this.callfc.openForm(
            ItemsSizeAddComponent,
            '',
            500,
            480,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event != null) {
              this.lstItemSize.push({...res?.event?.data});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  openFormItemStyle(){
    if(!this.validateItemID()) return;
    let data :any = {
      headerText: (this.lblAdd + ' ' + 'thuộc tính').toUpperCase(),
    };
    let option = new DialogModel();
    option.FormModel = this.fmItemsStyle;
    option.DataService = this.itemStyleSV;
    this.itemStyleSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        data.dataDefault = {...res};
        this.cache.gridViewSetup(this.fmItemsStyle.formName,this.fmItemsStyle.gridViewName).subscribe((o)=>{
          let dialog = this.callfc.openForm(
            ItemsStyleAddComponent,
            '',
            500,
            300,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event != null) {
              this.lstItemStyle.push({...res?.event?.data});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  openFormItemColor(){
    if(!this.validateItemID()) return;
    let data :any = {
      headerText: (this.lblAdd + ' ' + 'màu sắc').toUpperCase(),
    };
    let option = new DialogModel();
    option.FormModel = this.fmItemsColor;
    option.DataService = this.itemColorSV;
    this.itemStyleSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        data.dataDefault = {...res};
        this.cache.gridViewSetup(this.fmItemsColor.formName,this.fmItemsColor.gridViewName).subscribe((o)=>{
          let dialog = this.callfc.openForm(
            ItemsColorAddComponent,
            '',
            500,
            300,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event != null) {
              this.lstItemColor.push({...res?.event?.data});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  openFormConversion(){
    if(!this.validateItemID()) return;
    let data :any = {
      headerText: (this.lblAdd + ' ' + 'đơn vị quy đổi').toUpperCase(),
    };
    let option = new DialogModel();
    option.FormModel = this.fmUMConversion;
    option.DataService = this.UMConversionSV;
    this.UMConversionSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        data.dataDefault = {...res};
        this.cache.gridViewSetup(this.fmUMConversion.formName,this.fmUMConversion.gridViewName).subscribe((o)=>{
          let dialog = this.callfc.openForm(
            ItemsConversionAddComponent,
            '',
            500,
            350,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event != null) {
              this.lstUMConversion.push({...res?.event?.data});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }
  /**
   * *Ham thay doi title cho form
   * @param event 
   */
  setTitle(event) {
    this.headerText = this.dialogData?.data?.headerText;
  }

  onDisableTab(){
    let strdisable = '';
    if(!this.form.form?.data?.purchase) strdisable +='3';
    if(!this.form.form?.data?.sales) strdisable +=';4';
    if(!this.form.form?.data?.production) strdisable +=';5';
    this.form.setDisabled(strdisable);
  }

  validateItemID(){
    if(this.form.form?.data?.itemID?.trim() == '' || this.form.form?.data?.itemID?.trim() == undefined){
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.form.form.gridviewSetup['ItemID']?.headerText + '"'
      );
      return false;
    }
    return true;
  }

  tabChange(event){
    if (this.form?.form?.data?.isEdit) {
      if(event?.nextId.toLowerCase() === 'settings'){
        let data = this.eleCbxDimGroupID?.ComponentCurrent?.dataService?.data.find((x) =>x.DimGroupID == this.eleCbxDimGroupID?.ComponentCurrent?.value);
        if(data) this.oDimGroup = data;
      }
      if(event?.nextId.toLowerCase() === 'purchase'){
        this.fmItemsPurchase.currentData = this.itemPurchase;
        this.fgItemsPurchase.patchValue(this.itemPurchase);
        this.detectorRef.detectChanges();
      }
  
      if(event?.nextId.toLowerCase() === 'sales'){
        this.fmItemsSales.currentData = this.itemSales;
        this.fgItemsSales.patchValue(this.itemSales);
        this.detectorRef.detectChanges();
      }
  
      if(event?.nextId.toLowerCase() === 'production'){
        this.fmItemsProduction.currentData = this.itemProduction;
        this.fgItemsProduction.patchValue(this.itemProduction);
        this.detectorRef.detectChanges();
      } 
    }
  }
  //#endregion Function
}
