import { Util } from "codx-core";
import { Permission } from "./file.model";

export class Post {
  id: string;
  recID:string;
  connectId: string;
  user:any;
  userID: string;
  userName: string;
  status: string;
  content: string;
  approveControl:string;
  permissions:Permission[];
  thumb: string;
  title: string;
  subDescription: string;
  postType: string;
  category: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  refID: string;
  refType: string;
  shareControl: string;
  objectType: string;
  createdOn: Date;
  modifiedOn: string;
  modifiedBy: string;
  picture: string;
  votes:any[];
  voted: boolean;
  totalComment: number = 0;
  totalVote: number = 0;
  totalSubComment: number = 0;
  listComment: any[];
  totalGift: number = 0;
  totalPoint: number = 0;
  parentID:string ="";
  totalRecord: number = 0;
  tags: string;
  listTag:any[];
  listShare:any[];
  shares:any;
  news:any;
  card: any;
  share: any;
  shareName: string;
  tagName:string;
  shortConent: string;
  createdBy:string;
  createdName:string;
  subject:string;
  subContent:string ;
  medias:number ;
  attachments:number ;
  myVoteType:string;
  myVoted:string;
  listVoteType:string;
  newsType:string;
  startDate:Date;
  endDate:Date;
  contents:string;
  image:number;
  approveStatus:string
  approveLevels:string;
  approver:string;
  approveOn:Date;
  autoCreate:boolean;
  views:number;
  createPost:boolean;
  allowShare:boolean;
  stop:boolean;
  isActive:boolean;


  constructor(){
    this.recID = Util.uid();
    this.shareControl = "9";
    this.permissions = [];
    this.listComment = [];
    this.medias = 0;
    this.attachments = 0;
    this.totalComment = 0;
    this.votes = [];
    this.image = 0;
    this.allowShare = false;
    this.createPost = false;
    this.contents = "";
    this.permissions = [];
    this.startDate = new Date();
    this.endDate = null;
    this.views = 0;
    this.news = null;
    this.shares = null;
    this.user = null;
    this.createdOn = new Date();
}

}
