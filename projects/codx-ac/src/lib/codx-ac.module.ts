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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ItemsComponent, NameByIdPipe } from './items/items.component';
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
import { ArPostingAccountsComponent } from './ar-posting-accounts/ar-posting-accounts.component';
import { PopAddArComponent } from './ar-posting-accounts/pop-add-ar/pop-add-ar.component';
import { APPostingAccountsComponent } from './apposting-accounts/apposting-accounts.component';
import { PopupAddAPPostingAccountComponent } from './apposting-accounts/popup-add-apposting-account/popup-add-apposting-account.component';
import { PopAddItemComponent } from './item-posting-accounts/pop-add-item/pop-add-item.component';
import { FAPostingAccountsComponent } from './faposting-accounts/faposting-accounts.component';
import { PopupAddFAPostingAccountComponent } from './faposting-accounts/popup-add-faposting-account/popup-add-faposting-account.component';
import { CashTransfersComponent } from './cash-transfers/cash-transfers.component';
import { PopupAddCashTransferComponent } from './cash-transfers/popup-add-cash-transfer/popup-add-cash-transfer.component';
import { CashReceiptsComponent } from './cash-receipts/cash-receipts.component';
import { PopAddReceiptsComponent } from './cash-receipts/pop-add-receipts/pop-add-receipts.component';
import { PurchaseinvoicesComponent } from './purchaseinvoices/purchaseinvoices.component';
import { PopAddPurchaseComponent } from './purchaseinvoices/pop-add-purchase/pop-add-purchase.component';
import { PopupAddJournalComponent } from './journal-names/popup-add-journal/popup-add-journal.component';
import { DropdownDetailComponent } from './journal-names/dropdown-detail/dropdown-detail.component';
import { PopupSetupInvoiceComponent } from './journal-names/popup-setup-invoice/popup-setup-invoice.component';
import { PopAddLineComponent } from './purchaseinvoices/pop-add-line/pop-add-line.component';
import { SingleSelectPopupComponent } from './journal-names/single-select-popup/single-select-popup.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CustomizedMultiSelectPopupComponent } from './journal-names/customized-multi-select-popup/customized-multi-select-popup.component';
import { VoucherComponent } from './popup/voucher/voucher.component';
import { PopAddLinecashComponent } from './cash-payments/pop-add-linecash/pop-add-linecash.component';
import { PopAddLinereceiptsComponent } from './cash-receipts/pop-add-linereceipts/pop-add-linereceipts.component';
import { SearchPipe } from './cash-payments/pop-add-cash/search.pipe';

export const routes: Routes = [
  {
    path: '',
    component: NosubAsideComponent,
    children: [
      {
        path: 'cashpayments/:funcID',
        component: CashPaymentsComponent,
        data: { noReuse: true },
      },
      {
        path: 'cashreceipts/:funcID',
        component: CashReceiptsComponent,
        data: { noReuse: true },
      },
      {
        path: 'purchaseinvoices/:funcID',
        component: PurchaseinvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'journalnames/:funcID',
        component: JournalNamesComponent,
        data: { noReuse: true },
      },
      {
        path: 'cashtranfers/:funcID',
        component: CashTransfersComponent,
        data: { noReuse: true },
      },
      { path: '', redirectTo: 'journalnames/ACT', pathMatch: 'full' },
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
    PopAddDimensionSetupComponent,
    ArPostingAccountsComponent,
    PopAddArComponent,
    APPostingAccountsComponent,
    PopupAddAPPostingAccountComponent,
    PopAddItemComponent,
    FAPostingAccountsComponent,
    PopupAddFAPostingAccountComponent,
    CashTransfersComponent,
    PopupAddCashTransferComponent,
    CashReceiptsComponent,
    PopAddReceiptsComponent,
    PurchaseinvoicesComponent,
    PopAddPurchaseComponent,
    PopupAddJournalComponent,
    DropdownDetailComponent,
    PopupSetupInvoiceComponent,
    PopAddLineComponent,
    SingleSelectPopupComponent,
    CustomizedMultiSelectPopupComponent,
    VoucherComponent,
    PopAddLinecashComponent,
    NameByIdPipe,
    PopAddLinereceiptsComponent,
    SearchPipe,
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
    NgxUiLoaderModule,
    FormsModule
  ],
  exports: [RouterModule],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AcModule {}
