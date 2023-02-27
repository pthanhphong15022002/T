import { JournalNamesComponent } from './journal-names/journal-names.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxAcComponent } from './codx-ac.component';
import { LayoutComponent } from './_layout/layout.component';
import { CurrencyFormComponent } from './currency-form/currency-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@core/core.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';
import { PopAddCurrencyComponent } from './currency-form/pop-add-currency/pop-add-currency.component';
import { LayoutNoAsideComponent } from 'projects/codx-share/src/lib/_layout/_noAside/_noAside.component';
import { PopSettingExchangeComponent } from './currency-form/pop-setting-exchange/pop-setting-exchange.component';
import { PopAddExchangerateComponent } from './currency-form/pop-add-exchangerate/pop-add-exchangerate.component';
import { ChartOfAccountsComponent } from './chart-of-accounts/chart-of-accounts.component';
import { PopAddAccountsComponent } from './chart-of-accounts/pop-add-accounts/pop-add-accounts.component';
import { CustomersComponent } from './customers/customers.component';
import { PopAddCustomersComponent } from './customers/pop-add-customers/pop-add-customers.component';
import { PopAddBankComponent } from './customers/pop-add-bank/pop-add-bank.component';
import { PopAddContactComponent } from './customers/pop-add-contact/pop-add-contact.component';
import { PopAddAddressComponent } from './customers/pop-add-address/pop-add-address.component';
import { VendorsComponent } from './vendors/vendors.component';
import { PopAddVendorsComponent } from './vendors/pop-add-vendors/pop-add-vendors.component';
import { CashPaymentsComponent } from './cash-payments/cash-payments.component';
import { NoSubAsideComponent } from 'projects/codx-ad/src/lib/_noSubAside/_noSubAside.component';
import { NosubAsideComponent } from './_noSubAside/nosub-aside.component';
import { PopAddCashComponent } from './cash-payments/pop-add-cash/pop-add-cash.component';
import { ItemsComponent } from './items/items.component';
import { PopupAddItemComponent } from './items/popup-add-item/popup-add-item.component';
import { PopupAddItemSizeComponent } from './items/popup-add-item-size/popup-add-item-size.component';
import { PopupAddItemStyleComponent } from './items/popup-add-item-style/popup-add-item-style.component';
import { PopupAddItemColorComponent } from './items/popup-add-item-color/popup-add-item-color.component';
import { PopupAddItemConversionComponent } from './items/popup-add-item-conversion/popup-add-item-conversion.component';
import { WarehousesComponent } from './warehouses/warehouses.component';
import { PopAddWarehousesComponent } from './warehouses/pop-add-warehouses/pop-add-warehouses.component';
import { UnitsofmearsureComponent } from './unitsofmearsure/unitsofmearsure.component';
import { PopAddMearsureComponent } from './unitsofmearsure/pop-add-mearsure/pop-add-mearsure.component';
import { PopAddConversionComponent } from './unitsofmearsure/pop-add-conversion/pop-add-conversion.component';
import { InventoryComponent } from './inventory/inventory.component';
import { PopAddInventoryComponent } from './inventory/pop-add-inventory/pop-add-inventory.component';
import { ItempostingaccountsComponent } from './item-posting-accounts/item-posting-accounts.component';
import { DimensionGroupsComponent } from './dimension-groups/dimension-groups.component';
import { PopAddDimensionGroupsComponent } from './dimension-groups/pop-add-dimension-groups/pop-add-dimension-groups.component';
import { PopAddDimensionSetupComponent } from './dimension-groups/pop-add-dimension-setup/pop-add-dimension-setup.component';

export const routes: Routes = [
  {
    path: '',
    component: NosubAsideComponent,
    children: [
      {
        path: 'cashpayments/:funcID',
        component: CashPaymentsComponent,
      },
      {
        path: 'journalnames/:funcID',
        component: JournalNamesComponent,
      },
    ],
  },
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
    ],
  },
];

@NgModule({
  declarations: [
    CodxAcComponent,
    LayoutComponent,
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
    CashPaymentsComponent,
    PopAddCashComponent,
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
    JournalNamesComponent,
    PopAddDimensionSetupComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    InlineSVGModule,
    CommonModule,
    FormsModule,
    CoreModule,
    CircularGaugeModule,
    DatePickerModule,
    TabModule,
    NgbModule,
    SplitterModule,
    CodxReportModule,
  ],
  exports: [RouterModule],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AcModule {}
