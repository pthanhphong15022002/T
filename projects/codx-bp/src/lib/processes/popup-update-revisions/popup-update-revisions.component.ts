import {
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  Util,
} from 'codx-core';
import moment from 'moment';
import { CodxBpService } from '../../codx-bp.service';
import {
  BP_Processes,
  BP_ProcessRevisions,
} from '../../models/BP_Processes.model';
import { tmpListUserName } from '../../models/BP_UserPermission.model';
import { PopupViewDetailProcessesComponent } from '../../popup-view-detail-processes/popup-view-detail-processes.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
@Component({
  selector: 'lib-popup-update-revisions',
  templateUrl: './popup-update-revisions.component.html',
  styleUrls: ['./popup-update-revisions.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupUpdateRevisionsComponent implements OnInit {
  @Input() process = new BP_Processes();
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('view') codxview!: any;
  data: any;
  dialog: DialogRef;
  title = '';
  titleAction = '';
  action: any;
  gridViewSetup: any;
  listCombobox = {};
  listName = '';
  fieldValue = '';
  funcID: any;
  showLabelAttachment = false;
  isHaveFile = false;
  revisions: BP_ProcessRevisions[] = [];
  getProcess = new BP_Processes();
  user: any;
  dateLanguage: any;
  moreFunc: any;
  userId: string = '';
  isAdmin: false;
  isAdminBp: false;
  firstNameVersion: string = '';
  listUserName: any;
  userIdLogin: any;
  userNameLogin: any;
  isCheckNotUserNameLogin: boolean = false;
  listUserShow: tmpListUserName[] = [];
  index: number = 0;
  constructor(
    private bpService: CodxBpService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.getProcess = this.data;
    this.titleAction = dt.data.title;
    this.moreFunc = dt.data.moreFunc;
    this.userId = dt.data.userId;
    this.isAdmin = dt.data.isAdmin;
    this.isAdminBp = dt.data.isAdminBp;
    this.funcID = this.dialog.formModel.funcID;
    this.user = this.authStore.get();
    this.revisions = this.getProcess.versions.sort(
      (a, b) => moment(b.createdOn).valueOf() - moment(a.createdOn).valueOf()
    );
    this.title = this.titleAction;
    this.userIdLogin = this.user.userID;
    this.userNameLogin = this.user.userName;
  }
  ngOnInit(): void {
    this.cache.message('BP001').subscribe((res) => {
      if (res) {
        this.firstNameVersion =
          Util.stringFormat(res.defaultName, '').trim() + ': ' + 'V0.0';
        this.changeDetectorRef.detectChanges();
      }
    });
    let isCheck = this.revisions.map((x) => {
      if (x.createdBy !== this.userIdLogin) {
        this.isCheckNotUserNameLogin = true;
        return;
      }
    });
    if (this.isCheckNotUserNameLogin) {
      var listnew = this.revisions.map((x) => x.createdBy);
      this.bpService.getUserNameByListId(listnew).subscribe((res) => {
        res = res.map((x) => {
          let user = new tmpListUserName();
          user.userName = x.userName;
          user.userID = x.userID;
          user.postion = this.index;
          this.listUserShow.push(user);
          this.index++;
        });
      });
    }
  }

  onClose() {
    this.dialog.close();
  }

  openProcessStep(process, role) {
    let editRole = false;
    if (role) {
      editRole = process.write && !process.deleted ? true : false;
    }
    let obj = {
      moreFunc: this.moreFunc,
      data: process,
      formModel: {
        entityName: 'BP_Processes',
        entityPer: 'BP_Processes',
        formName: 'Processes',
        funcID: 'BPT1',
        gridViewName: 'grvProcesses',
        userPermission: null,
      },
      editRole,
    };

    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;
    dialogModel.zIndex = 999;
    var dialog = this.callfc.openForm(
      PopupViewDetailProcessesComponent,
      '',
      Util.getViewPort().height - 100,
      Util.getViewPort().width - 100,
      '',
      obj,
      '',
      dialogModel
    );
  }

  getProcessesStep(item) {
    if (item?.versionNo == this.data?.versionNo) {
      this.dialog.close();
      this.openProcessStep(this.data, true);
    } else {
      this.bpService
        .getProcessesByVersion([this.data.recID, item.versionNo])
        .subscribe((proesses) => {
          if (proesses) {
            this.dialog.close();
            this.openProcessStep(proesses, false);
          }
        });
    }
  }
  //#endregion event
}
