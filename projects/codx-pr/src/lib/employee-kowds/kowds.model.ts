export class Kowds{
    recID: string;
    employeeID: string;
    kowCode: string;
    dowCode: string;
    dayNum: number;

    constructor(recID, employeeID, kowCode, dayNum, dowCode){
        this.recID = recID;
        this.employeeID = employeeID;
        this.kowCode = kowCode;
        this.dayNum = dayNum;
        this.dowCode = dowCode
    }
}