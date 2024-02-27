import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { CallFuncService, DialogData, DialogRef, SidebarModel } from 'codx-core';
import { StagesComponent } from './stages/stages.component';
import { AddDefaultComponent } from './add-default/add-default.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { asapScheduler } from 'rxjs';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Component({
  selector: 'lib-form-steps-field-grid',
  templateUrl: './form-steps-field-grid.component.html',
  styleUrls: ['./form-steps-field-grid.component.scss']
})
export class FormStepsFieldGridComponent implements OnInit, OnChanges , AfterViewInit{
  @ViewChildren('todoList2') private dlq: QueryList<CdkDropList>;

  @Input() data: any;
  @Input() formModel: any;
  @Output() dataChange = new EventEmitter<any>();

  dls: CdkDropList[] = [];
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
  ngAfterViewInit(): void {
    this.resetDLS();
    // this.dlq.changes
    // .subscribe((queryChanges) => {
    //     this.dlq = queryChanges;
    //     this.resetDLS();
    // });
  }
  ngOnInit(): void {
    this.formatData();
  
  }
  ngAfterContentChecked() {
    this.ref.detectChanges();
  }
  resetDLS()
  {
    //this.dlq.reset();
    let ldls: CdkDropList[] = [];
    this.dlq.forEach((dl) => {
      dl.connectedTo = [];
      ldls.push(dl)
    });
    ldls = ldls.reverse()
    asapScheduler.schedule(() => { this.dls = ldls; });
    this.dls = [];
    this.ref.detectChanges();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] &&
      changes['data']?.currentValue != changes['data']?.previousValue
    ) 
    {
      this.data = changes['data']?.currentValue;
      if(this.data) this.data = JSON.parse(JSON.stringify(this.data))
      this.formatData();
    }
  }
  
  formatData()
  {
    this.data = JSON.parse(JSON.stringify(this.data))
    if(this.data && this.data.steps)
    {
      let i = 0;
      this.count = this.data.steps.length;
      this.listStage = this.data.steps.filter(x=>!x.parentID);
      this.count -= this.listStage.length;
      this.listStage.forEach(elm => {
        elm.child = this.getListChild(elm) || [];
        if(typeof elm.settings == 'string') elm.settings = JSON.parse(elm.settings);
        i++;

        if(elm.child && elm.child.length>0) elm.child.sort((a, b) => a.stepNo - b.stepNo);
      });

      this.listStage = this.listStage.sort((a, b) => a.stepNo - b.stepNo);

      this.listStage.forEach(elm3=>{
        elm3.stepNo = i;
        i++;
      })
    }
  }

  getListChild(elm:any)
  {
    if(this.count == 0) return; 
    let j = 0;
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
    
    list = list.sort((a, b) => a.stepNo - b.stepNo);
    list.forEach(elm3=>{
      elm3.stepNo = j;
      j++;
    })
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
          if(res?.event?.delete)
          {
            this.data = res?.event?.process;
            let deleteDt = res?.event?.data;
          }
          else
          {
            this.data = res?.event?.process;
            let dt = res?.event?.data;
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
                let index2 = this.dls.findIndex(x=>x.id == dt.parentID);
                this.dls[index2].data.push(dt);
              }
              else {
                var index2 = this.listStage[index].child.findIndex(x=>x.recID == dt.recID);
                var indexP = this.data.steps.findIndex(x=>x.recID == dt.recID);
                if(index2 >= 0) this.listStage[index].child[index2] = dt;
                if(indexP >= 0) this.data.steps[indexP] = dt;
              }
            }
            this.ref.detectChanges();
            this.dataChange.emit(this.data);
          }
          this.listStage = [...this.listStage];
          this.resetDLS();
        }
      });
  }

  setDataCondition(dt:any)
  {
    if(dt.activityType == "Conditions" &&  dt.settings.nextSteps.length > 0)
    {
      if(!dt?.child) dt.child = [];
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

  dropStage(event:any)
  {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    for(var i = 0 ; i < event.container.data.length ; i++)
    {
      event.container.data[i].stepNo = i;
    }

    this.dataChange.emit(this.data);
  }

  dropStep(event:any)
  {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      event.previousContainer.data[event.previousIndex].parentID = event.previousContainer.data[event.previousIndex].stageID = event?.event.target.id;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

    }
    for(var i = 0 ; i < event.container.data.length ; i++)
    {
      event.container.data[i].stepNo = i;
    }

    this.dataChange.emit(this.data);
  }
}
