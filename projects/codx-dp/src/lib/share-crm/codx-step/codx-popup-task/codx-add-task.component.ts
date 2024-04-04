import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import {
  OnInit,
  Optional,
  ViewChild,
  Component,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import {
  Util,
  AuthStore,
  DialogRef,
  DialogData,
  DialogModel,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  FormModel,
  SidebarModel,
} from 'codx-core';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from 'projects/codx-dp/src/lib/models/models';
import { StepService } from '../step.service';
import { TN_OrderModule } from 'projects/codx-ad/src/lib/models/tmpModule.model';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';

@Component({
  selector: 'codx-add-task',
  templateUrl: './codx-add-task.component.html',
  styleUrls: ['./codx-add-task.component.scss'],
})
export class CodxAddTaskComponent implements OnInit {
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  action = 'add';
  vllShare = 'BP021';
  linkQuesiton = 'http://';
  REQUIRE = ['taskName', 'endDate', 'startDate'];
  type: 'calendar' | 'step' | 'activitie' | 'cm' | 'group'; // type == instance => instanceID, group => groupTaskID

  typeTask;
  listGroup = [];
  recIdEmail = '';

  dialog!: DialogRef;
  endDateParent: Date;
  startDateParent: Date;
  instanceStep: DP_Instances_Steps;
  listInsStep: DP_Instances_Steps[];
  stepsTasks: DP_Instances_Steps_Tasks;
  taskInput: DP_Instances_Steps_Tasks;
  owner: DP_Instances_Steps_Tasks_Roles[] = [];
  roles: DP_Instances_Steps_Tasks_Roles[] = [];
  ownerDefaut: DP_Instances_Steps_Tasks_Roles[] = [];
  participant: DP_Instances_Steps_Tasks_Roles[] = [];

  listInsStepInUser: DP_Instances_Steps[];
  listGroupInUser: DP_Instances_Steps_TaskGroups[];
  isRoleFull = false; // admin, admin CM, admin DP, owner instance
  isRoleFullStep = false;
  isRoleFullGroup = false;

  fieldsStep = { text: 'stepName', value: 'recID' };
  fieldsTask = { text: 'taskName', value: 'refID' };
  fieldsGroup = { text: 'taskGroupName', value: 'refID' };

  isSave = true;
  isStart = false;
  isLoadDate = false;
  isHaveFile = false;
  isStatusNew = true;
  isBoughtTM = false;
  isNewEmails = true;
  isShowDate = false;
  isShowTime = false;
  isActivitie = false;
  isTaskDefault = false;
  isSaveTimeTask = true;
  isSaveTimeGroup = true;
  isEditTimeDefault = false;
  viewApprover: any;

  titleName = '';
  objectID = '';
  objectType = '';
  instanceID = '';
  instanceStepID = '';

  user;
  endDayOld;
  groupTask;
  ownerParent;
  startDayOld;
  groupTaskID = null;
  showLabelAttachment = false;
  listApproverView;

  view = [];
  listField = [];
  dataCombobox = [];
  litsParentID = [];
  listFieldCopy = [];

  dialogPopupLink: DialogRef;
  listCombobox = {
    U: 'Share_Users_Sgl',
    P: 'Share_Positions_Sgl',
    R: 'Share_UserRoles_Sgl',
    D: 'Share_Departments_Sgl',
    O: 'Share_OrgUnits_Sgl',
  };

  refValue = {
    '1': 'CMCustomersOfCalendar',
    '3': 'CMLeadsOfCalendar',
    '5': 'CMDealsOfCalendar',
    '7': 'CMContractsOfCalendar',
    '9': 'CMCasesOfCalendar',
  };
  refValueType = '';
  listTypeCM = [];
  typeCM = '';
  typeCMName = '';
  dataTypeCM;
  dataParentTask;
  dataCM = {
    deals: '',
    leads: '',
    cases: '',
    customers: '',
    contracts: '',
  };

  statusInput = {
    type: { show: false, disabled: false },
    dataType: { show: false, disabled: false },
    step: { show: false, disabled: false },
    group: { show: false, disabled: false },
  };

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private authStore: AuthStore,
    private callfc: CallFuncService,
    private stepService: StepService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.authStore.get();

    this.type = dt?.data?.type;
    this.action = dt?.data?.action;
    this.typeTask = dt?.data?.taskType;

    this.taskInput = dt?.data?.dataTask;
    this.isBoughtTM = dt?.data?.isBoughtTM;

    this.groupTaskID = dt?.data?.groupTaskID;
    this.listGroup = dt?.data?.listGroup;

    this.instanceID = dt?.data?.instanceID;
    this.listInsStep = dt?.data?.listInsStep;
    this.instanceStep = dt?.data?.instanceStep;
    this.ownerParent = dt?.data?.ownerInstance; // owner of Parent

    this.titleName = dt?.data?.titleName || '';
    this.isStart = dt?.data?.isStart;

    this.isEditTimeDefault = dt?.data?.isEditTimeDefault;

    this.typeCM = dt?.data?.typeCM;
    this.objectID = dt?.data?.objectID;
    this.objectType = dt?.data?.objectType;
    this.isActivitie = dt?.data?.isActivitie || false;

    this.dataParentTask = dt?.data?.dataParentTask;
    this.isRoleFull = dt?.data?.isRoleFull;

    this.isSave =
      dt?.data?.isSave == undefined ? this.isSave : dt?.data?.isSave;
    this.getValueList();
    !this.isRoleFull && this.checkAdminCM();
  }

  ngOnInit(): void {
    this.setTitle();
    this.setStatusForm();
    this.setData();
    this.setDataParent();
    this.setFieldTask();
    this.setStatusFormDate();
    this.getFormModel();
    (this.action == 'add' || this.action == 'copy') && this.getBoughtTM();
  }

  setTitle() {
    if (this.titleName) {
      this.titleName = (
        this.titleName +
        ' ' +
        this.typeTask?.text
      ).toUpperCase();
    } else {
      this.cache.moreFunction('CoDXSystem', '').subscribe((res: any) => {
        if (res) {
          if (this.action == 'add') {
            let title =
              res?.find((x) => x.functionID == 'SYS01')?.description || '';
            this.titleName = (title + ' ' + this.typeTask?.text).toUpperCase();
          } else if (this.action == 'edit') {
            let title =
              res?.find((x) => x.functionID == 'SYS03')?.description || '';
            this.titleName = (title + ' ' + this.typeTask?.text).toUpperCase();
          } else if (this.action == 'copy') {
            let title =
              res?.find((x) => x.functionID == 'SYS04')?.description || '';
            this.titleName = (title + ' ' + this.typeTask?.text).toUpperCase();
          }
        }
      });
    }
  }
  //#region set data before open form
  setStatusForm() {
    switch (this.type) {
      case 'calendar':
        if (this.action == 'edit') {
          this.statusInput.type.show = true;
          this.statusInput.type.disabled = true;
          this.statusInput.dataType.show = true;
          this.statusInput.dataType.disabled = true;
        } else if (this.action == 'copy') {
          this.statusInput.type.show = true;
          this.statusInput.type.disabled = false;
          this.statusInput.dataType.show = true;
          this.statusInput.dataType.disabled = false;
        } else {
          this.statusInput.type.show = true;
          this.statusInput.type.disabled = false;
        }
        break;
      case 'step':
        this.statusInput.step.show = true;
        this.statusInput.step.disabled = true;
        this.statusInput.group.show = true;
        this.statusInput.group.disabled = false;
        break;
      case 'activitie':
        break;
      case 'cm':
        this.statusInput.type.show = true;
        this.statusInput.type.disabled = true;
        this.statusInput.dataType.show = true;
        this.statusInput.dataType.disabled = true;
        this.statusInput.step.show = !this.isActivitie;
        this.statusInput.step.disabled = false;
        this.statusInput.group.show = !this.isActivitie;
        this.statusInput.group.disabled = false;
        break;
      case 'group':
        this.statusInput.step.show = true;
        this.statusInput.step.disabled = true;
        this.statusInput.group.show = true;
        this.statusInput.group.disabled = true;
        break;
    }
  }
  setData() {
    if (this.action == 'add') {
      this.stepsTasks = new DP_Instances_Steps_Tasks();
      this.stepsTasks.refID = Util.uid();
      this.stepsTasks.status = '1';
      this.stepsTasks.taskName = this.typeTask?.text;
      this.stepsTasks.taskType = this.typeTask?.value;
      this.stepsTasks.approveStatus = '1';
      this.stepsTasks.dependRule = '0';
      this.stepsTasks.isTaskDefault = false;
      this.stepsTasks.progress = 0;
      this.stepsTasks.assigned = '0';
      this.stepsTasks.approveStatus = '1';
      this.setRole();
    } else if (this.action == 'copy') {
      this.stepsTasks = JSON.parse(JSON.stringify(this.taskInput));
      this.stepsTasks.recID = Util.uid();
      this.stepsTasks.refID = Util.uid();
      this.stepsTasks.status = '1';
      this.stepsTasks.progress = 0;
      // this.stepsTasks.fieldID = null;
      this.stepsTasks.dependRule = '0';
      this.stepsTasks.parentID = null;
      this.stepsTasks.isTaskDefault = false;
      this.stepsTasks.requireCompleted = false;
      this.stepsTasks.approvedBy = null;
      this.stepsTasks.assigned = '0';
      this.stepsTasks.approveStatus = '1';
    } else if (this.action == 'edit') {
      this.stepsTasks = JSON.parse(JSON.stringify(this.taskInput));
      this.loadListApproverStep();
    }
    this.roles = this.stepsTasks?.roles || [];
    this.owner = this.roles?.filter(
      (role) => role.objectID == this.stepsTasks?.owner && role.roleType == 'O'
    );
    this.participant = this.roles?.filter((role) => role.roleType == 'P');
    this.ownerDefaut = this.roles?.filter((role) => role.roleType == 'R');
  }
  setRole() {
    let role = new DP_Instances_Steps_Tasks_Roles();
    role.recID = Util.uid();
    role.objectName = this.user?.userName;
    role.objectID = this.user?.userID;
    role.createdOn = new Date();
    role.createdBy = this.user?.userID;
    role.roleType = 'O';
    role.objectType = this.user?.objectType;
    this.stepsTasks.owner = role.objectID;
    this.stepsTasks.roles = [role];
    return role;
  }
  setDataParent() {
    switch (this.type) {
      case 'calendar':
        if (this.action == 'edit' || this.action == 'copy') {
          this.getParentTask(this.stepsTasks);
        }
        break;
      case 'cm':
        this.getParentTypeCm();
        break;
      case 'step':
        this.setInstanceStep();
        break;
      case 'activitie':
        this.isStart = true;
        this.isActivitie = true;
        this.setDateTimeTask();
        break;
      case 'group':
        this.setGroup();
        break;
    }
  }
  setDateTimeTask() {
    if (!this.taskInput?.taskGroupID) {
      this.startDateParent = new Date(
        this.instanceStep?.startDate || new Date()
      );
      this.endDateParent = this.instanceStep?.endDate
        ? new Date(this.instanceStep?.endDate)
        : null;
    } else {
      this.groupTask = this.listGroup.find(
        (x) => x.refID === this.taskInput?.taskGroupID
      );
      this.startDateParent = new Date(this.groupTask['startDate']);
      this.endDateParent = new Date(this.groupTask['endDate']);
    }
    this.stepsTasks.startDate = this.isStart ? this.startDateParent : null;
    let startDays = new Date(this.startDateParent);
    startDays.setDate(startDays?.getDate() + 1);
    this.stepsTasks.endDate = this.isStart ? startDays : null;
  }
  setFieldTask() {
    if (this.instanceStep?.fields?.length > 0 && this.stepsTasks?.fieldID) {
      let fieldID = this.stepsTasks?.fieldID;
      this.listFieldCopy = JSON.parse(
        JSON.stringify(this.instanceStep?.fields)
      );
      this.listField = this.listFieldCopy?.filter((field) =>
        fieldID?.includes(field?.recID)
      );
    }
  }
  setInstanceStep() {
    if (!this.instanceStep && this.instanceStepID) {
      this.api
        .exec<any>(
          'DP',
          'InstancesStepsBusiness',
          'GetStepByIdAsync',
          this.instanceStepID
        )
        .subscribe((res) => {
          if (res) {
            this.instanceStep = res;
            this.listInsStepInUser = [this.instanceStep];
            this.stepsTasks.stepID = this.instanceStep.recID;
            this.listGroup = this.instanceStep?.taskGroups;
            this.setDateTimeTask();
          } else {
            this.notiService.alert(
              '',
              'không thể thêm công việc trong giai đoạn này '
            );
            this.dialog.close();
          }
        });
    } else {
      this.listInsStepInUser = [this.instanceStep];
      this.stepsTasks.stepID = this.instanceStep.recID;
      this.listGroup = this.instanceStep?.taskGroups;
      this.setDateTimeTask();
    }
  }
  setStatusFormDate() {
    const isAddOrCopy = this.action === 'add' || this.action === 'copy';
    const isStatus3 = this.stepsTasks?.status === '3';
    const hasEndDate = !!this.stepsTasks?.endDate;
    const hasStartDate = !!this.stepsTasks?.startDate;

    if (isAddOrCopy) {
      this.isShowDate = (this.isStart || this.isActivitie) && !isStatus3;
      this.isShowTime = true;
    } else {
      if (this.isStart) {
        this.isShowDate = !isStatus3 && hasEndDate && hasStartDate;
        this.isShowTime = !isStatus3;
      } else {
        this.isShowDate = false;
        this.isShowTime = true;
      }
    }
  }
  setGroup() {
    if (this.groupTaskID) {
      if (this.instanceStep) {
        this.listInsStepInUser = [this.instanceStep];
        this.stepsTasks.stepID = this.instanceStep?.recID;
        this.stepsTasks.taskGroupID = this.groupTaskID;
        this.listGroup = this.instanceStep?.taskGroups;
        this.setDateTimeTask();
      }
    } else if (this.groupTask) {
      if (this.instanceStep) {
        this.listInsStepInUser = [this.instanceStep];
        this.stepsTasks.stepID = this.instanceStep?.recID;
        this.stepsTasks.taskGroupID = this.groupTaskID;
        this.listGroup = [this.groupTask];
        this.setDateTimeTask();
      }
    } else {
    }
    // if(this.instanceStep){
    //   this.notiService.alert('','không thể thêm công việc trong nhóm này ');
    //   this.dialog.close();
    // }
  }
  setStepByRole() {
    this.listInsStepInUser = this.listInsStep.filter((step) => {
      if (this.isRoleFull) {
        return !step.isFailStep && !step.isSuccessStep;
      } else {
        return (
          (step.owner == this.user?.userID ||
            step.taskGroups.some(
              (group) => group.owner == this.user?.userID
            )) &&
          !step.isFailStep &&
          !step.isSuccessStep
        );
      }
    });
    this.changeDetectorRef.detectChanges();
  }
  setGroupByRole(listGroup) {
    this.listGroupInUser =
      this.isRoleFull || this.isRoleFullStep
        ? listGroup
        : listGroup.filter((group) => group.owner == this.user?.userID);
  }
  //#endregion
  getParentTypeCm() {
    if (this.isActivitie) {
    } else {
      this.getListStepByInstanceID(this.instanceID);
    }
  }
  //#region get Data
  getParentTask(task) {
    if (task) {
      let recID = task?.recID;
      let taskGroupID = task?.taskGroupID;
      let stepID = task?.stepID;
      let instanceID = task?.instanceID;
      let objectID = task?.objectID;
      let objectType = task?.objectType;
      this.statusInput.step.show = false;
      this.statusInput.group.show = false;
      this.api
        .exec<any>('DP', 'ActivitiesBusiness', 'GetParentOfTaskAsync', [
          recID,
          taskGroupID,
          stepID,
          instanceID,
          objectID,
          objectType,
        ])
        .subscribe((res) => {
          if (res) {
            this.dataParentTask = res;
            if (res?.instancesStep) {
              this.instanceStep = res?.instancesStep;
              this.isStart = !!(
                this.instanceStep?.startDate && this.instanceStep?.endDate
              );
              if (this.action == 'edit') {
                this.listInsStepInUser = [res?.instancesStep];
                this.statusInput.step.show = true;
                this.statusInput.group.show = true;
                this.statusInput.step.disabled = true;
                this.statusInput.group.disabled = true;
                this.setFieldTask();
              } else if (this.action == 'copy') {
                this.getListInstanceStep(
                  res?.instancesStep?.instanceID,
                  this.isRoleFull
                );
              }
              this.listGroup = res?.instancesStep?.taskGroups || [];
              this.statusInput.group.show = true;
              this.statusInput.group.disabled = false;
            }
            switch (res?.applyFor) {
              case '1': //Deal
                this.typeCM = '5';
                break;
              case '2': //case
                this.typeCM = '9';
                break;
              case '3':
                this.typeCM;
                break;
              case '4': //Contracts
                this.typeCM = '7';
                break;
              case '5': //Lead
                this.typeCM = '3';
                break;
              case '6': //Customers
                this.typeCM = '1';
                this.isStart = true;
                break;
            }
            this.typeCMName = this.listTypeCM?.find(
              (x) => x.value == this.typeCM
            )?.text;
            this.dataTypeCM = this.dataParentTask?.parentTaskID;
            this.setStatusFormDate();
          }
        });
    }
  }
  getListStepByInstanceID(instanceID) {
    if ((!this.listInsStep || this.listInsStep?.length <= 0) && instanceID) {
      this.api
        .exec<any>(
          'DP',
          'InstancesStepsBusiness',
          'GetListInstanceStepsByInstanceIDAsync',
          [instanceID]
        )
        .subscribe((res) => {
          if (res) {
            this.listInsStep = res;
            this.setStepByRole();
          } else {
          }
        });
    } else if (this.listInsStep?.length > 0) {
      this.setStepByRole();
    }
  }
  getInstanceStepByRecID(insStepID) {
    if (this.instanceStep) {
      this.api
        .exec<any>(
          'DP',
          'InstancesStepsBusiness',
          'GetInstanceStepByRecIDAsync',
          [insStepID]
        )
        .subscribe((res) => {
          if (res) {
            this.instanceStep = res;
          }
        });
    }
  }
  getValueList() {
    this.cache.valueList('CRM060').subscribe((res) => {
      if (res?.datas) {
        this.listTypeCM = res?.datas?.map((data) => {
          return { ...data, refValue: this.refValue[data?.value] };
        });
      }
    });
  }
  getBoughtTM() {
    if (this.isBoughtTM == undefined) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.AD',
          'UsersBusiness',
          'GetListBoughtModuleAsync',
          ''
        )
        .subscribe((res: Array<TN_OrderModule>) => {
          if (res) {
            let lstModule = res;
            this.isBoughtTM = lstModule?.some(
              (md) =>
                !md?.boughtModule?.refID && md.boughtModule?.moduleID == 'TM1'
              // && md.bought
            );
            this.stepsTasks.createTask = this.isBoughtTM;
          }
        });
    } else {
      this.stepsTasks.createTask = this.isBoughtTM;
    }
  }
  getFormModel() {
    this.cache
      .gridViewSetup('DPInstancesStepsTasks', 'grvDPInstancesStepsTasks')
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]['isRequire']) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
      });
  }
  getListInstanceStep(instanceID, isRoleFull) {
    this.api
      .exec<any>('DP', 'InstancesStepsBusiness', 'GetInscestepCalendarAsync', [
        instanceID,
        isRoleFull,
      ])
      .subscribe((res) => {
        if (res) {
          this.listInsStepInUser = res;
          this.statusInput.step.show = true;
          this.statusInput.step.disabled = false;
        }
      });
  }
  checkAdminCM() {
    this.api
      .exec<any>('CM', 'DealsBusiness', 'CheckAdminDealAsync', [])
      .subscribe((res) => {
        this.isRoleFull = res ? true : false;
      });
  }
  //#endregion

  //#region change Data
  changeValueText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  changeValueCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  changeValueGroup(event, key) {
    let data = event?.value;
    this.stepsTasks[key] = data;
    if (data) {
      this.groupTask = this.listGroup.find((x) => x.refID === data);
      this.startDateParent = new Date(this.groupTask?.startDate);
      this.endDateParent = new Date(this.groupTask?.endDate);
      this.stepsTasks.startDate = this.startDateParent || new Date();
      this.stepsTasks.indexNo = this.groupTask?.task?.length + 1 || 1;
    } else {
      this.groupTask = this.listGroup.find((x) => x.recID === null);
      this.startDateParent = new Date(this.instanceStep?.startDate);
      this.endDateParent = new Date(this.instanceStep?.endDate);
      this.stepsTasks.startDate = this.startDateParent || new Date();
      this.stepsTasks.indexNo = this.groupTask?.task?.length + 1 || 1;
    }
    let startDays = new Date(this.startDateParent);
    startDays.setDate(startDays?.getDate() + 1);
    if (this.stepsTasks.endDate < this.stepsTasks.startDate) {
      this.stepsTasks.endDate = startDays;
    }
    if (this.stepsTasks.endDate > this.endDateParent) {
      this.stepsTasks.endDate = this.endDateParent;
    }
  }
  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
    if (event?.field == 'isOnline' && !event?.data) {
      this.stepsTasks.reference = '';
    }
  }
  changeValueDate(event) {
    this.stepsTasks[event?.field] = new Date(event?.data?.fromDate);
  }
  changeValueDateExpected(event) {
    this.stepsTasks[event?.field] = new Date(event?.data?.fromDate);
    if (this.instanceStep) {
      if (this.isLoadDate) {
        this.isLoadDate = !this.isLoadDate;
        return;
      }
      const startDate = new Date(this.stepsTasks['startDate']);
      const endDate = new Date(this.stepsTasks['endDate']);

      if (endDate && startDate > endDate) {
        this.isSaveTimeTask = false;
        this.isLoadDate = !this.isLoadDate;
        this.notiService.notifyCode('DP019');
        this.stepsTasks['durationHour'] = 0;
        this.stepsTasks['durationDay'] = 0;
        return;
      } else {
        this.isSaveTimeTask = true;
      }
      if (
        this.endDateParent &&
        this.stepService.compareDates(this.endDateParent, endDate) < 0
      ) {
        this.isSaveTimeGroup = false;
        this.isLoadDate = !this.isLoadDate;
        let start =
          ' ' +
          this.stepService.formatDate(
            this.startDateParent,
            'dd/MM/yyyy HH:mm'
          ) +
          ' ';
        let end =
          ' ' +
          this.stepService.formatDate(this.endDateParent, 'dd/MM/yyyy HH:mm') +
          ' ';
        this.notiService.notifyCode('DP020', 0, start, end);
        this.stepsTasks['durationHour'] = 0;
        this.stepsTasks['durationDay'] = 0;
        return;
      } else {
        this.isSaveTimeGroup = true;
      }

      if (this.stepService.compareDates(startDate, this.startDateParent) < 0) {
        this.isSaveTimeGroup = false;
        this.isLoadDate = !this.isLoadDate;
        let start =
          ' ' +
          this.stepService.formatDate(
            this.startDateParent,
            'dd/MM/yyyy HH:mm'
          ) +
          ' ';
        let end =
          ' ' +
          this.stepService.formatDate(this.endDateParent, 'dd/MM/yyyy HH:mm') +
          ' ';
        this.notiService.notifyCode('DP020', 0, start, end);
        this.stepsTasks['durationHour'] = 0;
        this.stepsTasks['durationDay'] = 0;
        return;
      } else {
        this.isSaveTimeGroup = true;
      }
      this.isLoadDate = !this.isLoadDate;
    }
    if (this.stepsTasks['startDate'] && this.stepsTasks['endDate']) {
      const endDate = new Date(this.stepsTasks['endDate']);
      const startDate = new Date(this.stepsTasks['startDate']);
      if (endDate >= startDate) {
        const duration = endDate.getTime() - startDate.getTime();
        const time = Number((duration / 60 / 1000 / 60).toFixed(1));
        let days = 0;
        let hours = 0;
        if (time < 1) {
          hours = time;
        } else {
          hours = Number((time % 24).toFixed(1));
          days = Math.floor(time / 24);
        }
        this.stepsTasks['durationHour'] = hours;
        this.stepsTasks['durationDay'] = days;
      }
    } else {
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
    }
  }
  changeRoler(e) {
    if (!e || e?.length == 0) {
      this.participant = [];
      return;
    }

    let listUser = e || [];
    let listRole = [];
    listUser.forEach((element) => {
      listRole.push({
        objectID: element.objectID,
        objectName: element.objectName,
        objectType: element.objectType,
        roleType: 'P',
        taskID: this.stepsTasks['recID'],
      });
    });
    this.participant = listRole;
    this.removeRoleDuplicate();
  }
  changeRolerOwner(event) {
    let role = event[0];
    if (role) {
      if (role?.objectType == 'U') {
        role['taskID'] = this.stepsTasks?.recID;
        role['roleType'] = 'O';
        this.owner = [role];
        this.stepsTasks.owner = role?.objectID;
        this.removeRoleDuplicate();
      } else if (role?.objectType == '1') {
        this.api
          .exec<any>(
            'DP',
            'InstancesBusiness',
            'GetUserByUserID',
            this.ownerParent
          )
          .subscribe((res) => {
            console.log(res);
            let role = new DP_Instances_Steps_Tasks_Roles();
            role.objectID = res?.userID;
            role.objectName = res?.userName;
            role.taskID = this.stepsTasks?.recID;
            role.roleType = 'O';
            this.owner = [role];
            this.stepsTasks.owner = role?.objectID;
          });
      } else {
        let data = [];
        switch (role?.objectType) {
          case 'D':
          case 'O':
            data = [
              role?.objectID,
              this.instanceStep?.instanceID,
              this.ownerParent,
            ];
            break;
          case 'R':
          case 'P':
            data = [
              role?.objectID,
              this.instanceStep?.instanceID,
              this.ownerParent,
              role?.objectType,
            ];
            break;
        }
        if (data?.length > 0) {
          this.api
            .exec<any>(
              'DP',
              'InstancesBusiness',
              'GetUserByOrgUnitIDAsync',
              data
            )
            .subscribe((res) => {
              if (res) {
                let role = new DP_Instances_Steps_Tasks_Roles();
                role['objectID'] = res?.userID;
                role['objectName'] = res?.userName;
                role['objectType'] = 'U';
                role['roleType'] = 'O';
                role['taskID'] = this.stepsTasks?.recID;
                this.owner = [role];
                this.stepsTasks.owner = role?.objectID;
              }
            });
        }
      }
    } else {
      this.owner = [];
    }
  }
  changeValueRadio(event) {
    this.stepsTasks.status = event?.value;
    this.stepsTasks.progress = this.stepsTasks?.status == '3' ? 100 : 0;
    if (this.stepsTasks?.status == '3') {
      this.stepsTasks.actualEnd = new Date();
      [this.startDayOld, this.endDayOld] = [
        this.stepsTasks?.startDate,
        this.stepsTasks?.endDate,
      ];
      [this.stepsTasks.startDate, this.stepsTasks.endDate] = [null, null];
    }
    if (this.stepsTasks?.status == '1') {
      this.stepsTasks.startDate = this.startDayOld
        ? this.startDayOld
        : this.stepsTasks?.startDate;
      this.stepsTasks.endDate = this.endDayOld
        ? this.endDayOld
        : this.stepsTasks?.endDate;
      this.stepsTasks.actualEnd = null;
    }
    this.setStatusFormDate();
  }

  changeTypeCM(event) {
    if (event?.data) {
      if (this.typeCM != event?.data) {
        this.typeCMName = event?.component?.itemsSelected?.pop()?.text;
        this.typeCM = event?.data;
        this.refValueType = this.refValue[this.typeCM];
        this.statusInput.dataType.show = true;
        this.statusInput.dataType.disabled = false;
      }
    }
  }
  changeDataCM(event) {
    console.log(event?.component?.itemsSelected[0]);
    this.dataTypeCM = event?.component?.itemsSelected[0];
    if (this.dataTypeCM) {
      if (this.typeCM == '1') {
        this.isStart = true;
        this.isActivitie = true;
        this.statusInput.step.show = false;
        this.statusInput.group.show = false;
        this.stepsTasks.objectID = this.dataTypeCM?.RecID;
        this.stepsTasks.objectType = 'CM_Customers';
      } else if (this.typeCM == '5') {
        this.isActivitie = false;
        this.stepsTasks.objectID = null;
        this.stepsTasks.objectType = null;
        this.stepsTasks.stepID = null;
        this.stepsTasks.taskGroupID = null;
        this.isStart = this.dataTypeCM?.Status == '2';
        this.getListInstanceStep(this.dataTypeCM.RefID, true);
      } else {
        this.isActivitie = !!!this.dataTypeCM.RefID;
        if (!this.isActivitie) {
          this.stepsTasks.objectID = null;
          this.stepsTasks.objectType = null;
          this.getListInstanceStep(this.dataTypeCM.RefID, true);
        } else {
          this.stepsTasks.stepID = null;
          this.stepsTasks.taskGroupID = null;
          this.statusInput.step.show = false;
          this.statusInput.group.show = false;
          this.statusInput.step.disabled = true;
        }
      }
      this.setStatusFormDate();
    }
    this.dataCM = event?.data;
  }
  changeStep(event) {
    let data = event?.value;
    if (data) {
      this.stepsTasks.stepID = data;
      let stepFind = this.listInsStepInUser?.find((x) => x.recID == data);
      if (stepFind) {
        this.stepsTasks.taskGroupID = null;
        this.listGroup = stepFind?.taskGroups;
        this.statusInput.group.show = true;
        this.stepsTasks.startDate = stepFind?.startDate || new Date();
        this.stepsTasks.endDate.setDate(
          this.stepsTasks.startDate.getDate() + 1
        );
      } else {
        this.stepsTasks.taskGroupID = null;
        this.listGroup = [];
        this.statusInput.group.show = false;
      }
    }
  }
  //#endregion

  removeRoleDuplicate() {
    let roleTypeO = this.owner[0];
    if (roleTypeO) {
      let index = this.participant?.findIndex(
        (p) => p.objectID == roleTypeO?.objectID
      );
      if (index >= 0) {
        this.participant?.splice(index, 1);
      }
    }
  }
  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.objectID == objectID);
    if (index != -1) data.splice(index, 1);
  }
  handelMail() {
    let data = {
      dialog: this.dialog,
      formGroup: null,
      templateID: this.recIdEmail,
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: this.isNewEmails,
    };

    let popEmail = this.callfunc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data
    );
    popEmail.closed.subscribe((res) => {
      if (res && res.event) {
        // this.processSteps['reference'] = res.event?.recID;
        this.recIdEmail = res.event?.recID ? res.event?.recID : '';
        this.isNewEmails = this.recIdEmail ? true : false;
      }
    });
  }
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }
  getfileDelete(event) {
    event.data.length;
  }
  fileAdded(e) {}

  //#region save
  async beforeSave(isCreateMeeting = false, isAddTask = false) {
    this.stepsTasks['roles'] = [
      ...this.ownerDefaut,
      ...this.participant,
      ...this.owner,
    ];
    this.stepsTasks['parentID'] = this.litsParentID.join(';');
    let message = [];
    if (!this.isSaveTimeTask) {
      this.notiService.notifyCode('DP019');
      return;
    }
    if (!this.isSaveTimeGroup) {
      this.notiService.notifyCode('DP020');
      return;
    }

    if (this.type == 'calendar') {
      if (!this.typeCM) {
        message.push('Danh mục cần thêm');
      } else {
        if (!this.dataTypeCM) {
          message.push(this.typeCMName);
        } else {
          if (!this.stepsTasks?.stepID && !this.isActivitie) {
            message.push(this.view['stepID']);
          }
        }
      }
    }

    if (this.type == 'cm') {
      if (!this.stepsTasks?.stepID && !this.isActivitie) {
        message.push(this.view['stepID']);
      }
    }

    if (!this.stepsTasks['taskName']?.trim()) {
      message.push(this.view['taskName']);
    }

    if (this.stepsTasks?.roles?.length <= 0 || !this.stepsTasks?.roles?.some(role => role?.roleType == "O")) {
      message.push(this.view['roles']);
    }

    if (this.isStart) {
      if (this.stepsTasks?.status != '3') {
        if (!this.stepsTasks?.startDate) {
          message.push(this.view['startDate']);
        }
        if (!this.stepsTasks?.endDate) {
          message.push(this.view['endDate']);
        }
      }
    } else {
      if (!this.stepsTasks['durationDay'] && !this.stepsTasks['durationHour']) {
        message.push(this.view['durationDay']);
      }
    }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
      return;
    }

    if (this.attachment && this.attachment.fileUploadList.length) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        this.save(this.stepsTasks, isCreateMeeting, isAddTask);
      });
    } else {
      this.save(this.stepsTasks, isCreateMeeting, isAddTask);
    }
  }
  save(task, isCreateMeeting = false, isAddTask = false) {
    if (this.action == 'add' || this.action == 'copy') {
      if (isCreateMeeting) {
        task.actionStatus = '2';
        task.status = '2';
      }
      this.addTask(task, isCreateMeeting, isAddTask);
    }
    if (this.action == 'edit') {
      this.editTask(task);
    }
  }
  addTask(task, isCreateMeeting = false, isAddTask = false) {
    if (this.isActivitie) {
      if (this.isSave && this.objectID) {
        task['objectType'] = this.objectType;
        task['objectID'] = this.objectID;
        this.api
          .exec<any>('DP', 'ActivitiesBusiness', 'AddActivitiesAsync', [
            task,
            isCreateMeeting,
            isAddTask,
          ])
          .subscribe((res) => {
            if (res) {
              this.dialog.close({
                task: res,
                isCreateMeeting,
              });
            }
          });
      } else {
        this.dialog.close({
          task,
          isActivitie: this.isActivitie,
          isCreateMeeting,
          isAddTask,
        });
      }
    } else {
      if (this.isSave) {
        this.api
          .exec<any>('DP', 'InstancesStepsBusiness', 'AddTaskStepAsync', [
            task,
            isCreateMeeting,
            isAddTask,
            this.listField,
          ])
          .subscribe((res) => {
            if (res) {
              if(this.instanceStep?.fields?.length > 0){
                this.instanceStep.fields?.forEach((fieldStep) => {
                  let field = this.listField?.find(x => x.recID == fieldStep.recID);
                  if(field){
                    fieldStep.versions = field?.versions;
                  }
                })
              }
              this.dialog.close({
                task: res[0],
                progressGroup: res[1],
                progressStep: res[2],
                isCreateMeeting,
              });
            }
          });
      } else {
        this.dialog.close({
          task,
          isActivitie: this.isActivitie,
          isCreateMeeting,
          isAddTask,
        });
      }
    }
  }
  editTask(task) {
    if (this.isSave) {
      this.api
        .exec<any>('DP', 'InstancesStepsBusiness', 'UpdateTaskStepAsync', [
          task,
          this.listField,
        ])
        .subscribe((res) => {
          if (res) {
            this.instanceStep.fields = this.listFieldCopy;
            this.dialog.close({
              task: res,
              progressGroup: null,
              progressStep: null,
            });
          }
        });
    } else {
      this.dialog.close({
        task,
        fields: this.listField,
        isActivitie: this.isActivitie,
      });
    }
  }
  //#endregion

  addFileCompleted(e) {
    // this.isAddComplete = e;
  }

  openPopupLink(addLink) {
    let option = new DialogModel();
    option.FormModel = this.dialog.formModel;
    option.zIndex = 3000;
    this.dialogPopupLink = this.callfc.openForm(addLink, '', 500, 300, '');
    this.dialogPopupLink.closed.subscribe((res: any) => {
      if (res?.event?.attendee != null || res?.event?.owner != null) {
        this.stepsTasks.reference = res?.event?.attendee || '';
        // this.meeting.link = res?.event?.attendee;
        // this.meeting.link2 = res?.event?.owner;
        // this.changDetec.detectChanges();
      }
    });
  }

  async clickSettingApprove() {
    let category;
    let idTask = this.stepsTasks?.isTaskDefault
      ? this.stepsTasks?.refID
      : this.stepsTasks?.recID;
    if (this.action == 'edit')
      category = await firstValueFrom(
        this.api.execSv<any>(
          'ES',
          'ES',
          'CategoriesBusiness',
          'GetByCategoryIDAsync',
          idTask
        )
      );
    if (category) {
      this.actionOpenFormApprove2(category);
    } else {
      this.api
        .execSv<any>('ES', 'Core', 'DataBusiness', 'GetDefaultAsync', [
          'ESS22',
          'ES_Categories',
        ])
        .subscribe(async (res) => {
          if (res && res?.data) {
            category = res.data;
            category.recID = res?.recID ?? Util.uid();
            category.eSign = true;
            category.category = this.isActivitie
              ? 'DP_Activities'
              : 'DP_Instances_Steps_Tasks';
            category.categoryID = idTask;
            category.categoryName = this.stepsTasks.taskName;
            category.createdBy = this.user.userID;
            category.owner = this.user.userID;
            category.functionApproval = this.isActivitie ? 'DPT07' : 'DPT04';
            category['refID'] = idTask;
            this.actionOpenFormApprove2(category, true);
          }
        });
    }
  }
  private destroyFrom$: Subject<void> = new Subject<void>();
  titleAction: any;

  actionOpenFormApprove2(item, isAdd = false) {
    this.cache.functionList('ESS22').subscribe((f) => {
      if (f) {
        if (!f || !f.gridViewName || !f.formName) return;
        this.cache.gridView(f.gridViewName).subscribe((gridview) => {
          this.cache
            .gridViewSetup(f.formName, f.gridViewName)
            .pipe(takeUntil(this.destroyFrom$))
            .subscribe((grvSetup) => {
              let formES = new FormModel();
              formES.funcID = f?.functionID;
              formES.entityName = f?.entityName;
              formES.formName = f?.formName;
              formES.gridViewName = f?.gridViewName;
              formES.currentData = item;
              let option = new SidebarModel();
              option.Width = '800px';
              option.FormModel = formES;
              let opt = new DialogModel();
              opt.FormModel = formES;
              option.zIndex = 1100;
              let popupEditES = this.callfc.openForm(
                PopupAddCategoryComponent,
                '',
                800,
                800,
                '',
                {
                  disableCategoryID: '1',
                  data: item,
                  isAdd: isAdd,
                  headerText: this.titleAction,
                  dataType: 'auto',
                  templateRefID: this.stepsTasks?.isTaskDefault
                    ? this.stepsTasks?.refID
                    : this.stepsTasks?.recID,
                  templateRefType: this.isActivitie
                    ? 'DP_Activities'
                    : this.stepsTasks?.isTaskDefault
                    ? 'DP_Steps_Tasks'
                    : 'DP_Instances_Steps_Tasks',
                  disableESign: true,
                },
                '',
                opt
              );

              popupEditES.closed.subscribe((res) => {
                if (res?.event) {
                  this.loadListApproverStep();
                }
              });
            });
        });
      }
    });
  }
  loadListApproverStep() {
    let idTask = this.stepsTasks?.isTaskDefault
      ? this.stepsTasks?.refID
      : this.stepsTasks?.recID;
    this.getListAproverStepByCategoryID(idTask)
      .pipe(takeUntil(this.destroyFrom$))
      .subscribe((res) => {
        if (res) {
          this.listApproverView = res;
          this.changeDetectorRef.markForCheck();
        }
      });
  }
  getListAproverStepByCategoryID(categoryID) {
    return this.api.exec<any>(
      'ES',
      'ApprovalStepsBusiness',
      'GetListStepByCategoryIDAsync',
      categoryID
    );
  }
  popoverApproverStep(p, data) {
    if (!data) {
      p.close();
      return;
    }
    if (p.isOpen()) p.close();
    this.viewApprover = data;
    p.open();
  }

  // ------------------- FIELDS -----------------------------//
  valueChangeCustom(event) {
    if (event && event.data) {
      var result = event.e;
      var field = event.data;

      // var result = event.e?.data;
      // var field = event.data;
      // switch (field.dataType) {
      //   case 'D':
      //     result = event.e?.data.fromDate;
      //     break;
      //   case 'P':
      //   case 'R':
      //   case 'A':
      //   case 'C':
      //   case 'L':
      //   case 'TA':
      //   case 'PA':
      //     result = event.e;
      //     break;
      // }

      var index = this.listField.findIndex((x) => x.recID == field.recID);
      if (index != -1) {
        // this.listField[index].dataValue = result;
        //upDataVersion
        this.listField[index] = this.upDataVersion(
          this.listField[index],
          result
        );
        //chua tính toán
      }
    }
  }
  //----------------------CACULATE---------------------------//
  // caculateField() {
  //   if (!this.arrCaculateField || this.arrCaculateField?.length == 0) return;
  //   let fieldsNum = this.fields.filter((x) => x.dataType == 'N');
  //   // let fieldsNum = this.fields.filter(
  //   //   (x) => x.dataType == 'N' || x.dataType == 'CF'
  //   // );
  //   if (!fieldsNum || fieldsNum?.length == 0) return;
  //   if (this.fieldOther?.length > 0) {
  //     //lấy các trường liên quan
  //     fieldsNum = fieldsNum.concat(this.fieldOther);
  //   }

  //   this.arrCaculateField.forEach((obj) => {
  //     let dataFormat = obj.dataFormat;
  //     // let check = field == null ? true : obj.recID == field.recID;
  //     // if (!check) return;
  //     // if (field != null && fieldName != null && dataValue != null)
  //     //   dataFormat.replaceAll('[' + fieldName + ']', dataValue);
  //     fieldsNum.forEach((f) => {
  //       if (dataFormat.includes('[' + f.fieldName + ']')) {
  //         if (!f.dataValue?.toString()) return;
  //         let dataValue = f.dataValue;
  //         // if (versionID) {
  //         //   let ver = f?.version?.find((x) => x.refID == versionID);
  //         //   if (ver) dataValue = ver?.dataValue;
  //         // }

  //         if (f.dataFormat == 'P') dataValue = dataValue + '/100';
  //         dataFormat = dataFormat.replaceAll(
  //           '[' + f.fieldName + ']',
  //           dataValue
  //         );
  //       }
  //     });

  //     this.arrCaculateField.forEach((x) => {
  //       if (dataFormat.includes('[' + x.fieldName + ']')) {
  //         if (!x.dataValue?.toString()) return;
  //         let dataValue = x.dataValue;
  //         dataFormat = dataFormat.replaceAll(
  //           '[' + x.fieldName + ']',
  //           dataValue
  //         );
  //       }
  //     });

  //     if (!dataFormat.includes('[')) {
  //       //tinh toán
  //       obj.dataValue = this.customFieldSV.caculate(dataFormat);
  //       //tính toan end
  //       let index = this.fields.findIndex((x) => x.recID == obj.recID);
  //       if (index != -1) {
  //         this.fields[index] = this.upDataVersion(
  //           this.fields[index],
  //           obj.dataValue,
  //           fieldsNum
  //         );
  //       }

  //       this.setElement(obj.recID, obj.dataValue);
  //       this.changeDetectorRef.detectChanges();
  //     } else if (obj.dataValue) {
  //       //Chua xu ly
  //     }
  //   });
  // }
  //  //cacule Version
  //  caculateVersionField(fieldsN, fieldCF) {
  //   let dataFormat = fieldCF.dataFormat;
  //   fieldsN.forEach((f) => {
  //     if (
  //       dataFormat.includes('[' + f.fieldName + ']') &&
  //       f.dataValue?.toString()
  //     ) {
  //       let dataValue = f.dataValue;
  //       if (f.dataFormat == 'P') dataValue = dataValue + '/100';
  //       dataFormat = dataFormat.replaceAll('[' + f.fieldName + ']', dataValue);
  //     }
  //   });

  //   if (!dataFormat.includes('[')) {
  //     //tinh toán
  //     return this.customFieldSV.caculate(dataFormat);
  //   }
  //   return null;
  // }

  //------------------END_CACULATE--------------------//

  //---------------------- Version ---------------------------//
  upDataVersion(field, value) {
    field.dataValue = value;
    // if (this.taskID) {
    let refIDVersion = this.stepsTasks.recID;
    if (field?.versions?.length > 0) {
      let idx = field?.versions.findIndex((x) => x.refID == refIDVersion);
      if (idx != -1) field.versions[idx].dataValue = value;
      else {
        let vs = field?.versions;
        let obj = {
          refID: refIDVersion,
          dataValue: value,
          createdOn: new Date(),
        };
        vs.push(obj);
        field.versions = vs;
      }
    } else {
      field['versions'] = [
        {
          refID: refIDVersion,
          dataValue: value,
          createdOn: new Date(),
        },
      ];
    }
    // }
    // else {
    //   //update cac version
    //   if (listFN?.length > 0) {
    //     var versions = field.versions;
    //     if (versions?.length > 0) {
    //       versions.forEach((vs) => {
    //         let listConver = [];
    //         listFN.forEach((fn) => {
    //           let f = JSON.parse(JSON.stringify(fn));
    //           var vsion = f?.versions.find((x) => x.refID == vs.refID);
    //           if (vsion != null) f.dataValue = vsion.dataValue;
    //           listConver.push(f);
    //         });
    //         let dataVer = this.caculateVersionField(listConver, field);
    //         if (dataVer != null) vs.dataValue = dataVer;
    //       });
    //     }
    //   }
    // }

    return field;
  }
  // ------------------- FIELDS -----------------------------//
}
