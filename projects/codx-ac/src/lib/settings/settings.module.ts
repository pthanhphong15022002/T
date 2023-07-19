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
import { NameByIdPipe } from '../pipes/nameById.pipe';
import { APPostingAccountsComponent } from './apposting-accounts/apposting-accounts.component';
import { PopupAddAPPostingAccountComponent } from './apposting-accounts/popup-add-apposting-account/popup-add-apposting-account.component';
import { ArPostingAccountsComponent } from './ar-posting-accounts/ar-posting-accounts.component';
import { PopAddArComponent } from './ar-posting-accounts/pop-add-ar/pop-add-ar.component';
import { ChartOfAccountsComponent } from './chart-of-accounts/chart-of-accounts.component';
import { PopAddAccountsComponent } from './chart-of-accounts/pop-add-accounts/pop-add-accounts.component';
import { CurrencyFormComponent } from './currency-form/currency-form.component';
import { PopAddCurrencyComponent } from './currency-form/pop-add-currency/pop-add-currency.component';
import { PopAddExchangerateComponent } from './currency-form/pop-add-exchangerate/pop-add-exchangerate.component';
import { PopSettingExchangeComponent } from './currency-form/pop-setting-exchange/pop-setting-exchange.component';
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
import { ItempostingaccountsComponent } from './item-posting-accounts/item-posting-accounts.component';
import { PopAddItemComponent } from './item-posting-accounts/pop-add-item/pop-add-item.component';
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

var routes: Routes = [
  {
    path: '',
    component: LayoutNoAsideComponent,
    children: [
      {
        path: 'currencies/:funcID',
        component: CurrencyFormComponent,
      },
      {
        path: 'chartofaccounts/:funcID',
        component: ChartOfAccountsComponent,
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
    ],
  },
];

@NgModule({
  declarations: [
    CurrencyFormComponent,
    PopAddCurrencyComponent,
    PopSettingExchangeComponent,
    PopAddExchangerateComponent,
    ChartOfAccountsComponent,
    PopAddAccountsComponent,
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
    PopAddItemComponent,
    FAPostingAccountsComponent,
    PopupAddFAPostingAccountComponent,
    FixedAssetsComponent,
    PopupAddFixedAssetComponent,
    ImageBoxListComponent,
    FiscalPeriodsComponent,
    PopAddFiscalPeriodsComponent,
    ItemBatchsComponent,
    PopAddItemBatchsComponent,
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
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsModule {}
