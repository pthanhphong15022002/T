import {
  Component,
  OnInit,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Post } from '@shared/models/post';
import { ApiHttpService, AuthStore, DialogModel } from 'codx-core';
import { ChatService } from '../chat.service';
import { ChattingComponent } from '../chatting.component';

@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
  @Input() public receiverId: string = ''; // user ID cua nguoi nhan
  @Input() public groupId: string = ''; // grp id cua nhom
  @Input() public senderId: string = ''; // user id cua nguoi gui
  @Input() receiverName = '';
  @Input() senderName = '';

  @Output() public close = new EventEmitter();
  @Output() public minimize = new EventEmitter();
  @Output() public groupIdChange = new EventEmitter();
  chatMessages: any[] = [];
  message: string;
  groupType: any;
  user: any;

  pageSize = 40;
  pageIndex = 0;
  isFull = false;
  tags = '';
  callFC: any;

  constructor(
    private api: ApiHttpService,
    private element: ElementRef,
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef,
    authStore: AuthStore
  ) {
    this.user = authStore.get();
  }

  ngOnInit(): void {
    this.senderId = this.user.userID;
    this.senderName = this.user.userName;
    this.loadGroupInformation();
  }
  clickShowChatting()
  {
    let option = new DialogModel();
    option.IsFull = true;
    this.callFC.openForm(ChattingComponent,"",0,0,"",null,"",option);
    
  }

  loadGroupInformation() {
    this.api
      .exec<any>('ERM.Business.WP', 'ChatBusiness', 'GetGroupInformationAsync', [
        this.groupId,
        this.senderId,
        this.receiverId,
      ])
      .subscribe((resp: any) => {
        if (resp) {
          this.groupId = resp.groupID;
          this.groupType = resp.groupType;
          this.groupIdChange.emit(this.groupId);
          let sender =
            resp.members[0].userID == this.user.userID
              ? resp.members[0]
              : resp.members[1];
          let receiver =
            resp.members[0].userID != this.user.userID
              ? resp.members[0]
              : resp.members[1];
          this.senderId = sender.userID;
          this.senderName = sender.userName;
          this.receiverId = receiver.userID;
          this.receiverName = receiver.userName;
          this.tags = receiver.tags;
          this.changeDetectorRef.detectChanges();
          this.loadChatMessages();
        }
      });
  }

  //Load lịch sử tin nhắn
  loadChatMessages() {
    this.api
      .exec<any>('ERM.Business.WP', 'ChatBusiness', 'LoadChatMessagesAsync', [
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

  sendMessage() {
    if (!this.message) {
      return;
    }
    //Gọi service gửi tin nhắn
    this.api
      .exec<Post>('ERM.Business.WP', 'ChatBusiness', 'SendMessageAsync', {
        senderId: this.senderId,
        receiverId: this.receiverId,
        groupId: this.groupId,
        message: this.message,
        messageType: '1',
        senderName: this.senderName,
        receiverName: this.receiverName,
      })
      .subscribe((resp: any) => {
        if (!resp) {
          //Xử lý gửi tin nhắn không thành công
          return;
        }
        if (!this.groupId) {
          this.groupId = resp[1].groupID;
          this.groupType = resp[1].groupType;
          this.groupIdChange.emit(this.groupId);
        }
        if (this.groupType == '1') {
          this.chatService.sendMessage(resp[0], 'SendMessageToUser');
        } else {
          this.chatService.sendMessage(resp[0], 'SendMessageToGroup');
        }
      });
  }

  onClose(event: any) {
    this.close.emit(event);
  }

  onMinimize(event: any) {
    this.minimize.emit(event);
  }
}
