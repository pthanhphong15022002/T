import { Permission } from "@shared/models/file.model";

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
    public objectType:string;

    public constructor(){
        this.permissions = [];
        this.createdOn = new Date();
        this.startDate = new Date();
    }
}