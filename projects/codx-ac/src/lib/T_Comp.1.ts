import { Type } from '@angular/core';
import { FiscalPeriodsComponent } from './settings/fiscal-periods/fiscal-periods.component';
import { FiscalPeriodsAutoCreateComponent } from './settings/fiscal-periods/fiscal-periods-add/fiscal-periods-auto-create.component';
import { PopAddVatpostingComponent } from './settings/vatcodes/pop-add-vatposting/pop-add-vatposting.component';
import { PopAddVatcodesComponent } from './settings/vatcodes/pop-add-vatcodes/pop-add-vatcodes.component';
import { VATCodesComponent } from './settings/vatcodes/vatcodes.component';
import { PopAddItemSeriesComponent } from './settings/item-series/pop-add-item-series/pop-add-item-series.component';
import { PopAddItemBatchsComponent } from './settings/item-batchs/pop-add-item-batchs/pop-add-item-batchs.component';
import { ItemSeriesComponent } from './settings/item-series/item-series.component';
import { ItemBatchsComponent } from './settings/item-batchs/item-batchs.component';
import { PopAddFiscalPeriodsComponent } from './settings/fiscal-periods/pop-add-fiscal-periods/pop-add-fiscal-periods.component';
import { PopupAddFixedAssetComponent } from './settings/fixed-assets/popup-add-fixed-asset/popup-add-fixed-asset.component';
import { FixedAssetsComponent } from './settings/fixed-assets/fixed-assets.component';
import { PopupAddFAPostingAccountComponent } from './settings/faposting-accounts/popup-add-faposting-account/popup-add-faposting-account.component';
import { FAPostingAccountsComponent } from './settings/faposting-accounts/faposting-accounts.component';
import { PostingAccountsAddComponent } from './settings/posting-accounts-categories/posting-accounts-add/posting-accounts-add.component';
import { PopupAddAPPostingAccountComponent } from './settings/apposting-accounts/popup-add-apposting-account/popup-add-apposting-account.component';
import { APPostingAccountsComponent } from './settings/apposting-accounts/apposting-accounts.component';
import { PopAddArComponent } from './settings/ar-posting-accounts/pop-add-ar/pop-add-ar.component';
import { ArPostingAccountsComponent } from './settings/ar-posting-accounts/ar-posting-accounts.component';
import { PopAddDimensionSetupComponent } from './settings/dimension-groups/pop-add-dimension-setup/pop-add-dimension-setup.component';
import { ItemsConversionAddComponent } from './settings/items-categories/items-conversion-add/items-conversion-add.component';
import { PopAddDimensionGroupsComponent } from './settings/dimension-groups/pop-add-dimension-groups/pop-add-dimension-groups.component';
import { ItempostingaccountsComponent } from './settings/posting-accounts-categories/posting-accounts.component';
import { DimensionGroupsComponent } from './settings/dimension-groups/dimension-groups.component';
import { InventoryComponent } from './settings/inventory/inventory.component';
import { PopAddInventoryComponent } from './settings/inventory/pop-add-inventory/pop-add-inventory.component';
import { ConversionAddComponent } from './settings/unitsofmearsure-categories/conversion-add/conversion-add.component';
import { UnitsOfMearSureAdd } from './settings/unitsofmearsure-categories/unitsofmearsure-add/unitsofmearsure-add.component';
import { UnitsofmearsureComponent } from './settings/unitsofmearsure-categories/unitsofmearsure.component';
import { WarehousesAddComponent } from './settings/warehouses-categories/warehouses-add/warehouses-add.component';
import { WarehousesComponent } from './settings/warehouses-categories/warehouses.component';
import { ItemsColorAddComponent } from './settings/items-categories/items-color-add/items-color-add.component';

export const T_Comp: Type<any>[] = [
  CurrencyComponent,
  CurrencyAddComponent,
  ExchangeRateSettingAddComponent,
  ExchangerateAddComponent,
  AccountsComponent,
  AccountsAddComponent,
  CustomersComponent,
  CustomersAddComponent,
  BankAddComponent,
  ContactAddComponent,
  AddressAddComponent,
  VendorsComponent,
  VendorsAddComponent,
  NosubAsideComponent,
  ItemsComponent,
  ItemsAddComponent,
  ItemsSizeAddComponent,
  ItemsStyleAddComponent,
  ItemsColorAddComponent,
  WarehousesComponent,
  WarehousesAddComponent,
  UnitsofmearsureComponent,
  UnitsOfMearSureAdd,
  ConversionAddComponent,
  InventoryComponent,
  PopAddInventoryComponent,
  ItempostingaccountsComponent,
  DimensionGroupsComponent,
  PopAddDimensionGroupsComponent,
  ItemsConversionAddComponent,
  PopAddDimensionSetupComponent,
  ArPostingAccountsComponent,
  PopAddArComponent,
  APPostingAccountsComponent,
  PopupAddAPPostingAccountComponent,
  PostingAccountsAddComponent,
  FAPostingAccountsComponent,
  PopupAddFAPostingAccountComponent,
  FixedAssetsComponent,
  PopupAddFixedAssetComponent,
  FiscalPeriodsComponent,
  PopAddFiscalPeriodsComponent,
  ItemBatchsComponent,
  PopAddItemBatchsComponent,
  ItemSeriesComponent,
  PopAddItemSeriesComponent,
  VATCodesComponent,
  PopAddVatcodesComponent,
  PopAddVatpostingComponent,
  FiscalPeriodsAutoCreateComponent,
];
