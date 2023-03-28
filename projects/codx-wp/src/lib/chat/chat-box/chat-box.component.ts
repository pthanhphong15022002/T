import { E } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, HostBinding, Input, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef, AfterContentInit, Output, EventEmitter, OnDestroy, ApplicationRef, TemplateRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';
import { interval } from 'rxjs';
import { PopupDetailComponent } from '../../dashboard/home/list-post/popup-detail/popup-detail.component';
import { WP_Messages } from '../../models/WP_Messages.model';
import { SignalRService } from '../../services/signalr.service';

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
  @Output() close = new EventEmitter<any>();
  @Output() collapse = new EventEmitter<any>();

  @Input() groupID:any;
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
  fileUpload:Array<any> = [];
  loading:boolean = false;

  emojiMode: 'native' | 'apple' |'facebook' | 'google' | 'twitter' = 'facebook';
  emojiPerLine:number = 7;
  emojiMaxFrequentRows:number = 4;
  emojiReview:boolean = false;
  vllL1480:Array<any> = [];

  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  @ViewChild("chatBoxBody") chatBoxBody:ElementRef<HTMLDivElement>;
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
    private applicationRef: ApplicationRef,
    private dt:ChangeDetectorRef,
  ) 
  {
    this.user = this.auth.get();
    this.data = new WP_Messages();
    this.formModel = new FormModel();
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
    this.signalR.reciverChat.subscribe((res:any) => {
      if(res.groupID === this.groupID)
      {
        let data = JSON.parse(JSON.stringify(res));
        this.arrMessages.push(data);
        setTimeout(()=>{
          this.chatBoxBody.nativeElement.scrollTo(0,this.chatBoxBody.nativeElement.scrollHeight);
        },100)
        this.dt.detectChanges();
      }
    });

    //vote message
    this.signalR.voteChat.subscribe((res:any) => {
      if(res.groupID === this.groupID){
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
  // value Change
  valueChange(event:any){
    if(this.data.message !== event.data)
      this.data.message = event.data;
  }
  // send message
  sendMessage(){
    if(!this.blocked){
      this.blocked = true;
      this.data.recID = Util.uid();
      if(this.messageReply){
        this.data.refID = this.messageReply.recID;
        this.data.refContent = this.messageReply.message;
      }
      if(this.fileUpload.length > 0){
        this.codxATM.objectId = this.data.recID; 
        this.codxATM.saveFilesMulObservable()
        .subscribe((res:any) => {
          if(res)
          {
            this.data.messageType = "2";
            this.signalR.sendData(JSON.stringify(this.data),"SendMessageToGroup");
          }
          else
          {
            this.notifiSV.notify("SYS019");
          }
          this.fileUpload = [];
          this.group.lastMssgID = this.data.recID; 
          this.group.message = this.data.message; 
          this.group.messageType = this.data.messageType;
          this.data.message = "";
          this.data.messageType = "";
          this.replyMssg = false;
          this.messageReply = null;
          this.blocked = false;
        });
      }
      else if(this.data.message && this.data.message.trim())
      {
        this.data.messageType = "1";
        this.signalR.sendData(JSON.stringify(this.data),"SendMessageToGroup");
        this.group.lastMssgID = this.data.recID; 
        this.group.message = this.data.message; 
        this.group.messageType = this.data.messageType;
        this.data.message = "";
        this.data.messageType = "";
        this.replyMssg = false;
        this.messageReply = null;
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
  clickUploadFile(){
    if(this.codxATM){
      this.codxATM.uploadFile();
    }
  }
  // attachment return files
  addFiles(event:any){
    let files = event.data;
    if(Array.isArray(files)){
      files.map((f) => {
        if(f.mimeType.includes('image'))
        {
          f["source"] = f.avatar;
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
        }
        else if(f.mimeType.includes('video'))
        {
          f['source'] = f.data.changingThisBreaksApplicationSecurity;
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
        }
        else 
          f['referType'] = this.FILE_REFERTYPE.APPLICATION;
      });
      let id = Util.uid();
      this.codxATM.objectId = id; 
      this.codxATM.saveFilesMulObservable()
      .subscribe((res:any) => {
        if(res){
          let messgae = new WP_Messages();
          messgae.recID = id;
          messgae.groupID = this.groupID;
          messgae.message = "";
          messgae.messageType = "2";
          this.signalR.sendData(JSON.stringify(messgae),"SendMessageToGroup");
        }
        else
        {
          this.notifiSV.notify("SYS019");
        }
      });
    }
  }

  // click files 
  clickViewFile(file){
    debugger
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
  //remove file
  removeFile(index:number){
    if(index > -1){
      this.fileUpload.splice(index,1);
      this.dt.detectChanges();
    }
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
    this.signalR.sendData(JSON.stringify(data),"VoteMessage");
    this.dt.detectChanges();
  }

  replyMssg:boolean = false;
  messageReply:any = null;
  // reply message
  clickReplyMssg(mssg:any = null){
    this.replyMssg = mssg ? true : false;
    this.messageReply = mssg;
    if(this.replyMssg){
      this.data.refID = this.messageReply.recID;
      this.data.refContent = this.messageReply.message;
    }
    else
    {
      this.data.refID = "";
      this.data.refContent = "";
    }
  }
}
