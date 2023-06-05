import { Component, OnInit, Optional } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { DP_Instances_Steps } from 'projects/codx-dp/src/lib/models/models';
import { firstValueFrom } from 'rxjs';
import { UpdateProgressComponent } from '../codx-progress/codx-progress.component';
import { StepService } from '../step.service';

@Component({
  selector: 'codx-view-task',
  templateUrl: './codx-view-task.component.html',
  styleUrls: ['./codx-view-task.component.scss'],
})
export class CodxViewTaskComponent implements OnInit {
  instanceStep: DP_Instances_Steps;
  dataView: any;
  type = '';
  title = '';
  dialog!: DialogRef;
  participant = []; //role
  owner = []; //role
  person = []; //role
  listDataLink = [];
  dataInput: any; 
  dataProgress: any = null;

  isOnlyView = false;
  isUpdateProgressGroup = false;
  isUpdateProgressStep = false;

  isRoleAll = false;
  listIdRoleInstance = [];

  connection = '';
  listTypeTask = [];
  tabInstances = [
    { type: 'history', title: 'History' },
    { type: 'comment', title: 'Comment' },
    { type: 'attachments', title: 'Attachments' },
  ];
  viewModelDetail = 'history';
  dateFomat = 'dd/MM/yyyy';
  frmModel: FormModel = {};
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-rule', text: 'Thiết lập', name: 'Establish' },
  ];
  hideExtend = true;
  isShowUpdate = false;
  user: any;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    public sanitizer: DomSanitizer,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    private stepService: StepService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.dataInput = dt?.data?.value;
    this.isRoleAll = dt?.data?.isRoleAll;
    this.isOnlyView = dt?.data?.isOnlyView;
    this.isUpdateProgressGroup = dt?.data?.isUpdateProgressGroup;
    this.listIdRoleInstance = dt?.data?.listIdRoleInstance;
    this.getModeFunction();
  }

  ngOnInit(): void {
    if (this.type == 'P') {
      this.getInstanceStepByRecID(this.dataInput?.recID);
    } else {
      this.getInstanceStepByRecID(this.dataInput?.stepID);
    }
  }

  async getInstanceStepByRecID(recID) {
    this.api
      .exec<any>(
        'DP',
        'InstanceStepsBusiness',
        'GetInstanceStepByRecIDAsync',
        recID
      )
      .subscribe(async (res) => {
        if (res) {
          this.instanceStep = res;
          await this.setDataView();
          this.settingData();
          this.isOnlyView = this.instanceStep?.stepStatus == '1' ? true : false;
          // this.checkRole();
        }
      });
  }

  checkRole(){
    if (this.listIdRoleInstance?.some((id) => id == this.user.userID)) {
      this.isRoleAll = true;
    } else if (this.instanceStep?.roles?.length > 0) {
      this.isRoleAll =
        this.instanceStep?.roles?.some(
          (element) =>
            element?.objectID == this.user.userID && element.roleType == 'S'
        ) || false;
    }
    this.isUpdateProgressGroup = this.instanceStep?.progressTaskGroupControl || false; //Cho phép người phụ trách cập nhật tiến độ nhóm công việc
    this.isUpdateProgressStep = this.instanceStep?.progressStepControl || false; //Cho phép người phụ trách cập nhật tiến độ nhóm giai đoạn
  }

  async setDataView() {
    if (this.type == 'P') {
      this.dataView = this.instanceStep;
    } else if (this.type == 'G') {
      let groupView = this.instanceStep.taskGroups.find(
        (group) => group.recID == this.dataInput.recID
      );
      this.dataView = groupView;
    } else {
      let taskView = this.instanceStep.tasks.find(
        (task) => task.recID == this.dataInput.recID
      );
      this.dataView = taskView;
    }
  }

  settingData() {
    if (this.type == 'T' && this.dataView?.parentID) {
      this.instanceStep?.tasks?.forEach((task) => {
        if (this.dataView?.parentID?.includes(task.refID)) {
          this.listDataLink.push(task);
        }
      });
    }

    if (this.type == 'G') {
      this.listDataLink = this.instanceStep?.tasks?.filter(
        (data) => data?.taskGroupID == this.dataView.refID
      );
    }

    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
        let type = res.datas.find((x) => x.value === this.type);
        this.title = type['text'];
      }
    });

    this.owner =
      this.dataView?.roles?.filter((role) => role.roleType === 'O') || [];
    this.participant =
      this.dataView?.roles?.filter((role) => role.roleType === 'P') || [];
    this.person =
      this.dataView?.roles?.filter((role) => role.roleType === 'S') || [];
    this.connection =
      this.dataView?.roles
        ?.filter((role) => role.roleType === 'R')
        ?.map((item) => {
          return item.objectID;
        })
        .join(';') || [];
  }

  getModeFunction() {
    var functionID = 'DPT0206';
    this.cache.functionList(functionID).subscribe((f) => {
      this.cache.gridViewSetup(f.formName, f.gridViewName).subscribe((grv) => {
        this.frmModel['formName'] = f.formName;
        this.frmModel['gridViewName'] = f.gridViewName;
        this.frmModel['entityName'] = f.entityName;
        this.frmModel['funcID'] = functionID;
      });
    });
  }

  getIconTask(task) {
    let type = task?.taskType || this.type;
    let color = this.listTypeTask?.find((x) => x.value === type);
    return color?.icon;
  }

  getColor(task) {
    let type = task?.taskType || this.type;
    let color = this.listTypeTask?.find((x) => x.value === type);
    return { 'background-color': color?.color, with: '40px', height: '40px' };
  }
  getColorTile(task) {
    let type = task?.taskType || this.type;
    let color = this.listTypeTask?.find((x) => x.value === type);
    return { 'border-left': '3px solid' + color?.color };
  }

  clickMenu(e) {
    this.viewModelDetail = e;
  }


  extendShow(): void {
    this.hideExtend = !this.hideExtend;
    var doc = document.getElementsByClassName('extend-more')[0];
    var ext = document.getElementsByClassName('ext_button')[0];
    if (ext != null) {
      if (this.hideExtend) {
        document
          .getElementsByClassName('codx-dialog-container')[0]
          .setAttribute('style', 'width: 550px; z-index: 1000;');
        doc.setAttribute('style', 'display: none');
        ext.classList.remove('rotate-back');
      } else {
        document
          .getElementsByClassName('codx-dialog-container')[0]
          .setAttribute('style', 'width: 900px; z-index: 1000;');
        doc.setAttribute('style', 'display: block');
        ext.classList.add('rotate-back');
      }
    }
  }
  async openPopupUpdateProgress(data, type) {
    // let checkUpdate = this.stepService.checkUpdateProgress(
    //   data,
    //   type,
    //   this.instanceStep,
    //   this.isRoleAll,
    //   this.isOnlyView,
    //   this.isUpdateProgressGroup,
    //   this.isUpdateProgressStep,
    //   this.user
    // );
    // if (!checkUpdate) return;
    if (type != 'P' && type != 'G') {
      let checkTaskLink = this.stepService.checkTaskLink(
        data,
        this.instanceStep
      );
      if (!checkTaskLink) return;
    }
    let dataInput = {
      data,
      type,
      step: this.instanceStep,
    };
    let popupTask = this.callfc.openForm(
      UpdateProgressComponent,
      '',
      550,
      400,
      '',
      dataInput
    );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    if (dataPopupOutput?.event) {
      if (this.type == 'P') {
        this.dataView.progress = dataPopupOutput?.event?.progressStep;
      } else if (this.type == 'G') {
        this.dataView.progress = dataPopupOutput?.event?.progressGroupTask;
      } else {
        this.dataView.progress = dataPopupOutput?.event?.progressTask;
      }
    }
    this.dataProgress = dataPopupOutput?.event;
  }
  closePopup() {
    this.dialog.close(this.dataProgress);
  }
  checkUpdateProgress(data, type) {
    let check = this.stepService.checkUpdateProgress(
      data,
      type,
      this.instanceStep,
      this.isRoleAll,
      this.isOnlyView,
      this.isUpdateProgressGroup,
      this.isUpdateProgressStep,
      this.user
    );
    return check;
  }
}
