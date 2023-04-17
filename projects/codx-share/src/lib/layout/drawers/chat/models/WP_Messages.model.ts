import { DateTime } from "@syncfusion/ej2-angular-charts";
import { Util } from "codx-core";

export class WP_Messages{
    public recID : string;
    public groupID : string;
    public userID : string;
    public userName : string;
    public status : any[];
    public message : string;
    public fileName : string;
    public fileType : string;
    public fileSize : number;
    public messageType : string;
    public votes : any[];
    public refID : string;
    public refType : string;
    public refContent : object;
    public createdBy:string;
    public createdOn : Date;
    public modifiedOn: Date;
    public modifiedBy: string;
    constructor(groupID:string){
        this.recID = Util.uid();
        this.groupID = groupID;
        this.userID = "";
        this.status = null;
        this.userName ="";
        this.message = "";
        this.fileName = "";
        this.fileSize = 0;
        this.fileType = "";
        this.messageType = "";
        this.votes = null;
        this.refID = "";
        this.refType = "";
        this.refContent = null;
        this.createdBy = "";
        this.createdOn = null;
        this.modifiedBy = "";
        this.modifiedOn = null;
    }
}
export class tmpMessage extends WP_Messages{
    public myVote : any;
    public lstVote : any[];
    public isOnline : boolean;
    public jSMessage : any;
    constructor(groupID:string){
        super(groupID);
        this.myVote = null;
        this.lstVote = [];
        this.isOnline = false;
        this.jSMessage = null;
    }
}