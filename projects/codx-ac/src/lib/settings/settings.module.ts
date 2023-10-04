import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule } from 'codx-core';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { NosubAsideComponent } from '../_noSubAside/nosub-aside.component';
import { NameByIdPipe } from '../pipes/name-by-id.pipe';
import { APPostingAccountsComponent } from './apposting-accounts/apposting-accounts.component';
import { PopupAddAPPostingAccountComponent } from './apposting-accounts/popup-add-apposting-account/popup-add-apposting-account.component';
import { ArPostingAccountsComponent } from './ar-posting-accounts/ar-posting-accounts.component';
import { PopAddArComponent } from './ar-posting-accounts/pop-add-ar/pop-add-ar.component';
import { CustomersComponent } from './customers/customers.component';
import { PopAddAddressComponent } from './customers/pop-add-address/pop-add-address.component';
import { PopAddBankComponent } from './customers/pop-add-bank/pop-add-bank.component';
import { PopAddContactComponent } from './customers/pop-add-contact/pop-add-contact.component';
import { PopAddCustomersComponent } from './customers/pop-add-customers/pop-add-customers.component';
import { DimensionGroupsComponent } from './dimension-groups/dimension-groups.component';
import { PopAddDimensionGroupsComponent } from './dimension-groups/pop-add-dimension-groups/pop-add-dimension-groups.component';
import { PopAddDimensionSetupComponent } from './dimension-groups/pop-add-dimension-setup/pop-add-dimension-setup.component';
import { FAPostingAccountsComponent } from './faposting-accounts/faposting-accounts.component';
import { PopupAddFAPostingAccountComponent } from './faposting-accounts/popup-add-faposting-account/popup-add-faposting-account.component';
import { FixedAssetsComponent } from './fixed-assets/fixed-assets.component';
import { PopupAddFixedAssetComponent } from './fixed-assets/popup-add-fixed-asset/popup-add-fixed-asset.component';
import { InventoryComponent } from './inventory/inventory.component';
import { PopAddInventoryComponent } from './inventory/pop-add-inventory/pop-add-inventory.component';
import { ItemsComponent } from './items/items.component';
import { PopupAddItemColorComponent } from './items/popup-add-item-color/popup-add-item-color.component';
import { PopupAddItemConversionComponent } from './items/popup-add-item-conversion/popup-add-item-conversion.component';
import { PopupAddItemSizeComponent } from './items/popup-add-item-size/popup-add-item-size.component';
import { PopupAddItemStyleComponent } from './items/popup-add-item-style/popup-add-item-style.component';
import { PopupAddItemComponent } from './items/popup-add-item/popup-add-item.component';
import { PopAddConversionComponent } from './unitsofmearsure/pop-add-conversion/pop-add-conversion.component';
import { PopAddMearsureComponent } from './unitsofmearsure/pop-add-mearsure/pop-add-mearsure.component';
import { UnitsofmearsureComponent } from './unitsofmearsure/unitsofmearsure.component';
import { PopAddVendorsComponent } from './vendors/pop-add-vendors/pop-add-vendors.component';
import { VendorsComponent } from './vendors/vendors.component';
import { PopAddWarehousesComponent } from './warehouses/pop-add-warehouses/pop-add-warehouses.component';
import { WarehousesComponent } from './warehouses/warehouses.component';
import { ImageBoxListComponent } from './items/components/image-box-list/image-box-list.component';
import { FiscalPeriodsComponent } from './fiscal-periods/fiscal-periods.component';
import { PopAddFiscalPeriodsComponent } from './fiscal-periods/pop-add-fiscal-periods/pop-add-fiscal-periods.component';
import { ItemBatchsComponent } from './item-batchs/item-batchs.component';
import { PopAddItemBatchsComponent } from './item-batchs/pop-add-item-batchs/pop-add-item-batchs.component';
import { ItemSeriesComponent } from './item-series/item-series.component';
import { PopAddItemSeriesComponent } from './item-series/pop-add-item-series/pop-add-item-series.component';
import { VATCodesComponent } from './vatcodes/vatcodes.component';
import { PopAddVatcodesComponent } from './vatcodes/pop-add-vatcodes/pop-add-vatcodes.component';
import { PopAddVatpostingComponent } from './vatcodes/pop-add-vatposting/pop-add-vatposting.component';
import { FiscalPeriodsAutoCreateComponent } from './fiscal-periods/fiscal-periods-add/fiscal-periods-auto-create.component';
import { AccountsComponent } from './account-categories/accounts.component';
import { AccountsAddComponent } from './account-categories/accounts-add/accounts-add.component';
import { CurrencyComponent } from './currency-categories/currency.component';
import { CurrencyAddComponent } from './currency-categories/currency-add/currency-add.component';
import { ExchangeRateSettingAddComponent } from './currency-categories/currency-exchangerate-setting-add/currency-exchangerate-setting-add.component';
import { ExchangerateAddComponent } from './currency-categories/currency-exchangerate-add/currency-exchangerate-add.component';
import { TranformValueNumberPipe } from '../pipes/tranform-value-number.pipe';
import { ItempostingaccountsComponent } from './posting-accounts-categories/posting-accounts.component';
import { PostingAccountsAddComponent } from './posting-accounts-categories/posting-accounts-add/posting-accounts-add.component';

var routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'currencies/:funcID',
        component: CurrencyComponent,
      },
      {
        path: 'chartofaccounts/:funcID',
        component: AccountsComponent,
      },
      {
        path: 'customers/:funcID',
        component: CustomersComponent,
      },
      {
        path: 'vendors/:funcID',
        component: VendorsComponent,
      },
      {
        path: 'items/:funcID',
        component: ItemsComponent,
      },
      {
        path: 'warehouses/:funcID',
        component: WarehousesComponent,
      },
      {
        path: 'unitsofmearsure/:funcID',
        component: UnitsofmearsureComponent,
      },
      {
        path: 'inventorymodels/:funcID',
        component: InventoryComponent,
      },
      {
        path: 'postingaccounts/:funcID',
        component: ItempostingaccountsComponent,
      },
      {
        path: 'dimensiongroups/:funcID',
        component: DimensionGroupsComponent,
      },
      {
        path: 'arpostingaccounts/:funcID',
        component: ArPostingAccountsComponent,
      },
      {
        path: 'appostingaccounts/:funcID',
        component: APPostingAccountsComponent,
      },
      {
        path: 'fapostingaccounts/:funcID',
        component: FAPostingAccountsComponent,
      },
      {
        path: 'fixedassets/:funcID',
        component: FixedAssetsComponent,
      },
      {
        path: 'fiscalperiods/:funcID',
        component: FiscalPeriodsComponent,
      },
      {
        path: 'itembatchs/:funcID',
        component: ItemBatchsComponent,
      },
      {
        path: 'itemseries/:funcID',
        component: ItemSeriesComponent,
      },
      {
        path: 'vatcodes/:funcID',
        component: VATCodesComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CurrencyComponent,
    CurrencyAddComponent,
    ExchangeRateSettingAddComponent,
    ExchangerateAddComponent,
    AccountsComponent,
    AccountsAddComponent,
    CustomersComponent,
    PopAddCustomersComponent,
    PopAddBankComponent,
    PopAddContactComponent,
    PopAddAddressComponent,
    VendorsComponent,
    PopAddVendorsComponent,
    NosubAsideComponent,
    ItemsComponent,
    PopupAddItemComponent,
    PopupAddItemSizeComponent,
    PopupAddItemStyleComponent,
    PopupAddItemColorComponent,
    WarehousesComponent,
    PopAddWarehousesComponent,
    UnitsofmearsureComponent,
    PopAddMearsureComponent,
    PopAddConversionComponent,
    InventoryComponent,
    PopAddInventoryComponent,
    ItempostingaccountsComponent,
    DimensionGroupsComponent,
    PopAddDimensionGroupsComponent,
    PopupAddItemConversionComponent,
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
    ImageBoxListComponent,
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
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    FormsModule,
    TabModule,
    NgbModule,
    CodxReportModule,
    FormsModule,
    NameByIdPipe,
    TranformValueNumberPipe
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsModule {}
