import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbAccordionModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  AccumulationTooltipService,
  ChartAllModule,
} from '@syncfusion/ej2-angular-charts';
import {
  AccordionModule,
  TabModule,
} from '@syncfusion/ej2-angular-navigations';
import { CodxCoreModule } from 'codx-core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { CodxReportViewsComponent } from 'projects/codx-report/src/lib/codx-report-views/codx-report-views.component';
import { CodxReportModule } from 'projects/codx-report/src/public-api';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CoreModule } from '../../../../src/core/core.module';
import { LayoutComponent } from './_layout/layout.component';
import { ApprovalsComponent as ApprovalsComponentWS } from 'projects/codx-ws/src/lib/approvals/approvals.component';
import { CodxAcComponent } from './codx-ac.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { JournalsAddComponent } from './journals/journals-add/journals-add.component';
import { AllocateToolsComponent } from './periodic/allocate-tools/allocate-tools.component';
import { PopAddAllocateToolsComponent } from './periodic/allocate-tools/pop-add-allocate-tools/pop-add-allocate-tools.component';
import { DeductPrepaidExpensesComponent } from './periodic/deduct-prepaid-expenses/deduct-prepaid-expenses.component';
import { PopAddDeductPrepaidExpensesComponent } from './periodic/deduct-prepaid-expenses/pop-add-deduct-prepaid-expenses/pop-add-deduct-prepaid-expenses.component';
import { DepreciatingFixedAssetsComponent } from './periodic/depreciating-fixed-assets/depreciating-fixed-assets.component';
import { PopAddDepreciatingFixedAssetsComponent } from './periodic/depreciating-fixed-assets/pop-add-depreciating-fixed-assets/pop-add-depreciating-fixed-assets.component';
import { PeriodicComponent } from './periodic/periodic.component';
import { UpdateTheLedgerComponent } from './periodic/update-the-ledger/update-the-ledger.component';
import { NameByIdPipe } from './pipes/name-by-id.pipe';
import { ReplacePipe } from './pipes/replace.pipe';
import { SearchingComponent } from './searching/searching.component';
import { SalesinvoicesComponent } from './vouchers/salesinvoices/salesinvoices.component';
import { DeductInterestExpensesComponent } from './periodic/deduct-interest-expenses/deduct-interest-expenses.component';
import { PopAddDeductInterestExpensesComponent } from './periodic/deduct-interest-expenses/pop-add-deduct-interest-expenses/pop-add-deduct-interest-expenses.component';
import { ClosingTransactionComponent } from './periodic/closing-transaction/closing-transaction.component';
import { PopAddClosingTransactionComponent } from './periodic/closing-transaction/pop-add-closing-transaction/pop-add-closing-transaction.component';
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
import { TranformSubobjectPipe } from './pipes/tranform-subobject.pipe';
import { CashPaymentsComponent } from './vouchers/cashpayments/cashpayments.component';
import { CashPaymentAddComponent } from './vouchers/cashpayments/cashpayments-add/cashpayments-add.component';
import { SettledInvoicesAdd } from './share/settledinvoices-add/settledinvoices-add.component';
import { TranformClassBorderPipe } from './pipes/tranform-class-border.pipe';
import { PurchaseinvoicesComponent } from './vouchers/purchaseinvoices/purchaseinvoices.component';
import { PurchaseinvoicesAddComponent } from './vouchers/purchaseinvoices/purchaseinvoices-add/purchaseinvoices-add.component';
import { SalesinvoicesAddComponent } from './vouchers/salesinvoices/salesinvoices-add/salesinvoices-add.component';
import { IsObjectEmptyPipe } from './pipes/is-object-empty.pipe';
import { CashreceiptsComponent } from './vouchers/cashreceipts/cashreceipts.component';
import { CashreceiptsAddComponent } from './vouchers/cashreceipts/cashreceipts-add/cashreceipts-add.component';
import { PurchaseinvoicesDetailComponent } from './vouchers/purchaseinvoices/purchaseinvoices-detail/purchaseinvoices-detail.component';
import { SalesinvoicesDetailComponent } from './vouchers/salesinvoices/salesinvoices-detail/salesinvoices-detail.component';
import { TranformValueNumberPipe } from './pipes/tranform-value-number.pipe';
import { AcctrantsTableComponent } from './share/ac-tableview/acctrants-table/acctrants-table.component';
import { SettledinvoicesTableComponent } from './share/ac-tableview/settledinvoices-table/settledinvoices-table.component';
import { VatinvoicesTableComponent } from './share/ac-tableview/vatInvoices-table/vatinvoices-table.component';
import { PurchaseinvoicesTableComponent } from './share/ac-tableview/purchaseinvoices-table/purchaseinvoices-table.component';
import { SalesinvoicesTableComponent } from './share/ac-tableview/salesinvoices-table/salesinvoices-table.component';
import { MACContentComponent } from './maccontent/maccontent.component';
import { LayoutOnlyHeaderComponent } from 'projects/codx-common/src/lib/_layout/_onlyHeader/_onlyHeader.component';
import { AdvancePaymentRequestComponent } from './vouchers/advance-payment-request/advance-payment-request.component';
import { AdvancePaymentRequestAddComponent } from './vouchers/advance-payment-request/advance-payment-request-add/advance-payment-request-add.component';
import { CashpaymentDetailComponent } from './vouchers/cashpayments/cashpayments-detail/cashpayment-detail.component';
import { CashrecieptDetailComponent } from './vouchers/cashreceipts/cashreceipts-detail/cashreciept-detail.component';
import { AdvancePaymentRequestDetailComponent } from './vouchers/advance-payment-request/advance-payment-request-detail/advance-payment-request-detail.component';
import { AdvancePaymentRequestTableComponent } from './share/ac-tableview/advance-payment-request-table/advance-payment-request-table.component';
import { PaymentOrderComponent } from './vouchers/payment-order/payment-order.component';
import { PaymentOrderAddComponent } from './vouchers/payment-order/payment-order-add/payment-order-add.component';
import { ReceiptTransactionsTableComponent } from './share/ac-tableview/receipt-transactions-table/receipt-transactions-table.component';
import { ImportEInvoicesComponent } from './periodic/importeinvoices/importeinvoices.component';
import { JournalV2Component } from './journals/journal-v2.component';
import { JournalsAddIdimcontrolComponent } from './journals/journals-add/journals-add-idimcontrol/journals-add-idimcontrol.component';
import { ImportinvoicesDetailComponent } from './periodic/importeinvoices/importinvoices-detail/importinvoices-detail.component';
import { GeneralJournalComponent } from './vouchers/general-journal/general-journal.component';
import { GeneralJournalAddComponent } from './vouchers/general-journal/general-journal-add/general-journal-add.component';
import { GeneralJournalDetailComponent } from './vouchers/general-journal/general-journal-detail/general-journal-detail.component';
import { TempPurchaseinvoicesTableComponent } from './periodic/importeinvoices/temp-purchaseinvoices-table/temp-purchaseinvoices-table.component';
import { WarehouseTransfersComponent } from './vouchers/warehouse-transfers/warehouse-transfers.component';
import { WarehouseTransfersAddComponent } from './vouchers/warehouse-transfers/warehouse-transfers-add/warehouse-transfers-add.component';
import { WarehouseTransfersDetailComponent } from './vouchers/warehouse-transfers/warehouse-transfers-detail/warehouse-transfers-detail.component';
import { TransfersTableComponent } from './share/ac-tableview/transfers-table/transfers-table.component';
import { AllocationAddComponent } from './vouchers/purchaseinvoices/allocation-add/allocation-add.component';
import { AllocationTableComponent } from './share/ac-tableview/allocation-table/allocation-table.component';
import { SuggestionAdd } from './share/suggestion-add/suggestion-add.component';
import { DealsComponent } from 'projects/codx-cm/src/lib/deals/deals.component';
import { CasesComponent } from 'projects/codx-cm/src/lib/cases/cases.component';
import { LeadsComponent } from 'projects/codx-cm/src/lib/leads/leads.component';
import { ViewInstancesComponent } from 'projects/codx-dp/src/lib/view-instances/view-instances.component';
import { CashtransfersComponent } from './vouchers/cashtransfers/cashtransfers.component';
import { CashtransfersAddComponent } from './vouchers/cashtransfers/cashtransfers-add/cashtransfers-add.component';
import { DynamicSettingModule } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting.module';
import { PeriodicControlComponent } from './share/periodic-control/periodic-control.component';
import { FormatDatePipe } from './share/periodic-control/formatDate/format-date.pipe';
import { ContractsComponent } from 'projects/codx-cm/src/lib/contracts/contracts.component';
import { AssetJournalsComponent } from './vouchers/asset-journals/asset-journals.component';
import { AssetJournalsAddComponent } from './vouchers/asset-journals/asset-journals-add/asset-journals-add.component';
import { CategoriesComponent } from './categories/categories.component';
import { RunDepreciationComponent } from './periodic/rundepreciation/rundepreciation.component';
import { NewvoucherComponent } from './share/add-newvoucher/newvoucher.component';
import { DynamicFormComponent } from 'projects/codx-share/src/lib/components/dynamic-form/dynamic-form.component';
import { ViewresultComponent } from './share/periodic-control/viewresult/viewresult.component';

import { JournalViewsettingComponent } from './journals/journals-viewsetting/journal-viewsetting/journal-viewsetting.component';
import { InventoryDetailComponent } from './vouchers/inventory/inventory-detail/inventory-detail.component';
import { InventoryComponent } from './vouchers/inventory/inventory.component';
import { InventoryAddComponent } from './vouchers/inventory/inventory-add/inventory-add.component';
import { CashCountingsComponent } from './vouchers/cash-countings/cash-countings.component';
import { CashCountingsAddComponent } from './vouchers/cash-countings/cash-countings-add/cash-countings-add.component';
import { AssetCountingsComponent } from './vouchers/asset-countings/asset-countings.component';
import { CashtransfersDetailComponent } from './vouchers/cashtransfers/cashtransfers-detail/cashtransfers-detail.component';
import { AssetAcquisitionsComponent } from './vouchers/asset-acquisitions/asset-acquisitions.component';
import { PopupInfoTransferComponent } from './share/popup-info-transfer/popup-info-transfer.component';
import { AssetJournalsDetailComponent } from './vouchers/asset-journals/asset-journals-detail/asset-journals-detail.component';
import { AssetsLineTableComponent } from './share/ac-tableview/assets-line-table/assets-line-table.component';
import { AssetsTableComponent } from './share/ac-tableview/assets-table/assets-table.component';
import { ChooseJournalComponent } from './share/choose-journal/choose-journal.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'categories/:funcID',
        component: CategoriesComponent,
      },
      {
        path: 'report/:funcID',
        component: CodxReportViewsComponent,
      },
      {
        path: 'dashboard/:funcID',
        component: DashboardComponent,
        data: { noReuse: true },
      },

      {
        path: 'journalnames/:funcID',
        component: JournalV2Component,
        data: { noReuse: true },
      },

      {
        path: 'journals/:funcID',
        component: JournalV2Component,
        data: { noReuse: true },
      },

      {
        path: 'report/detail/:funcID',
        component: CodxReportViewDetailComponent,
      },

      {
        path: 'cashpayments/:funcID/:journalNo',
        component: CashPaymentsComponent,
        data: { noReuse: true },
      },
      {
        path: 'bankpayments/:funcID/:journalNo',
        component: CashPaymentsComponent,
        data: { noReuse: true },
      },
      {
        path: 'assetacquisitions/:funcID/:journalNo',
        component: AssetJournalsComponent,
        data: { noReuse: true },
      },
      {
        path: 'assetrevaluations/:funcID/:journalNo',
        component: AssetJournalsComponent,
        data: { noReuse: true },
      },
      {
        path: 'assetadjustments/:funcID/:journalNo',
        component: AssetJournalsComponent,
        data: { noReuse: true },
      },
      {
        path: 'assetliquidations/:funcID/:journalNo',
        component: AssetJournalsComponent,
        data: { noReuse: true },
      },
      {
        path: 'assettransfers/:funcID/:journalNo',
        component: AssetJournalsComponent,
        data: { noReuse: true },
      },
      {
        path: 'assetdepreciations/:funcID/:journalNo',
        component: AssetJournalsComponent,
        data: { noReuse: true },
      },
      {
        path: 'generaljournals/:funcID/:journalNo',
        component: GeneralJournalComponent,
        data: { noReuse: true },
      },
      {
        path: 'cashreceipts/:funcID/:journalNo',
        component: CashreceiptsComponent,
        data: { noReuse: true },
      },
      {
        path: 'bankreceipts/:funcID/:journalNo',
        component: CashreceiptsComponent,
        data: { noReuse: true },
      },
      {
        path: 'purchaseinvoices/:funcID/:journalNo',
        component: PurchaseinvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'importeinvoices/:funcID',
        component: ImportEInvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'cashtranfers/:funcID/:journalNo',
        component: CashtransfersComponent,
        data: { noReuse: true },
      },
      
      //Approval
      {
        path: 'cashpayments/:funcID',
        component: CashPaymentsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'assetacquisitions/:funcID',
        component: AssetJournalsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'assetadjustments/:funcID',
        component: AssetJournalsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'assetrevaluations/:funcID',
        component: AssetJournalsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'assetliquidations/:funcID',
        component: AssetJournalsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'assettransfers/:funcID',
        component: AssetJournalsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'assetdepreciations/:funcID',
        component: AssetJournalsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'generaljournals/:funcID',
        component: GeneralJournalComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'cashreceipts/:funcID',
        component: CashreceiptsComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'purchaseinvoices/:funcID',
        component: PurchaseinvoicesComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'cashtranfers/:funcID',
        component: CashtransfersComponent,
        data: { noReuse: true, runMode: 1 },
      },
      {
        path: 'inquery/:funcID',
        component: SearchingComponent,
        data: { noReuse: true },
      },
      {
        path: 'salesinvoices/:funcID/:journalNo',
        component: SalesinvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'salesreturn/:funcID',
        component: SalesinvoicesComponent,
        data: { noReuse: true },
      },
      {
        path: 'approvals/:funcID',
        component: ApprovalsComponentWS,
        data: { noReuse: true },
      },
      {
        path: 'inventoryreceipts/:funcID/:journalNo',
        component: InventoryComponent,
        data: { noReuse: true },
      },
      {
        path: 'inventoryissues/:funcID/:journalNo',
        component: InventoryComponent,
        data: { noReuse: true },
      },
      {
        path: 'inventorytransfers/:funcID/:journalNo',
        component: WarehouseTransfersComponent,
        data: { noReuse: true },
      },
      {
        path: 'cashcountings/:funcID/:journalNo',
        component: CashCountingsComponent,
        data: { noReuse: true },
      },
      {
        path: 'assetcountings/:funcID/:journalNo',
        component: CashCountingsComponent,
        data: { noReuse: true },
      },
      {
        path: 'inventorycounting/:funcID/:journalNo',
        component: CashCountingsComponent,
        data: { noReuse: true },
      },
      // {
      //   path: 'CalculatingTheCostPrice/:funcID',
      //   //component: RunPeriodicComponent,
      //   component: PeriodicControlComponent,
      //   data: { noReuse: true },
      // },
      /// xu lí đinh ki
      {
        path: 'periodic/:funcID',
        component: PeriodicComponent,
        data: { noReuse: true },
        children: [
          {
            path: 'RunPosting/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'CloseInventory/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'AdjustInventory/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'AdjustExchRate/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'RunDepreciation/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'AllocatePrepaidExpenses/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'SimulateInventory/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'CalculateInterest/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'RunAllocation/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'RunCosting/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'RunExchDifference/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'CloseInvoices/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'RunTransfering/:funcID',
            component: PeriodicControlComponent,
          },
          {
            path: 'CloseFiscalPeriod/:funcID',
            component: PeriodicControlComponent,
          },
        ],
      },
      { path: '', redirectTo: 'journalnames/ACT', pathMatch: 'full' },
      {
        path: 'assetacquisitions/:funcID/:journalNo',
        component: AssetAcquisitionsComponent,
        data: { noReuse: true },
      },
      //----phát hành quy trình DP-CRM----//
      {
        path: 'deals/:funcID',
        component: DealsComponent,
        data: { noReuse: true },
      },
      {
        path: 'cases/:funcID',
        component: CasesComponent,
        data: { noReuse: true },
      },
      {
        path: 'leads/:funcID',
        component: LeadsComponent,
        data: { noReuse: true },
      },
      {
        path: 'contracts/:funcID',
        component: ContractsComponent,
        data: { noReuse: true },
      },
      {
        path: 'instances/:funcID/:processID',
        component: ViewInstancesComponent,
        data: { noReuse: true },
      },
      {
        path: 'shared/dynamic/:funcID',
        component: DynamicFormComponent,
      },
      //-----------end--------------//
      //-----------Xet duyet--------------//
      {
        path: 'requestsforadvances/:funcID',
        component: AdvancePaymentRequestComponent,
        data: { noReuse: true },
      },
      //-----------end--------------//
    ],
  },
  {
    path: '',
    component: LayoutOnlyHeaderComponent,
    children: [
      {
        path: 'maccontent/:funcID',
        component: MACContentComponent,
      },
    ],
  },
  {
    path: '',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsModule),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./categories/categories.module').then((m) => m.CategoriesModule),
  },
];

@NgModule({
  declarations: [
    CodxAcComponent,
    LayoutComponent,
    CashtransfersComponent,
    CashPaymentsComponent,
    CashPaymentAddComponent,
    PurchaseinvoicesComponent,
    PurchaseinvoicesAddComponent,
    PopupInfoTransferComponent,
    JournalsAddComponent,
    SettledInvoicesAdd,
    DashboardComponent,
    PeriodicComponent,
    SalesinvoicesComponent,
    SalesinvoicesAddComponent,
    SearchingComponent,
    InventoryComponent,
    InventoryAddComponent,
    SuggestionAdd,
    ReplacePipe,
    UpdateTheLedgerComponent,
    DepreciatingFixedAssetsComponent,
    PopAddDepreciatingFixedAssetsComponent,
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
    JournalV2Component,
    TranformSubobjectPipe,
    TranformClassBorderPipe,
    IsObjectEmptyPipe,
    CashreceiptsComponent,
    CashreceiptsAddComponent,
    CashpaymentDetailComponent,
    CashrecieptDetailComponent,
    PurchaseinvoicesDetailComponent,
    InventoryDetailComponent,
    SalesinvoicesDetailComponent,
    AcctrantsTableComponent,
    SettledinvoicesTableComponent,
    VatinvoicesTableComponent,
    PurchaseinvoicesTableComponent,
    SalesinvoicesTableComponent,
    MACContentComponent,
    AdvancePaymentRequestComponent,
    AdvancePaymentRequestAddComponent,
    AdvancePaymentRequestDetailComponent,
    AdvancePaymentRequestTableComponent,
    PaymentOrderComponent,
    PaymentOrderAddComponent,
    ReceiptTransactionsTableComponent,
    ImportEInvoicesComponent,
    ImportinvoicesDetailComponent,
    JournalsAddIdimcontrolComponent,
    GeneralJournalComponent,
    GeneralJournalAddComponent,
    GeneralJournalDetailComponent,
    TempPurchaseinvoicesTableComponent,
    WarehouseTransfersComponent,
    WarehouseTransfersAddComponent,
    WarehouseTransfersDetailComponent,
    TransfersTableComponent,
    AllocationAddComponent,
    AllocationTableComponent,
    CashtransfersAddComponent,
    PeriodicControlComponent,
    FormatDatePipe,
    AssetJournalsComponent,
    AssetJournalsAddComponent,
    CategoriesComponent,
    RunDepreciationComponent,
    NewvoucherComponent,
    ViewresultComponent,
    JournalViewsettingComponent,
    CashCountingsComponent,
    CashCountingsAddComponent,
    AssetCountingsComponent,
    CashtransfersDetailComponent,
    AssetAcquisitionsComponent,
    AssetJournalsDetailComponent,
    AssetsLineTableComponent,
    AssetsTableComponent,
    ChooseJournalComponent,
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
    TranformValueNumberPipe,
    NgbAccordionModule,
    DynamicSettingModule,
    AccordionModule,
  ],
})
export class AcModule {}
