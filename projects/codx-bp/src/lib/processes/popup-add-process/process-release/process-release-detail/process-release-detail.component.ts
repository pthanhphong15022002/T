import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  SidebarModel,
} from 'codx-core';
import moment from 'moment';
import { userInfo } from 'os';
import { PopupBpTasksComponent } from 'projects/codx-bp/src/lib/bp-tasks/popup-bp-tasks/popup-bp-tasks.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
import { AddDefaultComponent } from '../../form-steps-field-grid/add-default/add-default.component';
import { BPPopupChangePermissionComponent } from '../../form-steps-field-grid/bp-popup-change-permission/bp-popup-change-permission.component';

@Component({
  selector: 'lib-process-release-detail',
  templateUrl: './process-release-detail.component.html',
  styleUrls: ['./process-release-detail.component.scss'],
})
export class ProcessReleaseDetailComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() process: any;
  @Input() formModel: any;
  @Input() right = false;
  dialog: any;
  active = 1;
  listStage = [];
  count = 0;
  listTask: any;
  user: any;
  info: any;
  tempPermission = [];
  listDocument = [];
  constructor(
    private shareService: CodxShareService,
    private cache: CacheService,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private dtc: ChangeDetectorRef,
    private auth: AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.formModel = this.formModel || dialog?.formModel;
    this.data = this.data || dt?.data?.data;
    if (dt?.data?.process)
      this.process = JSON.parse(JSON.stringify(dt?.data?.process));
    this.user = this.auth.get();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['process']?.currentValue &&
      changes['process']?.currentValue != changes['process']?.previousValue
    ) {
      this.process = changes['process']?.currentValue;
      this.getData();
      this.getInfo();
    }
  }
  ngOnInit(): void {
    this.getData();
    this.getInfo();
    this.getInStance();
  }
  onNavChange(e: any) {
    this.active = e;
  }
  getInfo() {
    let paras = [this.data.createdBy];
    let keyRoot = 'UserInfo' + this.data.createdBy;
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
  getData() {
    this.api
      .execSv(
        'BP',
        'BP',
        'ProcessTasksBusiness',
        'GetItemsByInstanceIDAsync',
        this.data.recID
      )
      .subscribe((item) => {
        if (item) {
          this.listTask = item;
          this.getPermission();
          this.dtc.detectChanges();
        }
      });
  }

  getInStance() {
    this.api
      .execSv(
        'BP',
        'BP',
        'ProcessInstancesBusiness',
        'GetItemsByInstanceIDAsync',
        this.data.recID
      )
      .subscribe((item: any) => {
        if (item) {
          if (item?.documentControl && item.documentControl.length > 0) {
            item.documentControl.forEach((element) => {
              if (element.files && element.files.length > 0) {
                let check = element.files.some(
                  (x) => x.type == '1' || x.type == '3'
                );
                if (check) {
                  this.listDocument.push(element);
                }
              }
            });

            if (this.listDocument.length > 0) {
              let ids = [];
              this.listDocument.forEach((elm) => {
                if (elm.files && elm.files.length > 0) {
                  elm.files.forEach((element) => {
                    if (element.type == '1' || element.type == '3')
                      ids.push(element.fileID || element?.recID);
                  });
                }
              });

              if (ids.length > 0) {
                var str = JSON.stringify(ids);
                this.getFile(str);
              }
            }
          }
        }
      });
  }
  getFile(recID: any) {
    this.api
      .execSv('DM', 'DM', 'FileBussiness', 'GetListFile', recID)
      .subscribe((item: any) => {
        if (item) {
          item?.forEach((ix) => {
            let index = this.listDocument.findIndex((x) =>
              x.files.some((x) => x.fileID == ix.recID)
            );
            if (index >= 0) {
              if (!this.listDocument[index]?.filess)
                this.listDocument[index].filess = [];
              this.listDocument[index].filess.push(ix);
            }
          });
        }
      });
  }
  getPermission() {
    let approvers = [];
    if (!this.process) return;
    this.process.steps?.forEach((step) => {
      if (step?.permissions?.length > 0) {
        step?.permissions.forEach((per) => {
          if (per?.objectType != null) {
            approvers.push({
              approver: per?.objectID,
              roleType: per?.objectType,
              refID: step?.recID,
            });
          }
        });
      }
    });
    if (approvers?.length > 0) {
      this.shareService
        .getApproverByRole(approvers, false, this.data?.createdBy)
        .subscribe((res) => {
          if (res) {
            this.tempPermission = res;
            this.formatData();
          } else {
            this.formatData();
          }
        });
    } else {
      this.formatData();
    }
  }

  formatData() {
    if (this.process && this.process.steps) {
      this.count = this.process.steps.length;
      this.listStage = this.process.steps.filter((x) => !x.parentID);
      this.count -= this.listStage.length;
      this.listStage.forEach((elm) => {
        elm.child = this.getListChild(elm) || [];
        elm.settings =
          typeof elm?.settings === 'object'
            ? elm.settings
            : elm?.settings
            ? JSON.parse(elm.settings)
            : null;
        elm.countTask = 0;
        if (elm.child && elm.child.length > 0) {
          elm.countTask = elm.child.length;
          elm.countCompleted = 0;
          elm.child.forEach((element) => {
            if (element.activityType != 'Conditions' && element.status == '5')
              elm.countCompleted++;
            else if (element.activityType == 'Conditions') {
              if (element.child && element.child.length > 0) {
                if (element.child.some((x) => x.status == '5'))
                  elm.countCompleted++;
              }
            }
          });

          elm.percentCompleted = (elm.countCompleted / elm.countTask) * 100;

          elm.percentCompleted = elm.percentCompleted.toFixed(2);
          elm.duration = elm.child.reduce((n, { duration }) => n + duration, 0);
        }
      });
      this.data.countTask = this.listStage.reduce(
        (n, { countTask }) => n + countTask,
        0
      );
    }
  }

  getListChild(elm: any) {
    if (this.count == 0) return;

    let list = this.process.steps.filter((x) => x.parentID == elm.recID);
    this.count -= list.length;
    list.forEach((elm2) => {
      elm2.settings =
        typeof elm2?.settings === 'object'
          ? elm2.settings
          : elm2?.settings
          ? JSON.parse(elm2.settings)
          : null;
      elm2.child = this.getListChild(elm2);
      elm2.dataTask = null;
      if (this.listTask && this.listTask.length > 0) {
        var index = this.listTask.findIndex((x) => x.stepID == elm2.recID);
        if (index >= 0) {
          if (this.listTask[index].status != '1') {
            elm2.permissions =
              typeof this.listTask[index]?.permissions === 'object'
                ? this.listTask[index].permissions
                : this.listTask[index]?.permissions
                ? JSON.parse(this.listTask[index].permissions)
                : null;
            elm2.permissions = elm2?.permissions
              ? elm2.permissions.map((u) => u.objectID).join(';')
              : null;
            elm2.pers =
              this.listTask[index]?.permissions
                ?.map((u) => u?.objectID)
                ?.join(';') ?? null;
          }
          elm2.startDate = this.listTask[index].startDate;

          elm2.endDate = this.listTask[index].endDate;

          elm2.actualStart = this.listTask[index].actualStart;

          elm2.actualEnd = this.listTask[index].actualEnd;

          elm2.status = this.listTask[index].status;
          elm2.dataTask = this.listTask[index];
        } else elm2.permissions = null;
        if (elm2?.pers == null && this.tempPermission?.length > 0) {
          let pers = this.tempPermission.filter((x) => x.refID == elm2.recID);
          if (pers?.length > 0) {
            elm2.pers = pers?.map((u) => u?.userID).join(';') ?? '';
          }
        }
      }

      if (
        elm2.activityType == 'Conditions' &&
        elm2.child &&
        elm2.child.length > 0
      ) {
        for (var i = 0; i < elm2.child.length; i++) {
          var index = elm2.settings.nextSteps.findIndex(
            (x) => x.nextStepID == elm2.child[i].recID
          );
          if (index >= 0)
            elm2.child[i].reasonCon =
              elm2.settings.nextSteps[index].predicateName;
        }
      }
    });

    return list;
  }

  popupTasks(dataStep, action) {
    var option = new SidebarModel();
    option.FormModel = {
      formName: 'BPTasks',
      gridViewName: 'grvBPTasks',
      entityName: 'BP_Tasks',
    };
    option.zIndex = 1010;
    let data = this.listTask.find((x) => x.stepID == dataStep.recID);
    let subTitle = this.data?.title;
    const obj = {
      data: data,
      dataIns: this.data,
      subTitle: subTitle,
      action: action,
    };
    let popup = this.callFc.openSide(PopupBpTasksComponent, obj, option);
    popup.closed.subscribe((res) => {});
  }

  openForm(dt: any) {
    // if (dt?.activityType == 'Email') {
    //   let data = {
    //     dialog: this.dialog,
    //     formGroup: null,
    //     templateID: '',
    //     showIsTemplate: true,
    //     showIsPublish: true,
    //     showSendLater: true,
    //     files: null,
    //     isAddNew: false,
    //     notSendMail: true,
    //   };

    //   let popEmail = this.callFc.openForm(
    //     CodxEmailComponent,
    //     '',
    //     800,
    //     screen.height,
    //     '',
    //     data
    //   );
    // } else if (dt) {
    let privileged = true;
    if (dt?.permissions) {
      privileged = dt?.permissions.some(
        (x) => x.objectID == this.user.userID && x.objectType == 'U'
      );
    }
    var option = new SidebarModel();
    // option.FormModel = this.view.formModel; //Đợi có grid mở lên
    option.FormModel = {
      formName: 'BPTasks',
      gridViewName: 'grvBPTasks',
      entityName: 'BP_Tasks',
    };
    option.zIndex = 1060;
    let popup = this.callFc.openSide(
      PopupBpTasksComponent,
      {
        data: dt,
        process: this.process,
        dataIns: this.data,
        privileged: privileged,
      },
      option
    );
    popup.closed.subscribe((res) => {
      if (res && res?.event) {
        this.data = res?.event;
      }
    });
  }
  addNewTask(oldTask){
    var option = new SidebarModel();
    option.FormModel = {
      formName: 'BPTasks',
      gridViewName: 'grvBPTasks',
      entityName: 'BP_Tasks',
    };
    let popup = this.callFc.openSide(
      AddDefaultComponent,
      {
        data: oldTask,
        process: this.process,
        dataIns: this.data,
      },
      option
    );
    popup.closed.subscribe((res) => {
      if (res && res?.event) {
        this.data = res?.event;
      }
    });
  }
  changePer(task){
    var option = new SidebarModel();
    let dialogAP = this.callFc.openForm(
      BPPopupChangePermissionComponent,
      '',
      500,
      250,
      ''
    );
    dialogAP.closed.subscribe((res) => {
      if (res && res?.event) {
        this.data = res?.event;
      }
    });
  }
}
