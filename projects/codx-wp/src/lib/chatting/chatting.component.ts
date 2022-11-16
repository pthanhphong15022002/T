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
import { ApiHttpService, AuthStore } from 'codx-core';
import { ChatService } from './chat.service';
import { ChatBoxInfo } from './chat.models';
import { group } from 'console';
import { ChatVoteComponent } from './chat-vote/chat-vote.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';

import { SignalRService } from '@core/services/signalr/signalr.service';


import { environment } from 'src/environments/environment';
import { PopupViewImageComponent } from './popup-view-image/popup-view-image.component';
//------------

@Component({
  selector: 'lib-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.css'],
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
  @Input() objectId: string = '';

  
  //@Input() objectID: string = '';

/*   titleAttach = "Đính Kèm";
  titleSendMail = "Gửi Mail";
  titleShare = "Chia Sẻ"; */
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
  objIndex: any;
  message: string;
  groupType: any;

  pageSize = 20;
  pageIndex = 0;
  isFull = false;
  clickCheck = false;
  public searchCheck = false;
  public searchMessCheck = false;
  titleRef = 'Đang trả lời ';
  refName = '';
  refIDPost = '00000000-0000-0000-0000-000000000000';
  refContent = '';

  userId : any;
  SignalrMess : any[] = [];
  countSignalr = 0;
  countSignalr1 = 0;
  sodem1 = 0;
  sodem2 = 0;
  refID: any;


  tags = '';
  callFC: any;

  datenow: any;

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
    private signalrService: SignalRService,//Signalr
    private  inject: Injector,//service mở cửa sổ
    
    private chatService: ChatService,

    ////private override api: ApiHttpService,//
    
    public dmSV: CodxDMService,
    private auth: AuthService,
    //private callFC:CallFuncService,

    private element: ElementRef, //
    // private chatService: ChatService,//
    private changeDetectorRef: ChangeDetectorRef,//
    authStore: AuthStore,//

    
  ) 
  {
    super(inject);
    this.user = authStore.get(); //boxchat
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRightRef,
          panelLeftRef: this.tmpSearch,
        },
      },
    ];

    

      this.signalrService.signalChat.subscribe(res=>{

        console.log('tin nhan ne',res);
        //this.SignalrMess = res;
        if(this.countSignalr == 0){
          this.chatMessages.push(res);
          this.detectorRef.detectChanges();
          //this.SignalrMess = [];
          this.countSignalr ++ ;
        }else{
          this.countSignalr = 0;
        }
        
      })
      this.signalrService.signalDelChat.subscribe(res=>{
        //this.SignalrMess = res;
        if(this.countSignalr == 0){
          console.log('Xoa tin nhan ne',res);
          
          this.objIndex = this.chatMessages.findIndex((obj => obj.messageId == res.messageId));

          console.log("Before update: ", this.chatMessages[this.objIndex])

          this.chatMessages[this.objIndex].messageType = "5";

          console.log("After update: ", this.chatMessages[this.objIndex])

          //res.messageType = 5;
          //this.chatMessages.push(res);
          this.detectorRef.detectChanges();
          //this.SignalrMess = [];
          this.countSignalr ++ ;
        }else{
          this.countSignalr = 0;
        }
        //this.SignalrMess = res;
        
        //res.message = this.mesDelete;
        
      })

      this.signalrService.signaDataVote.subscribe(rest1=>{
        if(this.countSignalr == 0){
          
          this.objIndex = this.chatMessages.findIndex((obj => obj.messageId == rest1.messageId));
          console.log('vote nek',rest1);
        this.signalrService.signalVote.subscribe(res1=>{
          // console.log('vòng 2',this.sodem2);
          if(this.sodem2 == 0){
          this.signalrService.signalVoteType.subscribe(res2=>{
          // if(this.countSignalr1 <= 2 ){
            this.chatMessages[this.objIndex].votes = res1[0];
            this.chatMessages[this.objIndex].totalVote = res1[1];
            this.chatMessages[this.objIndex].listVoteType = res1[2];
            if (res2 == this.chatMessages[this.objIndex].myVotedType) {
              this.chatMessages[this.objIndex].myVotedType = null;
              this.chatMessages[this.objIndex].myVoted = false;
              this.checkVoted = false;
            } else {
              this.chatMessages[this.objIndex].myVotedType = res2;
              this.chatMessages[this.objIndex].myVoted = true;
              this.checkVoted = true;
            }
          //    this.countSignalr1 ++ ;
          // }
        })
        this.sodem2 ++;
      }
        
        })
        this.countSignalr ++
      
        this.changeDetectorRef.detectChanges();
        // }
        }else{
        this.countSignalr = 0;
        // this.countSignalr1 = 0;
        this.sodem2 =0;
      }
      
      // else{
          
      })
      

      this.signalrService.signalGroup.subscribe(res=>{
        console.log('group ne ',res);
        if(this.countSignalr == 0){
        this.view.dataService.add(res,0).subscribe();
        this.groupId = res.groupID;
        //this.view.dataService.add(resp.event,0).subscribe();
          //this.SignalrMess = [];

          // this.signalrService.signalFileMess.subscribe(res=>{
          //   console.log('file ne ',res);
          //   debugger;
          //     this.objectId = res.recID;
          //     this.objectType = res.referType;
          // })
          this.countSignalr ++ ;
        }else{
          this.countSignalr = 0;
        }
        
      })
      
      
      
    
  }
  addEmoji(event: any){
    this.message += event.emoji.native;
    this.changeDetectorRef.detectChanges();
  }
  onInit(): void {
    // 1 - start a connection
    this.signalrService.createConnection();
    // 2 - register for ALL relay
    this.signalrService.registerOnServerEvents();
    


    //this.api.execSv("WP","ERM.Business.WP","ChatBusiness","AddChatTestAsync").subscribe();
    this.senderId = this.user.userID; //
    this.senderName = this.user.userName; //
    // this.loadGroupInformation();//
    this.datenow = new Date();
    this.datenow = this.datenow.toLocaleString();

    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
      }
    });
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
      this.changeDetectorRef.detectChanges();
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
          this.files = result;this.SignalrMess
          this.evtGetFiles.emit(this.files); 
          this.dt.detectChanges();
        }
      });
  } */

  clikPopup() {
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm(
      'CreateGroupComponent',
      'Tao nhom chat',
      0,
      0,
      '',
      null,
      '',
      dialogModel
    );
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
     let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    let dialog = this.callfc.openForm(PopupGroupComponent,"Tao nhom chat",0,0,"",null,"",dialogModel);
    dialog.closed.subscribe((resp: any) => {
      if(resp?.event)
      this.signalrService.sendData(resp.event,"NewGroup");
      //this.chatMessages.push(resp);
    })
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
  onLoading($event): void {}

  //============= show chat=================
  loadChatMessages() {
    this.api
      .exec<any>('ERM.Business.WP', 'ChatBusiness', 'LoadMessagesAsync', [
        this.groupId,
        this.pageSize,
        this.pageIndex,
      ])
      .subscribe((resp: any[]) => {
        //debugger;
        if (resp) {
          this.messageList = resp[0];
          let lastEle =
            this.chatMessages.length == 0 ? undefined : this.chatMessages[0];
          let showImage = !lastEle ? true : lastEle.senderId == this.senderId;


          for (let i = 0; i < this.messageList.length; i++) {
            this.messageList[i].showImage = false;
            if (this.receiverId_coppy != this.messageList[i].senderId)
              showImage = true;
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
          
          
        this.detectorRef.detectChanges();
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
    this.changeDetectorRef.detectChanges();

  } else{
    this.messageType = "1";
  }
}
selectGroup(event: any){
//debugger;
}
  async sendMessage() {
    
    //Gọi service gửi tin nhắn
    if(!this.clickCheck && this.messageType != "2") {
      this.refID = this.refIDPost;
      this.refContent = null;
    } 
    //debugger;
    if(this.messageType == "1" || this.messageType == "4"){
      if (!this.message) {
        return;
      }
    }else if(this.messageType == "2"){
      this.refID =  this.refIDPost ;
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
        //
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

        //debugger;
        this.onCloseref();
          if (this.listFileUpload.length > 0) {
            this.attachment.objectId = resp[0].messageId;
            this.attachment.fileUploadList = [...this.listFileUpload];
            resp.files = [...this.listFileUpload];
            (await this.attachment.saveFilesObservable()).subscribe((res: any) => {

              // 3 - subscribe to messages received

              //this.objectId = res.data.objectID;


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
        
          this.signalrService.sendData(resp[0]);//this.allFeedSubscription = 
          //this.chatMessages.push(resp[0]);
          //this.detectorRef.detectChanges();
          this.message="";

      });
  }

  clickrendo(event: any) {
    this.clickCheck = true;
    this.refName = event.senderName;
    this.refContent = event.message;
    this.refID = event.messageId;
    this.messageType = "4";
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
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm(PopupViewImageComponent,null,0,850,null,{ data: event },"",dialogModel);
    
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
      this.signalrService.sendData(event,"DelMessage");
      
      //debugger;
      
    });
        this.detectorRef.detectChanges();
      };
  
groupName = "";
  historyItemClicked(data) {
    //debugger;
    this.groupName = data.groupName;
       
  this.groupId = data.groupID;
  this.groupType = data.groupType;
  //this.changeDetectorRef.detectChanges();

  
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
            
          this.senderId = sender.userID;
          this.senderName = sender.userName;

          }
        })
      }
      
  votePost(data: any, voteType = null) {
    
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "VoteChatPostAsync",
      [data.messageId, voteType])
      .subscribe((res: any) => {
        if (res) {

           this.signalrService.sendVoteData(data,res,voteType,"VoteMessage");
          
           
          
          
          

             
                // data.votes = res[0];
                // data.totalVote = res[1];
                // data.listVoteType = res[2];
                // if (voteType == data.myVotedType) {
                //   data.myVotedType = null;
                //   data.myVoted = false;
                //   this.checkVoted = false;
                // }
                // else {
                //   data.myVotedType = voteType;
                //   data.myVoted = true;
                //   this.checkVoted = true;
                // }
                
          
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




  ngOnChanges() {
    ///** WILL TRIGGER WHEN PARENT COMPONENT UPDATES '**
  }

    searchChanged(event){
      if(event){
        this.searchCheck = true;
        
      }else{
        this.searchCheck = false;
        event = "";
      }
      this.view.dataService.search(event).subscribe();
    }
    searchMess(event){
      if(event){
        this.searchMessCheck = true;
        event.searchMessCheck = true;
        
      }else{
        this.searchMessCheck = false;
        event = "";
      }
      this.view.dataService.search(event).subscribe();
    }
    onClosearchMess(){
      this.searchMessCheck = false;
    }
    onStartSearchMess(){
      this.searchMessCheck = true;
    }
    onClosearch(){

      this.clickCheck = false;
    }
}
