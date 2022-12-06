import { Permission } from "@shared/models/file.model";
import { Util } from "codx-core";

export class WP_News{
    public id:string;
    public recID:string;
    public newsType:string;
    public category:string;
    public tags:string;
    public startDate:Date;
    public endDate:Date;
    public subject:string;
    public contents:string;
    public subContent:string
    public image:string;
    public shareControl:string
    public publishControl:string;
    public status:string;
    public approveControl:string
    public approveStatus:string
    public approveLevels:string;
    public approver:string;
    public approveOn:Date;
    public autoCreate:boolean;
    public refType:string;
    public refID:string;
    public permissions:Permission[];
    public views:number;
    public shares:number;
    public createPost:boolean;
    public allowShare:boolean;
    public stop:boolean;
    public isActive:boolean;
    public createdOn:Date;
    public createdBy:string;
    public modifiedOn:Date;
    public modifiedBy:string;
    public shareName:string;


    public constructor(){
        this.recID = Util.uid();
        this.newsType = "";
        this.category = "";
        this.shareControl = "";
        this.subject = "";
        this.subContent = "";
        this.refType = "";
        this.tags = "";
        this.image = "";
        this.allowShare = false;
        this.createPost = false;
        this.contents = "";
        this.permissions = [];
        this.createdOn = new Date();
        this.startDate = new Date();
        this.endDate = null;
        this.createdBy = "";
        this.stop = false;
        this.views = 0;
        this.shares = 0;
        this.shareName = "";
    }
}