import { 
  Component,
  ViewChild, 
  OnInit,
  TemplateRef,
  Input,
  Output,
  Injector,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
} from '@angular/core';

import {
  ViewType,
  ViewModel,
  UIComponent,
  ButtonModel,
  CallFuncService,
  DialogModel,
  AuthService,
} from 'codx-core';
import { PopupGroupComponent } from './popup-group/popup-group.component';

//-----------
import { Post } from '@shared/models/post';
import { ApiHttpService, AuthStore} from 'codx-core';
import { ChatService } from './chat.service';
import { ChatBoxInfo } from './chat.models';
import { group } from 'console';
import { ChatVoteComponent } from './chat-vote/chat-vote.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';


import { environment } from 'src/environments/environment';
import { PopupViewImageComponent } from './popup-view-image/popup-view-image.component';
//------------


@Component({
  selector: 'lib-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.css']
})
export class ChattingComponent extends UIComponent implements AfterViewInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  //-----------
  @Input() public receiverId: string = ''; // user ID cua nguoi nhan
  @Input() public groupId: string = ''; // grp id cua nhom
  @Input() public groupId_coppy: string = ''; // grp id cua nhom coppy
  @Input() public receiverId_coppy: string = ''; // grp id cua nhom coppy
  @Input() public senderId: string = ''; // user id cua nguoi gui
  @Input() receiverName = '';
  @Input() senderName = '';
  @Input() messageType = '1';
  @Input() files: any[] = [];

  
  @Input() objectType: string = '';

  
  @Input() objectID: string = '';

  titleAttach = "Đính Kèm";
  titleSendMail = "Gửi Mail";
  titleShare = "Chia Sẻ";
  /* titleFunction = "Chức năng mở rộng"; */
  titleFunction = "Xóa";
  mesDelete = "Tin nhắn đã xóa";

  @Output() public close = new EventEmitter();
  @Output() public minimize = new EventEmitter();
  @Output() public groupIdChange = new EventEmitter();
  @Output() addFile = new EventEmitter();

  
  @Output() evtGetFiles = new EventEmitter();
  

  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  file_img_video: any[] = [];
  file_application: any[] = [];
  filesAdd: any[] = [];
  

  chatMessages: any[] = [];
  message: string;
  groupType: any;

  pageSize = 40;
  pageIndex = 0;
  isFull = false;
  clickCheck = false;
  titleRef = 'Đang trả lời ';
  refName ='';
  refID : any ;
  refContent = '';

  userId : any;
  




  tags = '';
  callFC: any;

  datenow : any;

  count = 0;
  public messageList: any[] = [] ;

  
  checkVoted = false;
  @Input() dVll: any = {};
  //------------
 

  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  @ViewChild("panelRightRef") panelRightRef: TemplateRef<any>;
  @ViewChild("tmpSearch") tmpSearch: TemplateRef<any>;

  
  listFileUpload:any[] = [];


  views: Array<ViewModel> = [];
  currView?: TemplateRef<any>;
  
  button?: ButtonModel;
  fileService: any;
  data: any[];
  listFolders: any;
  isSearch: boolean;
  textSearch: any;
  textSearchAll: any;
  predicates: any;
  values: any;
  searchAdvance: boolean;
  totalSearch: number;
  isFiltering: boolean;
  searchListObj: any;
  user: any;
  
  
  lstData: any;
  constructor
  (
    private  inject: Injector,//service mở cửa sổ
    
    private chatService: ChatService,

    ////private override api: ApiHttpService,//
    
    private dmSV: CodxDMService,
    private auth: AuthService,


    private element: ElementRef,//
    // private chatService: ChatService,//
    private changeDetectorRef: ChangeDetectorRef,//
    authStore: AuthStore,//
    private dt:ChangeDetectorRef//vote
  ) 
  {
    super(inject);
    this.user = authStore.get();//boxchat
  }
  ngAfterViewInit(): void {
    this.views = [{
      type : ViewType.listdetail,
      active:true,
      sameData:true,
      model:{
        template: this.itemTemplate,
        panelRightRef: this.panelRightRef,
        panelLeftRef:this.tmpSearch
      }
    }]
  }
  addEmoji(event: any){
    this.message += event.emoji.native;
    this.dt.detectChanges();
  }
  onInit(): void {
    //this.api.execSv("WP","ERM.Business.WP","ChatBusiness","AddChatTestAsync").subscribe();
    this.senderId = this.user.userID;//
    this.senderName = this.user.userName;//
    // this.loadGroupInformation();//
    this.datenow = new Date();
    this.datenow = this.datenow.toLocaleString();

    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
      }
    });
    debugger;
    /* if (this.objectID) {
      this.getFileByObjectID();
    } else {
      this.convertFile();
    } */
  }
  convertFile() {
    if (this.files) {
      this.files.forEach((f: any) => {
        if (f.referType == this.FILE_REFERTYPE.APPLICATION) {
          this.file_application.push(f);
        } else {
          this.file_img_video.push(f);
        }
      });
      this.dt.detectChanges();
    }
  }
/*   getFileByObjectID() {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        this.objectID
      )
      .subscribe((result: any[]) => {
        if (result.length > 0) {
          result.forEach((f: any) => {
            if (this.objectType == 'WP_News') {
              if (f.referType == this.FILE_REFERTYPE.IMAGE) {
                this.file_img_video.push(f);
              }
            } else {
              if (f.referType == this.FILE_REFERTYPE.IMAGE) {
                this.file_img_video.push(f);
              } else if (f.referType == this.FILE_REFERTYPE.VIDEO) {
                f[
                  'srcVideo'
                ] = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.auth.userValue.token}`;
                this.file_img_video.push(f);
              } else {
                this.file_application.push(f);
              }
            }
          });
          this.files = result;
          this.evtGetFiles.emit(this.files); // Sr tk Lộc, tk Nguyên add thêm dòng này để lấy dữ liệu
          this.dt.detectChanges();
        }
      });
  } */

  clikPopup(){
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm("CreateGroupComponent","Tao nhom chat",0,0,"",null,"",dialogModel);
  }
  openFormUploadFile() {
    this.attachment.uploadFile();

  }
  doFilter(event: any) {
    if (event == '') {
      this.isFiltering = false;
      return;
    }
    this.isFiltering = true;
    if (this.searchListObj) {
      this.searchListObj.SearchText = event;
      this.searchListObj.options.page = 1;
      this.searchListObj.options.pageLoading = true;
      this.searchListObj.options['dataValue'] = this.user.userID;
      this.searchListObj.loadData();
    }
  }

  openCreategroupForm() {
     //this.callfc.openForm(CreateGroupComponent, "Tạo nhóm chat", 800, 600);
     let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm(PopupGroupComponent,"Tao nhom chat",0,0,"",null,"",dialogModel);
  }

  viewChanging(event) {
    // this.dmSV.page = 1;
    //this.getDataFile("");
  }
 
  changeView(event) {
    //this.currView = null;
    //this.currView = event.view.model.template2;
    
    
    //  this.data = [];
    //  this.changeDetectorRef.detectChanges();
  }
  onLoading($event): void {
   
  }

  //============= show chat=================
//   loadGroupInformation(data: any) {
//     let opt = new ChatBoxInfo();
//     opt.ownerId = this.user.userID;
//     opt.ownerName = this.user.userName;
//     opt.colabId = data.userID;
//     opt.colabName = data.userName;
//     opt.groupId = data.groupId;
//     opt.groupType = data.groupType;
//     opt.isMinimum = false;
//     opt.numberNotRead = 1;
//     opt.messageInfo = data.message;

// debugger;
// /* if(opt.groupType != "1"){
//   this.receiverId = this.groupId;
// } */
//     this.api.exec<any>('ERM.Business.WP', 'ChatBusiness', 'GetGroupInformationAsync', [opt.groupId, this.senderId, this.receiverId]
//     /* [
//         this.groupId,
//         this.senderId,
//         this.receiverId,
//       ] */)
//       .subscribe((resp: any) => {
//         debugger;
//         if (resp) {
//           let sender;
//           this.groupId = resp.groupID;
//           this.groupType = resp.groupType;
//           this.groupIdChange.emit(this.groupId);
//           // let sender =
//           //   resp.members[0].userID == this.user.userID
//           //     ? resp.members[0]
//           //     : resp.members[1];
//           let receiver =
//             resp.members[0].userID != this.user.userID
//               ? resp.members[0]
//               : resp.members[1];
          
//           // this.count = ;
//           for(let i =0; i< resp.members.length; i++){
//             if(resp.members[i].userID == this.user.userID) sender = resp.members[i]; 
//           } 
//           this.receiverId = receiver.userID;
//           if(this.groupType == 1){
//             this.receiverName = receiver.userName;
//           }else{
//             this.receiverName = resp.groupName;
//           }
          
//           this.senderId = sender.userID;
//           this.senderName = sender.userName;
        
//           this.tags = receiver.tags;
//           // this.changeDetectorRef.detectChanges();
//           this.loadChatMessages();
//         }
//       });
      
      
//   }

  //Load lịch sử tin nhắn
  loadChatMessages() {
    this.api
      .exec<any>('ERM.Business.WP', 'ChatBusiness', 'LoadMessagesAsync', [
        this.groupId,
        this.pageSize,
        this.pageIndex,
      ])
      .subscribe((resp: any[]) => {
        debugger;
        if (resp) {
          this.messageList = resp[0];
          let lastEle =
            this.chatMessages.length == 0 ? undefined : this.chatMessages[0];
          let showImage = !lastEle ? true : lastEle.senderId == this.senderId;


          for (let i = 0; i < this.messageList.length; i++) {
            this.messageList[i].showImage = false;
            if(this.receiverId_coppy !=  this.messageList[i].senderId) showImage = true;
            if (this.messageList[i].senderId == this.senderId) {
              showImage = true;
            } else {
              if (showImage) {
                this.messageList[i].showImage = true;
                showImage = false;
              }
            }
            this.receiverId_coppy =  this.messageList[i].senderId;
            /* this.messageList[i].totalVote = this.messageList[i].votes.length;
            this.messageList[i].listVoteType = this.messageList[i].votes; */
           /*  data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2]; */
          }

          this.chatMessages = [...this.messageList, ...this.chatMessages];
         
          let totalPage = resp[1];
          this.pageIndex++;
          if (this.pageIndex >= totalPage) {
            this.isFull = true;
          }
          
          /* this.changeDetectorRef.detectChanges(); */
        }
      });
  }

  onScroll(event: any) {
    // check scrooll is top
    // and options.isfull false;
    const scroller = this.element.nativeElement.querySelector(
      '#kt_modal_new_address_scroll'
    );
    if (scroller.scrollTop === 0 && this.isFull) {
      this.loadChatMessages();
    }
  }
valueChange(event:any){
  this.message = event.data;
  this.detectorRef.detectChanges();
}
fileAdded(event: any) {
  debugger;
  if (event?.data){
    this.messageType = "2";

    event.data.map((f) => {
      if (f.mimeType.indexOf('image') >= 0) {
        f['referType'] = this.FILE_REFERTYPE.IMAGE;
        let a = this.file_img_video.find((f2) => f2.fileName == f.fileName);
        if (a) return;
        this.file_img_video.push(f);
      } else if (f.mimeType.indexOf('video') >= 0) {
        f['referType'] = this.FILE_REFERTYPE.VIDEO;
        let a = this.file_img_video.find((f2) => f2.fileName == f.fileName);
        if (a) return;
        this.file_img_video.push(f);
      } else {
        f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        let a = this.file_application.find((f2) => f2.fileName == f.fileName);
        if (a) return;
        this.file_application.push(f);
      }
      this.listFileUpload.push(f);
    });
    this.filesAdd = this.filesAdd.concat(event.data);
    this.files = this.files.concat(event.data);
    this.addFile.emit(event.data);
    this.dt.detectChanges();

  } else{
    this.messageType = "1";
  }

  
  
}
  async sendMessage() {
    // (await this.attachment.saveFilesObservable()).subscribe(
    //   (item2: any) => {
    //     if (item2?.status == 0) {
      
    //     } else {

    //     };
    //   }
    // );
    //Gọi service gửi tin nhắn
    if(!this.clickCheck && this.messageType != "2") {
      this.refID = null /* '00000000-0000-0000-0000-000000000000' */;
      this.refContent = null;
      this.messageType = "4";
    } 
    debugger;
    if(this.messageType == "1" || this.messageType == "4"){
      if (!this.message) {
        return;
      }
    }else if(this.messageType == "2"){
      this.refID = null /* '00000000-0000-0000-0000-000000000000' */;
      this.refContent = null;
      if(!this.message) this.message = "";
    }
    
    this.api
      .exec<Post>('ERM.Business.WP', 'ChatBusiness', 'SendMessageAsync', {
        senderId: this.senderId,
        receiverId: this.receiverId,
        groupId: this.groupId,
        message: this.message,
        messageType: this.messageType,
        senderName: this.senderName,
        receiverName: this.receiverName,
        refContent: this.refContent,
        refId: this.refID
      })
      .subscribe(async (resp: any) => {
        
        if (!resp) {
          //Xử lý gửi tin nhắn không thành công
          return;
        }
        // debugger;
        // if (!this.groupId) {
        //   this.groupId = resp[1].groupID;
        //   this.groupType = resp[1].groupType;
        //   this.groupIdChange.emit(this.groupId);
        // }
        // if (this.groupType == '1') {
        //   this.chatService.sendMessage(resp[0], 'SendMessageToUser');
        // } else {
        //   this.chatService.sendMessage(resp[0], 'SendMessageToGroup');
        // }

        debugger;
          if (this.listFileUpload.length > 0) {
            this.attachment.objectId = resp[0].messageId;
            this.attachment.fileUploadList = [...this.listFileUpload];
            resp.files = [...this.listFileUpload];
            (await this.attachment.saveFilesObservable()).subscribe((res: any) => {
              
              /* if (res) {
                if(this.dialogRef?.dataService){
                  this.dialogRef.dataService.add(result, 0).subscribe();
                }
                this.notifySvr.notifyCode('WP020');
                this.dialogRef.close();
              }
              else 
              {
                this.notifySvr.notifyCode('WP013');
                this.dialogRef.close();
              } */
            });
          }
          else {
            // if(this.dialogRef?.dataService)
            // {
            //   this.dialogRef.dataService.add(resp, 0).subscribe();
            // }
            // //this.notifySvr.notifyCode('WP020');
            // this.dialogRef.close();
          }
        


        
        this.chatMessages.push(resp[0]);
        this.detectorRef.detectChanges();
        this.message="";
      });
      
  }

  clickrendo(event: any){
    this.clickCheck = true;
    this.refName = event.senderName;
    this.refContent = event.message;
    this.refID = event.messageId;
  }

  onCloseref(){
    this.clickCheck = false;
  }

  clickvote(event: any){
      //this.callfc.openForm(CreateGroupComponent, "Tạo nhóm chat", 800, 600);
      let dialogModel = new DialogModel();
     dialogModel.DataService = this.view.dataService;
     dialogModel.FormModel = this.view.formModel;
     //this.callfc.openForm(PopupVoteComponent,"Tao nhom chat",0,0,"",null,"",dialogModel);

  }
  clickImage(event: any){
    var option = new DialogModel();

    this.callFC
          .openForm(
            PopupViewImageComponent,
            null,
            0,
            0,
            null,
            { data: event },
            '',
            option
          )
          .closed.subscribe((x) => {
            if (x.event) this.view.dataService.update(x.event).subscribe();
          });

  }
  DelMessage(event: any){
    debugger;
    event;
    if(event.receiverId != null){
      this.userId = event.receiverId
    }else{
      this.userId = event.senderId;
    }
    this.messageType = "5";
    this.api
    .exec<Post>('ERM.Business.WP', 'ChatBusiness', 'DeleteMessageAsync', [
      event.messageId,
      this.userId,
      this.messageType
      
    ])
    .subscribe((resp: any) => {
      
      if (resp == true) {
        // //Xử lý xóa tin nhắn không thành công
        // return;
        //event.message = this.mesDelete;
      }
      // this.chatMessages.push(resp[0]);
      //this.chatMessages = this.chatMessages.filter(x=>x.messageId != event.messageId)
      //this.chatMessages = this.chatMessages;
      this.detectorRef.detectChanges();
    });


  }
groupName = "";
  historyItemClicked(data) {
    debugger;
    this.groupId = data.groupID;
    this.groupName = data.groupName;

    //debugger
    //this.openChatBox();



    // this.loadGroupInformation({
    //   userID: data.colabId,
    //   userName: data.colabName,
    //   groupId: data.groupID,
    //   groupType: data.groupType,
    //   message: data
    // });

      // let opt = new ChatBoxInfo();
      // opt.ownerId = this.user.userID;
      // opt.ownerName = this.user.userName;
      // opt.colabId = data.colabId;
      // opt.colabName = data.colabName;
      // opt.groupId = data.groupID
      // opt.groupType = data.groupType;
      // opt.isMinimum = false;
      // opt.numberNotRead = 1;
      // opt.messageInfo = data;
  
      //this.: data.colabId
       
  this.groupId = data.groupID;
  this.groupType = data.groupType;
  this.changeDetectorRef.detectChanges();

  /* if(opt.groupType != "1"){
    this.receiverId = this.groupId;
  } */
      this.api.exec<any>('ERM.Business.WP', 'ChatBusiness', 'GetGroupInformationAsync', 
      [
        this.groupId, 
        this.senderId, 
        this.receiverId
      ])
        .subscribe((resp: any) => {
          
          if (resp) {
            let sender;
            // this.groupId = resp.groupID;
            this.groupIdChange.emit(this.groupId);
            // let sender =
            //   resp.members[0].userID == this.user.userID
            //     ? resp.members[0]
            //     : resp.members[1];
            let receiver =
              resp.members[0].userID != this.user.userID
                ? resp.members[0]
                : resp.members[1];
            
            
            for(let i =0; i< resp.members.length; i++){
              if(resp.members[i].userID == this.user.userID) sender = resp.members[i]; 
            } 
            this.receiverId = receiver.userID;
            if(this.groupType != "2"){
              this.receiverName = receiver.userName;
            }else{
              this.receiverName = resp.groupName;
            }
            console.log(this.receiverName);
            this.senderId = sender.userID;
            this.senderName = sender.userName;
          
            this.tags = receiver.tags;
            this.changeDetectorRef.detectChanges();
            //debugger;
            
            if(this.count > 0) {
              if(this.groupId_coppy != this.groupId){
                this.chatMessages = [];
                this.pageIndex = 0;
                //this.changeDetectorRef.detectChanges();
              } 
            }
            
            this.loadChatMessages();
            this.groupId_coppy = this.groupId;
            this.count ++ ;
            
          }
        });


   
  }

  votePost(data: any, voteType = null) {
    debugger;
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "VoteChatPostAsync",
      [data.messageId, voteType])
      .subscribe((res: any) => {
        debugger;
        if (res) {
          data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2];
          if (voteType == data.myVotedType) {
            data.myVotedType = null;
            data.myVoted = false;
            this.checkVoted = false;
          }
          else {
            data.myVotedType = voteType;
            data.myVoted = true;
            this.checkVoted = true;
          }
          this.dt.detectChanges();
        }

      });
  }
  showVotes(data: any) {
    debugger;
    let object = {
      data: data,
      entityName: "WP_Messages",
      vll: this.dVll
    }
    this.callfc.openForm(ChatVoteComponent, "", 750, 500, "", object);
  }



  // openChatBox(data: any) {
  //   let opt = new ChatBoxInfo();
  //   opt.ownerId = this.user.userID;
  //   opt.ownerName = this.user.userName;
  //   opt.colabId = data.userID;
  //   opt.colabName = data.userName;
  //   opt.groupId = data.groupId;
  //   opt.groupType = data.groupType;
  //   opt.isMinimum = false;
  //   opt.numberNotRead = 1;
  //   opt.messageInfo = data.message;
    
  //   // this.chatService.openChatBox(opt);
  // }

  ngOnChanges() {
    ///** WILL TRIGGER WHEN PARENT COMPONENT UPDATES '**
  
     console.log("load");
    } 

}
