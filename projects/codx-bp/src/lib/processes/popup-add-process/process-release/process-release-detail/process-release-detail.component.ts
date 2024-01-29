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
  currentStep:any;
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
    this.api.execSv("BP","BP","ProcessTasksBusiness","GetItemByCurrentStepAsync",this.data.currentStep).subscribe(item=>{
      if(item)
      {
        this.currentStep = item;
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
      elm2.owners = null;
      elm2.child = this.getListChild(elm2);

      if(this.currentStep.stepID == elm2.recID)
      {
        elm2.owners = typeof this.currentStep?.owners === 'object' ? this.currentStep.owners : (this.currentStep?.owners ? JSON.parse(this.currentStep.owners) : null);
        elm2.owners =  elm2.owners.map((u) => u.objectID).join(';');
        elm2.startDate = this.currentStep.startDate ? moment(this.currentStep.startDate).format('dd/MM/yyyy') : 'dd/MM/yyyy';
        elm2.endDate = this.currentStep.endDate ? moment(this.currentStep.endDate).format('dd/MM/yyyy') : 'dd/MM/yyyy';
        elm2.actualStart = this.currentStep.actualStart ? moment(this.currentStep.actualStart).format('dd/MM/yyyy') : 'dd/MM/yyyy';
        elm2.actualEnd = this.currentStep.actualEnd ? moment(this.currentStep.actualEnd).format('dd/MM/yyyy') : 'dd/MM/yyyy';
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
