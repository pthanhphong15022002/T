import { detach } from '@syncfusion/ej2-base';
import { Subscription, filter } from 'rxjs';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  AfterViewInit,
  HostListener,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';

import moment from 'moment';
import { Permission } from '@shared/models/file.model';
import { SignalRService } from '../services/signalr.service';
import { MessageItem, WP_Messages, tmpMessage } from '../models/WP_Messages.model';
import { MessageSystemPipe } from 'projects/codx-common/src/lib/pipe/mssgSystem.pipe';
import { CHAT } from '../models/chat-const.model';
@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class CodxChatBoxComponent implements OnInit, AfterViewInit {
  // @HostListener('click', ['$event'])
  // onClick(event: any) {
  //   this.isChatBox(event.target);
  //   this.checkActive(this.groupID);
  // }
  @Input() groupID: any;
  @Input() group: any;
  @Output() close = new EventEmitter<any>();
  @Output() collapse = new EventEmitter<any>();

  subscriptions = new Subscription();

  funcID: string = 'WPT11';
  formModel: FormModel = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  chatboxTitle = '';
  function: any = null;
  user: any = {};
  arrMessages: any[] = [];
  data: any = null;
  page: number = 0;
  pageSize: number = 20;
  isFull: boolean = false;
  blocked: boolean = false;
  isLoading: boolean = false;
  messageSystemPipe: MessageSystemPipe = null;
  MESSAGETYPE = {
    TEXT: '1',
    ATTACHMENTS: '2',
    SYSTEM: '3',
    REPLY: '4',
    DELTED: '5',
  };
  emojiMode: 'native' | 'apple' | 'facebook' | 'google' | 'twitter' =
    'facebook';
  emojiPerLine: number = 7;
  emojiMaxFrequentRows: number = 4;
  emojiReview: boolean = false;


  vllL1480: Array<any> = [];
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  mssgDeleted: string = '';
  sysMoreFunc: any = null;
  @ViewChild('chatBoxBody') chatBoxBody: ElementRef<HTMLDivElement>;
  @ViewChild('codxATMImages') codxATMImages: AttachmentComponent;
  @ViewChild('codxATM') codxATM: AttachmentComponent;
  @ViewChild('codxViewFile') codxViewFile: AttachmentComponent;
  @ViewChild('tmpMssgFunc') tmpMssgFunc: TemplateRef<any>;
  @ViewChild('templateVotes') popupVoted: TemplateRef<any>;
  @ViewChild('mssgType5') mssgType5: TemplateRef<any>;
  @ViewChild('tmpViewMember') tmpViewMember: TemplateRef<any>;

  @ViewChild("inputElement") inputElement:ElementRef<HTMLInputElement>;
  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private signalR: SignalRService,
    private notifiSV: NotificationsService,
    private cache: CacheService,
    private callFC: CallFuncService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService
  ) {
    this.user = this.auth.get();
    this.formModel = new FormModel();
  }

  permissions: any[] = [];
  ngOnInit() {
    this.getGroupInfo();
    this.getMessage();
    this.getSetting();
    let permisison = new Permission();
    permisison.objectType = '9';
    permisison.objectName = 'Everyone';
    permisison.read = true;
    permisison.share = true;
    permisison.download = true;
    permisison.isActive = true;
    this.permissions.push(permisison);
  }

  ngAfterViewInit(): void {
    let subscripbe1 = this.signalR.incomingMessage
    .subscribe((mssg:any) => {
      if(mssg && mssg.groupID == this.group.groupID) 
      {
        this.arrMessages.push(mssg);
        this.dt.detectChanges();
      }
    });

    let subscripbe2 = this.signalR.groupChange
    .subscribe((group:any) => {
      if(group && this.group.groupID == group.groupID)
      {
        this.group.groupName = group.groupName;
        this.group.groupName2 = group.groupName2;
        this.group.isFavorite = group.isFavorite;
        if(group.members)
        {
          this.group.members = [...group.members];
          this.crrMembers = group.members.map(x => x.userID).join(";");
        }
        this.dt.detectChanges();
      } 
    });

    this.subscriptions.add(subscripbe1);
    this.subscriptions.add(subscripbe2);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSetting() {
    // get function
    if (this.funcID) {
      let subscribe1 = this.cache.functionList(this.funcID)
      .subscribe((func: any) => {
        if (func) 
        {
          this.function = JSON.parse(JSON.stringify(func));
          this.formModel.funcID = func.functionID;
          this.formModel.entityName = func.entityName;
          this.formModel.formName = func.formName;
          this.formModel.gridViewName = func.gridViewName;
          this.subscriptions.add(
            this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grdViewSetUp = JSON.parse(JSON.stringify(grd));
                this.dt.detectChanges();
              }
          }));
          this.subscriptions.add(
            this.cache
            .moreFunction(func.formName, func.gridViewName)
            .subscribe((mFC: any) => {
              if (mFC) {
                this.moreFC = JSON.parse(JSON.stringify(mFC));
              }
          }));
        }
      });
      this.subscriptions.add(subscribe1);
    }
    // get valuelist vote
    let subscribe2 = this.cache.valueList('L1480')
    .subscribe((vll: any) => {
      if (vll?.datas) {
        this.vllL1480 = vll.datas;
      }
    });

    let subscribe3 = this.cache.message('CHAT002')
    .subscribe((res: any) => {
      this.mssgDeleted = res.defaultName;
    });

    let subscribe4 = this.cache.moreFunction('CoDXSystem', '')
    .subscribe((mFuc: any) => {
      if (mFuc) {
        this.sysMoreFunc = Array.from<any>(mFuc).filter(
          (x) => x.functionID == 'SYS02'
        );
      }
    });
    this.subscriptions.add(subscribe2);
    this.subscriptions.add(subscribe3);
    this.subscriptions.add(subscribe4);
  }

  getGroupInfo() {
    if (this.groupID) {
      let subscribe = this.api.execSv
      (
        'WP',
        'ERM.Business.WP',
        'GroupBusiness',
        'GetGroupByIDAsync',
        this.groupID
      ).subscribe((res: any) => {
        if(res) 
        {
          this.group = res;
          if (this.group.members) 
          {
            this.crrMembers = Array.from<any>(this.group.members)
              .map((x) => x.userID)
              .join(';');
          }
          this.dt.detectChanges();
        }
      });
      this.subscriptions.add(subscribe);
    }
  }

  getMessage(isScroll: boolean = false) {
    if (!this.isLoading && !this.isFull) {
      this.isLoading = true;
      this.page++;
      let subscribe = this.api
      .execSv('WP', 'ERM.Business.WP', 'ChatBusiness', 'GetMessageAsync', [this.groupID,this.page])
      .subscribe((res: any[]) => {
        if(res && res?.length > 0)
        {
          if (isScroll) 
          {
            let data = Array.from<any>(res[0]).reverse();
            if (data.length > 0) {
              this.arrMessages = data.concat(this.arrMessages);
            }
          } 
          else {
            let data = Array.from<any>(res[0]);
            if (data.length > 0) {
              this.arrMessages = data.reverse();
            }
          }
          this.isFull = this.page == Math.ceil(res[1] / 20);
          this.isLoading = false;
          this.dt.detectChanges();
        }
      });
      this.subscriptions.add(subscribe);
    }
  }

  scroll(element: HTMLElement) {
    if (!this.isLoading && element.scrollTop <= 100) 
    {
      this.getMessage(true);
    }
  }
  



  closeChatBox() {
    this.close.emit();
  }

  
 
  checkActive(id: string) {
    if (id) {
      let _elementSelected = document.getElementById(id);
      if (!_elementSelected?.classList.contains('active')) {
        _elementSelected?.classList.add('active');
        let _arrElement = document.getElementsByTagName('codx-chat-box');
        if (Array.isArray(_arrElement)) {
          Array.from(_arrElement).forEach((e) => {
            if (e.id !== id && e.classList.contains('active')) {
              e.classList.remove('active');
              return;
            }
          });
        }
      }
    }
  }

  isChatBox(element: HTMLElement) {
    if (element.tagName == 'CODX-CHAT-BOX') {
      if (!element.classList.contains('active'))
        element.classList.add('active');
      return;
    } else this.isChatBox(element.parentElement);
  }

  collapsed() {
    this.collapse.emit(this.groupID);
  }

  addEmoji(event) {
    this.data.message += event.emoji.native;
  }


  clickUploadFiles() {
    if (this.codxATM) {
      this.codxATM.uploadFile();
    }
  }


  clickUploadImages() {
    if (this.codxATMImages) {
      this.codxATMImages.uploadFile();
    }
  }

  addFiles(event: any) {
    if (Array.isArray(event?.data)) {
      let files = Array.from<any>(event.data);
      let message = new tmpMessage(this.groupID);
      files.map((x) => {
        if (x.mimeType.includes('image')) {
          x['source'] = x.avatar;
          x['referType'] = this.FILE_REFERTYPE.IMAGE;
        } else if (x.mimeType.includes('video')) {
          x['source'] = x.data.changingThisBreaksApplicationSecurity;
          x['referType'] = this.FILE_REFERTYPE.VIDEO;
        } else {
          x['referType'] = this.FILE_REFERTYPE.APPLICATION;
        }
      });
      this.codxATM.objectId = message.recID;

      let subscribe = this.codxATM.saveFilesMulObservable().subscribe((res: any) => {
        if (res) {
          message.message = '';
          message.messageType = '2';
          files.forEach((x) => {
            message.recID = x.objectID;
            message.fileName = x.fileName;
            message.fileSize = x.fileSize;
            message.fileType = x.referType;
            this.signalR.sendData(
              CHAT.BE_FUNC.SendMessage,
              JSON.stringify(message)
            );
          });
        } else this.notifiSV.notify('SYS019');
      });
      this.subscriptions.add(subscribe);
    }
  }

  addFileImages(event: any) {
    if (Array.isArray(event?.data)) {
      let images = Array.from<any>(event.data);
      let message = new tmpMessage(this.groupID);
      message.message = '';
      message.messageType = '2';
      images.forEach((f) => {
        f['source'] = f.avatar;
        f['referType'] = this.FILE_REFERTYPE.IMAGE;
      });
      if (images.length == 1) {
        message.fileName = images[0].fileName;
        message.fileSize = images[0].fileSize;
        message.fileType = images[0].referType;
      } else {
        // 'm' không cho reply vì multi files
        message.refType = 'm';
      }
      this.codxATMImages.objectId = message.recID;
      let subscribe = this.codxATMImages.saveFilesMulObservable().subscribe((res: any) => {
        if (res)
          this.signalR.sendData(
            CHAT.BE_FUNC.SendMessage,
            JSON.stringify(message)
          );
        else this.notifiSV.notify('SYS019');
      });
      this.subscriptions.add(subscribe);
    }
  }


  clickViewFile(file) {
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


  openTooltipEmoji(tooltip: any, mssg: any) {
    tooltip.isOpen() ? tooltip.close() : tooltip.open({ mssg });
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  checkDate(index: number) {
    var mssg1 = this.arrMessages[index];
    var mssg2 = this.arrMessages[index + 1];
    if (mssg1 && mssg2)
      return moment(mssg2.createdOn).diff(moment(mssg1.createdOn), 'days') > 0;
    return false;
  }

  showCBB: boolean = false;
  width: number = 720;
  height: number = window.innerHeight;
  crrMembers: string = '';
  editMemeber(event: any) {
    if(event) 
    {
      this.crrMembers = event.id;
      let members = event.dataSelected.map(x => ({ userID: x.UserID, userName: x.UserName }));
      let jsMember = JSON.stringify(members);
      this.signalR.sendData(CHAT.BE_FUNC.EditMemberAsync,this.group.groupID,jsMember);
    }
    this.showCBB = false;
    this.dt.detectChanges();
  }

  lstVoted: any[] = [];
  clickShowVote(mssg: any) {
    if (this.popupVoted) 
    {
      let subscribe = this.api.execSv('WP', 'ERM.Business.WP', 'ChatBusiness', 'GetVoteAsync', [mssg.recID])
      .subscribe((res: any[]) => {
        this.lstVoted = res;
        this.callFC.openForm(this.popupVoted, '', 500, 300);
      });
      this.subscriptions.add(subscribe);
    }
  }

  clickFavorite() {
    if(this.group)
    {
      this.group.isFavorite = !this.group.isFavorite; 
      this.dt.detectChanges();
      let subscribe = this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'ContactFavoriteBusiness',
        'AddAndUpdateFavoriteAsync',
        [this.group.groupID, this.group.groupType, this.group.isFavorite]
      ).subscribe((res:any) => 
      {
        if(res) this.signalR.sendData(CHAT.BE_FUNC.FavoriteGroupAsync,this.group.groupID);
      });  
      this.subscriptions.add(subscribe);  
    }
  }


  memberSelected: any = null;
  clickViewMember(data: any) {
    let dialogModel = new DialogModel();
    dialogModel.FormModel = this.formModel;
    let subscribe = this.api
    .execSv(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness',
      'GetEmpByUserIDAsync',
      [data.UserID]).subscribe((member: any) => {
      this.callFC.openForm(
        this.tmpViewMember,
        'Thông tin người dùng',
        300,
        350,
        '',
        member,
        '',
        dialogModel
      );
    });
    this.subscriptions.add(subscribe);
  }


  message:string = "";
  valueChange(event:any){
    this.message = event.data;
  }
  keyUp(event:any){
    debugger
  }



  sendMessage() {
    if(!this.message || !this.message.trim())
    {
      debugger 
      return;
    }
    let mssg = new MessageItem(this.groupID);
      mssg.message = this.message;
      mssg.messageType = '1';
      mssg.userID = this.user.userID;
      mssg.createdBy = this.user.userID;
      mssg.createdOn = new Date();
      if (this.replyMssg) 
      {
        mssg.messageType = '4';
        mssg.refID = this.replyMssg.recID;
        mssg.refContent = {
          type: this.replyMssg.messageType,
          content: this.replyMssg.message,
          createdName: this.replyMssg.createdName,
        };
      }
      this.signalR.sendData(CHAT.BE_FUNC.SendMessage, mssg);
      this.message = "";
      this.replyMssg = null;
      this.dt.detectChanges();
  }

  


  clickMF(event:any){
    if(event)
    {
      switch(event.type){
        case "delete":
          this.deleteMessage(event.data);
          break;
        case "vote":
          let mssg = event.data.mssg;
          let vote = event.data.vote;
          this.voteMessage(mssg.recID,vote.value);
          break;
        case "reply":
          this.replyMessage(event.data);
          break;
      }
    }
  }

  deleteMessage(mssg:any) {
    this.signalR.sendData(CHAT.BE_FUNC.DeleteMessage, this.groupID, mssg.recID);
  }

  voteMessage(mssgID:any,voteType:any){
    this.signalR.sendData(CHAT.BE_FUNC.VoteMessageAsync,this.groupID,mssgID,voteType);
  }

  replyMssg:any = null;
  replyMessage(mssg:any) {
    if (mssg) 
    {
      this.replyMssg = mssg;
      // if (mssg.messageType == '2') 
      // {
      //   this.data.fileName = this.replyMssg.fileName;
      //   this.data.fileSize = this.replyMssg.fileSize;
      //   this.data.fileType = this.replyMssg.fileType;
      // }
      this.dt.detectChanges();
    }
  }
}
