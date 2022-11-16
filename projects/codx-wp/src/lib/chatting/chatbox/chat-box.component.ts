import {
  Component,
  OnInit,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Optional,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { 
  ApiHttpService, 
  AuthStore, 
  DialogData, 
  DialogModel, 
  UIComponent, 
  ViewModel, 
  ViewType,
} from 'codx-core';
import { ActivatedRoute } from '@angular/router';
import { Post } from '@shared/models/post';

import { CodxOdService } from 'projects/codx-od/src/public-api';
import { ChatVoteComponent } from '../chat-vote/chat-vote.component';
import { ChatService } from '../chat.service';
import { ChattingComponent } from '../chatting.component';
import { PopupViewImageComponent } from '../popup-view-image/popup-view-image.component';

@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent extends UIComponent implements OnInit  {
  @Input() public receiverId: string = ''; // user ID cua nguoi nhan
  @Input() public groupId: string = ''; // grp id cua nhom
  @Input() public groupID: string = ''; // grp id cua nhom
  @Input() public senderId: string = ''; // user id cua nguoi gui
  @Input() receiverName = '';
  @Input() senderName = '';

  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;

  mesDelete = "Tin nhắn đã xóa";
  titleFunction = "Xóa";

  
  @Input() messageType = '1';
  @Input() objectType: string = '';

  @Output() public close = new EventEmitter();
  @Output() public minimize = new EventEmitter();
  @Output() public groupIdChange = new EventEmitter();

  views: Array<ViewModel> = [];

  chatMessages: any[] = [];
  message: string;
  groupType: any;
  user: any;
  data: any = {};

  pageSize = 40;
  pageIndex = 0;
  isFull = false;
  tags = '';
  callFC: any;
  messageList: any;
  receiverId_coppy: any;

  datenow : any;

  
  userId : any;
  clickCheck = false;
  titleRef = 'Đang trả lời ';
  refName ='';
  refID : any ;
  refContent = '';
  
  lstData: any;

  
  @Input() dVll: any = {};
  chatService: ChatService;
  authStore: AuthStore;
  changeDetectorRef: ChangeDetectorRef;
  element: ElementRef<any>;
  constructor(inject: Injector, private route: ActivatedRoute ,  private codxODService : CodxOdService,@Optional() dt?: DialogData,)
   {
    super(inject);

    this.api = inject.get(ApiHttpService),
    this.element =  inject.get(ElementRef),
    this.chatService = inject.get(ChatService),
    this.changeDetectorRef = inject.get(ChangeDetectorRef),
    this.authStore = inject.get(AuthStore),
    

    this.user = this.authStore.get();
    this.data = dt?.data;
  }

  addEmoji(event: any){
    this.message += event.emoji.native;
    this.changeDetectorRef.detectChanges();
  }
  onInit(): void {
    //this.senderId = this.user.userID;//

    
    this.senderId = this.user.userID;
    this.senderName = this.user.userName;
    
    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
      }
    });

    this.loadGroupInformation();
  }
  // override ngOnInit(): void {
    
  // }
  ngAfterViewInit(): void {
    this.views = [{
      type : ViewType.listdetail,
      active:false,
      sameData:false,
      model:{
        template: this.itemTemplate
      }
    }]
  }
  clickImage(event: any){
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm(PopupViewImageComponent,null,0,850,null,{ data: event },"",dialogModel);
    
  }
  clickShowChatting()
  {
    /* let option = new DialogModel();
    option.IsFull = true;
    this.callFC.openForm(ChattingComponent,"",0,0,"",null,"",option); */
    
  }
  showVotes(data: any) {
    // debugger;
    let object = {
      data: data,
      entityName: "WP_Messages",
      vll: this.dVll
    }
    this.callfc.openForm(ChatVoteComponent, "", 750, 500, "", object);
  }
  votePost(data: any, voteType = null) {
    // debugger;
    // this.api.execSv(
    //   "WP",
    //   "ERM.Business.WP",
    //   "ChatBusiness",
    //   "VoteChatPostAsync",
    //   [data.messageId, voteType])
    //   .subscribe((res: any) => {
    //     debugger;
    //     if (res) {
    //       data.votes = res[0];
    //       data.totalVote = res[1];
    //       data.listVoteType = res[2];
    //       if (voteType == data.myVotedType) {
    //         data.myVotedType = null;
    //         data.myVoted = false;
    //         this.checkVoted = false;
    //       }
    //       else {
    //         data.myVotedType = voteType;
    //         data.myVoted = true;
    //         this.checkVoted = true;
    //       }
    //       this.dt.detectChanges();
    //     }

    //   });
  }
  DelMessage(event: any){
    
    

    if(event.receiverId != null){
      this.userId = event.receiverId
    }else{
      this.userId = event.senderId;
    }
    this.messageType = "5";
    this.api
    .exec<Post>('ERM.Business.WP', 'ChatBusiness', 'DeleteMessageAsync', [
      event.groupId,
      event.messageId,
      this.userId,
      this.messageType,
      this.pageSize,
      this.pageIndex,
      
    ])
    .subscribe((resp: any) => {
      
      if (resp == false) {
        // //Xử lý xóa tin nhắn không thành công
        return;
        
      }

      event.message = this.mesDelete;
      this.detectorRef.detectChanges();
    });


  }
  loadGroupInformation() {
    this.groupId = this.data.data.groupId;

    this.api.exec<any>('ERM.Business.WP', 'ChatBusiness', 'GetGroupInformationAsync', [
        this.groupId,
        this.senderId,
        this.receiverId,
      ])
      .subscribe((resp: any) => {
        if (resp) {
          this.groupId = resp.groupID;
          this.groupType = resp.groupType;
          this.groupIdChange.emit(this.groupId);
          // let sender =
          //   resp.members[0].userID == this.user.userID
          //     ? resp.members[0]
          //     : resp.members[1];
          let receiver =
            resp.members[0].userID != this.user.userID
              ? resp.members[0]
              : resp.members[1];
          this.senderId = this.user.userID /* sender.userID */;
          this.senderName = this.user.userName /* sender.userName */;
          this.receiverId = receiver.userID;
          this.receiverName = receiver.userName;
          this.tags = receiver.tags;

          if(this.groupType == 2){
            this.receiverName = resp.groupName;
          }

          this.changeDetectorRef.detectChanges();
          this.loadChatMessages();
        }
      });
  }

  //Load lịch sử tin nhắn ERM.Business.WP', 'ChatBusiness', 'LoadChatMessagesAsynclick
  loadChatMessages() {
    this.api
      .exec<any>('ERM.Business.WP', 'ChatBusiness', 'LoadMessagesAsync', [
        this.groupId,
        this.pageSize,
        this.pageIndex,
      ])
      .subscribe((resp: any[]) => {
        if (resp) {
          let messageList = resp[0];

          let lastEle =
            this.chatMessages.length == 0 ? undefined : this.chatMessages[0];
          let showImage = !lastEle ? true : lastEle.senderId == this.senderId;

          for (let i = 0; i < messageList.length; i++) {
            messageList[i].showImage = false;
            if (messageList[i].senderId == this.senderId) {
              showImage = true;
            } else {
              if (showImage) {
                messageList[i].showImage = true;
                showImage = false;
              }
            }
          }

          this.chatMessages = [...messageList, ...this.chatMessages];
          let totalPage = resp[1];
          this.pageIndex++;
          if (this.pageIndex >= totalPage) {
            this.isFull = true;
          }
          this.changeDetectorRef.detectChanges();
        }
      });

      // this.api
      // .exec<any>('ERM.Business.WP', 'ChatBusiness', 'LoadMessagesAsync', [
      //   this.groupId,
      //   this.pageSize,
      //   this.pageIndex,
      // ])
      // .subscribe((resp: any[]) => {
      //   if (resp) {
      //     this.messageList = resp[0];
      //     let lastEle =
      //       this.chatMessages.length == 0 ? undefined : this.chatMessages[0];
      //     let showImage = !lastEle ? true : lastEle.senderId == this.senderId;


      //     for (let i = 0; i < this.messageList.length; i++) {
      //       this.messageList[i].showImage = false;
      //       if(this.receiverId_coppy !=  this.messageList[i].senderId) showImage = true;
      //       if (this.messageList[i].senderId == this.senderId) {
      //         showImage = true;
      //       } else {
      //         if (showImage) {
      //           this.messageList[i].showImage = true;
      //           showImage = false;
      //         }
      //       }
      //       this.receiverId_coppy =  this.messageList[i].senderId;
      //     }
      //     debugger;

      //     this.chatMessages = [...this.messageList, ...this.chatMessages];
      //     let totalPage = resp[1];
      //     this.pageIndex++;
      //     if (this.pageIndex >= totalPage) {
      //       this.isFull = true;
      //     }
          
      //     /* this.changeDetectorRef.detectChanges(); */
      //   }
      // });
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

  async sendMessage() {
    
    //Gọi service gửi tin nhắn
    if(!this.clickCheck && this.messageType != "2") {
      this.refID = '00000000-0000-0000-0000-000000000000';
      this.refContent = null;
    } 
    debugger;
    if(this.messageType == "1" || this.messageType == "4"){
      if (!this.message) {
        return;
      }
    }else if(this.messageType == "2"){
      this.refID =  '00000000-0000-0000-0000-000000000000' ;
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
        this.onCloseref();
        
        //send file
          // if (this.listFileUpload.length > 0) {
          //   this.attachment.objectId = resp[0].messageId;
          //   this.attachment.fileUploadList = [...this.listFileUpload];
          //   resp.files = [...this.listFileUpload];
          //   (await this.attachment.saveFilesObservable()).subscribe((res: any) => {
              
          //     /* if (res) {
          //       if(this.dialogRef?.dataService){
          //         this.dialogRef.dataService.add(result, 0).subscribe();
          //       }
          //       this.notifySvr.notifyCode('WP020');
          //       this.dialogRef.close();
          //     }
          //     else 
          //     {
          //       this.notifySvr.notifyCode('WP013');
          //       this.dialogRef.close();
          //     } */
          //   });
          // }
          // else {
          //   // if(this.dialogRef?.dataService)
          //   // {
          //   //   this.dialogRef.dataService.add(resp, 0).subscribe();
          //   // }
          //   // //this.notifySvr.notifyCode('WP020');
          //   // this.dialogRef.close();
          // }
        


        
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

  onClose(event: any) {
    this.close.emit(event);
  }
  onCloseref(){
    this.clickCheck = false;
  }

  onMinimize(event: any) {
    this.minimize.emit(event);
  }
}
