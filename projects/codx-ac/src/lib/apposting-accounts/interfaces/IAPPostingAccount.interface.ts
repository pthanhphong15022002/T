export interface IAPPostingAccount {
    id: string;
    recID: string;
    moduleID: string;
    postType: string;
    vendLevel: string;
    vendSelection: string;
    vendType: string;
    itemLevel: string;
    itemSelection: string;
    currencyID: string;
    pmtMethodID: string;
    pmtTermID: string;
    orderPoolID: string;
    payableAcctID: string;
    settledAcctID: string;
    creditLimit: number;
    overdueAmt: number;
    overDueDays: number;
    overDueInvoices: number;
    orderDuplicateDays: number | null;
    sorting: string;
    note: string;
    buid: string;
    createdOn: string;
    createdBy: string;
    modifiedOn: string | null;
    modifiedBy: string;
}