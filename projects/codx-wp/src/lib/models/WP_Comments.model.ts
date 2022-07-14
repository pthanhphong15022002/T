import { Permission } from "@shared/models/file.model";

export class WP_Comments{
    recID:string;
    refID:string;
    comments:string;
    category:string;
    fileName:string;
    fileType:string;
    fileSize:string;
    parentID:string;
    refType:string;
    votes:any;
    shareControl:string;
    permissions: Permission[];
    approveControl:string;
    approveStatus:string;
    approveLevels:string;
    appover:string;
    approveOn:Date;
    stop:boolean;
    publishOn:Date;
    createdName:string;
    positionName:string;
    orgUnitName:string;
    createdOn:Date;
    createdBy:string;
    modifiedOn:Date;
    modifiedBy:string;
    content:string;
    isUpload:boolean;
    files:any[];

    constructor(){
        this.createdOn = new Date();
        this.files = [];
        this.isUpload = false;
    }
}