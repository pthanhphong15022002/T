import { Util } from "codx-core";
export class WP_Groups{
    public groupID:string;
    public groupName:string;
    public groupType:string;
    public status:string;
    public members:any[];
    public picture:string;
    public lastMssgID:string;
    public createdBy:string;
    public createdOn:Date;
    public modifiedBy:string;
    public modifiedOn:Date;

    constructor()
    {
        this.groupID = Util.uid();
        this.groupName = "";
        this.groupType = "";
        this.status = "";
        this.members = [];
        this.picture = "";
        this.lastMssgID = "";
        this.createdBy = "";
        this.createdOn = new Date();
        this.modifiedBy = "";
        this.modifiedOn = null;
    }
}