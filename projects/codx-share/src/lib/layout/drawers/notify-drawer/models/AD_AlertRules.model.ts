export class AD_AlertRules{
    public recID:string;
    public ruleType:string;
    public tableName:string;
    public fieldName:string;
    public updatedField:string;
    public eventType:string;
    public eventValue:string;
    public description:string;
    public baseOn:string;
    public baseOnFilter:string;
    public baseOnePredicate:string;
    public url:string;
    public dataValue;
    public emailTemplate:string;
    public sendTo:string;
    public sendToObjects:string;
    public smsMessage:string;
    public emailSubject:string;
    public emailBody:string;
    public isAlert:boolean;
    public isMail:boolean;
    public isSMS:boolean;
    public stop:boolean;
    public owner:string;
    public buid:string;
    public createdOn:Date;
    public createdBy:Date;
    public modifiedOn:Date;
    public modifiedBy:string;
    public dataView:string;
    public module:string;
    public ruleNo:string;
    constructor(){
        this.isAlert = false;
        this.isMail = false;
        this.isSMS = false;
    }
}