import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, DialogData, DialogRef, SidebarModel } from 'codx-core';
import moment from 'moment';
import { PopupBpTasksComponent } from 'projects/codx-bp/src/lib/bp-tasks/popup-bp-tasks/popup-bp-tasks.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-process-release-detail',
  templateUrl: './process-release-detail.component.html',
  styleUrls: ['./process-release-detail.component.scss']
})
export class ProcessReleaseDetailComponent implements OnInit{
  data:any;
  dialog:any;
  active = 1;
  process:any;
  listStage = [];
  count = 0;
  listTask:any;
  formModel:any;
  info:any;
  constructor(
    private shareService: CodxShareService,
    private cache: CacheService,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.data = dt?.data?.data;
    this.process =  JSON.parse(JSON.stringify(dt?.data?.process));
  }
  ngOnInit(): void {
    this.getData();
    this.getInfo();
  }
  getInfo()
  {
    let paras = [this.data.createdBy];
    let keyRoot = 'UserInfo' + this.data.createdBy;
    let info = this.shareService.loadDataCache(paras,keyRoot,"SYS","AD",'UsersBusiness','GetOneUserByUserIDAsync');
    if(isObservable(info))
    {
      info.subscribe(item=>{
        this.info = item;
      })
    }
    else this.info = info;

  }
  getData()
  {
    this.api.execSv("BP","BP","ProcessTasksBusiness","GetItemsByInstanceIDAsync",this.data.recID).subscribe(item=>{
      if(item)
      {
        this.listTask = item;
        this.formatData();
      }
    })
  }

  formatData()
  {
    if(this.process && this.process.steps)
    {
      this.count = this.process.steps.length;
      this.listStage = this.process.steps.filter(x=>!x.parentID);
      this.count -= this.listStage.length;
      this.listStage.forEach(elm => {
        elm.child = this.getListChild(elm) || [];
        elm.settings = typeof elm?.settings === 'object' ? elm.settings : (elm?.settings ? JSON.parse(elm.settings) : null);
        elm.countTask = 0;
        if(elm.child && elm.child.length>0)
        {
          elm.countTask = elm.child.length;
          elm.countCompleted = (elm.child.filter(x=>x.status == "3") || []).length || 0;
          elm.percentCompleted = (elm.countCompleted / elm.countTask) * 100;
        }
      });
      this.data.countTask = this.listStage.reduce((n, {countTask}) => n + countTask, 0);
    }
  }

  getListChild(elm:any)
  {
    if(this.count == 0) return;

    let list = this.process.steps.filter(x=>x.parentID == elm.recID);
    this.count -= list.length;
    list.forEach(elm2 => {
      elm2.settings = typeof elm2?.settings === 'object' ? elm2.settings : (elm2?.settings ? JSON.parse(elm2.settings) : null);
      elm2.child = this.getListChild(elm2);
      elm2.dataTask = null;
      if(this.listTask && this.listTask.length > 0)
      {
        var index = this.listTask.findIndex(x=>x.stepID == elm2.recID);
        if(index >= 0)
        {
          elm2.permissions = typeof this.listTask[index]?.permissions === 'object' ? this.listTask[index].permissions : (this.listTask[index]?.permissions ? JSON.parse(this.listTask[index].permissions) : null);
          elm2.permissions =  elm2?.permissions ? elm2.permissions.map((u) => u.objectID).join(';') : null;
          elm2.startDate = this.listTask[index].startDate ? moment(this.listTask[index].startDate).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.endDate = this.listTask[index].endDate ? moment(this.listTask[index].endDate).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.actualStart = this.listTask[index].actualStart ? moment(this.listTask[index].actualStart).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.actualEnd = this.listTask[index].actualEnd ? moment(this.listTask[index].actualEnd).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.status = this.listTask[index].status;
          elm2.dataTask = this.listTask[index];
        }
        else elm2.permissions = null;
      }

      if(elm2.activityType == "Conditions" && elm2.child && elm2.child.length>0)
      {
        for(var i =0 ; i< elm2.child.length ; i++)
        {
          var index = elm2.settings.nextSteps.findIndex(x=>x.nextStepID == elm2.child[i].recID)
          if(index >= 0) elm2.child[i].reasonCon = elm2.settings.nextSteps[index].predicateName;
        }
      }
    });

    return list;
  }

  popupTasks(dataStep, action){
    var option = new SidebarModel();
    option.FormModel = {
      formName: 'BPTasks',
      gridViewName: 'grvBPTasks',
      entityName: 'BP_Tasks',
    };
    option.zIndex = 1010;
    let data = this.listTask.find(x => x.stepID == dataStep.recID);
    let subTitle = this.data?.title;
    const obj = { data: data, dataIns: this.data, subTitle: subTitle, action: action};
    let popup = this.callFc.openSide(
      PopupBpTasksComponent,
      obj,
      option
    );
    popup.closed.subscribe((res) => {

    });
  }

  openForm(dt:any)
  {
    if(dt?.activityType == "Email")
    {
      let data = {
        dialog: this.dialog,
        formGroup: null,
        templateID: '',
        showIsTemplate: true,
        showIsPublish: true,
        showSendLater: true,
        files: null,
        isAddNew: false,
        notSendMail: true,
      };
  
      let popEmail = this.callFc.openForm(
        CodxEmailComponent,
        '',
        800,
        screen.height,
        '',
        data
      );
    }
    else if(dt)
    {
      var option = new SidebarModel();
      // option.FormModel = this.view.formModel; //Đợi có grid mở lên
      option.FormModel = {
        formName: 'BPTasks',
        gridViewName: 'grvBPTasks',
        entityName: 'BP_Tasks',
      };
      option.zIndex = 1060;
      let popup = this.callFc.openSide(PopupBpTasksComponent, {data: dt}, option);
      popup.closed.subscribe((res) => {});
    }
  }
}
