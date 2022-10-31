export class ChatBoxInfo{
    public groupId: string;
    public groupName: string;
    public groupType: string;
    public ownerId: string;
    public ownerName: string;
    public colabId:string;
    public colabName:string;
    public isMinimum: boolean;
    public numberNotRead: number;
    public messageInfo: any;
    public members: any = new Array();
    public menberType: string;
  FormModel: any;
}