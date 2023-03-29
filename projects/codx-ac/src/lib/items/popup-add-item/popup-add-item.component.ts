import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Item } from '../interfaces/Item.interface';
import { ItemColor } from '../interfaces/ItemColor.Interface';
import { ItemSize } from '../interfaces/ItemSize.interface';
import { ItemsProduction } from '../interfaces/ItemsProduction.interface';
import { ItemsPurchase } from '../interfaces/ItemsPurchase.interface';
import { ItemsSales } from '../interfaces/ItemsSales.interface';
import { ItemStyle } from '../interfaces/ItemStyle.interface';
import { UMConversion } from '../interfaces/UMConversion.interface';
import { ItemsService } from '../items.service';
import { PopupAddItemColorComponent } from '../popup-add-item-color/popup-add-item-color.component';
import { PopupAddItemConversionComponent } from '../popup-add-item-conversion/popup-add-item-conversion.component';
import { PopupAddItemSizeComponent } from '../popup-add-item-size/popup-add-item-size.component';
import { PopupAddItemStyleComponent } from '../popup-add-item-style/popup-add-item-style.component';

@Component({
  selector: 'lib-popup-add-item',
  templateUrl: './popup-add-item.component.html',
  styleUrls: ['./popup-add-item.component.css'],
})
export class PopupAddItemComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('itemImage') itemImage?: ImageViewerComponent;

  title: string = '';
  item: Item;
  itemsPurchase: ItemsPurchase = {} as ItemsPurchase;
  itemsSales: ItemsSales = {} as ItemsSales;
  itemsProduction: ItemsProduction = {} as ItemsProduction;
  gridViewSetup: any;
  gvsItemsPurchase: any;
  gvsItemsSales: any;
  gvsItemsProduction: any;
  disabled: boolean = false;
  itemSizes1: ItemSize[] = [];
  itemSizes2: ItemSize[] = [];
  itemStyles: ItemStyle[] = [];
  itemColors: ItemColor[] = [];
  itemConversions: UMConversion[] = [];
  hoveredStyleId: string;
  hoveredColorId: string;
  hoveredItemSizeId1: string;
  hoveredItemSizeId2: string;
  tempItemID: string = '';
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
      icon: 'icon-add_box',
      text: 'Mua hàng',
      name: 'Purchase',
    },
    {
      icon: 'icon-house_siding',
      text: 'Bán hàng',
      name: 'Sales',
    },
    {
      icon: 'icon-settings_input_component',
      text: 'Sản xuất',
      name: 'Production',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'Other information',
    },
  ];
  fmItemsPurchase: FormModel = {
    entityName: 'IV_ItemsPurchase',
    formName: 'ItemsPurchase',
    gridViewName: 'grvItemsPurchase',
    entityPer: 'IV_ItemsPurchase',
    fieldRequired:
      'WarrantyDays;ImportDuty;ExciseTax;UnderDelivery;OverDelivery;',
  };
  fmItemsSales: FormModel = {
    entityName: 'IV_ItemsSales',
    formName: 'ItemsSales',
    gridViewName: 'grvItemsSales',
    entityPer: 'IV_ItemsSales',
    fieldRequired:
      'WarrantyDays;ExportDuty;ExciseTax;UnderDelivery;OverDelivery;',
  };
  fmItemsProduction: FormModel = {
    entityName: 'IV_ItemsProduction',
    formName: 'ItemsProduction',
    gridViewName: 'grvItemsProduction',
    entityPer: 'IV_ItemsProduction',
    fieldRequired: 'LeadTime;BatchSize;',
  };

  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    private itemsService: ItemsService,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    // debug
    console.log({ dialogRef });
    console.log({ dialogData });

    super(injector);

    this.item = dialogRef.dataService?.dataSelected;
    this.tempItemID = this.item?.itemID;
    this.dialogRef.formModel.currentData = this.item;

    this.dialogRef.closed.subscribe((res) => {
      // cancel
      for (const itemSize of this.itemSizes1.filter((i) => i.itemID === null)) {
        this.api
          .exec(
            'IV',
            'ItemSizesBusiness',
            'DeleteItemSizeAsync',
            itemSize.recID
          )
          .subscribe((res) => {
            if (res) {
              this.itemsService.deleteImage(itemSize.recID, 'IV_ItemSizes');
            }
          });
      }

      for (const itemSize of this.itemSizes2.filter((i) => i.itemID === null)) {
        this.api
          .exec(
            'IV',
            'ItemSizesBusiness',
            'DeleteItemSizeAsync',
            itemSize.recID
          )
          .subscribe((res) => {
            if (res) {
              this.itemsService.deleteImage(itemSize.recID, 'IV_ItemSizes');
            }
          });
      }

      for (const itemStyle of this.itemStyles.filter(
        (i) => i.itemID === null
      )) {
        this.api
          .exec(
            'IV',
            'ItemStylesBusiness',
            'DeleteItemStyleAsync',
            itemStyle.recID
          )
          .subscribe((res) => {
            if (res) {
              this.itemsService.deleteImage(itemStyle.recID, 'IV_ItemStyles');
            }
          });
      }

      for (const itemColor of this.itemColors.filter(
        (i) => i.itemID === null
      )) {
        this.api
          .exec(
            'IV',
            'ItemColorsBusiness',
            'DeleteItemColorAsync',
            itemColor.recID
          )
          .subscribe();
      }

      for (const itemConversion of this.itemConversions.filter(
        (i) => i.itemID === null
      )) {
        this.api
          .exec(
            'BS',
            'UMConversionBusiness',
            'DeleteByRecIDAsync',
            itemConversion.recID
          )
          .subscribe((res) => {
            if (res) {
              this.itemsService.deleteImage(
                itemConversion.recID,
                'BS_UMConversion'
              );
            }
          });
      }
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup('ItemsPurchase', 'grvItemsPurchase')
      .subscribe((res) => {
        this.gvsItemsPurchase = res;
      });
    this.cache.gridViewSetup('ItemsSales', 'grvItemsSales').subscribe((res) => {
      this.gvsItemsSales = res;
    });
    this.cache
      .gridViewSetup('ItemsProduction', 'grvItemsProduction')
      .subscribe((res) => {
        this.gvsItemsProduction = res;
      });
    this.cache.gridViewSetup('Items', 'grvItems').subscribe((gvs) => {
      this.gridViewSetup = gvs;
    });

    if (this.dialogData.data.formType == 'edit') {
      this.disabled = true;

      // load related data associated with itemID
      this.loadData(
        'IV',
        'IV_ItemsPurchase',
        'ItemID=@0',
        this.item.itemID,
        'itemsPurchase'
      );
      this.loadData(
        'IV',
        'IV_ItemsSales',
        'ItemID=@0',
        this.item.itemID,
        'itemsSales'
      );
      this.loadData(
        'IV',
        'IV_ItemsProduction',
        'ItemID=@0',
        this.item.itemID,
        'itemsProduction'
      );
      this.loadData(
        'IV',
        'IV_ItemSizes',
        'ItemID=@0&&SizeType==@1',
        `${this.item.itemID};1`,
        'itemSizes1',
        false
      );
      this.loadData(
        'IV',
        'IV_ItemSizes',
        'ItemID=@0&&SizeType==@1',
        `${this.item.itemID};0`,
        'itemSizes2',
        false
      );
      this.loadData(
        'IV',
        'IV_ItemColors',
        'ItemID=@0',
        this.item.itemID,
        'itemColors',
        false
      );
      this.loadData(
        'IV',
        'IV_ItemStyles',
        'ItemID=@0',
        this.item.itemID,
        'itemStyles',
        false
      );
      this.loadData(
        'BS',
        'BS_UMConversion',
        'ItemID=@0',
        this.item.itemID,
        'itemConversions',
        false
      );
    }
  }

  ngAfterViewInit(): void {
    // debug
    console.log(this.form);

    this.title = this.dialogData.data?.title;
  }
  //#endregion

  //#region Event
  handleInputChange(e: any, prop: string = 'item'): void {
    // debug
    console.log('handleInputChange', e);
    console.log({ prop });

    this[prop][e.field] = e.data;
  }

  deleteItemSize(
    event: MouseEvent,
    itemSize: ItemSize,
    sizeType: number
  ): void {
    event.stopPropagation();

    this.api
      .exec('IV', 'ItemSizesBusiness', 'DeleteItemSizeAsync', itemSize.recID)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS008');

          this.itemsService.deleteImage(itemSize.recID, 'IV_ItemSizes');

          if (sizeType === 1) {
            this.itemSizes1 = this.itemSizes1.filter(
              (i) => i.recID !== itemSize.recID
            );
          } else if (sizeType === 0) {
            this.itemSizes2 = this.itemSizes2.filter(
              (i) => i.recID !== itemSize.recID
            );
          }
        }
      });
  }

  deleteItemConversion(event: MouseEvent, recID: string): void {
    event.stopPropagation();

    this.api
      .exec('BS', 'UMConversionBusiness', 'DeleteByRecIDAsync', recID)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS008');

          this.itemsService.deleteImage(recID, 'BS_UMConversion');

          this.itemConversions = this.itemConversions.filter(
            (i) => i.recID !== recID
          );
        }
      });
  }

  deleteItemStyle(event: MouseEvent, itemStyle: ItemStyle): void {
    event.stopPropagation();

    this.api
      .exec('IV', 'ItemStylesBusiness', 'DeleteItemStyleAsync', itemStyle.recID)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS008');

          this.itemsService.deleteImage(itemStyle.recID, 'IV_ItemStyles');

          this.itemStyles = this.itemStyles.filter(
            (i) => i.recID !== itemStyle.recID
          );
        }
      });
  }

  deleteItemColor(event: MouseEvent, itemColor: ItemColor): void {
    event.stopPropagation();

    this.api
      .exec('IV', 'ItemColorsBusiness', 'DeleteItemColorAsync', itemColor.recID)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS008');

          this.itemColors = this.itemColors.filter(
            (i) => i.recID !== itemColor.recID
          );
        }
      });
  }
  //#endregion

  //#region Method
  save(): void {
    this.dialogRef.dataService
      .save((req: RequestOption) => {
        req.methodName =
          this.dialogData.data.formType === 'add'
            ? 'AddItemAsync'
            : 'UpdateItemAsync';
        req.className = 'ItemsBusiness';
        req.assemblyName = 'ERM.Business.IV';
        req.service = 'IV';
        req.data =
          this.dialogData.data.formType === 'add'
            ? [
                this.item,
                this.itemsPurchase,
                this.itemsSales,
                this.itemsProduction,
                this.itemSizes1,
                this.itemSizes2,
                this.itemStyles,
                this.itemColors,
                this.itemConversions,
              ]
            : [
                this.item,
                this.itemsPurchase,
                this.itemsSales,
                this.itemsProduction,
                this.itemSizes1.filter((i) => i.itemID === null),
                this.itemSizes2.filter((i) => i.itemID === null),
                this.itemStyles.filter((i) => i.itemID === null),
                this.itemColors.filter((i) => i.itemID === null),
                this.itemConversions,
              ];

        return true;
      })
      .subscribe((res) => {
        // debug
        console.log({ res });
        console.log(this.form.data);

        if (res.save || res.update) {
          this.itemSizes1 = this.itemSizes1.map((i) => ({
            ...i,
            itemID: this.item.itemID,
          }));
          this.itemSizes2 = this.itemSizes2.map((i) => ({
            ...i,
            itemID: this.item.itemID,
          }));
          this.itemStyles = this.itemStyles.map((i) => ({
            ...i,
            itemID: this.item.itemID,
          }));
          this.itemColors = this.itemColors.map((i) => ({
            ...i,
            itemID: this.item.itemID,
          }));
          this.itemConversions = this.itemConversions.map((i) => ({
            ...i,
            itemID: this.item.itemID,
          }));

          this.dialogRef.close(true);
        }
      });
  }

  handleClickSave(): void {
    console.log(this.item);
    // console.log(this.itemsPurchase);
    // console.log(this.itemsSales);
    // console.log(this.itemsProduction);

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gridViewSetup,
        ['UMID']
      )
    ) {
      return;
    }

    if (this.itemImage?.imageUpload?.item) {
      this.itemImage
        .updateFileDirectReload(this.item.itemID)
        .subscribe((res) => {
          console.log(res);
          this.save();
        });
    } else {
      this.save();
    }
  }

  openFormAddItemSize(sizeType: number, itemSize?: ItemSize) {
    this.cache.gridViewSetup('ItemSizes', 'grvItemSizes').subscribe((res) => {
      if (res) {
        const options = new DialogModel();
        options.FormModel = {
          entityName: 'IV_ItemSizes',
          formName: 'ItemSizes',
          gridViewName: 'grvItemSizes',
        };

        this.callfc
          .openForm(
            PopupAddItemSizeComponent,
            'This param is not working',
            500,
            300,
            '',
            {
              gridViewSetup: res,
              sizeType: sizeType,
              funcId: this.form.formModel?.funcID,
              itemSize: itemSize,
              savedItemSizes:
                sizeType === 1 ? this.itemSizes1 : this.itemSizes2,
            },
            '',
            options
          )
          .closed.subscribe((res) => {
            console.log(res);
            if (!itemSize) {
              // add
              if (sizeType === 1) {
                if (Array.isArray(res.event)) {
                  this.itemSizes1.push(...res.event);
                } else {
                  this.itemSizes1.push(res.event as ItemSize);
                }
              } else {
                // sizeType === 0
                if (Array.isArray(res.event)) {
                  this.itemSizes2.push(...res.event);
                } else {
                  this.itemSizes2.push(res.event as ItemSize);
                }
              }
            } else {
              // edit
              if (sizeType === 1) {
                this.itemSizes1 = res.event;
              } else {
                this.itemSizes2 = res.event;
              }
            }
          });
      }
    });
  }

  openFormAddItemStyle(itemStyle?: ItemStyle): void {
    this.cache.gridViewSetup('ItemStyles', 'grvItemStyles').subscribe((res) => {
      if (res) {
        const options = new DialogModel();
        options.FormModel = {
          entityName: 'IV_ItemStyles',
          formName: 'ItemStyles',
          gridViewName: 'grvItemStyles',
        };

        this.callfc
          .openForm(
            PopupAddItemStyleComponent,
            'This param is not working',
            500,
            300,
            '',
            {
              gridViewSetup: res,
              funcId: this.form.formModel?.funcID,
              itemStyle: itemStyle,
              savedItemStyles: this.itemStyles,
            },
            '',
            options
          )
          .closed.subscribe((res) => {
            if (!itemStyle) {
              // add
              if (Array.isArray(res.event)) {
                this.itemStyles.push(...res.event);
              } else {
                this.itemStyles.push(res.event as ItemStyle);
              }
            } else {
              // edit
              this.itemStyles = res.event;
            }
          });
      }
    });
  }

  openFormAddItemColor(itemColor?: ItemColor): void {
    this.cache.gridViewSetup('ItemColors', 'grvItemColors').subscribe((res) => {
      if (res) {
        const options = new DialogModel();
        options.FormModel = {
          entityName: 'IV_ItemColors',
          formName: 'ItemColors',
          gridViewName: 'grvItemColors',
        };

        this.callfc
          .openForm(
            PopupAddItemColorComponent,
            'This param is not working',
            500,
            325,
            '',
            {
              gridViewSetup: res,
              itemColor: itemColor,
              savedItemColors: this.itemColors,
            },
            '',
            options
          )
          .closed.subscribe((res) => {
            if (!itemColor) {
              // add
              if (Array.isArray(res.event)) {
                this.itemColors.push(...res.event);
              } else {
                this.itemColors.push(res.event as ItemColor);
              }
            } else {
              // edit
              this.itemColors = res.event;
            }
          });
      }
    });
  }

  openFormAddUMConversion(itemConversion?: UMConversion): void {
    this.cache
      .gridViewSetup('UMConversion', 'grvUMConversion')
      .subscribe((res) => {
        if (res) {
          const options = new DialogModel();
          options.FormModel = {
            entityName: 'BS_UMConversion',
            formName: 'UMConversion',
            gridViewName: 'grvUMConversion',
          };

          this.callfc
            .openForm(
              PopupAddItemConversionComponent,
              'This param is not working',
              500,
              300,
              '',
              {
                gridViewSetup: res,
                funcId: this.form.formModel?.funcID,
                itemConversion: itemConversion,
                savedItemConversions: this.itemConversions,
              },
              '',
              options
            )
            .closed.subscribe((res) => {
              if (!itemConversion) {
                // add
                if (Array.isArray(res.event)) {
                  this.itemConversions.push(...res.event);
                } else {
                  this.itemConversions.push(res.event as UMConversion);
                }
              } else {
                // edit
                this.itemConversions = res.event;
              }
            });
        }
      });
  }

  loadData(
    service: string,
    entityName: string,
    predicate: string,
    dataValue: string,
    prop: string,
    first: boolean = true
  ): void {
    const option = new DataRequest();
    option.entityName = entityName;
    option.predicates = predicate;
    option.dataValues = dataValue;
    option.page = 1;
    this.api
      .execSv(service, 'Core', 'DataBusiness', 'LoadDataAsync', option)
      .subscribe((res: any) => {
        if (first) {
          this[prop] = res[0][0];
        } else {
          this[prop] = res[0];
        }
        console.log(prop, this[prop]);
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
