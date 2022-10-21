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
} from 'codx-core';
import { PopupGroupComponent } from './popup-group/popup-group.component';

//-----------
import { Post } from '@shared/models/post';
import { ApiHttpService, AuthStore} from 'codx-core';
import { ChatService } from './chat.service';
import { ChatBoxInfo } from './chat.models';
import { group } from 'console';
//------------


@Component({
  selector: 'lib-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.css']
})
export class ChattingComponent extends UIComponent implements AfterViewInit {

  //-----------
  @Input() public receiverId: string = ''; // user ID cua nguoi nhan
  @Input() public groupId: string = ''; // grp id cua nhom
  @Input() public groupId_coppy: string = ''; // grp id cua nhom coppy
  @Input() public receiverId_coppy: string = ''; // grp id cua nhom coppy
  @Input() public senderId: string = ''; // user id cua nguoi gui
  @Input() receiverName = '';
  @Input() senderName = '';

  titleAttach = "Đính Kèm";
  titleSendMail = "Gửi Mail";
  titleShare = "Chia Sẻ";
  /* titleFunction = "Chức năng mở rộng"; */
  titleFunction = "Xóa";

  @Output() public close = new EventEmitter();
  @Output() public minimize = new EventEmitter();
  @Output() public groupIdChange = new EventEmitter();
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
  //------------
 

  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  @ViewChild("panelRightRef") panelRightRef: TemplateRef<any>;
  @ViewChild("tmpSearch") tmpSearch: TemplateRef<any>;


  views: Array<ViewModel> = [];
  changeDetectorRef: any;
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
  constructor
  (
    private  inject: Injector,//service mở cửa sổ
    
    private chatService: ChatService,

    ////private override api: ApiHttpService,//


    private element: ElementRef,//
    // private chatService: ChatService,//
    private changeDetectorReff: ChangeDetectorRef,//
    authStore: AuthStore//
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

  onInit(): void {
    //this.api.execSv("WP","ERM.Business.WP","ChatBusiness","AddChatTestAsync").subscribe();
    this.senderId = this.user.userID;//
    this.senderName = this.user.userName;//
    // this.loadGroupInformation();//
    this.datenow = new Date();
    this.datenow = this.datenow.toLocaleString();
  }

  clikPopup(){
    let dialogModel = new DialogModel();
    dialogModel.DataService = this.view.dataService;
    dialogModel.FormModel = this.view.formModel;
    this.callfc.openForm("CreateGroupComponent","Tao nhom chat",0,0,"",null,"",dialogModel);
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
          }
//debugger;
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
  sendMessage() {
    if (!this.message) {
      return;
    }
    //Gọi service gửi tin nhắn
    if(!this.clickCheck) {
      this.refID = null /* '00000000-0000-0000-0000-000000000000' */;
      this.refContent = null;
    } 
    //debugger;
    this.api
      .exec<Post>('ERM.Business.WP', 'ChatBusiness', 'SendMessageAsync', {
        senderId: this.senderId,
        receiverId: this.receiverId,
        groupId: this.groupId,
        message: this.message,
        messageType: '1',
        senderName: this.senderName,
        receiverName: this.receiverName,
        refContent: this.refContent,
        refId: this.refID
        
      })
      .subscribe((resp: any) => {
        
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
        
        this.chatMessages.push(resp[0]);
        this.detectorRef.detectChanges();
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
  DelMessage(event: any){
    
    event;
    if(event.receiverId != null){
      this.userId = event
    }else{
      this.userId = event.senderId;
    }
    this.api
    .exec<Post>('ERM.Business.WP', 'ChatBusiness', 'DeleteMessageAsync', [
      event.messageId,
      this.userId
      
    ])
    .subscribe((resp: any) => {
      if (!resp) {
        //Xử lý xóa tin nhắn không thành công
        return;
      }
      // this.chatMessages.push(resp[0]);
      this.chatMessages = this.chatMessages.filter(x=>x.messageId != event.messageId)

      this.detectorRef.detectChanges();
    });


  }

  historyItemClicked(data) {
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
            if(this.groupType == 1){
              this.receiverName = receiver.userName;
            }else{
              this.receiverName = resp.groupName;
            }
            
            this.senderId = sender.userID;
            this.senderName = sender.userName;
          
            this.tags = receiver.tags;
            //this.changeDetectorRef.detectChanges();
            //debugger;
            
            if(this.count >= 1) {
              if(this.groupId_coppy != this.groupId){
                this.chatMessages = [];
                this.pageIndex = 0;
              } 
            }
            
            this.loadChatMessages();
            this.groupId_coppy = this.groupId;
            this.count ++ ;
          }
        });


        
  }



  openChatBox(data: any) {
    let opt = new ChatBoxInfo();
    opt.ownerId = this.user.userID;
    opt.ownerName = this.user.userName;
    opt.colabId = data.userID;
    opt.colabName = data.userName;
    opt.groupId = data.groupId;
    opt.groupType = data.groupType;
    opt.isMinimum = false;
    opt.numberNotRead = 1;
    opt.messageInfo = data.message;
    
    // this.chatService.openChatBox(opt);
  }

  ngOnChanges() {
    ///** WILL TRIGGER WHEN PARENT COMPONENT UPDATES '**
  
     console.log("load");
    } 

}
