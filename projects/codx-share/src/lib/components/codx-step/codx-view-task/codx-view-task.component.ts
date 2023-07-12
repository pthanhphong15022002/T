
import {
  FormModel,
  DialogRef,
  AuthStore,
  DialogData,
  CacheService,
  ApiHttpService,
  CallFuncService,
} from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { StepService } from '../step.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { UpdateProgressComponent } from '../codx-progress/codx-progress.component';
import { DP_Instances_Steps, DP_Instances_Steps_TaskGroups, DP_Instances_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'codx-view-task',
  templateUrl: './codx-view-task.component.html',
  styleUrls: ['./codx-view-task.component.scss'],
})
export class CodxViewTaskComponent implements OnInit {
  //#region input
  type = '';//P:step, G: group, task
  dataInput: any; // step or group or task
  isRoleAll = false;
  isOnlyView = false;
  listRefIDAssign: any;
  listIdRoleInstance = [];
  isUpdateProgressGroup = false;
  isUpdateProgressStep = false;
  instanceStep: DP_Instances_Steps;
  //#endregion

  title = ''; // tiêu đề
  dataView: any; // data hien thi 
  owner = []; //role type O
  person = []; //role
  connection = '';// người liên quan => step
  participant = []; //role type P
  listDataLink = []; //role type S
  listTypeTask = []; 
  hideExtend = true;
  isShowUpdate = false;
  user: any;
  dataTree: any;
  dialog!: DialogRef;
  dataProgress: any = null;
  frmModel: FormModel = {};
  groupTaskAdd: DP_Instances_Steps_TaskGroups;
  taskAdd: DP_Instances_Steps_Tasks;

  viewModelDetail = 'history'; // nằm ở phần mở rộng
  tabInstances = [
    { type: 'history', title: 'Lịch sử' },
    { type: 'comment', title: 'Thảo luận' },
    { type: 'attachments', title: 'Đính kèm' },
    { type: 'assignTask', title: 'Giao việc' },
  ];
  
  dateFomat = 'dd/MM/yyyy';
  formModelStep: FormModel;
  moreDefaut;

  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    public sanitizer: DomSanitizer,
    private callfc: CallFuncService,
    private stepService: StepService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.dataInput = dt?.data?.value;
    this.isRoleAll = dt?.data?.isRoleAll;
    this.isOnlyView = dt?.data?.isOnlyView;
    this.instanceStep = dt?.data?.instanceStep;
    this.listRefIDAssign = dt?.data?.listRefIDAssign; // a thảo truyền để lấy listRef của cong việc
    this.listIdRoleInstance = dt?.data?.listIdRoleInstance;
    this.isUpdateProgressGroup = dt?.data?.isUpdateProgressGroup;
    this.getModeFunction();
    this.getTree(); //get tree by refID
    this.formModelStep = this.stepService.formModelStep;
    this.moreDefaut = this.stepService.moreDefaut;
  }

  ngOnInit(): void {
    // nhận vào 1 instanceStep và dữ liệu cần xem chi tiết 
    // nếu không có thì dựa vào dữ liệu cần xem để lấy instance từ DB để xử lý
    if (this.type == 'P') {
      this.getInstanceStepByRecID(this.dataInput?.recID);
    } else {
      this.getInstanceStepByRecID(this.dataInput?.stepID);
    }
  }

  closePopup() {
    //khi đóng thì nhận về progress để cập nhật nếu step và group thì có thêm group và task đã thêm
    this.dialog.close({dataProgress: this.dataProgress, group: this.groupTaskAdd, task: this.taskAdd });
  }

  //#region get data
  async getInstanceStepByRecID(recID) {
    if(!this.instanceStep){
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
          this.isOnlyView = this.instanceStep?.stepStatus == '1' ? true : false;
          // this.checkRole();
        }
        await this.setDataView();
        this.settingData();
        this.changeDetectorRef.detectChanges();
      });
    }else{
      await this.setDataView();
      this.settingData();
      this.isOnlyView = this.instanceStep?.stepStatus == '1' ? true : false;
      this.isUpdateProgressGroup = this.instanceStep?.progressTaskGroupControl || false;
      this.isUpdateProgressStep = this.instanceStep?.progressStepControl || false;
    }
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
    return type == 'P'? task?.icon : color?.icon;
  }

  getColor(task) {
    let type = task?.taskType || this.type;
    let color = this.listTypeTask?.find((x) => x.value === type);
    return { 'background-color': type == 'P' ? task?.backgroundColor: color?.color, with: '40px', height: '40px' };
  }

  getColorTile(task) {
    let type = task?.taskType || this.type;
    let color = this.listTypeTask?.find((x) => x.value === type);
    return { 'border-left': '3px solid' + color?.color };
  }
  //#endregion

  //#region set data
  async setDataView() {
    if (this.type == 'P') {
      this.dataView = this.instanceStep;
    } else if (this.type == 'G') {
      let groupView = this.instanceStep?.taskGroups?.find(
        (group) => group.recID == this.dataInput?.recID
      );
      this.dataView = groupView;
    } else {
      let taskView = this.instanceStep?.tasks?.find(
        (task) => task.recID == this.dataInput.recID
      );
      if(taskView){
        this.dataView = taskView;
      }else{
        this.dataView = this.dataInput;
      }
      
    }
  }
  settingData() {
    if (this.type == 'T' && this.dataView?.parentID) {
      this.instanceStep?.tasks?.forEach((task) => {
        if (this.dataView?.parentID?.includes(task.refID)) {
          this.listDataLink?.push(task);
        }
      });
    }

    if (this.type == 'G') {
      this.listDataLink = this.instanceStep?.tasks?.filter(
        (data) => data?.taskGroupID == this.dataView.refID
      );
    }

    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
        let type = res.datas.find((x) => x.value === this.type);
        this.title = type?.text;
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
  //#endregion

  //#region thu gon and mo rong
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
        doc?.setAttribute('style', 'display: none');
        ext?.classList.remove('rotate-back');
      } else {
        document
          .getElementsByClassName('codx-dialog-container')[0]
          .setAttribute('style', 'width: 900px; z-index: 1000;');
        doc?.setAttribute('style', 'display: block');
        ext?.classList.add('rotate-back');
      }
    }
  }
  //#endregion
  
  //#region progress
  async openPopupUpdateProgress(data, type) {
    let checkUpdate = this.checkUpdateProgress(data, type);
    if (!checkUpdate) return;
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
    this.changeDetectorRef.detectChanges();
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
  //#endregion
  
  //#region more functions
  changeDataMFStep(event) {
    let isGroup = true;
    let isTask = true;
    if (event != null) {
      event.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02': //xóa
          case 'SYS03': //sửa
          case 'SYS04': //copy
          case 'SYS003': //đính kèm file
          case 'DP07': //chi tiêt công việc
          case 'DP12':
          case 'DP25':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          case 'DP26': // chi tiêt
            res.disabled = true;
            break;

          case 'DP08': // Thêm công việc
            res.isbookmark = true;
            if (
              !(
                this.isRoleAll &&
                this.isOnlyView &&
                (this.type == 'P' || this.type == 'G')
              )
            ) {
              res.disabled = true;
            }
            break;
          case 'DP13': // giao việc
            res.isbookmark = true;
            if (
              !(
                this.dataView?.createTask &&
                this.isOnlyView &&
                (this.isRoleAll || isGroup || isTask) &&
                this.type != 'P' &&
                this.type != 'G'
              )
            ) {
              res.disabled = true;
            }
            break;
          case 'DP24': // tạo lịch họp
            res.isbookmark = true;
            if (this.type != 'M') {
              res.disabled = true;
            }
            break;
          case 'DP20': // tiến độ
            res.isbookmark = true;
            if (!(this.isRoleAll && this.isOnlyView && this.isUpdateProgressStep)) {
              res.disabled = true;
            }
            break;
          case 'DP27':// đặt xe
            res.isbookmark = true;
            if (this.type != 'B') {
              res.disabled = true;
            }
            break;
          case 'DP31': // bắt đầu ngay
            if((this.dataView?.dependRule != "0" || this.dataView?.status != "1")){
              res.disabled = true;
            }else if (!((this.isRoleAll || isGroup || isTask) && this.isOnlyView)) {
                res.isblur = true;
              }           
            break;
        }
      });
    }
  }

  async clickMFStep(event) {
    switch (event.functionID) {
      case 'DP13': //giao viec
        this.stepService.assignTask(event.data, this.dataView,this.instanceStep);
        break;
      case 'DP08': //them task
        await this.chooseTypeTask();
        break;
      case 'DP20': // tien do
        this.openPopupUpdateProgress(this.dataView, this.type)
        break;
      case 'DP27': // đặt xe
        await this.stepService.addBookingCar()
        break;

    }
  }
  //#endregion

  //#region CRUD
  async chooseTypeTask(){
    let isAddGroup = this.type == 'P' ? true : false;
    let dataType = await this.stepService.chooseTypeTask(isAddGroup);
    if(dataType){
      if (dataType?.value == 'G') {          
        await this.addGroup();
      } else {
        await this.addTask(dataType);
      }
    }
  }

  async addGroup(){
    let groupOutput = await this.stepService.addGroupTask(this.instanceStep);
    if(groupOutput?.groupTask){
      this.groupTaskAdd = groupOutput?.groupTask;
      this.instanceStep?.taskGroups?.push(groupOutput?.groupTask);
      this.changeDetectorRef.detectChanges();
    }
  }

  async addTask(dataType){
    let groupId = this.type == "G" ? this.dataView?.refID : null;
    let taskOutput = await this.stepService.addTask(dataType,this.instanceStep,groupId);
    if(taskOutput?.task){
      this.taskAdd = taskOutput?.task;
      this.instanceStep?.tasks?.push(taskOutput?.task);
      if(this.type != "P"){
        this.listDataLink?.push(this.taskAdd);
      }
      this.changeDetectorRef.detectChanges();
    }
  }
  //#endregion
  
  //#region check role
  checkRole() {
    if (this.listIdRoleInstance?.some((id) => id == this.user.userID)) {
      this.isRoleAll = true;
    } else if (this.instanceStep?.roles?.length > 0) {
      this.isRoleAll =
        this.instanceStep?.roles?.some(
          (element) =>
            element?.objectID == this.user.userID && element.roleType == 'S'
        ) || false;
    }
    this.isUpdateProgressGroup =
    this.instanceStep?.progressTaskGroupControl || false; //Cho phép người phụ trách cập nhật tiến độ nhóm công việc
    this.isUpdateProgressStep = this.instanceStep?.progressStepControl || false; //Cho phép người phụ trách cập nhật tiến độ nhóm giai đoạn
  }
  //#endregion

  //#region ve tree giao viec byRef
  getTree() {
    if (!this.listRefIDAssign) {
      this.dataTree = [];
      return;
    }
    let method = 'GetListTaskTreeByRefIDAsync';
    let data = this.listRefIDAssign;
    if (this.type == 'P' || this.type == 'G') {
      method = 'GetListTaskTreeByListRefIDAsync';
      data = JSON.stringify(this.listRefIDAssign.split(';'));
    }
    this.api
      .execSv<any>('TM', 'ERM.Business.TM', 'TaskBusiness', method, data)
      .subscribe((tree) => {
        this.dataTree = tree || [];
      });
  }
  saveAssign(e) {
    if (e) this.getTree();
  }
  //#endregion
}
