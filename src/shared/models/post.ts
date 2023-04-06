import { Util } from "codx-core";
import { Permission } from "./file.model";

export class Post {
  id: string;
  recID:string;
  connectId: string;
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
  shared: number = 0;
  card: any;
  shareMode: any[];
  files: any[];
  isPortal:boolean;
  share: any;
  shareIcon:string;
  shareText:string;
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


  constructor(){
    this.recID = Util.uid();
    this.createdOn = new Date();
    this.permissions = [];
    this.files = [];
    this.listComment = [];
    this.medias = 0;
    this.attachments = 0;
    this.totalComment = 0;
    this.votes = [];

}

}
