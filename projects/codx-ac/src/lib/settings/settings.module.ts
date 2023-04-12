import { RouterModule, Routes } from '@angular/router';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { CurrencyFormComponent } from './currency-form/currency-form.component';
import { ChartOfAccountsComponent } from './chart-of-accounts/chart-of-accounts.component';
import { CustomersComponent } from './customers/customers.component';
import { VendorsComponent } from './vendors/vendors.component';
import { ItemsComponent, NameByIdPipe } from './items/items.component';
import { WarehousesComponent } from './warehouses/warehouses.component';
import { UnitsofmearsureComponent } from './unitsofmearsure/unitsofmearsure.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ItempostingaccountsComponent } from './item-posting-accounts/item-posting-accounts.component';
import { DimensionGroupsComponent } from './dimension-groups/dimension-groups.component';
import { ArPostingAccountsComponent } from './ar-posting-accounts/ar-posting-accounts.component';
import { APPostingAccountsComponent } from './apposting-accounts/apposting-accounts.component';
import { FAPostingAccountsComponent } from './faposting-accounts/faposting-accounts.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PopAddCurrencyComponent } from './currency-form/pop-add-currency/pop-add-currency.component';
import { PopSettingExchangeComponent } from './currency-form/pop-setting-exchange/pop-setting-exchange.component';
import { PopAddAccountsComponent } from './chart-of-accounts/pop-add-accounts/pop-add-accounts.component';
import { PopAddExchangerateComponent } from './currency-form/pop-add-exchangerate/pop-add-exchangerate.component';
import { PopAddCustomersComponent } from './customers/pop-add-customers/pop-add-customers.component';
import { PopAddBankComponent } from './customers/pop-add-bank/pop-add-bank.component';
import { PopAddContactComponent } from './customers/pop-add-contact/pop-add-contact.component';
import { PopAddAddressComponent } from './customers/pop-add-address/pop-add-address.component';
import { PopAddVendorsComponent } from './vendors/pop-add-vendors/pop-add-vendors.component';
import { NosubAsideComponent } from '../_noSubAside/nosub-aside.component';
import { PopupAddItemComponent } from './items/popup-add-item/popup-add-item.component';
import { PopupAddItemSizeComponent } from './items/popup-add-item-size/popup-add-item-size.component';
import { PopupAddItemStyleComponent } from './items/popup-add-item-style/popup-add-item-style.component';
import { PopupAddItemColorComponent } from './items/popup-add-item-color/popup-add-item-color.component';
import { PopAddWarehousesComponent } from './warehouses/pop-add-warehouses/pop-add-warehouses.component';
import { PopAddMearsureComponent } from './unitsofmearsure/pop-add-mearsure/pop-add-mearsure.component';
import { PopAddConversionComponent } from './unitsofmearsure/pop-add-conversion/pop-add-conversion.component';
import { PopAddInventoryComponent } from './inventory/pop-add-inventory/pop-add-inventory.component';
import { PopAddDimensionGroupsComponent } from './dimension-groups/pop-add-dimension-groups/pop-add-dimension-groups.component';
import { PopupAddItemConversionComponent } from './items/popup-add-item-conversion/popup-add-item-conversion.component';
import { PopAddDimensionSetupComponent } from './dimension-groups/pop-add-dimension-setup/pop-add-dimension-setup.component';
import { PopAddArComponent } from './ar-posting-accounts/pop-add-ar/pop-add-ar.component';
import { PopupAddAPPostingAccountComponent } from './apposting-accounts/popup-add-apposting-account/popup-add-apposting-account.component';
import { PopAddItemComponent } from './item-posting-accounts/pop-add-item/pop-add-item.component';
import { PopupAddFAPostingAccountComponent } from './faposting-accounts/popup-add-faposting-account/popup-add-faposting-account.component';
import { CommonModule } from '@angular/common';
import { CodxCoreModule } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { FormsModule } from '@angular/forms';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxReportModule } from 'projects/codx-report/src/public-api';

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
        path: 'itempostingaccounts/:funcID',
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

    NameByIdPipe,
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
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsModule {}
