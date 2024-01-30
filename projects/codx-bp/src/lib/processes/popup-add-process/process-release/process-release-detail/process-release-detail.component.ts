import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';
import moment from 'moment';

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
  constructor(
    private api: ApiHttpService,
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
        if(elm.child && elm.child.length>0)
        {
          elm.countTask = elm.child.length;
          elm.countCompleted = (elm.child.filter(x=>x.status == "3") || []).length || 0;
          elm.percentCompleted = (elm.countCompleted / elm.countTask) * 100;
        }
      });
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
      if(this.listTask && this.listTask.length > 0)
      {
        var index = this.listTask.findIndex(x=>x.stepID == elm2.recID);
        if(index >= 0)
        {
          elm2.permissions = typeof this.listTask[index]?.permissions === 'object' ? this.listTask[index].permissions : (this.listTask[index]?.permissions ? JSON.parse(this.listTask[index].permissions) : null);
          elm2.permissions =  elm2?.permissions ? elm2.permissions.map((u) => u.objectID).join(';') : "";
          elm2.startDate = this.listTask[index].startDate ? moment(this.listTask[index].startDate).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.endDate = this.listTask[index].endDate ? moment(this.listTask[index].endDate).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.actualStart = this.listTask[index].actualStart ? moment(this.listTask[index].actualStart).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.actualEnd = this.listTask[index].actualEnd ? moment(this.listTask[index].actualEnd).format('dd/MM/yyyy') : 'dd/MM/yyyy';
          elm2.status = this.listTask[index].status;
        }
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
}
