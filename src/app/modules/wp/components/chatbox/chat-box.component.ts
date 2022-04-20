import { Component, OnInit, ElementRef } from '@angular/core';
import { Post } from '@shared/models/post';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
  public receiverId: string = ''; // user ID cua nguoi nhan
  public groupId: string = ''; // grp id cua nhom
  private senderId: string = ''; // user id cua nguoi gui

  chatHistory: any;
  historyData: any[] = [];
  message: string;

  constructor(private api: ApiHttpService, private element: ElementRef) {
    this.element.nativeElement;
    this.chatHistory = {
      page: 1,
      pageSize: 50,
      isFull: false,
    };
  }

  ngOnInit(): void {
    // load lich su chat
    this.loadHistory();
  }

  //Load lịch sử tin nhắn
  loadHistory() {
    this.api.exec<any>('ERM.Business.WP', 'ChatBusiness', 'LoadMessageAsync');
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
      from: this.senderId,
      to: this.receiverId,
      groupId: this.groupId,
      message: this.message,
    });
  }
}
