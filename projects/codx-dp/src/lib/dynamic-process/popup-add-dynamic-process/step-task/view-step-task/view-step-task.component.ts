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
import { UpdateProgressComponent } from 'projects/codx-dp/src/lib/componnent-task/update-progress/update-progress.component';

@Component({
  selector: 'lib-view-job',
  templateUrl: './view-step-task.component.html',
  styleUrls: ['./view-step-task.component.scss'],
})
export class ViewJobComponent implements OnInit {
  title = '';
  dialog!: DialogRef;
  dataInput: any; //format về như vậy {recID,name,startDate,type, roles, durationHour, durationDay,parentID }
  type = '';
  owner = [];
  person = [];
  participant = [];
  connection = '';
  listDataInput = [];
  listTypeTask = [];
  listDataLink = [];
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
    this.step = dt?.data?.step;
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

    this.owner = this.dataInput['roles']?.filter((role) => role.roleType === 'O') || [];
    this.participant = this.dataInput['roles']?.filter((role) => role.roleType === 'P') || [];
    this.person = this.dataInput['roles']?.filter((role) => role.roleType === 'S') || [];
    this.connection = this.dataInput['roles']?.filter((role) => role.roleType === 'R')?.map(item => {return item.objectID}).join(';') || [];
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
    return { 'background-color': color?.color, with: '40px', height: '40px' };
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
}
