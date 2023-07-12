import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  AccumulationTooltipService,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule } from 'codx-core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CoreModule } from '../../../../src/core/core.module';
import { LayoutComponent } from './_layout/layout.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { CodxAcComponent } from './codx-ac.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DropdownDetailComponent } from './journals/components/dropdown-detail/dropdown-detail.component';
import { GroupShareComponent } from './journals/components/group-share/group-share.component';
import { Group067Component } from './journals/components/group067/group067.component';
import { JournalsComponent } from './journals/journals.component';
import { MultiSelectPopupComponent } from './journals/multi-select-popup/multi-select-popup.component';
import { PopupAddJournalComponent } from './journals/popup-add-journal/popup-add-journal.component';
import { PopupPermissionComponent } from './journals/popup-permission/popup-permission.component';
import { AllocateToolsComponent } from './periodic/allocate-tools/allocate-tools.component';
import { PopAddAllocateToolsComponent } from './periodic/allocate-tools/pop-add-allocate-tools/pop-add-allocate-tools.component';
import { DeductPrepaidExpensesComponent } from './periodic/deduct-prepaid-expenses/deduct-prepaid-expenses.component';
import { PopAddDeductPrepaidExpensesComponent } from './periodic/deduct-prepaid-expenses/pop-add-deduct-prepaid-expenses/pop-add-deduct-prepaid-expenses.component';
import { DepreciatingFixedAssetsComponent } from './periodic/depreciating-fixed-assets/depreciating-fixed-assets.component';
import { PopAddDepreciatingFixedAssetsComponent } from './periodic/depreciating-fixed-assets/pop-add-depreciating-fixed-assets/pop-add-depreciating-fixed-assets.component';
import { PeriodicComponent } from './periodic/periodic.component';
import { PopAddRunPeriodicComponent } from './periodic/run-periodic/pop-add-run-periodic/pop-add-run-periodic.component';
import { RunPeriodicComponent } from './periodic/run-periodic/run-periodic.component';
import { PopAddUpdateTheLedgerComponent } from './periodic/update-the-ledger/pop-add-update-the-ledger/pop-add-update-the-ledger.component';
import { UpdateTheLedgerComponent } from './periodic/update-the-ledger/update-the-ledger.component';
import { NameByIdPipe } from './pipes/nameById.pipe';
import { ReplacePipe } from './pipes/replace.pipe';
import { VoucherComponent } from './popup/voucher/voucher.component';
import { ReportsComponent } from './reports/reports.component';
import { SearchingComponent } from './searching/searching.component';
import { CashPaymentsComponent } from './vouchers/cash-payments/cash-payments.component';
import { PopAddCashComponent } from './vouchers/cash-payments/pop-add-cash/pop-add-cash.component';
import { PopAddLinecashComponent } from './vouchers/cash-payments/pop-add-linecash/pop-add-linecash.component';
import { PopUpCashComponent } from './vouchers/cash-payments/pop-up-cash/pop-up-cash.component';
import { PopUpVatComponent } from './vouchers/cash-payments/pop-up-vat/pop-up-vat.component';
import { CashReceiptsComponent } from './vouchers/cash-receipts/cash-receipts.component';
import { PopAddLinereceiptsComponent } from './vouchers/cash-receipts/pop-add-linereceipts/pop-add-linereceipts.component';
import { PopAddReceiptsComponent } from './vouchers/cash-receipts/pop-add-receipts/pop-add-receipts.component';
import { CashTransfersComponent } from './vouchers/cash-transfers/cash-transfers.component';
import { PopupAddCashTransferComponent } from './vouchers/cash-transfers/popup-add-cash-transfer/popup-add-cash-transfer.component';
import { PopAddLineComponent } from './vouchers/purchaseinvoices/pop-add-line/pop-add-line.component';
import { PopAddPurchaseComponent } from './vouchers/purchaseinvoices/pop-add-purchase/pop-add-purchase.component';
import { PurchaseinvoicesComponent } from './vouchers/purchaseinvoices/purchaseinvoices.component';
import { PopAddLineinventoryComponent } from './vouchers/receipt-transaction/pop-add-lineinventory/pop-add-lineinventory.component';
import { PopAddReceiptTransactionComponent } from './vouchers/receipt-transaction/pop-add-receipt-transaction/pop-add-receipt-transaction.component';
import { ReceiptTransactionComponent } from './vouchers/receipt-transaction/receipt-transaction.component';
import { TableLineDetailStaticComponent } from './vouchers/sales-invoices/components/table-line-detail-static/table-line-detail-static.component';
import { TableLineDetailComponent } from './vouchers/sales-invoices/components/table-line-detail/table-line-detail.component';
import { PopupAddSalesInvoiceComponent } from './vouchers/sales-invoices/popup-add-sales-invoice/popup-add-sales-invoice.component';
import { PopupAddSalesInvoicesLineComponent } from './vouchers/sales-invoices/popup-add-sales-invoices-line/popup-add-sales-invoices-line.component';
import { SalesInvoicesComponent } from './vouchers/sales-invoices/sales-invoices.component';
import { DeductInterestExpensesComponent } from './periodic/deduct-interest-expenses/deduct-interest-expenses.component';
import { PopAddDeductInterestExpensesComponent } from './periodic/deduct-interest-expenses/pop-add-deduct-interest-expenses/pop-add-deduct-interest-expenses.component';
import { ClosingTransactionComponent } from './periodic/closing-transaction/closing-transaction.component';
import { PopAddClosingTransactionComponent } from './periodic/closing-transaction/pop-add-closing-transaction/pop-add-closing-transaction.component';
import { LayloutJournalComponent } from './laylout-journal/laylout-journal.component';
import { JournalV2Component } from './journal-v2/journal-v2.component';
import { ProgressBarModule } from '@syncfusion/ej2-angular-progressbar';
import { CircularGaugeModule } from '@syncfusion/ej2-angular-circulargauge';
import { CalculatingCostOfProductComponent } from './periodic/calculating-cost-of-product/calculating-cost-of-product.component';
import { PopAddCalculatingCostOfProductComponent } from './periodic/calculating-cost-of-product/pop-add-calculating-cost-of-product/pop-add-calculating-cost-of-product.component';
import { ExchangeRateTransactionComponent } from './periodic/exchange-rate-transaction/exchange-rate-transaction.component';
import { PopAddExchangeRateTransactionComponent } from './periodic/exchange-rate-transaction/pop-add-exchange-rate-transaction/pop-add-exchange-rate-transaction.component';
import { InvoiceSetlementComponent } from './periodic/invoice-setlement/invoice-setlement.component';
import { PopAddInvoiceSetlementComponent } from './periodic/invoice-setlement/pop-add-invoice-setlement/pop-add-invoice-setlement.component';
import { ClosingDataComponent } from './periodic/closing-data/closing-data.component';
import { PopAddClosingDataComponent } from './periodic/closing-data/pop-add-closing-data/pop-add-closing-data.component';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { PopUpCashReportComponent } from './vouchers/cash-payments/pop-up-cash-report/pop-up-cash-report.component';
import { TableAccountingComponent } from './vouchers/sales-invoices/components/table-accounting/table-accounting.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,

    children: [
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },
      {
        path: 'periodic/:funcID',
        component: PeriodicComponent,
        data: { noReuse: true },
      },
      {
        path: 'cashpayments/:funcID',
        component: CashPaymentsComponent,
        data: { noReuse: true },
      },
      {
        path: 'cashreceipts/:funcID',
        component: CashPaymentsComponent,
        data: { noReuse: true },
      },
      {
        path: 'purchaseinvoices/:funcID',
        component: PurchaseinvoicesComponent,
        data: { noReuse: true },
      },
      // {
      //   path: 'journalnames/:funcID',
      //   component: JournalsComponent,
      //   data: { noReuse: true },
      // },
      {
        path: 'cashtranfers/:funcID',
        component: CashTransfersComponent,
        data: { noReuse: true },
      },
      {
        path: 'dashboard/:funcID',
        component: DashboardComponent,
        data: { noReuse: true },
      },
      {
        path: 'inquery/:funcID',
        component: SearchingComponent,
        data: { noReuse: true },
      },
      {
        path: 'salesinvoices/:funcID',
        component: SalesInvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'salesreturn/:funcID',
        component: SalesInvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'approvals/:funcID',
        component: ApprovalsComponent,
        data: { noReuse: true },
      },
      {
        path: 'receipttransaction/:funcID',
        component: ReceiptTransactionComponent,
        data: { noReuse: true },
      },
      {
        path: 'issuetransaction/:funcID',
        component: ReceiptTransactionComponent,
        data: { noReuse: true },
      },
      {
        path: 'calculatingthecostprice/:funcID',
        component: RunPeriodicComponent,
        data: { noReuse: true },
      },
      {
        path: 'updatetheledger/:funcID',
        component: UpdateTheLedgerComponent,
        data: { noReuse: true },
      },
      {
        path: 'depreciatingfixedassets/:funcID',
        component: DepreciatingFixedAssetsComponent,
        data: { noReuse: true },
      },
      {
        path: 'allocatingtools/:funcID',
        component: AllocateToolsComponent,
        data: { noReuse: true },
      },
      {
        path: 'deductprepaidexpenses/:funcID',
        component: DeductPrepaidExpensesComponent,
        data: { noReuse: true },
      },
      {
        path: 'deductinterestexpenses/:funcID',
        component: DeductInterestExpensesComponent,
        data: { noReuse: true },
      },
      {
        path: 'closingtransaction/:funcID',
        component: ClosingTransactionComponent,
        data: { noReuse: true },
      },
      {
        path: 'calculatingcostofproduct/:funcID',
        component: CalculatingCostOfProductComponent,
        data: { noReuse: true },
      },
      {
        path: 'exchangeratetransaction/:funcID',
        component: ExchangeRateTransactionComponent,
        data: { noReuse: true },
      },
      {
        path: 'invoicesetlement/:funcID',
        component: InvoiceSetlementComponent,
        data: { noReuse: true },
      },
      {
        path: 'closingdata/:funcID',
        component: ClosingDataComponent,
        data: { noReuse: true },
      },
      { path: '', redirectTo: 'journalnames/ACT', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: LayloutJournalComponent,
    children: [
      {
        path: 'journalnames/:funcID',
        component: JournalV2Component,
        data: { noReuse: true },
      },
    ],
  },
  {
    path: '',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsModule),
  },
];

@NgModule({
  declarations: [
    CodxAcComponent,
    LayoutComponent,
    CashPaymentsComponent,
    PopAddCashComponent,
    JournalsComponent,
    CashTransfersComponent,
    PopupAddCashTransferComponent,
    CashReceiptsComponent,
    PopAddReceiptsComponent,
    PurchaseinvoicesComponent,
    PopAddPurchaseComponent,
    PopupAddJournalComponent,
    DropdownDetailComponent,
    PopAddLineComponent,
    MultiSelectPopupComponent,
    VoucherComponent,
    PopAddLinecashComponent,
    PopAddLinereceiptsComponent,
    DashboardComponent,
    PeriodicComponent,
    SalesInvoicesComponent,
    PopupAddSalesInvoiceComponent,
    PopupAddSalesInvoicesLineComponent,
    SearchingComponent,
    TableLineDetailComponent,
    ReceiptTransactionComponent,
    PopAddReceiptTransactionComponent,
    ReportsComponent,
    ApprovalsComponent,
    PopAddLineinventoryComponent,
    Group067Component,
    GroupShareComponent,
    RunPeriodicComponent,
    PopAddRunPeriodicComponent,
    PopUpCashComponent,
    ReplacePipe,
    UpdateTheLedgerComponent,
    PopAddUpdateTheLedgerComponent,
    PopupPermissionComponent,
    DepreciatingFixedAssetsComponent,
    PopAddDepreciatingFixedAssetsComponent,
    PopUpVatComponent,
    AllocateToolsComponent,
    PopAddAllocateToolsComponent,
    DeductPrepaidExpensesComponent,
    PopAddDeductPrepaidExpensesComponent,
    DeductInterestExpensesComponent,
    PopAddDeductInterestExpensesComponent,
    ClosingTransactionComponent,
    PopAddClosingTransactionComponent,
    CalculatingCostOfProductComponent,
    PopAddCalculatingCostOfProductComponent,
    ExchangeRateTransactionComponent,
    PopAddExchangeRateTransactionComponent,
    InvoiceSetlementComponent,
    PopAddInvoiceSetlementComponent,
    ClosingDataComponent,
    PopAddClosingDataComponent,
    TableLineDetailStaticComponent,
    JournalV2Component,
    LayloutJournalComponent,
    PopUpCashReportComponent,
    TableAccountingComponent,
  ],
  exports: [RouterModule],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule.forChild(routes),
    CodxCoreModule,
    CodxShareModule,
    CommonModule,
    FormsModule,
    TabModule,
    NgbModule,
    CodxReportModule,
    FormsModule,
    NameByIdPipe,
    DragDropModule,
    CoreModule,
    NgxUiLoaderModule,
    ProgressBarModule,
    CircularGaugeModule,
    TooltipModule,
    ChartAllModule,
  ],
})
export class AcModule {}
