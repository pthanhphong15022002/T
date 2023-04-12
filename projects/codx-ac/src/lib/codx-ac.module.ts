import { JournalNamesComponent } from './journal-names/journal-names.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule } from 'codx-core';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxAcComponent } from './codx-ac.component';
import { LayoutComponent } from './_layout/layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';
import { CashPaymentsComponent } from './cash-payments/cash-payments.component';
import { NosubAsideComponent } from './_noSubAside/nosub-aside.component';
import { PopAddCashComponent } from './cash-payments/pop-add-cash/pop-add-cash.component';
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
import { CustomizedMultiSelectPopupComponent } from './journal-names/customized-multi-select-popup/customized-multi-select-popup.component';
import { VoucherComponent } from './popup/voucher/voucher.component';
import { PopAddLinecashComponent } from './cash-payments/pop-add-linecash/pop-add-linecash.component';
import { PopAddLinereceiptsComponent } from './cash-receipts/pop-add-linereceipts/pop-add-linereceipts.component';

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
    JournalNamesComponent,
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
    PopAddLinereceiptsComponent,
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
  ],
  exports: [RouterModule],
  providers: [AccumulationTooltipService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AcModule {}
