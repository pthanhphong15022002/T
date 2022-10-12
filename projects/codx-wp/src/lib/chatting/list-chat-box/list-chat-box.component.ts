import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ChatConstant } from '../chat.constant';
import { ChatBoxInfo } from '../chat.models';
import { ChatService } from '../chat.service';

@Component({
    selector: 'codx-list-chat-box',
    templateUrl: './list-chat-box.component.html',
    styleUrls: ['./list-chat-box.component.scss']
})
export class ListChatBoxComponent implements OnInit {
    @ViewChild('chatBoxWrap') chatBoxWrap:HTMLElement;
    @ViewChild('chatStackWrap') chatStackWrap:HTMLElement;

    public listChatBoxes: ChatBoxInfo[] = [];
    public listStack: ChatBoxInfo[] = [];

    numberShowStack = ChatConstant.NUMBER_STACK_DISPLAY;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private chatService: ChatService) { }

    ngOnInit(): void {
        var _this = this;
        this.chatService.openChatBoxEvent.subscribe((opt : ChatBoxInfo)=>{
            let inListStack = this.CheckInListStack(opt);
            if(!inListStack){
                // check is showing
                let inListChatBoxes = this.checkInListChatBox(opt);
                if(!inListChatBoxes){
                    // kiem tra list chat co full hay khong
                    if(this.listChatBoxes.length == ChatConstant.NUMBER_CHAT_BOX_DISPLAY){
                        // TH: FULL
                        // => Them vao stack
                        let element = new ChatBoxInfo();
                        element.ownerId = opt.ownerId;
                        element.ownerName = opt.ownerName;
                        element.groupId = opt.groupId;
                        element.groupType = opt.groupType;
                        element.colabId = opt.colabId;
                        element.colabName = opt.colabName;
                        element.isMinimum = false;
                        element.numberNotRead = opt.numberNotRead;
                        element.messageInfo = opt.messageInfo;
                        this.addToStack(element,0);
                    }else{
                        // TH Con Slot
                        // => Tao Element
                        let element = new ChatBoxInfo();
                        element.ownerId = opt.ownerId;
                        element.ownerName = opt.ownerName;
                        element.groupId = opt.groupId;
                        element.groupType = opt.groupType;
                        element.colabId = opt.colabId;
                        element.colabName = opt.colabName;
                        element.isMinimum = false;
                        element.numberNotRead = opt.numberNotRead;
                        element.messageInfo = opt.messageInfo;
                        this.addToListChatBox(element);
                    }
                }
            }else{
                // Thông báo trên stack
                let itemOnStack = this.findOnStack(opt);
                if(itemOnStack){
                    itemOnStack.numberNotRead ++;
                }
            }
            this.changeDetectorRef.detectChanges();
        });
    }

    private addToStack(ele: any, index: number = -1){
        if(index == -1){
            this.listStack.push(ele);
        }
        else{
            this.listStack.splice(index, 0, ele);
        }

        if(this.listStack.length == ChatConstant.NUMBER_STACK_DISPLAY + 1){
            this.numberShowStack = ChatConstant.NUMBER_STACK_DISPLAY + 1;
        }else{
            this.numberShowStack = ChatConstant.NUMBER_STACK_DISPLAY;
        }
    }

    private getFromStack(index: number = 0){
        let element = this.listStack[index];
        this.listStack.splice(index, 1);
        if(this.listStack.length == ChatConstant.NUMBER_STACK_DISPLAY + 1){
            this.numberShowStack = ChatConstant.NUMBER_STACK_DISPLAY + 1;
        }else{
            this.numberShowStack = ChatConstant.NUMBER_STACK_DISPLAY;
        }
        return element;
    }

    private removeFromStack(index: number = 0){
        this.listStack.splice(index, 1);
        if(this.listStack.length == ChatConstant.NUMBER_STACK_DISPLAY + 1){
            this.numberShowStack = ChatConstant.NUMBER_STACK_DISPLAY + 1;
        }else{
            this.numberShowStack = ChatConstant.NUMBER_STACK_DISPLAY;
        }
    }

    private addToListChatBox(ele: any, index: number = -1){
        if(index == -1){
            this.listChatBoxes.push(ele);
        }
        else{
            this.listChatBoxes.splice(index, 0, ele);
        }
    }

    private getFromListChatBox(index: number = 0){
        let element = this.listChatBoxes[index];
        this.listChatBoxes.splice(index, 1);
        return element;
    }

    private removeFromListChatBox(index: number = 0){
        this.listChatBoxes.splice(index, 1);
    }

    private CheckInListStack(ele: ChatBoxInfo) : boolean{
        for(let i = 0; i< this.listStack.length; i++){
            let eleInStack = this.listStack[i];

            // Nếu chat box options có group id
            // Nếu là nhóm chát thì chỉ cần so sánh grpId
            // Ngược lại có thể xuất hiện trường hợp
            // Người dùng mở của số chát mới mà không chát gì sau đó người dùng mới chát ở phía bên kia, 
            // lúc này chỉ cần gán lại thông tin cho chat box 
            if(ele.groupId != null){
                if(ele.groupType != "1")
                {
                    if(ele.groupId == eleInStack.groupId){
                        return true;
                    }
                } else {
                    if(!eleInStack.groupId){
                        if(ele.ownerId == eleInStack.ownerId && ele.colabId == eleInStack.colabId){
                            eleInStack.groupId = ele.groupId;
                            eleInStack.groupType = ele.groupType;
                            return true;
                        }
                    }else{
                        if(ele.groupId == eleInStack.groupId){
                            return true;
                        } 
                    }
                }
            }else{
                if(ele.ownerId == eleInStack.ownerId && ele.colabId == eleInStack.colabId){
                    return true;
                }
            }
        }
        return false;
    }

    private checkInListChatBox(ele: ChatBoxInfo) : boolean{
        for(let i = 0; i< this.listChatBoxes.length; i++){
            let eleInListChatBox = this.listChatBoxes[i];

            // Nếu chat box options có group id
            // Nếu là nhóm chát thì chỉ cần so sánh grpId
            // Ngược lại có thể xuất hiện trường hợp
            // Người dùng mở của số chát mới mà không chát gì sau đó người dùng mới chát ở phía bên kia, 
            // lúc này chỉ cần gán lại thông tin cho chat box 
            if(ele.groupId != null){
                if(ele.groupType != "1")
                {
                    if(ele.groupId == eleInListChatBox.groupId){
                        return true;
                    }
                } else {
                    if(!eleInListChatBox.groupId){
                        if(ele.ownerId == eleInListChatBox.ownerId && ele.colabId == eleInListChatBox.colabId){
                            eleInListChatBox.groupId = ele.groupId;
                            eleInListChatBox.groupType = ele.groupType;
                            return true;
                        }
                    }else{
                        if(ele.groupId == eleInListChatBox.groupId){
                            return true;
                        } 
                    }
                }
            }else{
                if(ele.ownerId == eleInListChatBox.ownerId && ele.colabId == eleInListChatBox.colabId){
                    return true;
                }
            }
        }
        return false;
    }

    private findOnStack(ele: ChatBoxInfo): ChatBoxInfo{
        for(let i = 0; i< this.listStack.length; i++){
            let eleInStack = this.listStack[i];
            if(ele.groupId != null){
                if(ele.groupType != "1")
                {
                    if(ele.groupId == eleInStack.groupId){
                        return eleInStack;
                    }
                } else {
                    if(!eleInStack.groupId){
                        if(ele.ownerId == eleInStack.ownerId && ele.colabId == eleInStack.colabId){
                            eleInStack.groupId = ele.groupId;
                            eleInStack.groupType = ele.groupType;
                            return eleInStack;
                        }
                    }else{
                        if(ele.groupId == eleInStack.groupId){
                            return eleInStack;
                        } 
                    }
                }
            }else{
                if(ele.ownerId == eleInStack.ownerId && ele.colabId == eleInStack.colabId){
                    return eleInStack;
                }
            }
        }
        return undefined;
    }

    private findOnListChatBox(ele: ChatBoxInfo): ChatBoxInfo{
        for(let i = 0; i< this.listChatBoxes.length; i++){
            let eleInListChatBox = this.listChatBoxes[i];
            if(ele.groupId != null){
                if(ele.groupType != "1")
                {
                    if(ele.groupId == eleInListChatBox.groupId){
                        return eleInListChatBox;
                    }
                } else {
                    if(!eleInListChatBox.groupId){
                        if(ele.ownerId == eleInListChatBox.ownerId && ele.colabId == eleInListChatBox.colabId){
                            eleInListChatBox.groupId = ele.groupId;
                            eleInListChatBox.groupType = ele.groupType;
                            return eleInListChatBox;
                        }
                    }else{
                        if(ele.groupId == eleInListChatBox.groupId){
                            return eleInListChatBox;
                        } 
                    }
                }
            }else{
                if(ele.ownerId == eleInListChatBox.ownerId && ele.colabId == eleInListChatBox.colabId){
                    return eleInListChatBox;
                }
            }
        }
        return undefined;
    }

    private findIndexOnListChatBox(ele: ChatBoxInfo): number{
        for(let i = 0; i< this.listChatBoxes.length; i++){
            let eleInListChatBox = this.listChatBoxes[i];
            if(ele.groupId != null){
                if(ele.groupType != "1")
                {
                    if(ele.groupId == eleInListChatBox.groupId){
                        return i;
                    }
                } else {
                    if(!eleInListChatBox.groupId){
                        if(ele.ownerId == eleInListChatBox.ownerId && ele.colabId == eleInListChatBox.colabId){
                            eleInListChatBox.groupId = ele.groupId;
                            eleInListChatBox.groupType = ele.groupType;
                            return i;
                        }
                    }else{
                        if(ele.groupId == eleInListChatBox.groupId){
                            return i;
                        } 
                    }
                }
            }else{
                if(ele.ownerId == eleInListChatBox.ownerId && ele.colabId == eleInListChatBox.colabId){
                    return i;
                }
            }
        }
        return -1;
    }

    public stackItemSelected(index: number = 0){
        let ele = this.getFromStack(index);
        if(this.listChatBoxes.length == ChatConstant.NUMBER_CHAT_BOX_DISPLAY){
            let lastChatBoxEle = this.listChatBoxes.pop();
            this.addToStack(lastChatBoxEle);
        }
        this.listChatBoxes.unshift(ele);
    }

    public minimizeChatBox(index: number = 0){
        let ele = this.getFromListChatBox(index);
        ele.isMinimum = true;
        this.addToStack(ele, 0);
        // Lặp qua danh sách trong stack
        // kiểm tra xem có phần tử nào không minimum hay không
        for(let i = 0; i < this.listStack.length; i++){
            if(!this.listStack[i].isMinimum){
                let eleNotMinimum = this.getFromStack(i);
                this.addToListChatBox(eleNotMinimum);
                break;
            }
        }
    }

    public removeChatBox(index: number = 0){
        this.removeFromListChatBox(index);
        // Lặp qua danh sách trong stack
        // kiểm tra xem có phần tử nào không minimum hay không
        for(let i = 0; i < this.listStack.length; i++){
            if(!this.listStack[i].isMinimum){
                let eleNotMinimum = this.getFromStack(i);
                this.addToListChatBox(eleNotMinimum);
                break;
            }
        }
    }

    public addChatBox(newEle: ChatBoxInfo){
        if(this.listChatBoxes.length == ChatConstant.NUMBER_CHAT_BOX_DISPLAY){
            let lastChatBoxEle = this.listChatBoxes.pop();
            this.addToStack(lastChatBoxEle);
        }
        this.listChatBoxes.unshift(newEle);
    }

    public removeStackItem(index: number = 0){
        this.removeFromStack(index);
    }

    public listStackTrackBy(index: any, ele: ChatBoxInfo){
        let id = ele.groupId ?? "" + "_" + ele.colabId??"";
    }

    public onChatBoxClose(ele: ChatBoxInfo){
        let index = this.findIndexOnListChatBox(ele);
        if(index != -1){
            this.removeChatBox(index);
        }
    }

    public onChatBoxMinimize(ele: ChatBoxInfo){
        let index = this.findIndexOnListChatBox(ele);
        if(index != -1){
            this.minimizeChatBox(index);
        }
    }

    public onGroupIdChange(groupId: string, index: number){
        this.listChatBoxes[index].groupId = groupId;
        this.listChatBoxes[index].groupType = "1";
    }
}
