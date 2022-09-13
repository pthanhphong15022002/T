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
  shortConent: string;
  createdBy:string;
  createdName:string;

  constructor(){
    this.createdOn = new Date();
    this.permissions = [];
    this.files = [];
    this.listComment = [];

}

}
