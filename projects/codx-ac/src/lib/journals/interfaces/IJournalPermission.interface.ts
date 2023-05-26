export interface IJournalPermission {
    recID: string;
    journalNo: string;
    roleType: string;
    objectType: string;
    objectID: string;
    add: string;
    read: string;
    edit: string;
    delete: string;
    assign: string;
    share: string;
    approval: string;
    post: string;
    unPost: string;
    startDate: string | null;
    endDate: string | null;
    note: string;
    stop: boolean;
    createdOn: string;
    createdBy: string;
    modifiedOn: string | null;
    modifiedBy: string;
}