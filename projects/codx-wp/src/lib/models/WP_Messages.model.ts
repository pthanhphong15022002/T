import { Util } from "codx-core";

export class WP_Messages{
    public recID : string;
    public groupID : string;
    public userID : string;
    public userName : string;
    public status : any[];
    public message : string;
    public messageType : string;
    public votes : any[];
    public refID : string;
    public refContent : string;
    public createdBy:string;
    public createdOn : Date;
    public modifiedOn: Date;
    public modifiedBy: string;
    constructor(){
        this.recID = "";
        this.groupID = "";
        this.userID = "";
        this.status = null;
        this.userName ="";
        this.message = "";
        this.messageType = "";
        this.votes = null;
        this.refID = "";
        this.refContent = "";
        this.createdBy = "";
        this.createdOn = null;
        this.modifiedBy = "";
        this.modifiedOn = null;
    }
}