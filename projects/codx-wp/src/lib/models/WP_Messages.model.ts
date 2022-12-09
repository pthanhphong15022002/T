import { Util } from "codx-core";

export class WP_Messages{
    public recID : string;
    public groupID : string;
    public userID : string;
    public status : any[];
    public message : string;
    public messageType : string;
    public fileName : string;
    public fileSize : number;
    public fileType : string;
    public votes : any[];
    public refID : string;
    public refContent : string;
    public createdOn : Date;
    public modifiedOn: Date;
    public modifiedBy: string;
    constructor(){
        this.recID = Util.uid();
        this.groupID = "";
        this.userID = "";
        this.status = [];
        this.message = "";
        this.messageType = "";
        this.fileName = "";
        this.fileSize = 0;
        this.fileType = "";
        this.votes = [];
        this.refID = "";
        this.refContent = "";
        this.createdOn = new Date();
        this.modifiedBy = "";
        this.modifiedOn = null;
    }
}