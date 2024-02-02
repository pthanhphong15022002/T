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
  DialogData,
  DialogRef,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
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
  action = '';
  constructor(
    private authstore: AuthStore,
    private shareService: CodxShareService,
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.formModel = this.dialog?.formModel;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.dataIns = dt?.data?.dataIns
      ? JSON.parse(JSON.stringify(dt?.data?.dataIns))
      : null;
    this.user = this.authstore.get();
    this.subTitle = dt?.data?.subTitle;
  }
  ngOnInit(): void {
    this.checkList = this.data.checkList ?? [];
    this.getInfo();
    this.getVll();
    if(this.dataIns == null){
      this.api.execSv<any>('BP','BP','ProcessInstancesBusiness','GetItemsByInstanceIDAsync', [this.data.instanceID]).subscribe((ins) => {
        if(ins){
          this.dataIns = ins;
          if(this.subTitle == null){
            this.subTitle = this.dataIns.title;
          }
        }
      });
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

  onSave() {
    if (this.checkList?.length > 0) {
      for (let i = 0; i < this.checkList.length; i++) {
        const item = this.checkList[i];
        if (item.taskName == null || item.taskName?.trim() == '') {
          this.checkList.splice(i, 1);
          i--;
        }
      }
    }
  }

  valueChange(e){

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
}
