import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { CallFuncService, DialogData, DialogRef, SidebarModel } from 'codx-core';
import { StagesComponent } from './stages/stages.component';
import { AddDefaultComponent } from './add-default/add-default.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'lib-form-steps-field-grid',
  templateUrl: './form-steps-field-grid.component.html',
  styleUrls: ['./form-steps-field-grid.component.scss']
})
export class FormStepsFieldGridComponent implements OnInit, OnChanges{
  @Input() data: any;
  @Input() formModel: any;
  myTemplate  = '';
  listStage = [];
  count = 0;
  constructor(
    private shareService: CodxShareService,
    private ref: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  )
  {
    if(dt?.data) this.data = dt?.data
  }
  ngOnInit(): void {
    this.formatData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] &&
      changes['data']?.currentValue != changes['data']?.previousValue
    ) 
    {
      this.data = changes['data']?.currentValue;
      this.formatData();
    }
  }
  
  formatData()
  {
    if(this.data && this.data.steps)
    {
      this.count = this.data.steps.length;
      this.listStage = this.data.steps.filter(x=>!x.parentID);
      this.count -= this.listStage.length;
      this.listStage.forEach(elm => {
        elm.child = this.getListChild(elm) || [];
      });
    }
  }

  getListChild(elm:any)
  {
    if(this.count == 0) return; 
    
    let list = this.data.steps.filter(x=>x.parentID == elm.recID);
    this.count -= list.length;
    list.forEach(elm2 => {
      elm2.settings = typeof elm2?.settings === 'object' ? elm2.settings : (elm2?.settings ? JSON.parse(elm2.settings) : null);
      elm2.permissions = typeof elm2?.permissions === 'object' ? elm2.permissions : (elm2?.permissions ? JSON.parse(elm2.permissions) : null);
      elm2.child = this.getListChild(elm2);

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

  addEditStages(activityType:any,type:any,item:any = null,parent:any = null,stage:any = null)
  {
    let lstParent = JSON.parse(JSON.stringify(this.listStage));
    lstParent.forEach(elm=>{
      delete elm.child;
    })
    var obj = 
    {
      type: type,
      activityType: activityType,
      process: this.data,
      data: item,
      parent: parent,
      stage: stage,
      listStage: lstParent
    }
    let option = new SidebarModel();
    option.Width = "Auto";
    option.FormModel = this.formModel;
    let popup = this.callFunc.openSide(AddDefaultComponent,obj,option);
    popup.closed.subscribe(res=>
      {
        if(res?.event)
        {
          let dt = res?.event;
          if(dt.activityType == "Stage")
          {
            var index = this.listStage.findIndex(x=>x.recID == dt.recID);
            var indexP = this.data.steps.findIndex(x=>x.recID == dt.recID);
            if(index >= 0) this.listStage[index] = dt;
            else this.listStage.push(dt);
            if(indexP >= 0) this.data.steps[indexP] = dt;
            else this.data.steps.push(dt);
          }
          else
          {
            var index = this.listStage.findIndex(x=>x.recID == dt.parentID);
            dt = this.setDataCondition(dt);
            if(type == 'add') {
              this.listStage[index].child.push(dt);
              this.data.steps.push(dt);
            }
            else {
              var index2 = this.listStage[index].child.findIndex(x=>x.recID == dt.recID);
              var indexP = this.data.steps.findIndex(x=>x.recID == dt.recID);
              if(index2 >= 0) this.listStage[index].child[index2] = dt;
              if(indexP >= 0) this.data.steps[indexP] = dt;
            }
          }
          this.ref.detectChanges();
        }
      });
  }

  setDataCondition(dt:any)
  {
    if(dt.activityType == "Conditions" &&  dt.settings.nextSteps.length > 0)
    {
      dt.settings.nextSteps.forEach(element => {
        if(!dt.child.some(x=>x.parentID == element.nextStepID))
        {
          for(var i = 0 ; i < this.listStage.length ; i++)
          {
            if(this.listStage[i].child.length>0)
            {
              var index2 = this.listStage[i].child.findIndex(x=>x.recID == element.nextStepID);
              if(index2 >= 0)
              {
                this.listStage[i].child[index2].parentID = dt.recID;
                this.listStage[i].child[index2].reasonCon = element.predicateName;
                if(!Array.isArray(dt.child)) dt.child = [];
                dt.child.push(this.listStage[i].child[index2]);
                this.listStage[i].child.splice(index2,1);
                break;
              }
            }
          }
        }
      });
    }
    return dt;
  }
  getNextStepHTML(val:any,id:any)
  {
    let data = this.data.steps.filter(x=>x.recID == id)[0];
    if(data)
    {
      return this.sanitizer
      .bypassSecurityTrustHtml(`<div class="col-3 d-flex align-items-center"><div class="w-30px"><i class="`+val.settings.icon+`" style="color:`+val.settings.color+`"></i></div>`+data.stepName+`</div><div class="col-1 d-flex align-items-center"><i class="`+data?.settings?.icon+`" style="color:`+data?.settings?.color+`"></i><span class="mx-2">`+data.activityType+`</span></div><div class="col-4"><span>`+(data?.memo || '')+`</span></div><div class="col-2"><span>`+data?.duration+`</span><span class="mx-1">`+data?.interval+`</span></div>`);
    }
    return "";
  }
}
