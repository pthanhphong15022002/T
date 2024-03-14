import { E } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CallFuncService,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../../codx-share.service';
import { tmpHistory } from '../../../models/tmpComments.model';
import { PopupVoteComponent } from '../../treeview-comment/popup-vote/popup-vote.component';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'codx-comment-history',
  templateUrl: './codx-comment-history.component.html',
  styleUrls: ['./codx-comment-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxCommentHistoryComponent implements OnInit {

  @Input() funcID: string;
  @Input() objectID: string;
  @Input() objectType: string;
  @Input() actionType: string;
  @Input() reference: string;
  @Input() formModel: FormModel;
  @Input() new: boolean = false;
  @Input() data: any;
  @Input() viewIcon: boolean = true;
  @Input() allowVotes: boolean = true;
  @Input() allowEdit: boolean = true;
  @Input() alertNoti: boolean = true;
  @Input() dVll: any = {};
  @Input() vllIcon: any = [];
  @Input() dataBusiness:any; // bổ sung 11/03/2024 - comment and default push noti to createdBy and Owner

  @Output() evtReply = new EventEmitter();
  @Output() evtDelete = new EventEmitter();
  @Output() evtSend = new EventEmitter();
  user: any = null;
  message: string = '';
  files: any = null;
  grdSetUp: any;
  date = new Date();
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };

  @ViewChild('codxATM') codxATM: AttachmentComponent;
  @ViewChild('popupComment') popupComment: TemplateRef<any>;

  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private cache: CacheService,
    private notifySV: NotificationsService,
    private callFuc: CallFuncService,
    private dt: ChangeDetectorRef
  ) {
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    if (this.data) {
      this.getFileByObjectID();
    }
  }
  // get file by id
  getFileByObjectID() {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        this.data.recID
      )
      .subscribe((res: any[]) => {
        if (Array.isArray(res)) {
          this.files = res[0];
          this.dt.detectChanges();
        }
      });
  }
  // deleted comment
  deleteComment(item: any) {
    this.notifySV.alertCode('WP032').subscribe((res) => {
      if (res.event.status == 'Y') {
        this.api
          .execSv(
            'BG',
            'ERM.Business.BG',
            'CommentLogsBusiness',
            'DeleteAsync',
            item.recID
          )
          .subscribe((res: any) => {
            if (res) {
              this.evtDelete.emit(item);
              this.notifySV.notifyCode('WP033');
            } else this.notifySV.notifyCode('SYS022');
          });
      }
    });
  }
  // value change
  valueChange(event: any) {
    if (event.data) {
      this.message = event.data;
      this.dt.detectChanges();
    }
  }
  // select file
  selectedFiles(event: any) {
    if (Array.isArray(event.data)) {
      let file = event.data[0];
      if (file.mimeType.indexOf('image') >= 0) {
        file['referType'] = this.REFERTYPE.IMAGE;
        file['source'] = file.avatar;
      } else if (file.mimeType.indexOf('video') >= 0) {
        file['referType'] = this.REFERTYPE.VIDEO;
        file['source'] = file.data;
      } else {
        file['referType'] = this.REFERTYPE.APPLICATION;
      }
      this.files = file;
      this.dt.detectChanges();
    }
  }
  // remove file
  removeFile() {
    this.files = null;
    this.dt.detectChanges();
  }
  // send comment
  sendComments(evt: any) {
    evt.preventDefault();
    this.deleteComment;
    if (!this.message && !this.files) {
      this.notifySV.notify('Nội dung không được phép bỏ trống',"2");
      return;
    }
    let data = new tmpHistory();
    data.recID = Util.uid();
    data.comment = this.message;
    data.objectID = this.objectID;
    data.objectType = this.objectType;
    data.functionID = this.funcID;
    data.reference = this.reference;
    if (this.files)
    {
      data.attachments = 1;
      this.codxATM.objectId = data.recID;
      let lstFile = [];
      lstFile.push(this.files);
      this.codxATM.fileUploadList = lstFile;
      this.codxATM.objectType = 'BG_Comments';
      this.codxATM.saveFilesMulObservable()
      .subscribe((res: any) => {
        if (res)
        {
          this.save(data,this.dataBusiness.createdBy,this.dataBusiness.owner);
        }
        else
        {
          this.notifySV.notifyCode('SYS023');
        }
      });
    } else this.save(data,this.dataBusiness.createdBy,this.dataBusiness.owner);
  }
  // clear data
  clearData() {
    this.message = '';
    this.files = null;
  }
  //click upload file
  uploadFile() {
    this.codxATM.uploadFile();
  }
  //click reply
  replyTo(data: any) {
    this.evtReply.emit(data);
  }
  //vote comment
  votePost(data: any, voteType = null) {
    this.api
      .execSv(
        'BG',
        'ERM.Business.BG',
        'CommentLogsBusiness',
        'VoteCommentAsync',
        [data.recID, voteType]
      )
      .subscribe((res: any) => {
        if (res) {
          data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2];
          if (voteType == data.myVoteType) {
            data.myVoteType = null;
            data.myVoted = false;
          } else {
            data.myVoteType = voteType;
            data.myVoted = true;
          }
          this.dt.detectChanges();
        }
      });
  }
  //click show votes
  showVotes(data: any) {
    if (data) {
      let object = {
        data: data,
        entityName: 'BG_Comments',
        vll: this.dVll,
      };
      this.callFuc.openForm(PopupVoteComponent, '', 750, 500, '', object);
    }
  }

  //click view file
  clickViewFile(file: any) {
    let option = new DialogModel();
    option.FormModel = this.formModel;
    option.IsFull = true;
    option.zIndex = 999;
    this.callFuc.openForm(
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

  //open popup comment
  openPopupComment(value:string = null){
    if(value)
      this.content = value;
    let option = new DialogModel();
    option.FormModel = this.formModel;
    this.callFuc.openForm(
      this.popupComment,
      '',
      600,
      500,
      '',
      null,
      '',
      option
    ).closed.subscribe(() => {
      this.content = "";
    });
  }

  content:string = "";
  valuePopupChange(event){
    if (event.data) {
      this.content = event.data;
    }
  }

  // send comment
  sendCommentPopup(dialog:DialogRef) {
    if (this.content == "" || this.content == null)
    {
      this.notifySV.notify('Nội dung không được phép bỏ trống',"2");
      return;
    }
    let data = new tmpHistory();
    data.recID = Util.uid();
    data.comment = this.content;
    data.objectID = this.objectID;
    data.objectType = this.objectType;
    data.functionID = this.funcID;
    data.reference = this.reference;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'CommentLogsBusiness',
      'InsertCommentAsync',
      [data]).subscribe((res: any[]) => {
      this.evtSend.emit(res[1]);
      this.alertNoti && this.notifySV.notifyCode(res[0] != null ? 'WP034' : 'SYS023');
      this.content = "";
      dialog.close();
    });
  }


  save(data:tmpHistory,createdBy:string,owner:string){
    if(data)
    {
      this.api
        .execSv(
          'BG',
          'ERM.Business.BG',
          'CommentLogsBusiness',
          'InsertCommentAsync',
          [data,createdBy,owner]
        ).subscribe((res: any[]) => {
          if(res && res[0])
          {
            this.evtSend.emit(res[1]);
            this.alertNoti && this.notifySV.notifyCode('WP034');
            this.clearData();
          }
          else this.notifySV.notifyCode('SYS023');
        });
    }
  }
}
