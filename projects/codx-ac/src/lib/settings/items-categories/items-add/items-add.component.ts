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
import { Subject, lastValueFrom, map, takeUntil } from 'rxjs';
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

    // this.itemsPurchaseSV.addNew().subscribe((res: any) => {
    //   if (res) {
    //     this.fgItemsPurchase.patchValue(res);
    //     this.fmItemsPurchase.currentData = res;
    //     this.detectorRef.detectChanges();
    //   }
    // })

    // this.itemsSalesSV.addNew().subscribe((res: any) => {
    //   if (res) {
    //     this.fgItemsSales.patchValue(res);
    //     this.fmItemsSales.currentData = res;
    //     this.detectorRef.detectChanges();
    //   }
    // })

    // this.itemsProductionSV.addNew().subscribe((res: any) => {
    //   if (res) {
    //     this.fgItemsProduction.patchValue(res);
    //     this.fmItemsProduction.currentData = res;
    //     this.detectorRef.detectChanges();
    //   }
    // })
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
    let value = event?.data;
    switch(field.toLowerCase()){
      case 'purchase':
        if (value) {
          this.itemsPurchaseSV.addNew().subscribe((res: any) => {
            if (res) {
              this.fgItemsPurchase.patchValue(res);
              this.fmItemsPurchase.currentData = res;
              this.onDisableTab();
              this.detectorRef.detectChanges();
            }
          })
        }else{
          this.onDisableTab();
        }
        break;
      case 'sales':
        if (value) {
          this.itemsSalesSV.addNew().subscribe((res: any) => {
            if (res) {
              this.fgItemsSales.patchValue(res);
              this.fmItemsSales.currentData = res;
              this.onDisableTab();
              this.detectorRef.detectChanges();
            }
          })
        }else{
          this.onDisableTab();
        }
        break;
      case 'production':
        if (value) {
          this.itemsProductionSV.addNew().subscribe((res: any) => {
            if (res) {
              this.fgItemsProduction.patchValue(res);
              this.fmItemsProduction.currentData = res;
              this.onDisableTab();
              this.detectorRef.detectChanges();
            }
          })
        }else{
          this.onDisableTab();
        }
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
    this.form.form.save((o: RequestOption) => {
      o.service = 'IV';
      o.assemblyName = 'IV';
      o.className = 'ItemsBusiness';
      o.methodName = (this.form.form?.data?.isAdd || this.form.form?.data?.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      o.data = [this.form.form.data,
        this.form.form?.data?.purchase ? this.fmItemsPurchase?.currentData : null,
        this.form.form?.data?.sales ? this.fmItemsSales?.currentData : null,
        this.form.form?.data?.production ? this.fmItemsProduction?.currentData : null,
        this.lstItemSize,this.lstItemStyle,this.lstItemColor,this.lstUMConversion];
      return true;
    }, 0, '', '', false,{skipHasChange:true}).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if (this.form.form.data.isAdd || this.form.form.data.isCopy)
        this.notification.notifyCode('SYS006');
      else
        this.notification.notifyCode('SYS007');
      this.dialog.close();
    })
  }
  //#endregion Method

  //#region Function
  openFormItemSize(type){
    this.itemSizeSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        res.sizeType = type;
        let data: any = {
          headerText: (this.lblAdd + ' ' + (type === '1' ? 'quy cách đóng gói' : 'quy cách')).toUpperCase(),
          dataDefault: { ...res }
        };
        this.cache.gridViewSetup(this.fmItemsSize.formName, this.fmItemsSize.gridViewName).subscribe((o) => {
          let option = new DialogModel();
          option.FormModel = this.fmItemsSize;
          option.DataService = this.itemSizeSV;
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
            if (res && res.event) {
              this.lstItemSize.push({ ...res?.event });
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  editItemSize(dataEdit,type){
    this.itemSizeSV.edit({...dataEdit}).subscribe((res:any)=>{
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        res.sizeType = type;
        let data: any = {
          headerText: ('Chỉnh sửa' + ' ' + (type === '1' ? 'quy cách đóng gói' : 'quy cách')).toUpperCase(),
          dataDefault: { ...res }
        };
        this.cache.gridViewSetup(this.fmItemsSize.formName, this.fmItemsSize.gridViewName).subscribe((o) => {
          let option = new DialogModel();
          option.FormModel = this.fmItemsSize;
          option.DataService = this.itemSizeSV;
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
            if (res && res?.event) {
              let data = res?.event;
              let index = this.lstItemSize.findIndex((x) => x.recID == data.recID);
              if (index > -1) this.lstItemSize[index] = data;
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  deleteItemSize(dataDelete:any){
    this.itemSizeSV.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstItemSize.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstItemSize.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  openFormItemStyle(){
    this.itemStyleSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        let data :any = {
          headerText: (this.lblAdd + ' ' + 'thuộc tính').toUpperCase(),
          dataDefault:{...res}
        };
        this.cache.gridViewSetup(this.fmItemsStyle.formName,this.fmItemsStyle.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmItemsStyle;
          option.DataService = this.itemStyleSV;
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
            if (res && res.event) {
              this.lstItemStyle.push({...res?.event});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  editItemStyle(dataEdit){
    this.itemStyleSV.edit({...dataEdit}).subscribe((res:any)=>{
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
          let data :any = {
            headerText: ('Chỉnh sửa' + ' ' + 'thuộc tính').toUpperCase(),
            dataDefault:{...res}
          };
          this.cache.gridViewSetup(this.fmItemsStyle.formName,this.fmItemsStyle.gridViewName).subscribe((o)=>{
            let option = new DialogModel();
            option.FormModel = this.fmItemsStyle;
            option.DataService = this.itemStyleSV;
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
              if (res && res?.event) {
                let data = res?.event;
                let index = this.lstItemStyle.findIndex((x) => x.recID == data.recID);
                if (index > -1) {
                  this.lstItemStyle[index] = data;
                }
                this.detectorRef.detectChanges();
              }
            });
          })
      }
    })
  }

  deleteItemStyle(dataDelete:any){
    this.itemStyleSV.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstItemStyle.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstItemStyle.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  openFormItemColor(){
    this.itemColorSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        let data :any = {
          headerText: (this.lblAdd + ' ' + 'màu sắc').toUpperCase(),
          dataDefault:{...res}
        };
        this.cache.gridViewSetup(this.fmItemsColor.formName,this.fmItemsColor.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmItemsColor;
          option.DataService = this.itemColorSV;
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
            if (res && res.event) {
              this.lstItemColor.push({...res?.event});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  deleteItemColor(dataDelete:any){
    this.itemColorSV.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstItemColor.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstItemColor.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  openFormConversion(){
    this.UMConversionSV.addNew().subscribe((res: any) => {
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
        let data :any = {
          headerText: (this.lblAdd + ' ' + 'đơn vị quy đổi').toUpperCase(),
          dataDefault:{...res}
        };
        this.cache.gridViewSetup(this.fmUMConversion.formName,this.fmUMConversion.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmUMConversion;
          option.DataService = this.UMConversionSV;
          let dialog = this.callfc.openForm(
            ItemsConversionAddComponent,
            '',
            500,
            400,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res.event) {
              this.lstUMConversion.push({...res?.event});
              this.detectorRef.detectChanges();
            }
          });
        })
      }
    })
  }

  editConversion(dataEdit){
    this.UMConversionSV.edit({...dataEdit}).subscribe((res:any)=>{
      if (res) {
        res.itemID = this.form.form?.data?.itemID;
          let data :any = {
            headerText: (this.lblAdd + ' ' + 'đơn vị quy đổi').toUpperCase(),
            dataDefault:{...res}
          };
          this.cache.gridViewSetup(this.fmUMConversion.formName,this.fmUMConversion.gridViewName).subscribe((o)=>{
            let option = new DialogModel();
            option.FormModel = this.fmUMConversion;
            option.DataService = this.UMConversionSV;
            let dialog = this.callfc.openForm(
              ItemsConversionAddComponent,
              '',
              500,
              400,
              '',
              data,
              '',
              option
            );
            dialog.closed.subscribe((res) => {
              if (res && res?.event) {
                let data = res?.event;
                let index = this.lstUMConversion.findIndex((x) => x.recID == data.recID);
                if (index > -1) {
                  this.lstUMConversion[index] = data;
                }
                this.detectorRef.detectChanges();
              }
            });
          })
      }
    })
  }

  deleteConversion(dataDelete:any){
    this.UMConversionSV.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstUMConversion.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstUMConversion.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
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

  tabChange(event,isload:any = false){
    let tabname = event?.nextId.toLowerCase();
    switch(tabname){
      case 'settings':
        let data = this.eleCbxDimGroupID?.ComponentCurrent?.dataService?.data.find((x) =>x.DimGroupID == this.eleCbxDimGroupID?.ComponentCurrent?.value);
        if(data) this.oDimGroup = data;
        break;
      case 'purchase':
        if (this.form.form.data.isEdit) {
          let options = new DataRequest();
          options.entityName = 'IV_ItemsPurchase';
          options.pageLoading = false;
          options.predicates = 'ItemID=@0';
          options.dataValues = this.form.form.data.itemID;
          this.api
            .execSv('IV', 'Core', 'DataBusiness', 'LoadDataAsync', options)
            .pipe(map((r) => r?.[0] ?? [])).subscribe((res: any) => {
              if (res.length) {
                this.fgItemsPurchase.patchValue(res[0]);
                this.fmItemsPurchase.currentData = res[0];
                this.detectorRef.detectChanges();
              }
            })
        }
        break;
      case 'sales':
        if (this.form.form.data.isEdit) {
          if (!this.fmItemsSales.currentData) {
            let options = new DataRequest();
            options.entityName = 'IV_ItemsSales';
            options.pageLoading = false;
            options.predicates = 'ItemID=@0';
            options.dataValues = this.form.form.data.itemID;
            this.api
              .execSv('IV', 'Core', 'DataBusiness', 'LoadDataAsync', options)
              .pipe(map((r) => r?.[0] ?? [])).subscribe((res: any) => {
                if (res.length) {
                  this.fgItemsSales.patchValue(res[0]);
                  this.fmItemsSales.currentData = res[0];
                  this.detectorRef.detectChanges();
                }
              })
          }
        }
        break;
      case 'production':
        if (this.form.form.data.isEdit) {
          if (!this.fmItemsProduction.currentData) {
            let options = new DataRequest();
            options.entityName = 'IV_ItemsProduction';
            options.pageLoading = false;
            options.predicates = 'ItemID=@0';
            options.dataValues = this.form.form.data.itemID;
            this.api
              .execSv('IV', 'Core', 'DataBusiness', 'LoadDataAsync', options)
              .pipe(map((r) => r?.[0] ?? [])).subscribe((res: any) => {
                if (res.length) {
                  this.fgItemsProduction.patchValue(res[0]);
                  this.fmItemsProduction.currentData = res[0];
                  this.detectorRef.detectChanges();
                }
              })
          }
        }
        break;
    }
    // if (!isload) {
    //   event.preventDefault();
    // }
    // if (!this.fgItemsPurchase) {
    //   this.fgItemsPurchase = this.codxService.buildFormGroup(
    //     this.fmItemsPurchase.formName,
    //     this.fmItemsPurchase.gridViewName,
    //     this.fmItemsPurchase.entityName
    //   );
    //   this.itemsPurchaseSV.addNew().subscribe((res: any) => {
    //     if (res) {
    //       this.fgItemsPurchase.patchValue(res);
    //       this.fmItemsPurchase.currentData = res;
    //       this.detectorRef.detectChanges();
    //       this.tabChange(event,true);
    //     }
    //   })
    // }
    // if (this.form?.form?.data?.isEdit) {
    //   if(event?.nextId.toLowerCase() === 'settings'){
    //     let data = this.eleCbxDimGroupID?.ComponentCurrent?.dataService?.data.find((x) =>x.DimGroupID == this.eleCbxDimGroupID?.ComponentCurrent?.value);
    //     if(data) this.oDimGroup = data;
    //   }
    //   if(event?.nextId.toLowerCase() === 'purchase'){
    //     this.fmItemsPurchase.currentData = this.itemPurchase;
    //     this.fgItemsPurchase.patchValue(this.itemPurchase);
    //     this.detectorRef.detectChanges();
    //   }
  
    //   if(event?.nextId.toLowerCase() === 'sales'){
    //     this.fmItemsSales.currentData = this.itemSales;
    //     this.fgItemsSales.patchValue(this.itemSales);
    //     this.detectorRef.detectChanges();
    //   }
  
    //   if(event?.nextId.toLowerCase() === 'production'){
    //     this.fmItemsProduction.currentData = this.itemProduction;
    //     this.fgItemsProduction.patchValue(this.itemProduction);
    //     this.detectorRef.detectChanges();
    //   } 
    // }
  }
  
  changeDataMF(event:any){
    event.reduce((pre,element) => {
      if(!['SYS03','SYS02'].includes(element.functionID)) element.disabled = true;
    },{})
  }

  clickMF(event:any,type:any,data:any){
    switch (event.functionID) {
      case 'SYS02':
        if (type === 'active0' || type === 'active3') {
          this.deleteItemSize(data);
        }
        if (type === 'active1') {
          this.deleteItemStyle(data);
        }
        if (type === 'conversion') {
          this.deleteConversion(data);
        }
        break;
      case 'SYS03':
        if (type === 'active0') {
          this.editItemSize(data,'1');
        }
        if (type === 'active1') {
          this.editItemStyle(data);
        }
        if (type === 'active3') {
          this.editItemSize(data,'0');
        }
        if (type === 'conversion') {
          this.editConversion(data);
        }
        break;
    }
  }
  //#endregion Function
}
