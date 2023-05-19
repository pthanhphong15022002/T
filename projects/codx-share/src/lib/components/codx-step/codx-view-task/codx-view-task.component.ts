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
  participant = [];//role
  owner = [];//role
  person = [];//role
  listDataLink = [];
  dataInput: any; //format về như vậy {recID,name,startDate,type, roles, durationHour, durationDay,parentID }


  connection = '';
  listDataInput = [];
  listTypeTask = [];
  tabInstances = [
    { type: 'history', title: 'History'},
    { type: 'comment', title: 'Comment'},
    { type: 'attachments', title: 'Attachments'},
  ];
  viewModelDetail = 'history';
  dateFomat = 'dd/MM/yyyy';
  frmModel: FormModel = {};
  step: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-rule', text: 'Thiết lập', name: 'Establish' },
  ];
  hideExtend = true;
  isRoleAll = false;
  isShowUpdate = false;
  user: any;
  isUpdate = false;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    public sanitizer: DomSanitizer,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.type = dt?.data?.value?.type;
    this.dataInput = dt?.data?.value;
    this.isRoleAll = dt?.data?.isRoleAll;
    this.isUpdate = dt?.data?.isUpdate;


    this.listDataInput = dt?.data?.listValue;
    this.step = dt?.data?.step;
    this.getModeFunction();


    //TODO: check quyền cập nhật tiến độ
    //TODO: role và công việc liên kết
    this.isShowUpdate = this.isRoleAll && this.isUpdate;
    // this.dataView = dt?.data?.dataView;
    console.log(this.dataView);
  }


  ngOnInit(): void {
    if(this.type == 'P'){
      this.getInstanceStepByRecID(this.dataInput?.recID);
    }else{
      this.getInstanceStepByRecID(this.dataInput?.stepID);
    }
  }


  getInstanceStepByRecID(recID) {
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetInstanceStepByRecIDAsync',
      recID
    ).subscribe(async res => {
      if(res){
        this.instanceStep = res;
        await this.setDataView();
        this.settingData();
      }
    })
  }


  async setDataView(){
    if(this.type == 'P'){
      this.dataView = this.instanceStep;
    }else if(this.type == 'G'){
      let groupView = this.instanceStep.taskGroups.find(group => group.recID == this.dataInput.recID)
      this.dataView = groupView;
    }else{
      let taskView = this.instanceStep.tasks.find(task => task.recID == this.dataInput.recID)
        this.dataView = taskView;
    }
  }


  settingData(){
    if(this.type == 'T' && this.dataView?.parentID){
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


    this.owner = this.dataView?.roles?.filter((role) => role.roleType === 'O') || [];
    this.participant = this.dataView?.roles?.filter((role) => role.roleType === 'P') || [];
    this.person = this.dataView?.roles?.filter((role) => role.roleType === 'S') || [];
    this.connection = this.dataView?.roles?.filter((role) => role.roleType === 'R')?.map(item => {return item.objectID}).join(';') || [];
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


  checRoleTask(data, type) {
    return (
      data.roles?.some(
        (element) =>
          element?.objectID == this.user.userID && element.roleType == type
      ) || false
    );
  }
 
  openUpdateProgress(data?: any) {
    console.log('======');
   
    this.callfc.openForm(UpdateProgressComponent, '', 550, 400);
    if (data?.parentID) {
      //check công việc liên kết hoàn thành trước
    //   let check = false;
    //   let taskName = '';
    //   let listID = data?.parentID.split(';');
    //   listID?.forEach((item) => {
    //     let taskFind = this.taskList?.find((task) => task.refID == item);
    //     if (taskFind?.progress != 100) {
    //       check = true;
    //       taskName = taskFind?.taskName;
    //     } else {
    //       this.actualEndMax =
    //         !this.actualEndMax || taskFind?.actualEnd > this.actualEndMax
    //           ? taskFind?.actualEnd
    //           : this.actualEndMax;
    //     }
    //   });
    //   if (check) {
    //     this.notiService.notifyCode('DP023', 0, taskName);
    //     return;
    //   }
    // } else {
    //   this.actualEndMax = this.step?.actualStart;
    // }
    // if (data) {
    //   this.dataProgress = JSON.parse(JSON.stringify(data));
    //   this.dataProgressClone = data;
    //   this.progressOld = data['progress'] == 100 ? 0 : data['progress'];
    //   this.disabledProgressInput = data['progress'] == 100 ? true : false;
    // }
   
    }
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
  async openPopupUpdateProgress(data, type){
    let dataInput = {
      data,
      type,
      step: this.instanceStep,
    };
    let popupTask = this.callfc.openForm(
      UpdateProgressComponent,'',
      550, 400,
      '',
      dataInput);


    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    if(dataPopupOutput?.event){
      if(this.type == 'P'){
        this.dataView.progress = dataPopupOutput?.event?.progressStep;
      }else if(this.type == 'G'){
        this.dataView.progress = dataPopupOutput?.event?.progressGroupTask;
      }else{
        this.dataView.progress = dataPopupOutput?.event?.progressTask;
      }
    }
   
  }
}
