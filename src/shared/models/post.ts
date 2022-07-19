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
  shareControl: string
  createdOn: Date;
  modifiedOn: string;
  modifiedBy: string;
  picture: string;
  voted: boolean;
  totalComment: number = 0;
  totalVote: number = 0;
  totalSubComment: number = 0;
  listComment: any[];
  listImage: any[];
  totalGift: number = 0;
  totalPoint: number = 0;
  pageIndex: number = 0;
  totalRecord: number = 0;
  pageSize: number = 10;
  tag: number = 0;
  tags: string;
  shares:any;
  shared: number = 0;
  card: any;
  shareMode: any[];
  isUpload:boolean;
  files: any[];
  isPortTal: boolean
  isPortal:boolean;
  tmp: any;
  share: any;
  shareName: string;
  shortConent: string;
  createdBy:string;
  createdName:string;

  constructor(){
    this.recID = null;
    this.createdOn = new Date();
    this.permissions = [];
    this.isUpload = false;
    this.files = [];

}

}
