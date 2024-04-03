import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
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
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AnimationModel, ILoadedEventArgs, ProgressBar, ProgressTheme } from '@syncfusion/ej2-angular-progressbar';
import { X } from '@angular/cdk/keycodes';

@Component({
  selector: 'lib-process-release-detail',
  templateUrl: './process-release-detail.component.html',
  styleUrls: ['./process-release-detail.component.scss'],
})
export class ProcessReleaseDetailComponent implements OnInit, OnChanges {
  @ViewChild('circular1') public circular1: ProgressBar;
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
  VllBP014:any;
  public type1: string = 'Circular';
  public min1: number = 0;
  public max1: number = 100;
  public value1: number = 0;
  public secondaryProgress1: number = 90;
  public height: string = '85';
  public width: string = '85';
  public trackThickness: number = 7;
  public progressThickness: number = 7;
  public animation: AnimationModel = { enable: true, duration: 2000, delay: 0 };
  public annotationColors: string[] = ['#e91e63', '#0078D6', '#317ab9', '#007bff', '#FFD939'];
  listMF = [
    {
      functionID: 'BP0701',
      customName: 'Giao việc',
      largeIcon: 'icon-person_add_alt_1',
      color: '#005DC7'
    },
    {
      functionID: 'BP0702',
      customName: 'Ủy quyền',
      largeIcon: 'icon-i-people',
      color: '#0078FF'
    },
    {
      functionID: 'BP0703',
      customName: 'Trả về',
      largeIcon: 'icon-i-arrow-90deg-right',
      color: '#FFA800'
    },
    {
      functionID: 'BP0704',
      customName: 'Từ chối',
      largeIcon: 'icon-i-x-circle',
      color: '#F64E60'
    },
    {
      functionID: 'BP0705',
      customName: 'Duyệt',
      largeIcon: 'icon-check_circle',
      color: '#1BC5BD'
    }
  ]
  constructor(
    private shareService: CodxShareService,
    private cache: CacheService,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private dtc: ChangeDetectorRef,
    private auth: AuthStore,
    public dmSV: CodxDMService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.formModel = this.formModel || dialog?.formModel;
    this.data = this.data || dt?.data?.data;
    if (dt?.data?.process)
      this.process = JSON.parse(JSON.stringify(dt?.data?.process));
    this.user = this.auth.get();
    this.getVll();
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
    this.getVll();
  }
  onNavChange(e: any) {
    this.active = e;
  }
  getVll()
  {
   this.VllBP014 = this.shareService.loadValueList("BP014");
   if(isObservable(this.VllBP014))
   {
      this.VllBP014.subscribe(item=>{
        this.VllBP014 = item;
      })
   }  
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
      let countTaskSum = 0;
      let countTaskCompletedSum = 0;
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
            {
              elm.countCompleted++;
              countTaskCompletedSum ++;
            }  
            else if (element.activityType == 'Conditions') {
              if (element.child && element.child.length > 0) {
                if (element.child.some((x) => x.status == '5'))
                {
                  elm.countCompleted++;
                  countTaskCompletedSum++;
                }
              }
            }
            countTaskSum ++;
          });

          elm.percentCompleted = (elm.countCompleted / elm.countTask) * 100;

          elm.percentCompleted = elm.percentCompleted.toFixed(2);
          elm.duration = elm.child.reduce((n, { duration }) => n + duration, 0);
        }
        var index = this.listTask.findIndex((x) => x.stepID == elm.recID);
        if(index >= 0)
        {
          elm.colorStatus = this.VllBP014.datas.filter(x=>x.value == this.listTask[index].status)[0].textColor;
          elm.statusStage = this.listTask[index].status;
        }
      });
      this.data.countTask = countTaskSum;
      this.value1 = (countTaskCompletedSum / countTaskSum) * 100;
      this.circular1.value= this.value1;
      this.circular1.refresh();
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

          elm2.taskID = this.listTask[index].recID;
        
        } 
        else elm2.permissions = null;

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
       
        this.formatDataTask(res);
        //this.data = res?.event;
      }
    });
  }

  formatDataTask(res:any)
  {
    debugger
    if(res?.event?.ins) this.data = res?.event?.ins;
    let index = this.listStage.findIndex(x=>x.recID == res?.event?.task?.stageID);
    if(index >= 0)
    {
      let nextStepID = null;
      let crrStage = this.listStage[index];
      let crrNextStage = null;
      let index2 = this.listStage[index].child.findIndex(x=>x.taskID == res?.event?.task?.recID);
      if(index2>=0) 
      {
        let crrStep = this.listStage[index].child[index2];
        if(crrStep?.settings?.nextSteps && crrStep?.settings?.nextSteps.length>0)
        {
          let idNextStep = crrStep.settings?.nextSteps[0].nextStepID; 
          if(idNextStep)
          {
            let index3 = this.process.steps.findIndex(x=>x.recID == idNextStep);
            if(index3>=0)
            {
              nextStepID = this.process.steps[index3].recID;
              if(this.process.steps[index3].activityType != "Stage") nextStepID = this.process.steps[index3].settings?.nextSteps[0].nextStepID;
              let index4 = this.listStage.findIndex(x=>x.recID == nextStepID);
              if(index4 >= 0) crrNextStage = this.listStage[index4];
            }
          }
        }
        this.listStage[index].child[index2].status = res?.event?.task?.status;
        this.listStage[index].child[index2].statusStage = res?.event?.task?.status;
        this.listStage[index].child[index2].colorStatus = this.VllBP014.datas.filter(x=>x.value == res?.event?.task?.status)[0].textColor;
      }
     
      if(crrStage?.recID != crrNextStage?.recID)
      {
        this.data.currentStage = crrNextStage?.recID || crrStage?.recID;
        
        let recID = crrNextStage?.recID || crrStage?.recID;
        let index = this.listStage.findIndex(x=>x.recID == recID);
        if(index>=0) 
        {
          if(crrNextStage)
          {
            nextStepID = this.listStage[index].settings?.nextSteps[0]?.nextStepID;
            let index2 = this.listStage[index].child.findIndex(x=>x.recID == nextStepID);
            if(index2 >=0) this.listStage[index].child[index2].status = '3';
            this.listStage[index].statusStage = '3';
            this.listStage[index].colorStatus = this.VllBP014.datas.filter(x=>x.value == crrNextStage.statusStage)[0].textColor;
          }
        }
      
        let indexCrr = this.listStage.findIndex(x=>x.recID == crrStage?.recID);
        if(indexCrr>=0 )
        {
          this.listStage[indexCrr].statusStage = '5';
          this.listStage[indexCrr].colorStatus = this.VllBP014.datas.filter(x=>x.value == crrStage.statusStage)[0].textColor;
        }
        
      }
      else if(nextStepID) 
      {
        let index2 =  this.listStage[index].child.findIndex(x=>x.recID == nextStepID);
        if(index2 >= 0 ) 
        {
          this.listStage[index].child[index2].status = '3';
        }
      }

      let countTaskSum = 0;
      let countTaskCompletedSum = 0;
      this.listStage.forEach((elm) => {
        if (elm.child && elm.child.length > 0) {
          elm.countTask = elm.child.length;
          elm.countCompleted = 0;
          elm.child.forEach((element) => {
            if (element.activityType != 'Conditions' && element.status == '5')
            {
              elm.countCompleted++;
              countTaskCompletedSum ++;
            }  
            else if (element.activityType == 'Conditions') {
              if (element.child && element.child.length > 0) {
                if (element.child.some((x) => x.status == '5'))
                {
                  elm.countCompleted++;
                  countTaskCompletedSum++;
                }
              }
            }
            countTaskSum ++;
          });

          elm.percentCompleted = (elm.countCompleted / elm.countTask) * 100;

          elm.percentCompleted = elm.percentCompleted.toFixed(2);
          elm.duration = elm.child.reduce((n, { duration }) => n + duration, 0);
        }
        //var index = this.listTask.findIndex((x) => x.stepID == elm.recID);
        // if(index >= 0)
        // {
        //   elm.colorStatus = this.VllBP014.datas.filter(x=>x.value == this.listTask[index].status)[0].textColor;
        //   elm.statusStage = this.listTask[index].status;
        // }
      });
      this.value1 = (countTaskCompletedSum / countTaskSum) * 100;
      this.circular1.value= this.value1;
      this.circular1.refresh();
    }

  }
  addNewTask(oldTask){
    let lstParent = JSON.parse(JSON.stringify(this.listStage));
    lstParent.forEach((elm) => {
      delete elm.child;
    });
    var obj = {
      type: "add",
      activityType: "Task",
      process: this.process,
      data: null,
      parent: parent,
      stage: lstParent?.find(x=>x?.recID == oldTask?.stageID),
      listStage: lstParent,
      hideDelete: true
    };
    let option = new SidebarModel();
    option.Width = 'Auto';
    option.FormModel = this.formModel;
    let popup = this.callFc.openSide(AddDefaultComponent,obj,option);    
    popup.closed.subscribe((res) => {
      if (res && res?.event) {
        this.data = res?.event;
      }
    });
  }
  changePer(data){
    var option = new SidebarModel();
    let dialogAP = this.callFc.openForm(
      BPPopupChangePermissionComponent,
      '',
      500,
      250,
      '',
      {data:data},
    );
    dialogAP.closed.subscribe((res) => {
      if (res && res?.event) {
        this.data = res?.event;
      }
    });
  }
  public load(args: ILoadedEventArgs): void {}

  close()
  {
    this.dialog.close(this.data)
  }
}
