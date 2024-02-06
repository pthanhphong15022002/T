export class TS_KowDs{
    recID: string;
    employeeID: string;
    kowCode: string;
    dowCode: string;
    dayNum: number;
    groupSal: number;

    constructor(recID, employeeID, dowCode, kowCode, dayNum, groupSal){
        this.recID = recID;
        this.employeeID = employeeID;
        this.kowCode = kowCode;
        this.dayNum = dayNum;
        this.dowCode = dowCode;
        this.groupSal = groupSal;
    }
}