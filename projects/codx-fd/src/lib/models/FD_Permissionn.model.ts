export class FD_Permissions{

    public id:string;

    public recID:string;

    public memberType:string = "";

    public userID:string = "";

    public objectType:string = "";

    public objectID:string = "";

    public objectName:string = "";

    public full:boolean = false;

    public read:boolean = false;

    public update:boolean = false;

    public assign:boolean = false;

    public delete:boolean = false;

    public share:boolean = false;

    public upload:boolean = false;

    public download:boolean = false;

    public startDate:Date;

    public endDate:Date;

    public createdOn:Date;

    public createdBy:string = "";

    public modifiedOn:Date = null;

    public owner:string = "";

    public buid:string = "";

    public employeeID:string = "";

    public positionID:string = "";

    public orgUnitID:string = "";

    public departmentID:string = "";

    public divisionID:string = "";

    public companyID:string = "";

    public isActive:boolean = false;

    constructor(){
        
    }
}