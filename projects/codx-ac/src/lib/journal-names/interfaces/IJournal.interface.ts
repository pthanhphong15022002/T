export interface IJournal {
    recID: string;
    journalNo: string;
    journalDate: string;
    journalName: string;
    journalDesc: string;
    journalDesc2: string;
    journalType: string;
    postedLayer: string;
    periodControl: boolean;
    periodID: string;
    transCount: number;
    transactionText: string;
    direction: string;
    status: string;
    voucherNoFormat: string;
    assignRule: string;
    allowEdited: boolean;
    invoiceType: string;
    invoiceForm: string;
    invoiceSeriNo: string;
    invoiceNo: string;
    invoiceRule: string;
    invoiceName: string;
    invoiceEdited: boolean;
    currencyControl: boolean;
    currencyID: string;
    exchangeRate: number;
    cashBookID: string;
    vATID: string;
    warehouseIssue: string;
    warehouseReceipt: string;
    mixedPayment: any;
    postSubControl: boolean;
    postSubDetail: string;
    objectControl: string;
    settlementRule: string;
    brigdeAcctControl: string;
    drAcctControl: string;
    drAcctID: string;
    crAcctControl: string;
    crAcctID: string;
    diM1Control: string;
    diM2Control: string;
    diM3Control: string;
    dIM1: string;
    dIM2: string;
    dIM3: string;
    iDIMControl: string;
    approval: any;
    approver: any;
    approvedBy: string;
    approvedOn: string | null;
    inUsed: boolean;
    isAllocation: boolean;
    isTransfer: boolean;
    isSettlement: boolean;
    exported: boolean;
    postControl: any;
    qtyControl: boolean;
    assetControl: boolean;
    loanControl: boolean;
    projectControl: boolean;
    inputControl: string;
    invoiceControl: string;
    productionControl: string;
    noteControl: string;
    personalControl: string;
    illegalControl: string;
    attachment: string;
    otherControl: string;
    closed: boolean;
    owner: string;
    bUID: string;
    createdOn: string;
    createdBy: string;
    modifiedOn: string | null;
    modifiedBy: string;
    functionID: string;
    thumbnail: string;
    vatType: string;
    cashPaymentType: string;
    voucherNoRule: string;
    creater: any;
    poster: any;
    unpostControl: any;
    unposter: string;
    unpostTime: number | null;
    sharer: string;
}