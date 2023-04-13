import { Component, OnInit, Optional } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { UpdateProgressComponent } from 'projects/codx-dp/src/lib/instances/instance-detail/stages-detail/update-progress/update-progress.component';
@Component({
  selector: 'lib-view-job',
  templateUrl: './view-step-task.component.html',
  styleUrls: ['./view-step-task.component.scss'],
})
export class ViewJobComponent implements OnInit {
  title = '';
  dialog!: DialogRef;
  dataInput = {}; //format về như vậy {recID,name,startDate,type, roles, durationHour, durationDay,parentID }
  type = '';
  owner = [];
  person = [];
  participant = [];
  listDataInput = [];
  listTypeTask = [];
  listDataLink = [];
  tabInstances = [
    { type: 'view', title: 'Chi tiết công việc', icon: 'icon-history',},
    { type: 'history', title: 'Lịch sử', icon: 'icon-info' },
  ];
  viewModelDetail = 'view';
  dateFomat = 'dd/MM/yyyy';
  frmModel: FormModel = {};
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    public sanitizer: DomSanitizer,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.value?.type;
    this.dataInput = dt?.data?.value;
    this.listDataInput = dt?.data?.listValue;
    this.getModeFunction();
  }

  ngOnInit(): void {
    if (this.dataInput['parentID']) {
      this.listDataInput?.forEach((task) => {
        if (this.dataInput['parentID']?.includes(task.refID)) {
          this.listDataLink.push(task);
        }
      });
    }
    if (this.dataInput['type'] == 'G') {
      this.listDataLink = this.listDataInput?.filter(
        (data) =>
          data['taskGroupID'] && data['taskGroupID'] == this.dataInput['refID']
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
      this.dataInput['roles']?.filter((role) => role.roleType === 'O') || [];
    this.participant =
      this.dataInput['roles']?.filter((role) => role.roleType === 'P') || [];
    this.person =
      this.dataInput['roles']?.filter((role) => role.roleType === 'S') || [];
    console.log(this.owner);
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
    let color = this.listTypeTask?.find((x) => x.value === task.type);
    return color?.icon;
  }

  getColor(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.type);
    return { 'background-color': color?.color };
  }
  getColorTile(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.type);
    return { 'border-left': '3px solid' + color?.color };
  }

  clickMenu(e) {
    this.viewModelDetail = e;
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
}
