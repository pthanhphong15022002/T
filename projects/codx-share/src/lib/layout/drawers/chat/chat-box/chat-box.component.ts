import { E } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Input, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef, Output, EventEmitter, ApplicationRef, TemplateRef, EmbeddedViewRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { SignalRService } from '../services/signalr.service';
import { MessageSystemPipe } from './mssgSystem.pipe';
import { WP_Messages, tmpMessage } from '../models/WP_Messages.model';
import moment from 'moment';
import { Permission } from '@shared/models/file.model';
import { map } from 'rxjs';
@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})

export class CodxChatBoxComponent implements OnInit, AfterViewInit{
  @HostListener('click', ['$event'])
  onClick(event:any) {
    this.isChatBox(event.target);
    this.checkActive(this.groupID);
  }
  @Input() groupID:any;
  @Output() close = new EventEmitter<any>();
  @Output() collapse = new EventEmitter<any>();

  funcID:string = "WPT11"
  formModel:FormModel = null;
  grdViewSetUp:any = null;
  moreFC:any = null;
  function:any = null;
  user:any = {};
  arrMessages:any[] = [];
  data:any = null;
  page:number = 0;
  pageIndex:number = 0;
  group:any = null;
  blocked:boolean = false;
  loading:boolean = false;
  messageSystemPipe:MessageSystemPipe = null;
  MESSAGETYPE = {
    TEXT:'1',
    ATTACHMENTS:'2',
    SYSTEM:'3',
    REPLY:'4',
    DELTED:'5'
  }
  emojiMode: 'native' | 'apple' |'facebook' | 'google' | 'twitter' = 'facebook';
  emojiPerLine:number = 7;
  emojiMaxFrequentRows:number = 4;
  emojiReview:boolean = false;
  vllL1480:Array<any> = [];
  isReply:boolean = false;
  mssgReply:any = null;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  mssgDeleted:string = "";
  @ViewChild("chatBoxBody") chatBoxBody:ElementRef<HTMLDivElement>;
  @ViewChild("codxATMImages") codxATMImages:AttachmentComponent;
  @ViewChild("codxATM") codxATM:AttachmentComponent;
  @ViewChild("codxViewFile") codxViewFile:AttachmentComponent;
  @ViewChild("tmpMssgFunc") tmpMssgFunc:TemplateRef<any>;
  @ViewChild("templateVotes") popupVoted:TemplateRef<any>;
  @ViewChild("mssgType5") mssgType5:TemplateRef<any>;
  @ViewChild("tmpViewMember") tmpViewMember:TemplateRef<any>;


  constructor
  (
    private api:ApiHttpService,
    private auth:AuthStore,
    private signalR: SignalRService,
    private notifiSV:NotificationsService,
    private cache:CacheService,
    private callFC:CallFuncService,
    private dt:ChangeDetectorRef,
  ) 
  {
    this.user = this.auth.get();
    this.formModel = new FormModel();
  }


  permissions:any[] = [];
  ngOnInit(): void 
  {
    this.data = new tmpMessage(this.groupID);
    this.getGroupInfo();
    this.getMessage();
    this.getSetting();
    let permisison = new Permission();
    permisison.objectType = "9";
    permisison.objectName = "Everyone";
    permisison.read = true;
    permisison.share = true;
    permisison.download = true;
    permisison.isActive = true
    this.permissions.push(permisison);
  }

  getSetting(){
    if (this.funcID) {
      this.cache.functionList(this.funcID)
      .subscribe((func: any) => {
        if (func) {
          this.function = JSON.parse(JSON.stringify(func));
          this.formModel.funcID = func.functionID;
          this.formModel.entityName = func.entityName;
          this.formModel.formName = func.formName;
          this.formModel.gridViewName = func.gridViewName;
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grdViewSetUp = JSON.parse(JSON.stringify(grd));
                this.dt.detectChanges();
              }
            });
          this.cache
            .moreFunction(func.formName, func.gridViewName)
            .subscribe((mFC: any) => {
              if (mFC) {
                this.moreFC = JSON.parse(JSON.stringify(mFC));
              }
            });
        }
      });
    }

    let valuelist = this.cache.valueList("L1480").subscribe((vll:any) => {
      if(vll?.datas){
        this.vllL1480 = vll.datas;
      }
      valuelist.unsubscribe();
    });
    let mssgDelete = this.cache.message("CHAT002").subscribe((res:any) => {
      this.mssgDeleted = res.defaultName;
      mssgDelete.unsubscribe();
    });
  }
  ngAfterViewInit(): void {
    //receiver message
    this.signalR.chat.subscribe((res:any) => {
      if(res && res.groupID == this.groupID)
      {
        let mssg = res.mssg;
        let action = res.action;
        if(mssg && action)
        {
          if(action === "deletedMessage"){
            let index = this.arrMessages.findIndex(x => x.recID == mssg);
            if(index != -1){
              this.arrMessages[index].messageType = "5";
            }
          }
          else
          {
            this.group.lastMssgID = mssg.recID;
            this.group.messageType = mssg.messageType;
            if(res.messageType !== "3"){
              this.group.message = mssg.message;
            }
            this.arrMessages.push(mssg); 
            setTimeout(()=>{
              this.chatBoxBody.nativeElement.scrollTo(0,this.chatBoxBody.nativeElement.scrollHeight);
            },100)
          }
          this.dt.detectChanges();
        }
      }
    });
    //vote message
    this.signalR.voteChat.subscribe((res:any) => {
      if(res){
        let vote = res.vote;
        if(vote.groupID == this.groupID){
          let mssg = this.arrMessages.find(x => x.recID == vote.mssgID );
          if(mssg){
            let index = mssg.votes.findIndex(x => x.createdBy == vote.createdBy);
            if(index != -1){
              if(mssg.votes[index].voteType == vote.voteType) // remove
                this.updateVote(mssg,vote,"remove");
              else // update
                this.updateVote(mssg,vote,"update");
            }
            else // add
              this.updateVote(mssg,vote,"add");
          }
        }
      }
      
    });
  }

  // CRUD vote
  updateVote(mssg:any,vote:any,type:string){
    //add
    if(type == "add"){
      if(!mssg.lstVote){
        mssg.lstVote = [];
      }
      let index = mssg.lstVote.findIndex(x => x.voteType == vote.voteType);
      if(index != -1){
        mssg.lstVote[index].count++;
      }
      else
      {
        let newVote = {
          voteType : vote.voteType,
          count : 1
        };
        mssg.lstVote.push(newVote);
      }
      let tmpVote = {
        voteType : vote.voteType,
        createdBy: vote.createdBy
      };
      if(!mssg.votes)
      {
        mssg.votes = [];
      }
      mssg.votes.push(tmpVote);
      if(this.user.userID == vote.createdBy)
      {
        mssg.myVote = tmpVote;
      }
    }
    //remove
    else if(type =="remove")
    {
      let index = mssg.lstVote.findIndex(x => x.voteType == vote.voteType);
      if(index != -1)
      {
        mssg.lstVote[index].count <= 1 ?  mssg.lstVote.splice(index,1): mssg.lstVote[index].count--;
      }
      if(this.user.userID == vote.createdBy)
      {
        mssg.myVote = null;
      }
      let i = mssg.votes.findIndex(x => x.createdBy == vote.createdBy); 
      mssg.votes.splice(i,1);
    }
    //update
    else
    {
      let oldVote = mssg.votes.find(x => x.createdBy == vote.createdBy);
      let indexOld = mssg.lstVote.findIndex(x => x.voteType == oldVote.voteType);
      let indexNew = mssg.lstVote.findIndex(x => x.voteType == vote.voteType);
      if(indexOld != -1)
      {
        mssg.lstVote[indexOld].count <= 1 ?  mssg.lstVote.splice(indexOld,1): mssg.lstVote[indexOld].count--;
      }
      if(indexNew != -1){
        mssg.lstVote[indexNew].count++;
      }
      else
      {
        let newVote = {
          voteType : vote.voteType,
          count : 1
        };
        mssg.lstVote.push(newVote);
      }
      if(this.user.userID == vote.createdBy)
      {
        mssg.myVote.voteType = vote.voteType;
      }
      let index = mssg.votes.findIndex(x => x.createdBy == vote.createdBy);
      mssg.votes[index].voteType = vote.voteType;
    }
    this.dt.detectChanges();
  }
  // get group infor
  getGroupInfo(){
    this.api.execSv("WP","ERM.Business.WP","GroupBusiness","GetGroupByIDAsync",[this.groupID])
    .subscribe((res:any) => {
      if(res){

        this.group = res;
        this.data.groupID = res.groupID;
        this.crrMembers = Array.from<any>(res.members).map(x => x.userID).join(";");
      }
    })
  }
  // get history chat
  getMessage(){
    this.loading = true;
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "GetMessageAsync",
      [this.groupID,this.pageIndex])
      .subscribe((res:any[]) => {
        let data = Array.from<any>(res[0]);
        if(data.length > 0)
          this.arrMessages = data.reverse();
        this.page = Math.ceil(res[1]/20);
        this.pageIndex++;
        this.loading = false;
        this.dt.detectChanges();
      });
  }
  // scroll up load data
  scroll(element:HTMLElement){
    if(!this.loading && element.scrollTop <= 100){
      this.getHistoryChat();
    }
  }

  // get list chat
  getHistoryChat(){
    if(this.pageIndex <= this.page){
      this.loading = true;
      this.pageIndex++;
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "ChatBusiness",
        "GetMessageAsync",
        [this.group.groupID,this.pageIndex])
        .subscribe((res:any[]) => {
          let data = Array.from<any>(res[0]).reverse();
          if(data.length > 0){
            this.arrMessages = data.concat(this.arrMessages);
          }
          this.loading = false;
          this.dt.detectChanges();
        });
    }
  }
  // close 
  closeChatBox(){
    this.close.emit();
  }

  // send message
  sendMessage(){
    if(!this.blocked)
    {
      this.blocked = true;
      if(this.data.message?.trim())
      {
        this.data.messageType = this.data.refID ? "4" : "1";
        this.signalR.sendData("SendMessageToGroup",JSON.stringify(this.data));
        this.data = new tmpMessage(this.groupID);
        this.isReply = false;
        this.mssgReply = null;
        this.blocked = false;
      }
      else this.blocked = false;
      this.dt.detectChanges();
    }
  }
  // check active
  checkActive(id:string){
    if(id){
      let _elementSelected = document.getElementById(id);
      if(!_elementSelected?.classList.contains("active")){
        _elementSelected?.classList.add("active");
        let _arrElement = document.getElementsByTagName("codx-chat-box");
        if(Array.isArray(_arrElement)){
          Array.from(_arrElement).forEach(e => {
            if(e.id !== id && e.classList.contains("active")){
              e.classList.remove("active");
              return;
            }
          });
        }
      }
    }
  }
  // check tag name 
  isChatBox(element:HTMLElement){
  if(element.tagName == "CODX-CHAT-BOX")
  {
    if(!element.classList.contains("active"))
      element.classList.add("active");
    return;
  }
  else
    this.isChatBox(element.parentElement);
  }
  // collapse box chat
  collapsed(){
    this.collapse.emit(this.groupID);
  }
  // add emoji
  addEmoji(event){
    this.data.message += event.emoji.native; 
  }

  // click upload files
  clickUploadFiles(){
    if(this.codxATM){
      this.codxATM.uploadFile();
    }
  }

  // click upload images
  clickUploadImages(){
    if(this.codxATMImages)
    {
      this.codxATMImages.uploadFile();
    }
  }
  // add files
  addFiles(event:any){
    if(Array.isArray(event?.data)){
      let files = Array.from<any>(event.data);
      let message = new tmpMessage(this.groupID);
      files.map((x) => {
        if(x.mimeType.includes('image')){
          x["source"] = x.avatar;
          x['referType'] = this.FILE_REFERTYPE.IMAGE;
        }
        else if(x.mimeType.includes('video')){
          x['source'] = x.data.changingThisBreaksApplicationSecurity;
          x['referType'] = this.FILE_REFERTYPE.VIDEO;
        }
        else{
          x['referType'] = this.FILE_REFERTYPE.APPLICATION;
        }
      });
      this.codxATM.objectId = message.recID;
      
      this.codxATM.saveFilesMulObservable()
      .subscribe((res:any)=>{
        if(res){
          message.message = "";
          message.messageType = "2";
          files.forEach(x => {
            message.recID = x.objectID;
            message.fileName = x.fileName;
            message.fileSize = x.fileSize;
            message.fileType = x.referType;
            this.signalR.sendData("SendMessageToGroup",JSON.stringify(message));
          });
        }
        else
          this.notifiSV.notify("SYS019");
      })
    }
  }
  // add files image
  addFileImages(event:any){

    if(Array.isArray(event?.data)){
      let images = Array.from<any>(event.data);
      let message = new tmpMessage(this.groupID);
      message.message = "";
      message.messageType = "2";
      images.forEach((f) => {
        f["source"] = f.avatar;
        f['referType'] = this.FILE_REFERTYPE.IMAGE;
      });
      if(images.length == 1){
        message.fileName = images[0].fileName;
        message.fileSize = images[0].fileSize;
        message.fileType = images[0].referType;
      }
      else
      {
        // 'm' không cho reply vì multi files
        message.refType = 'm';
      }
      this.codxATMImages.objectId = message.recID; 
      this.codxATMImages.saveFilesMulObservable()
      .subscribe((res:any) => {
        if(res)
          this.signalR.sendData("SendMessageToGroup",JSON.stringify(message));
        else
          this.notifiSV.notify("SYS019");
      });
    }
  }

  // click files 
  clickViewFile(file){
    let option = new DialogModel();
      option.FormModel = this.formModel;
      option.IsFull = true;
      option.zIndex = 999;
      this.callFC.openForm(
        ViewFileDialogComponent,
        '',
        0,
        0,
        '',
        file,
        '',
        option
      );
  }

  // handle tooltip emoji mssg
  openTooltipEmoji(tooltip:any,mssg:any){
    tooltip.isOpen() ? tooltip.close() : tooltip.open({ mssg });
  }
  // click vote mssg
  clickVoteMssg(mssg:any,vote:any){
    this.signalR.sendData("VoteMessage",this.groupID,mssg.recID,vote.value);
    this.dt.detectChanges();
  }

  replyTo:string = "";
  // reply message
  clickReplyMssg(mssg:any = null){
    this.isReply = mssg ? true : false;
    this.mssgReply = mssg;
    if(mssg)
    {
      this.data.refID = this.mssgReply.recID;
      this.data.refContent = {
        type:this.mssgReply.messageType,
        content:this.mssgReply.message,
        createdName:this.mssgReply.createdName
      } 
      if(this.mssgReply.messageType == "2")
      {
        this.data.fileName = this.mssgReply.fileName;
        this.data.fileSize = this.mssgReply.fileSize;
        this.data.fileType = this.mssgReply.fileType;
      }
      this.replyTo = 'Đang trả lời ';
      if(mssg.createdBy != this.user.userID)
      {
        this.replyTo += mssg.createdName;
      }
    }
    else
    {
      this.data.refID = "";
      this.data.fileName = "";
      this.data.fileSize = 0;
      this.data.fileType = "";
      this.data.refContent = null;
    }
  }
  // format file size 
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // group by tin nhắn theo ngày
  checkDate(index:number){
    var mssg1 = this.arrMessages[index];
    var mssg2 = this.arrMessages[index+1];
    if(mssg1 && mssg2){
      let a = moment(mssg2.createdOn).diff(moment(mssg1.createdOn),"days");
      return a > 0;
    }
    return false;
  }

  //
  showCBB:boolean = false;
  width:number = 720;
  height:number = window.innerHeight;
  crrMembers:string = "";
  addMemeber(event:any){
    if(event && event.id && event.text){
      let arrUserID = event.id.split(";");
      let arUserName = event.text.split(";");
      let lstMemberID = this.crrMembers.split(";");
      let members = [];
      let index = 0;
      arrUserID.forEach((e,i) => {
        if(!lstMemberID.includes(e))
        {
          members[index] = { userID:arrUserID[i], userName:arUserName[i] };
          index++;
        }
      });
      this.crrMembers = event.id;
      this.signalR.sendData("AddMemberToGroup",this.groupID,JSON.stringify(members));
    }
    this.showCBB = false;
  }
  //click add member
  clickAddMemeber(){
    this.showCBB = true;
  }
  //xóa tin nhắn
  deleteMessage(mssg:any){
    this.signalR.sendData("DeletedMessage",this.groupID,mssg.recID);
  }
  // show vote
  lstVoted:any[] = [];
  clickShowVote(mssg:any) {
    if(this.popupVoted){
      this.api.execSv("WP","ERM.Business.WP","ChatBusiness","GetVoteAsync",[mssg.recID])
      .subscribe((res:any[]) => {
        this.lstVoted = res;
        this.callFC.openForm(this.popupVoted,"",500,300);
      });
    }
  }

  //
  closePopupVote(dialog:any){
    dialog?.close();
  }
  memberSelected:any = null;
  //
  clickViewMember(data:any){
    debugger
    let dialogModel = new DialogModel();
    dialogModel.FormModel = this.formModel;
    this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness","GetEmpByUserIDAsync",[data.UserID])
    .subscribe((member:any) => {
      debugger
      this.callFC.openForm(this.tmpViewMember,"Thông tin người dùng",300,350,"",member,"",dialogModel);
    });
  }
  //
  closePoppViewMember(dialog:DialogRef){
    dialog?.close();
  }
  click(dialog,member){
    debugger
  }
}


