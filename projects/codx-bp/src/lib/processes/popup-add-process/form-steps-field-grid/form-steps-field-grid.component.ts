import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import {
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  SidebarModel,
} from 'codx-core';
import { StagesComponent } from './stages/stages.component';
import { AddDefaultComponent } from './add-default/add-default.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { DomSanitizer } from '@angular/platform-browser';
import {
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { asapScheduler } from 'rxjs';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { ModeviewComponent } from '../../../modeview/modeview.component';

@Component({
  selector: 'lib-form-steps-field-grid',
  templateUrl: './form-steps-field-grid.component.html',
  styleUrls: ['./form-steps-field-grid.component.scss'],
})
export class FormStepsFieldGridComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @ViewChildren('todoList2') private dlq: QueryList<CdkDropList>;

  @Input() data: any;
  @Input() formModel: any;
  @Output() dataChange = new EventEmitter<any>();

  dls: CdkDropList[] = [];
  myTemplate = '';
  listStage = [];
  count = 0;
  listIds = [];
  tempPermission = [];
  constructor(
    private shareService: CodxShareService,
    private ref: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    if (dt?.data) this.data = dt?.data;
  }
  ngAfterViewInit(): void {
    //this.resetDLS();
  }

  ngOnInit(): void {
    this.listIds = [];
    if (
      this.tempPermission?.length == null ||
      this.tempPermission?.length == 0
    ) {
      this.getPermission();
    } else {
      this.formatData();
    }
  }
  getPermission() {
    let approvers = [];
    this.data?.steps?.forEach((step) => {
      if (step?.permissions?.length > 0) {
        step?.permissions.forEach((per) => {
          if (per?.objectType != null) {
            approvers.push({
              approver: per?.objectID,
              roleType: per?.objectType,
              refID: step?.recID,
            });
          }
        });
      }
    });
    if (approvers?.length > 0) {
      this.shareService
        .getApproverByRole(approvers, false, this.data?.createdBy)
        .subscribe((res) => {
          if (res) {
            this.tempPermission = res;
            this.formatData();
          } else {
            this.formatData();
          }
        });
    } else {
      this.formatData();
    }
  }

  resetDLS() {
    //this.dlq.reset();
    let ldls: CdkDropList[] = [];
    this.dlq.forEach((dl) => {
      ldls.push(dl);
    });
    ldls = ldls.reverse();
    asapScheduler.schedule(() => {
      this.dls = ldls;
    });
    this.ref.detectChanges();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] &&
      changes['data']?.currentValue != changes['data']?.previousValue
    ) {
      this.data = changes['data']?.currentValue;
      if (this.data) this.data = JSON.parse(JSON.stringify(this.data));
      this.formatData();
    }
  }

  formatData()
  {
    this.data = JSON.parse(JSON.stringify(this.data))
    if(this.data && this.data.steps)
    {
    
      this.count = this.data.steps.length;
      this.listStage = this.data.steps.filter((x) => !x.parentID);
      this.count -= this.listStage.length;
      this.listStage.forEach((elm) => {
        elm.child = this.getListChild(elm) || [];
        if(typeof elm.settings == 'string') elm.settings = JSON.parse(elm.settings);
        if(elm.child && elm.child.length>0) elm.child.sort((a, b) => a.stepNo - b.stepNo);
      });

      let a = 0;
      let i = 0;
      this.listStage.forEach(elm3=>{
        this.listIds.push('stage'+a+'_'+elm3.recID)
        elm3.stepNo = i;
        i++;
        if(elm3.child && elm3.child.length>0)
        {
          elm3.child.forEach(elm4 => {
            elm4.stepNo = i;
            i++
          });
        }
        a++;
      });
    }
  }

  getListChild(elm:any)
  {
    if(this.count == 0) return;
    let j = 0;
    let list = this.data.steps.filter(x=>x.parentID == elm.recID);
    this.count -= list.length;
    list.forEach((elm2) => {
      elm2.settings =
        typeof elm2?.settings === 'object'
          ? elm2.settings
          : elm2?.settings
          ? JSON.parse(elm2.settings)
          : null;
      elm2.permissions =
        typeof elm2?.permissions === 'object'
          ? elm2.permissions
          : elm2?.permissions
          ? JSON.parse(elm2.permissions)
          : null;
      if (this.tempPermission?.length > 0) {
        let pers = this.tempPermission.filter((x) => x.refID == elm2.recID);
        if (pers?.length > 0) {
          elm2.pers = pers?.map((u) => u?.userID).join(';') ?? '';
        }
      } else {
        elm2.pers = elm2?.permissions?.map((u) => u?.objectID).join(';') ?? '';
      }
      elm2.child = this.getListChild(elm2);
      if (
        elm2.activityType == 'Conditions' &&
        elm2.child &&
        elm2.child.length > 0
      ) {
        for (var i = 0; i < elm2.child.length; i++) {
          var index = elm2.settings.nextSteps.findIndex(
            (x) => x.nextStepID == elm2.child[i].recID
          );
          if (index >= 0)
            elm2.child[i].reasonCon =
              elm2.settings.nextSteps[index].predicateName;
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

  addEditStages(
    activityType: any,
    type: any,
    item: any = null,
    parent: any = null,
    stage: any = null,
    isCondistion = false,
    hideDelete = false,
  ) {
    let lstParent = JSON.parse(JSON.stringify(this.listStage));
    lstParent.forEach((elm) => {
      delete elm.child;
    });
    var obj = {
      type: type,
      activityType: activityType,
      process: this.data,
      data: item,
      parent: parent,
      stage: stage,
      listStage: lstParent,
      hideDelete: hideDelete
    };
    let option = new SidebarModel();
    option.Width = 'Auto';
    option.FormModel = this.formModel;
    let popup = this.callFunc.openSide(AddDefaultComponent,obj,option);
    popup.closed.subscribe(res=>
      {
        if(res?.event)
        {
          if(res?.event?.delete)
          {
            this.data = res?.event?.process || this.data;
            let deleteDt = res?.event?.delete;
            if(deleteDt)
            {
              //debugger
              // if(indexDelete>=0)
              // {
              //   if(deleteDt?.child && deleteDt.child.length>0)
              //   {
              //     deleteDt.child.forEach(element => {
              //       this.data.steps.splice(indexDelete,0,element)
              //     });
              //   }
              // }

              let indexParent2 = this.listStage.findIndex(x=>x.recID == deleteDt.parentID);
              if(indexParent2>=0)
              {
                var indexC = this.listStage[indexParent2].child.findIndex(x=>x.recID == deleteDt.recID);
                
                if(deleteDt.child && deleteDt.child.length>0)
                {
                  deleteDt.child.forEach(element => {
                    element.parentID = this.listStage[indexParent2].recID;
                    this.listStage[indexParent2].child.splice(indexC,0,element);
                  });
                }
                
                this.listStage[indexParent2].child = this.listStage[indexParent2].child.filter(x=>x.recID != deleteDt.recID);

                let ind = 0;
                this.listStage[indexParent2].child.forEach(element => {
                  element.stepNo = ind;
                  ind ++;
                });
              }

              let indexParent = this.data.steps.findIndex(x=>x.recID == deleteDt.parentID);
              let indexDelete = this.data.steps.findIndex(x=>x.recID == deleteDt.recID);
              if(indexParent>=0)
              {
                this.data.steps[indexParent].child = this.data.steps[indexParent].child.filter(x=>x.recID != deleteDt.recID);
              }

              this.data.steps = this.data.steps.filter(x=>x.recID != deleteDt.recID);

            }
            this.dataChange.emit(this.data);
          }
          else
          {
            this.data = res?.event?.process || this.data;
            let dt = res?.event?.data;
            if(dt.activityType == "Stage")
            {
                var index = this.listStage.findIndex(x=>x.recID == dt.recID);
                var indexP = this.data.steps.findIndex(x=>x.recID == dt.recID);
                if(index >= 0) this.listStage[index] = dt;
                else this.listStage.push(dt);
                if(indexP >= 0) this.data.steps[indexP] = dt;
                else this.data.steps.push(dt);

              var name = 'stage' + (this.listIds.length - 1) + '_' + dt.recID;
              this.listIds.push(name);
            } 
            else 
            {
              var index = this.listStage.findIndex((x) => x.recID == dt.parentID);
              dt = this.setDataCondition(dt);

              if (type == 'add') {
                this.listStage[index].child.push(dt);
                this.data.steps.push(dt);
              } else {
                
                if(isCondistion)
                {
                  index = this.listStage.findIndex(x=>x.recID == dt?.stageID);
                  var indexP = this.listStage[index].child.findIndex(x=>x.recID == dt.parentID);
                  var indexC = this.listStage[index].child[indexP].child.findIndex(x=>x.recID == dt.recID);
                  this.listStage[index].child[indexP].child[indexC] = dt;
                }
              
                var index2 = this.listStage[index].child.findIndex(
                  (x) => x.recID == dt.recID
                );
                var indexP = this.data.steps.findIndex(
                  (x) => x.recID == dt.recID
                );
                
                if (index2 >= 0) 
                {
                
                  this.listStage[index].child[index2] = dt;
                  this.listStage = JSON.parse(JSON.stringify(this.listStage));
                }
                if (indexP >= 0) this.data.steps[indexP] = dt;
              }
            }

            if(res?.event?.process) this.data = Object.assign({},  this.data);
            this.ref.detectChanges();
            this.dataChange.emit(this.data);
          }
        }
      });
  }

  setDataCondition(dt: any) {
    if (dt.activityType == 'Conditions' && dt.settings.nextSteps.length > 0) {
      if (!dt?.child) dt.child = [];
      dt.settings.nextSteps.forEach((element) => {
        if (!dt.child.some((x) => x.parentID == element.nextStepID)) {
          for (var i = 0; i < this.listStage.length; i++) {
            if (this.listStage[i].child.length > 0) {
              var index2 = this.listStage[i].child.findIndex(
                (x) => x.recID == element.nextStepID
              );
              if (index2 >= 0) {
                this.listStage[i].child[index2].parentID = dt.recID;
                this.listStage[i].child[index2].reasonCon =
                  element.predicateName;
                if (!Array.isArray(dt.child)) dt.child = [];
                dt.child.push(this.listStage[i].child[index2]);
                this.listStage[i].child.splice(index2, 1);
                break;
              }
            }
          }
        }
      });
    } else {
      if (dt?.permissions && dt?.permissions.length > 0) {
        dt.permissionsName = this.getImg(dt?.permissions);
      }
    }
    return dt;
  }
  getNextStepHTML(val: any, id: any) {
    let data = this.data.steps.filter((x) => x.recID == id)[0];
    if (data) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<div class="col-3 d-flex align-items-center"><div class="w-30px"><i class="` +
          val.settings.icon +
          `" style="color:` +
          val.settings.color +
          `"></i></div>` +
          data.stepName +
          `</div><div class="col-1 d-flex align-items-center"><i class="` +
          data?.settings?.icon +
          `" style="color:` +
          data?.settings?.color +
          `"></i><span class="mx-2">` +
          data.activityType +
          `</span></div><div class="col-4"><span>` +
          (data?.memo || '') +
          `</span></div><div class="col-2"><span>` +
          data?.duration +
          `</span><span class="mx-1">` +
          data?.interval +
          `</span></div>`
      );
    }
    return '';
  }

  dropStage(event: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    for (var i = 0; i < event.container.data.length; i++) {
      event.container.data[i].stepNo = i;
    }

    this.dataChange.emit(this.data);
  }

  dropStep(event: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      let id = event?.event.target.id.split('_');
      event.previousContainer.data[event.previousIndex].parentID =
        event.previousContainer.data[event.previousIndex].stageID = id[1];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    for (var i = 0; i < event.container.data.length; i++) {
      event.container.data[i].stepNo = i;
    }

    this.dataChange.emit(this.data);
  }

  getImg(data: any) {
    return data.map((u) => u.objectID).join(';');
  }

  sortPredicateForDisableItem(e: any) {
    return function (index: number, item: CdkDrag, drop: CdkDropList) {
      if (e) {
        if (index >= 0) {
          if (e[index]?.stepType == '1') return false;
        }
      }
      return true;
    };
  }
  openFormModeView(data: any) {
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1056;
    let popupDialog = this.callFunc.openForm(
      ModeviewComponent,
      '',
      null,
      null,
      '',
      { extendInfo: data.extendInfo, stepNo: data.stepNo },
      '',
      option
    );
    popupDialog.closed.subscribe((res) => {
      if (res?.event) {
        var indexP = this.data.steps.findIndex((x) => x.recID == data?.recID);
        if (indexP >= 0) this.data.steps[indexP].extendInfo = res?.event;
        this.dataChange.emit(this.data);
      }
    });
  }
}
