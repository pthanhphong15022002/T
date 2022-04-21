import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SignalRService } from '@core/services/signalr/signalr.service';
import { AuthStore, DataRequest } from 'codx-core';
import { ChatBoxInfo } from '../chat.models';
import { ChatService } from '../chat.service';

@Component({
    selector: 'codx-chat-list',
    templateUrl: 'chat-list.component.html',
    styleUrls:['./chat-list.component.scss']
})

export class ChatListComponent implements OnInit {
    @ViewChild('historyListEle') historyListObj:any;
    @ViewChild('searchListEle') searchListObj:any;
    user:any;
    constructor(
        private chatService : ChatService,
        private signalService: SignalRService,
        authStore: AuthStore
    ) { 
        this.user = authStore.get();
    }
    
    toolbarButtonMarginClass = 'ms-1 ms-lg-3';
    toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px';
    toolbarButtonIconSizeClass = 'svg-icon-1';
    isFiltering = false;

    ngOnInit() {
        this.signalService.signalChat.subscribe((mesInfo:any)=>{
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

        this.getNumberMessageNotRead();
    }

    getChatHistory(){
        
    }

    resetFilterOptions() {

    }

    doFilter(event:any){
        this.isFiltering = true;
        if(this.searchListObj){
            this.searchListObj.SearchText = event;
            this.searchListObj.options.page = 1;
            this.searchListObj.options.pageLoading = true;
            this.searchListObj.loadData();
        }
    }

    filterGroup(event: any) {
        
    }

    receiveMessage() {

    }

    openChatBox(data: any){
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

    getNumberMessageNotRead(){

    }
}