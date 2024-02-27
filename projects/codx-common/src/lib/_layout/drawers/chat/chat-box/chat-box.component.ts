import { detach } from '@syncfusion/ej2-base';
import { filter } from 'rxjs';
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
import { MessageItem, tmpMessage } from '../models/WP_Messages.model';
import { MessageSystemPipe } from 'projects/codx-common/src/lib/pipe/mssgSystem.pipe';
import { CHAT } from '../models/chat-const.model';
@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class CodxChatBoxComponent implements OnInit, AfterViewInit {
  chatboxTitle = '';
  @HostListener('click', ['$event'])
  onClick(event: any) {
    this.isChatBox(event.target);
    this.checkActive(this.groupID);
  }
  @Input() groupID: any;
  @Output() close = new EventEmitter<any>();
  @Output() collapse = new EventEmitter<any>();
  funcID: string = 'WPT11';
  formModel: FormModel = null;
  grdViewSetUp: any = null;
  moreFC: any = null;
  function: any = null;
  user: any = {};
  arrMessages: any[] = [];
  data: any = null;
  page: number = 0;
  pageSize: number = 20;
  isFull: boolean = false;
  group: any = null;
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
  isReply: boolean = false;
  mssgReply: any = null;
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
    this.signalR.chatboxChange.subscribe((res: any) => {
      if (res?.event && res?.data) {
        switch (res?.event) {
          case CHAT.UI_FUNC.DeletedMessage: {
            let deleted = this.arrMessages?.filter(
              (x) => x?.recID == res?.data
            );
            if (deleted?.length > 0) {
              this.arrMessages[
                this.arrMessages.indexOf(deleted[0])
              ].messageType = '5';
              this.dt.detectChanges();
            }
            break;
          }
          case CHAT.UI_FUNC.ReactedMessage: {
            let mssgReact = this.arrMessages?.filter(
              (x) => x?.recID == res?.data?.mssgID
            );
            if (mssgReact?.length > 0) {
              let vote = {
                voteType: res?.data?.voteType,
                createdBy: res?.data?.createdBy,
                createdName: res?.data?.CreatedName,
              };
              this.reactedMessage(
                this.arrMessages[this.arrMessages.indexOf(mssgReact[0])],
                vote
              );
              this.dt.detectChanges();
            }
            break;
          }
          case CHAT.UI_FUNC.SendedMessage:
          case CHAT.UI_FUNC.SendedMessageSystem: {
            if (res?.groupID == this.groupID) {
              this.group.lastMssgID = res.data.recID;
              this.group.messageType = res.data.messageType;
              this.group.message = res.data.message;
              this.arrMessages.push(res.data);
              setTimeout(() => {
                this.chatBoxBody.nativeElement.scrollTo(
                  0,
                  this.chatBoxBody.nativeElement.scrollHeight
                );
              }, 200);
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {}
  getSetting() {
    // get function
    if (this.funcID) {
      this.cache.functionList(this.funcID).subscribe((func: any) => {
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
    // get valuelist vote
    this.cache.valueList('L1480').subscribe((vll: any) => {
      if (vll?.datas) {
        this.vllL1480 = vll.datas;
      }
    });
    // get mssage deleted
    this.cache.message('CHAT002').subscribe((res: any) => {
      this.mssgDeleted = res.defaultName;
    });
    // get more funtion hệ thống dùng tạm cho moreFunction chat
    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc) {
        this.sysMoreFunc = Array.from<any>(mFuc).filter(
          (x) => x.functionID == 'SYS02'
        );
      }
    });
  }

  // get group infor
  getGroupInfo() {
    if (this.groupID) {
      this.api
        .execSv(
          'WP',
          'ERM.Business.WP',
          'GroupBusiness',
          'GetGroupByIDAsync',
          this.groupID
        )
        .subscribe((res: any) => {
          if (res) {
            this.group = res;

            if (res.members) {
              if (this.group?.groupType == '1') {
                let tempUser = res.members.filter(
                  (x) => x.userID != this.user?.userID
                );
                if (tempUser?.length > 0) {
                  this.chatboxTitle = tempUser[0].userName;
                }
              }
              this.crrMembers = Array.from<any>(res.members)
                .map((x) => x.userID)
                .join(';');
            }
          }
        });
    }
  }
  // get message
  getMessage(isScroll: boolean = false) {
    if (!this.isLoading) {
      if (!this.isFull) {
        this.isLoading = true;
        this.page++;
        this.api
          .execSv('WP', 'ERM.Business.WP', 'ChatBusiness', 'GetMessageAsync', [
            this.groupID,
            this.page,
          ])
          .subscribe((res: any[]) => {
            if (isScroll) {
              let data = Array.from<any>(res[0]).reverse();
              if (data.length > 0) {
                this.arrMessages = data.concat(this.arrMessages);
              }
            } else {
              let data = Array.from<any>(res[0]);
              if (data.length > 0) {
                this.arrMessages = data.reverse();
              }
            }
            this.isFull = this.page == Math.ceil(res[1] / 20);
            this.isLoading = false;
            this.dt.detectChanges();
          });
      }
    }
  }
  // scroll up load data
  scroll(element: HTMLElement) {
    if (!this.isLoading && element.scrollTop <= 100) {
      this.getMessage(true);
    }
  }
  reactedMessage(mssg: any, vote: any) {
    //Thêm react
    let myVote = mssg?.votes?.filter((x) => x.createdBy == this.user?.userID);
    if (mssg?.votes?.length == 0 || myVote?.length == 0) {
      if (!mssg.lstVote) {
        mssg.lstVote = [];
      }
      let index = mssg.lstVote.findIndex((x) => x.voteType == vote.voteType);
      if (index != -1) {
        mssg.lstVote[index].count++;
      } else {
        let newVote = {
          voteType: vote.voteType,
          count: 1,
        };
        mssg.lstVote.push(newVote);
      }
      let tmpVote = {
        voteType: vote.voteType,
        createdBy: vote.createdBy,
      };
      if (!mssg.votes) {
        mssg.votes = [];
      }
      mssg.votes.push(tmpVote);
      if (this.user.userID == vote.createdBy) {
        mssg.myVote = tmpVote;
      }
    } else if (myVote?.length > 0) {
      //Cập nhập react
      if (myVote[0]?.voteType != vote?.voteType) {
        let oldVote = mssg.votes.find((x) => x.createdBy == vote.createdBy);
        let indexOld = mssg.lstVote.findIndex(
          (x) => x.voteType == oldVote.voteType
        );
        let indexNew = mssg.lstVote.findIndex(
          (x) => x.voteType == vote.voteType
        );
        if (indexOld != -1) {
          mssg.lstVote[indexOld].count <= 1
            ? mssg.lstVote.splice(indexOld, 1)
            : mssg.lstVote[indexOld].count--;
        }
        if (indexNew != -1) {
          mssg.lstVote[indexNew].count++;
        } else {
          let newVote = {
            voteType: vote.voteType,
            count: 1,
          };
          mssg.lstVote.push(newVote);
        }
        if (this.user.userID == vote.createdBy) {
          mssg.myVote.voteType = vote.voteType;
        }
        let index = mssg.votes.findIndex((x) => x.createdBy == vote.createdBy);
        mssg.votes[index].voteType = vote.voteType;
      }
      //Xóa
      else {
        let index = mssg.lstVote.findIndex((x) => x.voteType == vote.voteType);
        if (index != -1) {
          mssg.lstVote[index].count <= 1
            ? mssg.lstVote.splice(index, 1)
            : mssg.lstVote[index].count--;
        }
        if (this.user.userID == vote.createdBy) {
          mssg.myVote = null;
        }
        let i = mssg.votes.findIndex((x) => x.createdBy == vote.createdBy);
        mssg.votes.splice(i, 1);
      }
    }
    this.dt.detectChanges();
  }
  // CRUD vote
  updateVote(mssg: any, vote: any, type: string) {
    //add
    if (type == 'add') {
      if (!mssg.lstVote) {
        mssg.lstVote = [];
      }
      let index = mssg.lstVote.findIndex((x) => x.voteType == vote.voteType);
      if (index != -1) {
        mssg.lstVote[index].count++;
      } else {
        let newVote = {
          voteType: vote.voteType,
          count: 1,
        };
        mssg.lstVote.push(newVote);
      }
      let tmpVote = {
        voteType: vote.voteType,
        createdBy: vote.createdBy,
      };
      if (!mssg.votes) {
        mssg.votes = [];
      }
      mssg.votes.push(tmpVote);
      if (this.user.userID == vote.createdBy) {
        mssg.myVote = tmpVote;
      }
    }
    //remove
    else if (type == 'remove') {
      let index = mssg.lstVote.findIndex((x) => x.voteType == vote.voteType);
      if (index != -1) {
        mssg.lstVote[index].count <= 1
          ? mssg.lstVote.splice(index, 1)
          : mssg.lstVote[index].count--;
      }
      if (this.user.userID == vote.createdBy) {
        mssg.myVote = null;
      }
      let i = mssg.votes.findIndex((x) => x.createdBy == vote.createdBy);
      mssg.votes.splice(i, 1);
    }
    //update
    else {
      let oldVote = mssg.votes.find((x) => x.createdBy == vote.createdBy);
      let indexOld = mssg.lstVote.findIndex(
        (x) => x.voteType == oldVote.voteType
      );
      let indexNew = mssg.lstVote.findIndex((x) => x.voteType == vote.voteType);
      if (indexOld != -1) {
        mssg.lstVote[indexOld].count <= 1
          ? mssg.lstVote.splice(indexOld, 1)
          : mssg.lstVote[indexOld].count--;
      }
      if (indexNew != -1) {
        mssg.lstVote[indexNew].count++;
      } else {
        let newVote = {
          voteType: vote.voteType,
          count: 1,
        };
        mssg.lstVote.push(newVote);
      }
      if (this.user.userID == vote.createdBy) {
        mssg.myVote.voteType = vote.voteType;
      }
      let index = mssg.votes.findIndex((x) => x.createdBy == vote.createdBy);
      mssg.votes[index].voteType = vote.voteType;
    }
    this.dt.detectChanges();
  }
  // close
  closeChatBox() {
    this.close.emit();
  }

  // send message
  message: string = '';
  sendMessage() {
    if (!this.blocked && this.message.trim()) {
      this.blocked = true;
      let mssg = new MessageItem(this.groupID);
      mssg.message = this.message;
      mssg.messageType = '1';
      mssg.userID = this.user?.userID;
      mssg.createdBy = this.user?.userID;
      mssg.createdOn = new Date();
      if (this.mssgReply) {
        mssg.refID = this.mssgReply.recID;
        mssg.messageType = '4';
        let refContent = {
          type: this.mssgReply.messageType,
          content: this.mssgReply.message,
          createdName: this.mssgReply.createdName,
        };
        mssg.refContent = refContent;
      }

      this.signalR.sendData(CHAT.BE_FUNC.SendMessage, JSON.stringify(mssg));
      this.message = '';
      this.isReply = false;
      this.replyTo = '';
      this.blocked = false;
      this.mssgReply = null;
      this.dt.detectChanges();
    }
  }
  // check active
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
  // check tag name
  isChatBox(element: HTMLElement) {
    if (element.tagName == 'CODX-CHAT-BOX') {
      if (!element.classList.contains('active'))
        element.classList.add('active');
      return;
    } else this.isChatBox(element.parentElement);
  }
  // collapse box chat
  collapsed() {
    this.collapse.emit(this.groupID);
  }
  // add emoji
  addEmoji(event) {
    this.data.message += event.emoji.native;
  }

  // click upload files
  clickUploadFiles() {
    if (this.codxATM) {
      this.codxATM.uploadFile();
    }
  }

  // click upload images
  clickUploadImages() {
    if (this.codxATMImages) {
      this.codxATMImages.uploadFile();
    }
  }
  // add files
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

      this.codxATM.saveFilesMulObservable().subscribe((res: any) => {
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
    }
  }
  // add files image
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
      this.codxATMImages.saveFilesMulObservable().subscribe((res: any) => {
        if (res)
          this.signalR.sendData(
            CHAT.BE_FUNC.SendMessage,
            JSON.stringify(message)
          );
        else this.notifiSV.notify('SYS019');
      });
    }
  }

  // click files
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

  // handle tooltip emoji mssg
  openTooltipEmoji(tooltip: any, mssg: any) {
    tooltip.isOpen() ? tooltip.close() : tooltip.open({ mssg });
  }
  // click vote mssg
  clickVoteMssg(mssg: any, vote: any) {
    this.signalR.sendData(
      CHAT.BE_FUNC.ReactMessage,
      this.groupID,
      mssg.recID,
      vote.value
    );
    this.dt.detectChanges();
  }
  defaultReact(mssg: any) {
    this.clickVoteMssg(mssg, this.vllL1480[0]);
  }

  replyTo: string = '';
  // reply message
  clickReplyMssg(mssg: any = null) {
    this.isReply = mssg ? true : false;
    this.replyTo = mssg ? 'Đang trả lời ' : '';
    this.mssgReply = mssg;
    if (mssg) {
      if (this.mssgReply.messageType == '2') {
        this.data.fileName = this.mssgReply.fileName;
        this.data.fileSize = this.mssgReply.fileSize;
        this.data.fileType = this.mssgReply.fileType;
      }
      if (mssg.createdBy != this.user.userID) {
        this.replyTo += mssg.createdName;
      }
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
  checkDate(index: number) {
    var mssg1 = this.arrMessages[index];
    var mssg2 = this.arrMessages[index + 1];
    if (mssg1 && mssg2)
      return moment(mssg2.createdOn).diff(moment(mssg1.createdOn), 'days') > 0;
    return false;
  }

  //
  showCBB: boolean = false;
  width: number = 720;
  height: number = window.innerHeight;
  crrMembers: string = '';
  addMemeber(event: any) {
    if (event) {
      let arrUserID = [];
      if (event.id) arrUserID = event.id.split(';');
      let arUserName = [];
      if (event.text) arUserName = event.text.split(';');
      let lstMemberID = [];
      if (this.crrMembers) lstMemberID = this.crrMembers.split(';');
      let members = [];
      let index = 0;
      let membersDeleted = [];
      arrUserID.forEach((e, i) => {
        members[index] = { userID: arrUserID[i], userName: arUserName[i] };
        index++;
      });
      this.crrMembers = event.id;
      this.signalR.sendData(
        CHAT.BE_FUNC.AddMember,
        this.groupID,
        JSON.stringify(members)
      );
    }
    this.showCBB = false;
  }
  //click add member
  clickAddMemeber() {
    this.showCBB = true;
  }
  //xóa tin nhắn
  deleteMessage(mssg: any) {
    this.signalR.sendData(CHAT.BE_FUNC.DeleteMessage, this.groupID, mssg.recID);
  }
  // show vote
  lstVoted: any[] = [];
  clickShowVote(mssg: any) {
    if (this.popupVoted) {
      this.api
        .execSv('WP', 'ERM.Business.WP', 'ChatBusiness', 'GetVoteAsync', [
          mssg.recID,
        ])
        .subscribe((res: any[]) => {
          this.lstVoted = res;
          this.callFC.openForm(this.popupVoted, '', 500, 300);
        });
    }
  }
  favorite() {
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'ContactFavoriteBusiness',
        'CheckFavoriteAsync',
        [this.group?.groupID2, !this.group.isFavorite]
      )
      .subscribe((res: any) => {
        if (res) {
          this.group.isFavorite = !this.group?.isFavorite;
          this.dt.detectChanges();
        }
      });
  }
  //
  closePopupVote(dialog: any) {
    dialog?.close();
  }
  memberSelected: any = null;
  //
  clickViewMember(data: any) {
    let dialogModel = new DialogModel();
    dialogModel.FormModel = this.formModel;
    this.api
      .execSv(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetEmpByUserIDAsync',
        [data.UserID]
      )
      .subscribe((member: any) => {
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
  }
  //
  closePoppViewMember(dialog: DialogRef) {
    dialog?.close();
  }
  click(dialog, member) {}
}
