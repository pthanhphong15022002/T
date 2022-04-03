export class Post {
  id: string;
  connectId: string;
  userID: string;
  userName: string;
  status: string;
  content: string;
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
  createdOn: string;
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
  shared: number = 0;
  card: any;
  shareMode: any[];
  files: any[];
  isPortTal: boolean
  tmp: any;
  share: any;
  shareName: string;
  shortConent: string;
}
