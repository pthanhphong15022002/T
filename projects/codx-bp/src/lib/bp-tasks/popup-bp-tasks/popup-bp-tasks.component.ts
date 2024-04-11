import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
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
import { CodxBpService } from '../../codx-bp.service';
import { CoDxAddApproversComponent } from 'projects/codx-common/src/lib/component/codx-approval-procress/codx-add-approvers/codx-add-approvers.component';
import { BP_DocumentControl, BP_Files } from '../../models/BP_DocumentControl.model';

@Component({
  selector: 'lib-popup-bp-tasks',
  templateUrl: './popup-bp-tasks.component.html',
  styleUrls: ['./popup-bp-tasks.component.css'],
})
export class PopupBpTasksComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;

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
  lstFile = [];
  attDoc = new BP_DocumentControl();
  constructor(
    private authstore: AuthStore,
    private callfc: CallFuncService,
    private shareService: CodxShareService,
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private bpSv: CodxBpService,
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
    if (dt?.data?.privileged != null) this.privileged = dt?.data?.privileged;
    this.subTitle = dt?.data?.subTitle;
  }
  ngOnInit(): void {
    if (this.data?.activityType == 'Check') {
      this.data.result =
        this.data?.result == null || this.data?.result?.trim() == ''
          ? '1'
          : this.data?.result;
    }
    this.checkList = this.data?.checkList ?? [];
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
        this.dataIns?.documentControl.forEach((doc) => {
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

  onSaveTask(){
    if (this.checkList?.length > 0) {
      this.checkList=this.checkList.filter(x=>x.taskName?.trim()?.length>0)
    }
    this.bpSv.checkListTask(this.data?.recID, this.checkList).subscribe(res=>{
      if(res){
        this.dialog && this.dialog.close();
      }
    })
  }

  async onSave(status = '5') {
    if (this.checkList?.length > 0) {
      if (this.checkList?.length > 0) {
        this.checkList=this.checkList.filter(x=>x.taskName?.trim()?.length>0)
      }
    }

    if(this.attachment?.fileUploadList?.length>0){
      if (
        this.attachment.fileUploadList &&
        this.attachment.fileUploadList.length > 0
      ) {
        this.attachment.addPermissions = this.data?.permissions;
        this.attachment.objectId = this.data?.recID;
        (await this.attachment.saveFilesObservable()).subscribe(
          (uploaded: any) => {
            if (uploaded) {
              this.attDoc.stepID = this.data?.stepID;
              this.attDoc.stepNo =this.data?.indexNo;
              this.attDoc.title=this.data?.taskName;
              this.attDoc.permissions=this.data?.permissions;
              this.attDoc.files=[];
              let arrFile=[]
              if(uploaded?.length>1)
              {
                arrFile=uploaded;
              }
              else{
                arrFile =[uploaded]
              }
              Array.from(arrFile).forEach((f:any)=>{
                if(f?.data){
                  let docFile = new BP_Files();
                  docFile.fileID = f?.data?.recID;
                  docFile.fileName = f?.data?.fileName;
                  docFile.esign = false;
                  docFile.type="1";
                  this.attDoc.files.push(docFile);
                }
              });
            }

            this.bpSv.addDocControl(this.dataIns?.recID,this.data?.recID, [this.attDoc]).subscribe(added=>{
              if(added ==null){

              }
              this.updateTaskStatus(status);
            })

          }
        );
      }
    }
    else{
      this.updateTaskStatus(status);
    }


  }
  updateTaskStatus(status){
    //Update Task Status test
    this.bpSv.updateStatusTask(this.data.recID, status,this.checkList).subscribe((res) => {
        if (res) {
          if (this.data.activityType != 'Sign')
            this.notiService.notifyCode('SYS034');
          this.dialog && this.dialog.close({task:res});
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
      notSendMail: false,
      saveIsTemplate: false,
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
    popEmail.closed.subscribe(sendMail=>{
      if(sendMail?.event?.isSendMail){
        this.onSave('5');
      }
    })
  }

  valueChange(e) {
    this.data[e?.field] = e?.data;
    this.detectorRef.detectChanges();
  }

  //#region ActivityType = 'Task'
  addCheckList() {
    if (!this.privileged || this.data.status == '5') return;
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
  fileAdded(e) {


  }
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
  }

  dataChange(e: any) {
    this.data = e[0];
    this.dataIns = e[1];
    this.dialog.close({task:this.data,ins:this.dataIns});
  }
  authority(){
    let dialogAuthority = this.callfc.openForm(CoDxAddApproversComponent,'',500,250,'',{mode:'1'});
    dialogAuthority.closed.subscribe(res=>{
      if(res?.event){
        this.bpSv.authorityTask(this.data.recID,res?.event).subscribe(res=>{
          if(res){
            this.notiService.notifyCode('SYS034');
            this.dialog && this.dialog.close();
          }
        })
      }
    })
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
          if (res?.event.returnStatus == '5') {
            this.onSave('5');
          } else if (res?.event.returnStatus == '3') {
            this.dialog && this.dialog?.close();
          }
        }
      });
    }
  }

  openFiles() {
    if (this.tmpListItem) {
      let option = new DialogModel();
      option.zIndex = 2001;
      let popup = this.callfc.openForm(
        this.tmpListItem,
        '',
        400,
        500,
        '',
        null,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if (res) {
          // this.getDataFileAsync(this.dataSelected.recID);
        }
      });
    }
  }
}
