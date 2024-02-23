import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiscalPeriodsComponent } from './settings/fiscal-periods/fiscal-periods.component';
import { CodxCoreModule } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { FormsModule } from '@angular/forms';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { TranformValueNumberPipe } from './pipes/tranform-value-number.pipe';
import { NameByIdPipe } from './pipes/name-by-id.pipe';
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
import { ItemsConversionAddComponent } from './settings/items-categories/items-conversion-add/items-conversion-add.component';
import { ItempostingaccountsComponent } from './settings/posting-accounts-categories/posting-accounts.component';
import { InventoryComponent } from './settings/inventory/inventory.component';
import { PopAddInventoryComponent } from './settings/inventory/pop-add-inventory/pop-add-inventory.component';
import { ConversionAddComponent } from './settings/unitsofmearsure-categories/conversion-add/conversion-add.component';
import { UnitsOfMearSureAdd } from './settings/unitsofmearsure-categories/unitsofmearsure-add/unitsofmearsure-add.component';
import { UnitsofmearsureComponent } from './settings/unitsofmearsure-categories/unitsofmearsure.component';
import { WarehousesAddComponent } from './settings/warehouses-categories/warehouses-add/warehouses-add.component';
import { WarehousesComponent } from './settings/warehouses-categories/warehouses.component';
import { ItemsColorAddComponent } from './settings/items-categories/items-color-add/items-color-add.component';
import { ItemsStyleAddComponent } from './settings/items-categories/items-style-add/items-style-add.component';
import { ItemsSizeAddComponent } from './settings/items-categories/items-size-add/items-size-add.component';
import { ItemsAddComponent } from './settings/items-categories/items-add/items-add.component';
import { ItemsComponent } from './settings/items-categories/items.component';
import { NosubAsideComponent } from './_noSubAside/nosub-aside.component';
import { VendorsAddComponent } from './settings/vendors-categories/vendors-add/vendors-add.component';
import { VendorsComponent } from './settings/vendors-categories/vendors.component';
import { AddressAddComponent } from './settings/customers-categories/address-add/address-add.component';
import { ContactAddComponent } from './settings/customers-categories/contact-add/contact-add.component';
import { BankAddComponent } from './settings/customers-categories/bank-add/bank-add.component';
import { CustomersAddComponent } from './settings/customers-categories/customers-add/customers-add.component';
import { CustomersComponent } from './settings/customers-categories/customers.component';
import { AccountsAddComponent } from './settings/account-categories/accounts-add/accounts-add.component';
import { AccountsComponent } from './settings/account-categories/accounts.component';
import { ExchangerateAddComponent } from './settings/currency-categories/currency-exchangerate-add/currency-exchangerate-add.component';
import { ExchangeRateSettingAddComponent } from './settings/currency-categories/currency-exchangerate-setting-add/currency-exchangerate-setting-add.component';
import { CurrencyAddComponent } from './settings/currency-categories/currency-add/currency-add.component';
import { CurrencyComponent } from './settings/currency-categories/currency.component';
import { DimensionGroupsComponent } from './settings/dimension-groups-categories/dimension-groups.component';
import { DimensionGroupsAddComponent } from './settings/dimension-groups-categories/dimension-groups-add/dimension-groups-add.component';
import { DimensionSetupAddComponent } from './settings/dimension-groups-categories/dimension-setup-add/dimension-setup-add.component';

const T_Comp: Type<any>[] = [
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
  DimensionGroupsAddComponent,
  ItemsConversionAddComponent,
  DimensionSetupAddComponent,
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
@NgModule({
  declarations: [T_Comp],
  exports: [T_Comp, NameByIdPipe],
  imports: [
    CommonModule,
    CodxCoreModule,
    CodxShareModule,
    FormsModule,
    TabModule,
    NgbModule,
    CodxReportModule,
    FormsModule,
    NameByIdPipe,
    TranformValueNumberPipe,
  ],
})
export class AcShareModule {}
