import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { PopupSignForApprovalComponent } from 'projects/codx-es/src/lib/sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-popup-bp-tasks',
  templateUrl: './popup-bp-tasks.component.html',
  styleUrls: ['./popup-bp-tasks.component.css'],
})
export class PopupBpTasksComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  dialog: any;
  formModel: any;
  data: any;
  dataIns: any;
  user: any;
  isHaveFile: boolean = false;
  info: any;
  title = '';
  vllTitle = '';
  subTitle = '';
  checkList = [];
  files = [];
  fileIDs = [];
  action = '';
  process: any;
  privileged = true;
  countCheck = 0;
  constructor(
    private authstore: AuthStore,
    private callfc: CallFuncService,
    private shareService: CodxShareService,
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.formModel = this.dialog?.formModel;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.process = dt?.data?.process;
    this.dataIns = dt?.data?.dataIns
      ? JSON.parse(JSON.stringify(dt?.data?.dataIns))
      : null;
    this.user = this.authstore.get();
    // if(dt?.data?.privileged != null) this.privileged = dt?.data?.privileged;
    this.subTitle = dt?.data?.subTitle;
  }
  ngOnInit(): void {
    if (this.data?.activityType == 'Check') {
      this.data.result =
        this.data?.result == null || this.data?.result?.trim() == ''
          ? '1'
          : this.data?.result;
    }
    this.checkList = this.data.checkList ?? [];
    this.countCheck = this.checkList.filter((x) => x.status == '1').length;
    this.getInfo();
    this.getVll();

    if (this.dataIns == null) {
      this.api
        .execSv<any>(
          'BP',
          'BP',
          'ProcessInstancesBusiness',
          'GetItemsByInstanceIDAsync',
          [this.data.instanceID]
        )
        .subscribe((ins) => {
          if (ins) {
            this.dataIns = ins;
            this.getFile();
          }
        });
    } else {
      if (this.subTitle == null) {
        this.subTitle = this.dataIns?.title;
      }
      this.getFile();
    }
  }
  getFile() {
    if (this.dataIns != null) {
      this.fileIDs = [];
      if (this.dataIns?.documentControl?.length > 0) {
        this.dataIns?.documentControl.forEach(doc=>{
          if (doc?.files?.length > 0) {
            doc?.files?.forEach((file) => {
              if (file?.type == '1' || file?.type == '3') {
                this.fileIDs.push(file?.fileID);
              }
            });
          }
        });

        // let curStepDmc = this.dataIns?.documentControl.filter(
        //   (x) => x?.stepID == this.data?.stepID
        // );
        // if (curStepDmc?.length > 0) {
        //   curStepDmc?.forEach((dmc) => {
        //     if (dmc?.files?.length > 0) {
        //       dmc?.files?.forEach((file) => {
        //         if (file?.type == '1' || file?.type == '3') {
        //           this.fileIDs.push(file?.fileID);
        //         }
        //       });
        //     }

        //     let curRefStepDmc = this.dataIns?.documentControl.filter(
        //       (x) => x?.recID == dmc?.refID
        //     );
        //     if (curRefStepDmc?.length > 0) {
        //       curRefStepDmc?.forEach((refDmc) => {
        //         if (refDmc?.files?.length > 0) {
        //           refDmc?.files?.forEach((refFile) => {
        //             if (refFile?.type == '1' || refFile?.type == '3') {
        //               this.fileIDs.push(refFile?.fileID);
        //             }
        //           });
        //         }
        //       });
        //     }
        //   });
        // }
        if (this.fileIDs?.length > 0) {
          this.files = [];
          this.shareService.getLstFileByID(this.fileIDs).subscribe((res) => {
            if (res) {
              this.files = res;
              this.detectorRef.detectChanges();
            }
          });
        }
      }
    }
  }
  getVll() {
    this.cache.valueList('BP001').subscribe((vll) => {
      if (vll && vll?.datas?.length > 0) {
        const datas = vll?.datas;
        this.title = datas.find((x) => x.value == this.data.activityType)?.text;
      }
    });
  }

  getInfo() {
    let paras = this.data.createdBy
      ? [this.data.createdBy]
      : [this.dataIns?.createdBy];
    let keyRoot =
      'UserInfo' +
      (this.data.createdBy ? [this.data.createdBy] : [this.dataIns?.createdBy]);
    let info = this.shareService.loadDataCache(
      paras,
      keyRoot,
      'SYS',
      'AD',
      'UsersBusiness',
      'GetOneUserByUserIDAsync'
    );
    if (isObservable(info)) {
      info.subscribe((item) => {
        this.info = item;
      });
    } else this.info = info;
  }

  onSave(status = '5') {
    if (this.checkList?.length > 0) {
      for (let i = 0; i < this.checkList.length; i++) {
        const item = this.checkList[i];
        if (item.taskName == null || item.taskName?.trim() == '') {
          this.checkList.splice(i, 1);
          i--;
        }
      }
    }
    //Update Task Status test
    this.api
      .execSv(
        'BP',
        'ERM.Business.BP',
        'ProcessesBusiness',
        'UpdateStatusTaskAsync',
        [this.data.recID, status] //Hoàn tất
      )
      .subscribe((res) => {
        if (res) {
          if(this.data.activityType !="Sign") this.notiService.notifyCode('SYS034');
          this.dialog && this.dialog.close(res);
        }
      });
  }

  sendMail() {
    let data = {
      dialog: this.dialog,
      formGroup: null,
      templateID: '',
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: false,
      notSendMail: true,
    };
    let opt = new DialogModel();
    opt.zIndex = 20000;
    let popEmail = this.callfc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data,
      '',
      opt
    );
  }

  valueChange(e) {
    this.data[e?.field] = e?.data;
    this.detectorRef.detectChanges();
  }

  //#region ActivityType = 'Task'
  addCheckList() {
    let obj = {
      recID: Util.uid(),
      taskName: '',
      status: '0',
    };
    this.checkList.push(obj);
    this.detectorRef.detectChanges();
  }
  valueChangeCheckList(e: any, i: any) {
    this.checkList[i]['taskName'] = e?.target?.value;
    this.detectorRef.detectChanges();
  }
  valueChangeCb(e, i) {
    this.checkList[i]['status'] = e?.target?.checked ? '1' : '0';
    this.countCheck = this.checkList.filter((x) => x.status == '1').length;
    this.detectorRef.detectChanges();
  }

  changeRadio(e) {
    if (e.field === 'yes' && e.component.checked === true) {
      this.data.result = '1';
    } else if (e.field === 'no' && e.component.checked === true) {
      this.data.result = '0';
    }
    this.detectorRef.detectChanges();
  }
  //#endregion

  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
  }

  dataChange(e: any) {
    this.dataIns = e;
    this.dialog.close(this.dataIns);
  }

  return() {
    this.onSave('2');
  }
  eSign() {
    if (this.data?.recID) {
      // gọi hàm xử lý xem trình ký
      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      var listApproveMF = this.shareService.getMoreFunction(null, 'S1');

      let dialogApprove = this.callfc.openForm(
        PopupSignForApprovalComponent,
        'Thêm mới',
        700,
        650,
        'EST021',
        {
          funcID: 'EST021',
          sfRecID: this.data?.recID,
          title: this.data?.taskName,
          status: '3',
          stepType: 'S1',
          stepNo: '0',
          modeView: '2',
          lstMF: listApproveMF,
        },
        '',
        dialogModel
      );
      dialogApprove.closed.subscribe((res) => {
        if (res?.event?.msgCodeError == null && res?.event?.rowCount > 0) {
          if(res?.event.returnStatus =='5'){
            this.onSave("5");
          }
          else if(res?.event.returnStatus =='3'){
            this.dialog && this.dialog?.close()
          }
        }
      });
    }
  }
}
