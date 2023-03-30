import { E } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef, AfterContentInit, Output, EventEmitter, OnDestroy, ApplicationRef, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { content } from '@syncfusion/ej2-angular-grids';
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { interval } from 'rxjs';
import { PopupDetailComponent } from '../../dashboard/home/list-post/popup-detail/popup-detail.component';
import { WP_Messages } from '../../models/WP_Messages.model';
import { SignalRService } from '../../services/signalr.service';
import { MessageSystemPipe } from './mssgSystem.pipe';
@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})

export class ChatBoxComponent implements OnInit, AfterViewInit{
  @HostListener('click')
  onClick() {
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
  data:WP_Messages = null;
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
  @ViewChild("chatBoxBody") chatBoxBody:ElementRef<HTMLDivElement>;
  @ViewChild("codxATMImages") codxATMImages:AttachmentComponent;
  @ViewChild("codxATM") codxATM:AttachmentComponent;
  @ViewChild("codxViewFile") codxViewFile:AttachmentComponent;
  @ViewChild("tmpMssgFunc") tmpMssgFunc:TemplateRef<any>;
  constructor
  (
    private api:ApiHttpService,
    private auth:AuthStore,
    private signalR: SignalRService,
    private notifiSV:NotificationsService,
    private cache:CacheService,
    private callFC:CallFuncService,
    private sanitizer: DomSanitizer,
    private codxShareSV:CodxShareService,
    private dt:ChangeDetectorRef,
  ) 
  {
    this.user = this.auth.get();
    this.data = new WP_Messages();
    this.formModel = new FormModel();
    this.messageSystemPipe = new MessageSystemPipe(this.cache);

  }

  ngOnInit(): void 
  {
    this.getGroupInfo();
    this.getMessage();
    this.getSetting();
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
    this.cache.valueList("L1480").subscribe((vll:any) => {
      if(vll?.datas){
        this.vllL1480 = vll.datas;
      }
    });
  }
  ngAfterViewInit(): void {
    //receiver message
    this.signalR.chat.subscribe((res:any) => {
      debugger
      if(res){
        let data = res;
        this.group.lastMssgID = data.recID;
        this.group.messageType = data.messageType;
        if(res.messageType == "3"){
          this.messageSystemPipe.transform(data.jsMessage)
          .subscribe(res => {
            data.message = res;
            this.group.message = data.message;
            this.arrMessages.push(data);
          });
        }
        else
        {
          this.group.message = data.message;
          this.arrMessages.push(data);
        }
        setTimeout(()=>{
          this.chatBoxBody.nativeElement.scrollTo(0,this.chatBoxBody.nativeElement.scrollHeight);
        },100)
      }
    });
    //vote message
    this.signalR.voteChat.subscribe((res:any) => {
      if(res){
        let mssg = this.arrMessages.find(x => x.recID == res.recID);
        if(mssg){
          if(!Array.isArray(mssg.votes)){
            mssg.votes = [];
          }
          if(mssg.votes.length > 0){
            let index = mssg.votes.findIndex((x:any) => x.createdBy == res.createdBy);
            if(index != -1 ){
              if(mssg.votes[index].voteType == res.voteType)
                mssg.votes.splice(index,1);
              else
                mssg.votes[index].voteType = res.voteType;
              this.dt.detectChanges();
              return;
            }
          }
          mssg.votes.push(res);
          this.dt.detectChanges();
        }
      }
    });
  }

  // get group infor
  getGroupInfo(){
    this.api.execSv("WP","ERM.Business.WP","GroupBusiness","GetGroupInforAsync",[this.groupID])
    .subscribe((res:any) => {
      if(res?.groupID){
        this.group = res;
        this.data.groupID = res.groupID;
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
      "GetMessageByGroupIDAsync",
      [this.groupID,this.pageIndex])
      .subscribe((res:any[]) => {
        this.arrMessages = res[0];
        this.page = Math.ceil(res[1]/20);
        this.pageIndex++;
        this.loading = false;
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
        "GetMessageByGroupIDAsync",
        [this.group.groupID,this.pageIndex])
        .subscribe((res:any[]) => {
          if(res[1] > 0)
          {
            let _messgae = res[0];
            this.arrMessages = _messgae.concat(this.arrMessages);
            this.dt.detectChanges();
          }
          this.loading = false;
        });
    }
  }
  // close 
  closeChatBox(){
    this.close.emit();
  }

  // send message
  sendMessage(){
    if(!this.blocked){
      this.blocked = true;
      this.data.recID = Util.uid();
      if(this.data.message?.trim())
      {
        this.data.messageType = this.data.refID ? "4" : "1";
        this.signalR.sendData("SendMessageToGroup",JSON.stringify(this.data));
        this.data.message = "";
        this.data.messageType = "";
        this.isReply = false;
        this.mssgReply = null;
        this.blocked = false;
      }
      else this.blocked = false;
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
      files.map((x) => {
        x['objectID'] = Util.uid();
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
      this.codxATM.saveFilesMulObservable()
      .subscribe((res:any)=>{
        if(res){
          let message = new WP_Messages();
          message.groupID = this.groupID;
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
      let message = new WP_Messages();
      message.recID = Util.uid();
      message.groupID = this.groupID;
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
    if (tooltip.isOpen()) {
			tooltip.close();
		} else {
			tooltip.open({ mssg });
		}
  }
  // click vote mssg
  clickVoteMssg(mssg:any,vote:any){
    let data = {groupID: this.groupID, mssgID:mssg.recID, voteType:vote.value};
    this.signalR.sendData("VoteMessage",JSON.stringify(data));
    this.dt.detectChanges();
  }

  replyTo:string = "";
  // reply message
  clickReplyMssg(mssg:any = null){
    this.isReply = mssg ? true : false;
    this.mssgReply = mssg;
    if(mssg){
      this.data.refID = this.mssgReply.recID;
      this.data.refContent = {
        type:this.mssgReply.messageType,
        content:this.mssgReply.message,
        createdName:this.mssgReply.createdName
      } 
      if(this.mssgReply.messageType == "2"){
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

  }

  //
  showCBB:boolean = false;
  width:number = 720;
  height:number = window.innerHeight;
  memeber:string = "PMNHI;ADMIN";
  addMemeber(event:any){
    if(event.id && event.text){
      let userIDs = event.id.split(";");
      let userNames = event.text.split(";");
      if(Array.isArray(userIDs) && Array.isArray(userNames)){
        let length = userIDs.length;
        let members = [];
        for (let i = 0; i < length; i++) {
          members[i] = {userID:userIDs[i], userName:userNames[i] };
        }
        this.signalR.sendData("AddMemberToGroup",this.groupID,JSON.stringify(members));
      }
    }
    this.showCBB = false;
  }
  clickAddMemeber(){
    this.showCBB = !this.showCBB;
  }
  deleteMessage(index:number){
    if(index != -1){
      let data = this.arrMessages.splice(index,1);
      this.api.execSv("WP","ERM.Business.WP","ChatBusiness","DeletedAsync",[data[0]])
      .subscribe();
    }
  }
}
