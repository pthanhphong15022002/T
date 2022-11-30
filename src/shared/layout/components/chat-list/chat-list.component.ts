import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
// import { CreateGroupComponent } from '@modules/wp/components/create-group/create-group.component';
import { AuthStore, CallFuncService, DataRequest } from 'codx-core';
import { ChatBoxInfo } from '../chat.models';
import { ChatService } from '../chat.service';
import { CreateGroupComponent } from '../create-group/create-group.component';

@Component({
  selector: 'codx-chat-list',
  templateUrl: 'chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})

export class ChatListComponent implements OnInit, AfterViewInit {
  @ViewChild('historyListEle') historyListObj: any;
  @ViewChild('searchListEle') searchListObj: any;
  @ViewChild('searchbar') searchbar: any;
  user: any;
  constructor(
    private chatService: ChatService,
    authStore: AuthStore,
    private callfc: CallFuncService
  ) {
    this.user = authStore.get();
  }
  ngAfterViewInit(): void {
    if (this.historyListObj) {
      this.historyListObj.SearchText = this.user.userID;
      this.historyListObj.options.page = 1;
      this.historyListObj.options.pageLoading = true;
      this.historyListObj.loadData();
    }
  }

  toolbarButtonMarginClass = 'ms-1 ms-lg-3';
  toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px';
  toolbarButtonIconSizeClass = 'svg-icon-1';
  isFiltering = false;
  filterValue = undefined;

  ngOnInit() {
    this.chatService.receiveMessage.subscribe((mesInfo: any) => {
      // Thông tin của box
      // Lúc nào sender của box cũng phải là current user
      // Người còn lại sẽ là userId và userName
      let data = {
        userID: mesInfo.senderId == this.user.userID ? mesInfo.receiverId : mesInfo.senderId,
        userName: mesInfo.senderId == this.user.userID ? this.user.userName : mesInfo.senderName,
        groupId: mesInfo.groupId,
        groupType: mesInfo.groupType,
        senderId: this.user.userID,
        message: mesInfo
      };
      this.openChatBox(data);
    });

    this.chatService.readMessage.subscribe((data) => {
      let groupId = data.groupId;
      // cập nhật danh sách not read
    });

    this.getChatHistory();
    this.getNumberMessageNotRead();
  }

  getChatHistory() {

  }

  resetFilterOptions() {

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

  filterGroup(event: any) {

  }

  receiveMessage() {

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
    this.chatService.openChatBox(opt);
  }

  getNumberMessageNotRead() {

  }

  openChange(event: any) {
    if (event == false) {
      this.isFiltering = false;
      this.searchbar.onClear();
    }
  }

  historyItemClicked(data) {
    this.openChatBox({
      userID: data.colabId,
      userName: data.colabName,
      groupId: data.groupID,
      groupType: data.groupType,
      message: data
    });
  }

  openCreategroupForm() {
    this.callfc.openForm(CreateGroupComponent, "Tạo nhóm chat", 800, 600);
  }
}
