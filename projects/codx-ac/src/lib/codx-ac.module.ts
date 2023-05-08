import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule } from 'codx-core';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { LayoutComponent } from './_layout/layout.component';
import { NosubAsideComponent } from './_noSubAside/nosub-aside.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { CodxAcComponent } from './codx-ac.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomizedMultiSelectPopupComponent } from './journals/customized-multi-select-popup/customized-multi-select-popup.component';
import { DropdownDetailComponent } from './journals/dropdown-detail/dropdown-detail.component';
import { JournalsComponent } from './journals/journals.component';
import { PopupAddJournalComponent } from './journals/popup-add-journal/popup-add-journal.component';
import { PopupSetupInvoiceComponent } from './journals/popup-setup-invoice/popup-setup-invoice.component';
import { PeriodicComponent } from './periodic/periodic.component';
import { NameByIdPipe } from './pipes/nameById.pipe';
import { VoucherComponent } from './popup/voucher/voucher.component';
import { ReportsComponent } from './reports/reports.component';
import { SearchingComponent } from './searching/searching.component';
import { CashPaymentsComponent } from './vouchers/cash-payments/cash-payments.component';
import { PopAddCashComponent } from './vouchers/cash-payments/pop-add-cash/pop-add-cash.component';
import { PopAddLinecashComponent } from './vouchers/cash-payments/pop-add-linecash/pop-add-linecash.component';
import { CashReceiptsComponent } from './vouchers/cash-receipts/cash-receipts.component';
import { PopAddLinereceiptsComponent } from './vouchers/cash-receipts/pop-add-linereceipts/pop-add-linereceipts.component';
import { PopAddReceiptsComponent } from './vouchers/cash-receipts/pop-add-receipts/pop-add-receipts.component';
import { CashTransfersComponent } from './vouchers/cash-transfers/cash-transfers.component';
import { PopupAddCashTransferComponent } from './vouchers/cash-transfers/popup-add-cash-transfer/popup-add-cash-transfer.component';
import { PopAddLineComponent } from './vouchers/purchaseinvoices/pop-add-line/pop-add-line.component';
import { PopAddPurchaseComponent } from './vouchers/purchaseinvoices/pop-add-purchase/pop-add-purchase.component';
import { PurchaseinvoicesComponent } from './vouchers/purchaseinvoices/purchaseinvoices.component';
import { PopAddReceiptTransactionComponent } from './vouchers/receipt-transaction/pop-add-receipt-transaction/pop-add-receipt-transaction.component';
import { ReceiptTransactionComponent } from './vouchers/receipt-transaction/receipt-transaction.component';
import { PopupAddSalesInvoiceComponent } from './vouchers/sales-invoices/popup-add-sales-invoice/popup-add-sales-invoice.component';
import { PopupAddSalesInvoicesLineComponent } from './vouchers/sales-invoices/popup-add-sales-invoices-line/popup-add-sales-invoices-line.component';
import { SalesInvoicesComponent } from './vouchers/sales-invoices/sales-invoices.component';
import { TableLineDetailComponent } from './vouchers/sales-invoices/table-line-detail/table-line-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: NosubAsideComponent,
    children: [
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
      {
        path: 'journalnames/:funcID',
        component: JournalsComponent,
        data: { noReuse: true },
      },
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
        path: 'searching/:funcID',
        component: SearchingComponent,
        data: { noReuse: true },
      },
      {
        path: 'salesinvoices/:funcID',
        component: SalesInvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'reports/:funcID',
        component: ReportsComponent,
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
      { path: '', redirectTo: 'journalnames/ACT', pathMatch: 'full' },
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
    PopupSetupInvoiceComponent,
    PopAddLineComponent,
    CustomizedMultiSelectPopupComponent,
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
  ],
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
  ],
  exports: [RouterModule],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AcModule {}
