import {
  OnInit,
  Optional,
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import {
  Util,
  DialogRef,
  AuthStore,
  DialogData,
  CacheService,
  CallFuncService,
  NotificationsService,
  ApiHttpService,
  FormModel,
  SidebarModel,
  DialogModel,
} from 'codx-core';
import {
  DP_Steps,
  DP_Steps_Tasks,
  DP_Steps_Tasks_Roles,
} from '../../../../models/models';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { Subject, takeUntil, filter, firstValueFrom } from 'rxjs';
import { PopupAddCategoryComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-category/popup-add-category.component';
import { PopupMapContractComponent } from './popup-map-contract/popup-map-contract.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
//role: roleType
// O: owner
// P: người tham gia
// R: thiết lập default
// S: shale
@Component({
  selector: 'lib-popup-job',
  templateUrl: './popup-step-task.component.html',
  styleUrls: ['./popup-step-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupJobComponent implements OnInit, OnDestroy {
  @ViewChild('sample') comboBoxObj: ComboBoxComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  REQUIRE = ['taskName', 'roles', 'dependRule'];

  step: DP_Steps;
  dialog!: DialogRef;
  stepsTasks: DP_Steps_Tasks;
  listStep: DP_Steps[] = [];
  listTask: DP_Steps_Tasks[] = [];
  roles: DP_Steps_Tasks_Roles[] = [];
  owner: DP_Steps_Tasks_Roles[] = [];
  participant: DP_Steps_Tasks_Roles[] = [];

  fieldsStep = { text: 'stepName', value: 'recID' };
  fieldsGroup = { text: 'taskGroupName', value: 'recID' };
  fieldsTask = { text: 'taskName', value: 'recID' };
  fieldsFields = { text: 'title', value: 'recID' };

  typeTask;
  action = 'add';
  vllShare = 'DP0331';
  linkQuesiton = 'http://';

  view = [];

  listFieldID = [];
  listFieldLink = [];
  listParentID = [];
  listTaskLink = [];
  listGroupTask = [];
  listGroupTaskCombobox = [];
  listFileTask: string[] = [];
  user: any;
  recIdEmail = '';
  isNewEmails = true;
  isHaveFile = false;
  isBoughtTM = false;
  showLabelAttachment = false;
  listField = [];
 
  listApproverView;
  listGrvContracts;
  showSelect = false;

  listFields = [];
  listFieldConvert = [];
  titleField = '';
  listFieldIntask = [];

  listCombobox = {
    U: 'Share_Users_Sgl',
    O: 'Share_OrgUnits_Sgl',
    P: 'Share_Positions_Sgl',
    R: 'Share_UserRoles_Sgl',
    D: 'Share_Departments_Sgl',
  };
  //detroy
  private detroyFormTask$: Subject<void> = new Subject<void>();

  constructor(
    private cache: CacheService,
    private authStore: AuthStore,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.step = dt?.data?.step;
    this.action = dt?.data?.action;
    this.typeTask = dt?.data?.typeTask;
    this.listStep = dt?.data?.listStep;
    this.listTask = dt?.data?.listTask;
    this.isBoughtTM = dt?.data?.isBoughtTM;
    this.listFileTask = dt?.data?.listFileTask;
    if (dt?.data?.listGroup) {
      // remove group task recID null
      this.listGroupTask = dt?.data?.listGroup || [];
      this.listGroupTaskCombobox = JSON.parse(
        JSON.stringify(this.listGroupTask)
      );
      let index = this.listGroupTaskCombobox?.findIndex(
        (group) => !group.recID
      );
      index >= 0 && this.listGroupTaskCombobox?.splice(index, 1);
    }

    if (this.action == 'add') {
      this.stepsTasks = new DP_Steps_Tasks();
      this.stepsTasks['durationDay'] = 1;
      this.stepsTasks['stepID'] = this.step?.recID;
      this.stepsTasks['taskType'] = this.typeTask?.value;
      this.stepsTasks['taskGroupID'] = dt?.data?.groupTaskID;
      this.stepsTasks['createTask'] = this.isBoughtTM;
      this.stepsTasks.taskName = this.typeTask?.text;
      this.stepsTasks.assignControl = this.stepsTasks?.createTask ? '0' : null;
      this.setRoleDefaut();
    } else if (this.action == 'copy') {
      this.stepsTasks = dt?.data?.taskInput || new DP_Steps_Tasks();
      this.stepsTasks['recID'] = Util.uid();
      this.showLabelAttachment = true;
    } else {
      this.stepsTasks = dt?.data?.taskInput || new DP_Steps_Tasks();
      this.showLabelAttachment = true;
      this.loadListApproverStep();
    }
  }
  ngOnDestroy(): void {
    this.onDestroy();
  }

  onDestroy(): void {
    this.detroyFormTask$.next();
    this.detroyFormTask$.complete();
  }

  async ngOnInit() {
    this.getFormModel();
    this.roles = this.stepsTasks['roles'];
    this.owner = this.roles?.filter((role) => role.roleType == 'O') || [];
    this.participant =
      this.stepsTasks?.taskType &&
      ['M', 'B'].includes(this.stepsTasks?.taskType)
        ? this.roles?.filter((role) => role.roleType != 'O') || []
        : [];

    let group = this.listGroupTask?.find(
      (x) => x.recID === this.stepsTasks?.taskGroupID
    );
    let listTaskConvert = group?.recID
      ? JSON.parse(JSON.stringify(group?.task))
      : JSON.parse(JSON.stringify(this.listTask));
    await this.getTasksWithoutLoop(this.stepsTasks, listTaskConvert);
    this.listTaskLink = listTaskConvert;
    this.listParentID = this.stepsTasks?.parentID
      ? this.stepsTasks?.parentID?.split(';')
      : [];

    this.listFieldID = this.stepsTasks?.fieldID ? this.stepsTasks?.fieldID?.split(';') : [];
    this.listFields = this.step?.fields || [];
    this.listFieldConvert = this.listFields?.map(x => ({recID: x?.recID,title: x?.title}));

    if(this.listFieldID?.length > 0 && this.listFieldConvert){
      let fields = [];

      for(let fieldID of this.listFieldID ){
        let field = this.listFieldConvert?.find(x => x.recID == fieldID)
        if(field){
          this.listFieldIntask.push(field);
        }
      }
      for(let field of this.listFieldConvert ){
        if(!this.listFieldID?.includes(field?.recID)){
          fields.push(field);
        }
      }
      this.titleField = this.listFieldIntask?.map(x => x.title)?.join(';');
      this.listFieldConvert = fields;
    }

    if (this.typeTask?.value == 'CO') {
      this.cache
        .gridViewSetup('CMContracts', 'grvCMContracts')
        .subscribe((grv) => {
          if (grv) {
            let grvShow = [
              'contractID',
              'contractDate',
              'contractType',
              'useType',
              'contractName',
              'customerID',
              'contactID',
              'owner',
              'contractAmt',
              'pmtMethodID',
              'interval',
              'disposalBefore',
              'effectiveFrom',
              'effectiveTo',
              'note',
              'dealID',
              'quotationID',
            ];
            this.listGrvContracts =
              this.listGrvContracts?.length > 0 ? this.listGrvContracts : [];
            const listFieldLinkConvert = (
              this.stepsTasks?.reference
                ? this.stepsTasks.reference.split(';')
                : []
            )
              .filter((field) => field.includes('/'))
              .map((item) => {
                const [recID, fieldName] = item.split('/');
                const fieldFind = this.step?.fields?.find(
                  (x) => x.recID == recID
                );
                return fieldFind
                  ? { recID, fieldName, title: fieldFind.title }
                  : null;
              })
              .filter(Boolean);
            for (var key in grv) {
              if (grvShow?.some((x) => x.toLowerCase() == key.toLowerCase())) {
                let filed = listFieldLinkConvert?.find(
                  (x) => x?.fieldName == grv[key]?.fieldName
                );
                let data = {
                  fieldName: grv[key]?.fieldName,
                  headerText: grv[key]?.headerText,
                  dataType: grv[key]?.dataType,
                  field: filed || null,
                  show: false,
                };
                this.listGrvContracts?.push(data);
              }
            }
          }
        });
    }
  }

  setRoleDefaut() {
    let role = new DP_Steps_Tasks_Roles();
    role.objectID = this.user?.userID;
    role.objectName = this.user?.username;
    role.objectType = '1';
    role.roleType = 'O';
    role.taskID = this.stepsTasks?.recID;
    this.stepsTasks.roles = [role];
  }
  ngAfterViewInit() {}
  getFormModel() {
    this.cache
      .gridViewSetup(
        this.dialog?.formModel?.formName,
        this.dialog?.formModel?.gridViewName
      )
      .pipe(takeUntil(this.detroyFormTask$))
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
      });
  }
  //Email
  handelMail() {
    let data = {
      dialog: this.dialog,
      formGroup: null,
      templateID:
        this.stepsTasks['reference'] || '48a624a5-a55a-11ee-94cf-00155d035517',
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
        this.stepsTasks['reference'] = res.event?.recID ? res.event?.recID : '';
        this.isNewEmails = this.recIdEmail ? true : false;
      }
    });
  }
  //  khảo sát
  changeQuestion(e) {
    if (e?.data) {
      this.stepsTasks['reference'] = e?.data;
    }
  }

  viewDetailSurveys() {
    if (this.linkQuesiton) {
      this.setLink();
      window.open(this.linkQuesiton);
    }
  }

  setLink() {
    let url = window.location.href;
    let index = url.indexOf('/dp/');
    if (index != -1) {
      this.linkQuesiton =
        url.substring(0, index) +
        Util.stringFormat(
          '/sv/add-survey?funcID={0}&title={1}&recID={2}',
          'SVT01',
          '',
          this.stepsTasks['reference']
        );
    }
  }
  // file
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}

  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  getfileDelete(event) {
    event.data.length;
  }
  //#region save
  async saveData() {
    this.stepsTasks['roles'] = [...this.owner, ...this.participant];
    this.stepsTasks['parentID'] = this.listParentID.join(';');
    if (this.listGrvContracts?.length > 0) {
      let listFieldIDLink = [];
      for (let grv of this.listGrvContracts) {
        if (grv?.field) {
          let fieldAndfieldName = grv?.field?.recID + '/' + grv?.fieldName;
          listFieldIDLink.push(fieldAndfieldName);
        }
      }
      this.stepsTasks.reference = listFieldIDLink.join(';');
    }
    if (this.typeTask?.value == 'F' && this.listFieldIntask) {
      this.stepsTasks.fieldID = this.listFieldIntask?.map(x => x.recID).join(';');
    }
    let message = [];
    for (let key of this.REQUIRE) {
      if (this.typeTask?.value == 'F' && key == 'dependRule') {
        continue;
      }
      if (
        (typeof this.stepsTasks[key] === 'string' &&
          !this.stepsTasks[key].trim()) ||
        !this.stepsTasks[key] ||
        this.stepsTasks[key]?.length === 0
      ) {
        message.push(this.view[key]);
      }
    }
    if (!this.stepsTasks['durationDay'] && !this.stepsTasks['durationHour']) {
      message.push(this.view['durationDay']);
    }
    if (this.typeTask?.value === 'F' && !this.stepsTasks?.fieldID) {
      message.push(this.view['fieldID']);
    }

    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
    } else {
      if (this.attachment && this.attachment.fileUploadList.length) {
        (await this.attachment.saveFilesObservable())
          .pipe(takeUntil(this.detroyFormTask$))
          .subscribe((res) => {
            this.attachment?.clearData();

            if (res) {
              if (res?.length >= 0) {
                res.forEach((item) => {
                  if (item['data']['recID']) {
                    this.listFileTask.push(item['data']['recID']);
                  }
                });
              } else {
                this.listFileTask.push(res['data']['recID']);
              }
              this.handelSave();
            }
          });
      } else {
        this.handelSave();
      }
    }
  }

  handelSave() {
    // this.stepsTasks = JSON.parse(JSON.stringify(this.stepsTasks));
    let task = this.stepsTasks;
    // if task thuộc group thì kiểm tra trong group nếu không thuộc group kiểm tra với step
    if (task['taskGroupID']) {
      let groupTask = this.listGroupTask?.find(
        (x) => x.recID == task?.taskGroupID
      );
      if (
        task?.dependRule != '1' ||
        !task?.parentID.trim() ||
        groupTask?.task?.length === 0
      ) {
        //No parentID
        this.checkSave(groupTask);
      } else {
        // tính thời gian lớn nhất của group
        let timeMax = this.getTimeMaxGroupTask(
          groupTask?.task,
          this.stepsTasks
        );
        this.checkSave(groupTask, timeMax);
      }
    } else {
      if (!task['parentID'].trim() || task['dependRule'] != '1') {
        //if ko có parentID thì so sánh trực tiếp với step
        if (this.getHour(this.stepsTasks) > this.getHour(this.step)) {
          this.notiService.alertCode('DP010').subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = this.stepsTasks['durationDay'] || 0;
              this.step['durationHour'] = this.stepsTasks['durationHour'] || 0;
              this.dialog?.close({
                data: this.stepsTasks,
                status: this.action,
              });
              this.onDestroy();
            }
          });
        } else {
          this.dialog.close({ data: this.stepsTasks, status: this.action });
          this.onDestroy();
        }
      } else {
        // tính thời gian dựa vào công việc liên quan rồi mới so sánh
        let listIdTask = this.stepsTasks['parentID'].split(';');
        let maxtime = 0;
        listIdTask?.forEach((id) => {
          let time = this.getSumTimeTask(this.listTask, id, false);
          maxtime = Math.max(time, maxtime);
        });
        maxtime += this.getHour(this.stepsTasks);
        if (maxtime > this.getHour(this.step)) {
          this.notiService.alertCode('DP010').subscribe((x) => {
            if (x.event && x.event.status == 'Y') {
              this.step['durationDay'] = Math.floor(maxtime / 24 || 0);
              this.step['durationHour'] = maxtime % 24 || 0;
              this.dialog.close({ data: this.stepsTasks, status: this.action });
              this.onDestroy();
            }
          });
        } else {
          this.dialog.close({ data: this.stepsTasks, status: this.action });
          this.onDestroy();
        }
      }
    }
  }

  checkSave(groupTask, timeInput?: number) {
    let time = timeInput ? timeInput : this.getHour(this.stepsTasks);
    if (this.getHour(groupTask) >= time) {
      // nếu thời gian ko vượt quá thời gian cho phép lưu => không ảnh hưởng đến step
      this.dialog.close({ data: this.stepsTasks, status: this.action });
    } else {
      // nếu vượt quá thì hỏi ý kiến
      this.notiService.alertCode('DP010').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          if (timeInput) {
            groupTask['durationDay'] = Math.floor(time / 24);
            groupTask['durationHour'] = time % 24;
          } else {
            groupTask['durationDay'] = this.stepsTasks['durationDay'];
            groupTask['durationHour'] = this.stepsTasks['durationHour'];
          }
          let sumGroup = this.sumHourGroupTask();
          let timeStep = this.getHour(this.step);
          if (sumGroup > timeStep) {
            this.step['durationDay'] = Math.floor(sumGroup / 24);
            this.step['durationHour'] = sumGroup % 24;
          }
          this.dialog.close({ data: this.stepsTasks, status: this.action });
          this.onDestroy();
        }
      });
    }
  }
  //#endregion

  //#region handle time
  getHour(data) {
    let hour =
      Number(data?.durationDay || 0) * 24 + Number(data?.durationHour || 0);
    return hour || 0;
  }

  sumHourGroupTask(index?: number) {
    let sum = 0;
    if (this.listGroupTask?.length > 0) {
      if (index >= 0) {
        for (let group of this.listGroupTask) {
          if (Number(group['indexNo']) < index) {
            sum += this.getHour(group);
          }
        }
      } else {
        sum = this.listGroupTask.reduce((sumHour, group) => {
          return (sumHour += this.getHour(group));
        }, 0);
      }
    }
    return sum;
  }

  getTimeMaxGroupTask(tasks, task) {
    if (!task) return 0;
    if (!tasks || tasks?.length <= 0) return this.getHour(task);
    let listTask = JSON.parse(JSON.stringify(tasks));
    let maxTime = 0;
    if (this.action === 'edit') {
      let index = listTask?.findIndex((t) => t.recID == task.recID);
      if (index >= 0) {
        listTask?.splice(index, 1, task);
      }
      listTask?.forEach((itemTask) => {
        let time = this.getSumTimeTask(listTask, itemTask['recID']);
        maxTime = Math.max(maxTime, time);
      });
    } else {
      listTask?.push(task);
      maxTime = this.getSumTimeTask(listTask, task['recID']);
    }
    return maxTime;
  }

  getSumTimeTask(taskList: any[], taskId: string, isGroup = true) {
    let task = taskList?.find((t) => t['recID'] === taskId);
    if (!task) return 0;
    if (task['dependRule'] != '1' || !task['parentID']?.trim()) {
      let maxTime = this.getHour(task);
      if (task.taskGroupID && !isGroup) {
        let groupFind = this.listGroupTask?.find(
          (group) => group['recID'] == task.taskGroupID
        );
        if (groupFind) {
          let time = this.sumHourGroupTask(groupFind?.indexNo) || 0;
          maxTime += time;
        }
      }
      return maxTime;
    } else {
      const parentIds = task?.parentID.split(';');
      let maxTime = 0;
      parentIds?.forEach((parentId) => {
        const parentTime = this.getSumTimeTask(taskList, parentId, isGroup);
        maxTime = Math.max(maxTime, parentTime);
      });
      const completionTime = this.getHour(task) + maxTime;
      return completionTime;
    }
  }
  //#endregion

  //#region change value
  parentIDChange(event) {
    this.listParentID = event;
  }
  // fieldIDChange(event) {
  //   this.listFieldID = event;
  //   let field = this.listFields.find((fieldID) => fieldID.recID == event[0]);
  //   // this.clickSettingReference(field);
  // }
  onItemClick(e) {
    console.log(e);
    console.log(e?.item?.value);
  }
  valueChangeText(event) {
    this.stepsTasks[event?.field] = JSON.parse(JSON.stringify(event?.data));
  }

  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
    if (event?.field == 'createTask') {
      if (event?.data) {
        this.stepsTasks.assignControl = '0';
      } else {
        this.stepsTasks.assignControl = null;
      }
    }
  }

  changeRoler(e, roleType) {
    if (!e || e?.length == 0) return;
    let listUser = e || [];
    let listRole = [];
    for (let role of listUser) {
      if (
        roleType == 'P' &&
        this.owner.some((ownerFind) => ownerFind.objectID == role.objectID)
      ) {
        continue;
      }
      listRole.push({
        objectID: role?.objectID,
        objectName: role?.objectName,
        objectType: role?.objectType,
        roleType: roleType,
        taskID: this.stepsTasks?.recID,
      });
    }
    if (roleType == 'O') {
      this.owner = listRole;
      this.stepsTasks.owner = this.owner[0]?.objectID;
      let index = this.participant?.findIndex(
        (role) => role?.objectID == this.stepsTasks.owner
      );
      index >= 0 &&
        this.participant?.length > 0 &&
        this.participant?.splice(index, 1);
      this.participant = [...this.participant];
    }
    if (roleType == 'P') {
      this.participant = listRole;
    }
  }
  //#endregion

  //#region prarentID
  async changeCombobox(event, key) {
    let data = event?.value;
    this.stepsTasks[key] = data;
    let group = this.listGroupTask.find((x) => x.recID === data);
    this.listTaskLink = group?.recID
      ? JSON.parse(JSON.stringify(group?.task))
      : JSON.parse(JSON.stringify(this.listTask));
    await this.getTasksWithoutLoop(this.stepsTasks, this.listTaskLink);
    this.stepsTasks['parentID'] = '';
    this.listParentID = [];
  }

  async getTasksWithoutLoop(task, tasks) {
    this.listParentID;
    let indexTask = tasks?.findIndex((item) => item.recID === task.recID);
    if (indexTask >= 0) {
      tasks.splice(indexTask, 1);
    }
    let listTask = tasks.filter((item) =>
      item?.parentID?.includes(task?.recID)
    );
    if (listTask?.length == 0) return;

    listTask?.forEach(async (element) => {
      await this.getTasksWithoutLoop(element, tasks);
    });
  }
  //#endregion
  async clickSettingApprove() {
    let category;
    if (this.action == 'edit')
      category = await firstValueFrom(
        this.api.execSv<any>(
          'ES',
          'ES',
          'CategoriesBusiness',
          'GetByCategoryIDTypeAsync',
          [this.stepsTasks.recID, 'DP_Steps_Tasks', null]
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
            category.category = 'DP_Steps_Tasks'; //DP_Instances_Steps_Tasks
            category.categoryID = this.stepsTasks.recID;
            category.categoryName = this.stepsTasks.taskName;
            category.createdBy = this.user.userID;
            category.owner = this.user.userID;
            category.functionApproval = 'DPT04';
            category['refID'] = this.stepsTasks.recID;
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
              let popupEditES = this.callfunc.openForm(
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
                  templateRefID: this.stepsTasks.recID,
                  templateRefType: 'DP_Steps_Tasks', //DP_Instances_Steps_Tasks
                  disableESign: true,
                },
                '',
                opt
              );

              popupEditES.closed.subscribe((res) => {
                if (res?.event) {
                  this.loadListApproverStep();
                  // this.loadEx();
                  // this.loadWord();
                  // this.recIDCategory = res?.event?.recID;
                }
              });
            });
        });
      }
    });
  }
  loadListApproverStep() {
    this.getListAproverStepByCategoryID(this.stepsTasks?.recID)
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

  clickSettingReference(field = null) {
    let option = new DialogModel();
    option.zIndex = 1050;
    let obj = {
      datas: this.listGrvContracts,
      entityName: 'CM_Contracts',
      action: this.action,
      titleAction: 'Thêm trường liên kết', //test
      listFields: this.listFields,
    };
    let dialogColumn = this.callfunc.openForm(
      PopupMapContractComponent,
      '',
      1000,
      Util.getViewPort().height - 100,
      '',
      obj,
      '',
      option
    );
    dialogColumn?.closed.subscribe((res) => {
      if (res?.event) {
        this.listGrvContracts = res?.event;
        this.listFieldID = [];
        for (let grv of this.listGrvContracts) {
          grv.show = false;
          if (grv?.field?.recID) {
            this.listFieldID.push(grv?.field?.recID);
          }
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  handleDivClick(event: Event) {
    event.stopPropagation();
    this.showSelect = true;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const combobox = this.elementRef.nativeElement.querySelector('#combobox');
    if (combobox && !combobox.contains(event.target as Node)) {
      this.showSelect = false;
    }
  }

  chooseFieldCombobox(field, index) {
    if(field){
      this.listFieldIntask = this.listFieldIntask?.length ? this.listFieldIntask : [];
      this.listFieldIntask.push({recID: field?.recID, title: field?.title});
      this.titleField = this.listFieldIntask?.map(x => x.title)?.join('; ');
      if(index >= 0){
        this.listFieldConvert?.splice(index,1);
      }
    }
  }

  removeField(field) {
   if(field){
    let index = this.listFieldIntask.findIndex(x => x.recID === field?.recID);
    if(index >= 0){
      this.listFieldIntask?.splice(index,1);
      this.titleField = this.listFieldIntask?.map(x => x.title)?.join(';');
      this.listFieldConvert?.unshift(field);
    }
   }
  }

  drop(event: CdkDragDrop<string[]>) {
    let field = event.previousContainer?.data['item'];
    let indexContainer = event.container?.data['index'];
    let indexPrevious = event.previousContainer?.data['index'];
    if(this.listFieldIntask?.length > 0 && indexContainer >= 0 && indexPrevious>=0 && indexContainer != indexPrevious  && field){
      this.listFieldIntask.splice(indexPrevious,1);
      this.listFieldIntask.splice(indexContainer,0,field);
    }
  }
}
