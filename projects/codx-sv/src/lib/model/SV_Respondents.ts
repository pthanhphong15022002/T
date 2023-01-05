export class SV_Respondents {
    recID: string;
    transID: string;
    objectType: string;
    objectID: string;
    respondent: string;
    position: string;
    department: string;
    email: string;
    status: string;
    startedOn: Date;
    finishedOn: Date;
    responds: any = [];
    scores: number;
    duration: number;
    pending: boolean;
    createdOn: string;
    createdBy: string;
    modifiedOn: string;
    modifiedBy: string;
}