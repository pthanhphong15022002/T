import { R } from "@angular/cdk/keycodes";
import { Permission } from "@shared/models/file.model";
import { Util } from "codx-core";
import { timeStamp } from "console";

export class WP_Comments{
    public recID:string
    public comments:string
    public content:string
    public subject:string
    public newsType:string
    public views:number
    public subContent:string
    public contents:string
    public allowShare:boolean
    public category:string
    public fileName:string
    public fileType:string
    public fileSize:number
    public parentID:string
    public refID:string
    public permissions:any
    public refType:any
    public votes:any
    public shareControl:string
    public createdName:string
    public positionName:string
    public orgUnitName:string
    public approveControl:string
    public approveStatus:string
    public approveLevels:string
    public approver:string
    public approverOn:Date
    public stop:boolean
    public publishOn:Date
    public createdOn:Date
    public createdBy:string
    public modifiedOn:Date
    public modifiedBy:string
    public myVoteType:string
    public myVoted:boolean
    public listVoteType:any
    public totalVote:number	
    public isShowComment:boolean
    public isShowShare:boolean
    public totalComment:number
    public listComment:any
    public cardID:string
    public card:string
    public isFeedBack:boolean
    public totalSubComment:number	
    public isShowSubComment:boolean
    public shareIcon:string
    public shareText:string
    public shareName:string
    public listShare:any
    public listTag:any
    public tag:number
    public tagName:string
    public shares:any
    public news:any
    constructor(){
        this.recID = "";
        this.refID = "";
        this.comments = "";
        this.content = "";
        this.contents = "";
        this.category = "";
        this.fileName = "";
        this.fileType = "";
        this.fileSize = 0;
        this.refType = "";
        this.parentID = "";
        this.votes = null;
        this.shareControl = "";
        this.permissions = null;
        this.approveControl = "";
        this.approverOn = null;
        this.approver = ""
        this.approveStatus = "";
        this.approveLevels = "";
        this.stop = false;
        this.publishOn = null;
        this.createdBy = "";
        this.createdName = "";
        this.createdOn = new Date();
        this.modifiedBy = "";
        this.modifiedOn = null;
        this.shareControl = null;
        this.shareName = "";
        this.tagName = "";
        this.tag = 0;
    }
}