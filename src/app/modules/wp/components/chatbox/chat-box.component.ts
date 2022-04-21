import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { SignalRService } from '@core/services/signalr/signalr.service';
import { Post } from '@shared/models/post';
import { ApiHttpService, AuthStore } from 'codx-core';

@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
  @Input() public receiverId: string = ''; // user ID cua nguoi nhan
  @Input() public groupId: string = ''; // grp id cua nhom
  @Input() public senderId: string = ''; // user id cua nguoi gui

  private receiverName = "Nguyễn Văn A";
  private senderName = "Nguyễn Thị B";

  @Output() public close = new EventEmitter();
  @Output() public minimize = new EventEmitter();
  @Output() public groupIdChange = new EventEmitter();
  chatHistory: any;
  historyData: any[] = [];
  message: string;
  groupType: any;
  user: any;

  constructor(
    private api: ApiHttpService, 
    private element: ElementRef,
    private signalRService: SignalRService,
    authStore: AuthStore) {
    this.element.nativeElement;
    this.chatHistory = {
      page: 1,
      pageSize: 50,
      isFull: false,
    };
    this.user = authStore.get();
  }

  ngOnInit(): void {
    this.senderId = this.user.userID;
    this.senderName = this.user.userName;
    // load lich su chat
    //this.loadHistory();
  }

  //Load lịch sử tin nhắn
  loadHistory() {
    this.api.exec<any>('ERM.Business.WP', 'ChatBusiness', 'LoadMessageAsync').subscribe((res)=>{

    });
  }

  onScroll(event: any) {
    // check scrooll is top
    // and options.isfull false;
    const scroller = this.element.nativeElement.querySelector(
      '#kt_modal_new_address_scroll'
    );
    if (scroller.scrollTop === 0 && this.chatHistory.isFull) {
      this.loadHistory();
    }
  }

  sendMessage() {
    if (!this.message) {
      return;
    }
    //Gọi service gửi tin nhắn
    this.api.exec<Post>('ERM.Business.WP', 'ChatBusiness', 'SendMessageAsync', {
      senderId: this.senderId,
      receiverId: this.receiverId,
      groupId: this.groupId,
      message: this.message,
      messageType: "1",
      senderName: this.senderName,
      receiverName: this.receiverName
    }).subscribe((resp : any)=>{
      if(!resp) 
      {
        //Xử lý gửi tin nhắn không thành công
        return;
      }
      if(!this.groupId){
        this.groupId = resp[1].groupID;
        this.groupType = resp[1].groupType;
        this.groupIdChange.emit(this.groupId)
      }
      if(this.groupType == "1"){
        this.signalRService.sendData(resp[0], "SendMessageToUser");
      }else{
        this.signalRService.sendData(resp[0], "SendMessageToGroup");
      }
    });
  }

  onClose(event: any){
    this.close.emit(event);
  }

  onMinimize(event: any){
    this.minimize.emit(event);
  }
}
