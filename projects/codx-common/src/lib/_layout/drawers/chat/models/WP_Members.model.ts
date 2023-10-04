import { Util } from "codx-core";

export class WP_Members{
    public recID : string;
    public userID : string;
    public userName : string;
    public tag : string;
    public menberType : string;
    public createdBy : string;
    public createdOn : Date;
    constructor(){
        this.recID = Util.uid();
        this.userID = "";
        this.userName = "";
        this.tag = "";
        this.menberType = "";
        this.createdBy = "";
        this.createdOn = new Date();

    }
}