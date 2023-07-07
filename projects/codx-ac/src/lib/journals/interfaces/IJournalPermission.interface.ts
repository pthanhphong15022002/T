export interface IJournalPermission {
    recID: string;
    journalNo: string;
    roleType: string;
    objectType: string;
    objectID: string;
    add: boolean | string;
    read: string;
    edit: string;
    delete: string;
    assign: string;
    share: string;
    approval: string;
    post: boolean | string;
    unPost: string;
    startDate: string | null;
    endDate: string | null;
    note: string;
    stop: boolean;
    createdOn: string;
    createdBy: string;
    modifiedOn: string | null;
    modifiedBy: string;

    objectName?: string;
}