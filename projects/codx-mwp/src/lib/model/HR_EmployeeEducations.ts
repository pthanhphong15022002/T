import { DateTime } from "@syncfusion/ej2-angular-charts";
import { Util } from "codx-core";

export class HR_EmployeeEducations{
    public recID:string;
    public employeeID:string;
    public courseName:string;
    public educationID:string;
    public institutionID:string;
    public certificateID:string;
    public duration:string;
    public speciality:string;
    public ranking:string;
    public category:string;
    public fromDate:DateTime;
    public toDate:DateTime;
    public expiredOn:DateTime;
    public issuedOn:DateTime;
    public optional:boolean;
    public importance:number;
    public memo:string;
    public memo2:string;
    public note:string;
    public attachment:number;
    public sorting:string;
    public stop:boolean;
    public createdBy:string;
    public createdOn:DateTime;
    public modifiedBy:string;
    public modifiedOn:DateTime;
    public owner:string;
    public BUID:string;
    public positionID:string;
    public orgUnitID:string;
    public divisionID:string;
    public instiutionName:string;
    public cerificateName:string;
    public educationName:string;

    constructor(){
        this.recID = Util.uid();
        this.employeeID = "";
        this.courseName = "";
        this.educationID = "";
        this.institutionID = "";
        this.certificateID = "";
        this.duration = "";
        this.speciality = "";
        this.ranking = "";
        this.category = "";
        this.fromDate = null;
        this.toDate = null;
        this.expiredOn = null;
        this.issuedOn = null;
        this.optional = false;
        this.importance = 0;
        this.memo = "";
        this.memo2 = "";
        this.note = "";
        this.attachment = 0;
        this.sorting = "";
        this.stop = false;
        this.createdBy = "";
        this.createdOn = null;
        this.modifiedBy = "";
        this.modifiedOn = null;
        this.owner = "";
        this.BUID = "";
        this.orgUnitID = "";
        this.positionID = "";
        this.divisionID = "";


    }
}