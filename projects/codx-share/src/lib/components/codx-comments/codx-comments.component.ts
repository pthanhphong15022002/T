import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CacheService,
  ApiHttpService,
  AuthService,
  NotificationsService,
  CallFuncService,
  Util,
  DialogModel,
  AuthStore,
} from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../codx-share.service';
import { PopupVoteComponent } from '../treeview-comment/popup-vote/popup-vote.component';
import { WP_Comments } from 'projects/codx-wp/src/lib/models/WP_Comments.model';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'codx-comments',
  templateUrl: './codx-comments.component.html',
  styleUrls: ['./codx-comments.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxCommentsComponent implements OnInit, OnDestroy {


  @Input() data: any = null;
  @Input() parent: any = null;
  @Input() refID: string = null;
  @Input() funcID: string = '';
  @Input() formModel: any;
  @Input() new: boolean = false;
  @Output() evtReplyTo = new EventEmitter();
  @Output() evtSendComment = new EventEmitter();
  @Output() evtDeleteComment = new EventEmitter();
  @Output() evtViewDetail = new EventEmitter();
  @ViewChild('codxATM') codxATM: AttachmentComponent;
  user: any;
  file: any = null;
  fileDelete: any = null;
  checkVoted = false;
  vllL1480: any;
  date = new Date();
  grvWP: any = null;
  isEdit: boolean = false;
  defaulVote: any = null;
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  destroy$ = new Subject<void>();
  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private cache: CacheService,
    private callFuc: CallFuncService,
    private notifySvr: NotificationsService,
    private codxShareSV: CodxShareService,
    private dt: ChangeDetectorRef
  ) {
    this.user = this.auth.get();
  }
  
  ngOnInit(): void {
    if (this.new) {
      this.data = new WP_Comments();
      this.data.refID = this.refID;
      this.data.parentID = this.parent.recID;
    } 
    else 
    {
      this.getFileByObjectID();
    }
    this.cache.valueList('L1480')
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.vllL1480 = res.datas;
        this.defaulVote = this.vllL1480[0];
      }
    });
    this.getGrdSetup();
  }

  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  getGrdSetup() {
    this.cache
      .gridViewSetup('Comments', 'grvComments')
      .pipe(takeUntil(this.destroy$))
      .subscribe((grv: any) => {
        if (grv) {
          this.grvWP = grv;
        }
      });
  }

  getFileByObjectID() {
    if (this.data.attachments > 0) {
      this.api
        .execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesByIbjectIDAsync',
          [this.data.recID]
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any[]) => {
          if (res.length > 0) {
            this.file = res[0];
            if (this.file.referType == this.REFERTYPE.IMAGE) {
              this.file['source'] = this.codxShareSV.getThumbByUrl(
                this.file.url,
                150
              );
            } else if (this.file.referType == this.REFERTYPE.VIDEO) {
              this.file['source'] = `${environment.urlUpload}/${this.file.url}`;
            }
            this.dt.detectChanges();
          }
        });
    }
  }

  valueChange(value: any) {
    this.data.contents = value.data;
  }

  loading: boolean = false;
  sendComment() {
    if (!this.loading) {
      if (!this.data.contents.trim() && !this.file) {
        this.notifySvr.notifyCode(
          'SYS009',
          0,
          this.grvWP['Comments']['headerText']
        );
        return;
      }
      this.loading = true;
      if (this.isEdit) this.updateComment(this.data);
      else this.insertComment(this.data);
    }
  }
  // insert comments
  insertComment(data: any) {
    this.data.refID = this.refID;
    this.data.parentID = this.parent.recID;
    //có đính kèm file
    if (this.file) {
      let lstFile = [];
      lstFile.push(this.file);
      this.codxATM.objectId = data.recID;
      this.codxATM.fileUploadList = JSON.parse(JSON.stringify(lstFile));
      this.codxATM.objectType = 'WP_Comments';
      this.codxATM.saveFilesMulObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          data.attachments = 1;
          this.api
            .execSv<any>(
              'WP',
              'ERM.Business.WP',
              'CommentsBusiness',
              'InsertCommentAsync',
              [this.parent, data]
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                this.data.recID = Util.uid();
                this.data.contents = '';
                this.file = null;
                this.evtSendComment.emit(res);
                this.notifySvr.notifyCode('WP034');
              } else this.notifySvr.notifyCode('SYS023');
              this.loading = false;
              this.dt.detectChanges();
            });
        } else {
          this.loading = false;
          this.notifySvr.notifyCode('SYS023');
        }
      });
    } else {
      this.api
        .execSv<any>(
          'WP',
          'ERM.Business.WP',
          'CommentsBusiness',
          'InsertCommentAsync',
          [this.parent, data]
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.data.recID = Util.uid();
            this.data.contents = '';
            this.file = null;
            this.evtSendComment.emit(res);
            this.notifySvr.notifyCode('WP034');
          } else this.notifySvr.notifyCode('SYS023');
          this.loading = false;
          this.dt.detectChanges();
        });
    }
  }
  // update comments
  updateComment(data) {
    //check deleted file
    if (this.fileDelete) {
      data.attachments = 0;
      this.deleteFile(this.fileDelete);
    }
    // đính kèm file
    if (this.file) {
      let lstFile = [];
      lstFile.push(this.file);
      this.codxATM.objectId = data.recID;
      this.codxATM.fileUploadList = JSON.parse(JSON.stringify(lstFile));
      this.codxATM.saveFilesMulObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          data.attachments = 1;
          this.api
            .execSv<any>(
              'WP',
              'ERM.Business.WP',
              'CommentsBusiness',
              'UpdateCommentAsync',
              [data]
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: boolean) => {
              if (res) {
                this.new = false;
                this.isEdit = false;
                this.notifySvr.notifyCode('SYS007');
              } else this.notifySvr.notifyCode('SYS021');
              this.loading = false;
              this.dt.detectChanges();
            });
        } else {
          this.loading = false;
          this.notifySvr.notifyCode('SYS023');
        }
      });
    } else {
      this.api
        .execSv<any>(
          'WP',
          'ERM.Business.WP',
          'CommentsBusiness',
          'UpdateCommentAsync',
          [data]
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: boolean) => {
          if (res) {
            this.new = false;
            this.isEdit = false;
            this.notifySvr.notifyCode('SYS007');
          } else this.notifySvr.notifyCode('SYS021');
          this.loading = false;
          this.dt.detectChanges();
        });
    }
  }
  //
  deleteFile(file: any) {
    this.api
      .execSv('DM', 'ERM.Business.DM', 'FileBussiness', 'DeleteFileAsync', [
        file.recID,
        true,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  //edit comment
  clickEditComment() {
    this.isEdit = true;
    this.new = true;
  }
  //delete comment
  deleteComment() {
    this.notifySvr.alertCode('WP032').subscribe((res) => {
      if (res.event.status == 'Y') {
        this.api
          .execSv(
            'WP',
            'ERM.Business.WP',
            'CommentsBusiness',
            'DeleteCommentAsync',
            [this.data.recID]
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: boolean) => {
            if (res) {
              this.evtDeleteComment.emit(this.data);
              this.notifySvr.notifyCode('SYS008');
            } else this.notifySvr.notifyCode('SYS022');
          });
      }
    });
  }

  uploadFile() {
    this.codxATM.uploadFile();
  }

  selectFile(event: any) {
    if (Array.isArray(event.data)) {
      let file = event.data[0];
      if (file.mimeType.indexOf('image') >= 0) {
        file['referType'] = this.REFERTYPE.IMAGE;
        this.file = file;
        this.file['source'] = file.avatar;
      } else if (file.mimeType.indexOf('video') >= 0) {
        file['referType'] = this.REFERTYPE.VIDEO;
        this.file = file;
        this.file['source'] = file.data.changingThisBreaksApplicationSecurity;
      } else {
        file['referType'] = this.REFERTYPE.APPLICATION;
        this.file = file;
      }
      this.dt.detectChanges();
    }
  }

  removeFile() {
    if (this.isEdit) {
      this.fileDelete = JSON.parse(JSON.stringify(this.file));
    }
    this.file = null;
    this.dt.detectChanges();
  }

  replyTo(data) {
    this.evtReplyTo.emit(data);
  }
  //vote
  votePost(data: any, voteType = null) {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'VotesBusiness', 'VotePostAsync', [
        data,
        voteType
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2];
          if (voteType == data.myVoteType) {
            data.myVoteType = null;
            data.myVoted = false;
            this.checkVoted = false;
          } else {
            data.myVoteType = voteType;
            data.myVoted = true;
            this.checkVoted = true;
          }
          this.dt.detectChanges();
        }
      });
  }
  // show vote
  showVotes(data: any) {
    let object = {
      data: data,
      entityName: 'WP_Comments',
    };
    this.callFuc.openForm(PopupVoteComponent, '', 750, 500, '', object);
  }
  //click view detail
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

  clickCancelEdit() {
    this.isEdit = false;
    this.new = false;
  }

  dbLikePost(data) {
    if (data && this.defaulVote) {
      this.votePost(data, this.defaulVote.value);
    }
  }
}
