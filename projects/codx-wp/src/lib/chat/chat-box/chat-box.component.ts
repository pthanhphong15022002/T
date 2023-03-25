import { ChangeDetectorRef, Component, HostBinding, Input, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef, AfterContentInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
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
  @Input() status:any;
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

  emojiMode: 'native' | 'apple' |'facebook' | 'google' | 'twitter' = 'facebook';
  emojiPerLine:number = 7;
  emojiMaxFrequentRows:number = 4;
  emojiReview:boolean = false;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  @ViewChild("chatBoxBody") chatBoxBody:ElementRef<HTMLDivElement>;
  @ViewChild("codxATM") codxATM:AttachmentComponent;
  @ViewChild("codxViewFile") codxViewFile:AttachmentComponent;


  constructor
  (
    private api:ApiHttpService,
    private auth:AuthStore,
    private signalR: SignalRService,
    private notifiSV:NotificationsService,
    private cache:CacheService,
    private callFC:CallFuncService,
    private sanitizer: DomSanitizer,
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
  }

  // get group infor
  getGroupInfo(){
    this.api.execSv("WP","ERM.Business.WP","GroupBusiness","GetGroupInforAsync",[this.groupID])
    .subscribe((res:any) => {
      if(res){
        this.group = res;
        this.group.isOnline = this.status;
        this.data.groupID = this.group.groupID;
      }
    })
  }
  // get history chat
  getMessage(){
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
      });
  }
  // scroll up load data
  loading:boolean = false;
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
    this.close.emit(this.groupID);
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
      if(this.fileUpload.length > 0){
        let id = Util.uid();
        this.data.recID = id;
        this.codxATM.objectId = id; 
        this.codxATM.saveFilesMulObservable()
        .subscribe((res:any) => {
          if(res){
            this.data.messageType = "2";
            this.signalR.sendData(JSON.stringify(this.data),"SendMessageToGroup");
          }
          else
          {
            this.notifiSV.notify("Lỗi thêm file không thành công!");
          }
          if(this.data.message && this.data.message.trim()){
            this.data.recID = Util.uid();
            this.data.messageType = "1";
            this.signalR.sendData(JSON.stringify(this.data),"SendMessageToGroup");
            this.data.message = "";
          }
          this.fileUpload = [];
          this.blocked = false;
        });
      }
      else if(this.data.message && this.data.message.trim())
      {
        this.data.recID = Util.uid();
        this.data.messageType = "1";
        this.signalR.sendData(JSON.stringify(this.data),"SendMessageToGroup");
        this.data.message = "";
        this.blocked = false;
      }
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
      this.fileUpload = files;
      this.dt.detectChanges();
    }
  }

  // click files 
  clickViewFile(file){
    
  }
  //remove file
  removeFile(index:number){
    if(index > -1){
      this.fileUpload.splice(index,1);
      this.dt.detectChanges();
    }
  }
}
