export class HR_Request{
    recID: string;
    requestName: string;
    category:string;
    dowCode: string;
    orgUnitID: string;
    constructor(recID, requestName, category, dowCode, orgUnitID){
        this.recID = recID;
        this.requestName = requestName;
        this.category = category;
        this.orgUnitID = orgUnitID;
        this.dowCode = dowCode;
    }
}