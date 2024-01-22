import { filter } from 'rxjs';
import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Injector,
  OnInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  Optional,
} from '@angular/core';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import {
  CodxEsService,
  GridModels,
} from 'projects/codx-es/src/lib/codx-es.service';
import { CodxShareService } from '../../codx-share.service';

@Component({
  selector: 'codx-view-approval-step',
  templateUrl: './codx-view-approval-step.component.html',
  styleUrls: ['./codx-view-approval-step.component.scss'],
})
export class CodxViewApprovalStepComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() transID: string = '';
  @Input() approveStatus: string = '';
  @Input() eSign = false;
  @Input() showCanceled = false;
  @Input() isSettingMode = true;
  formModel: FormModel;
  fmApprovalTrans: FormModel;
  fmApprovalStep: FormModel;
  gridViewSetup: any = {};
  guidEmpty='00000000-0000-0000-0000-000000000000';
  positionDefault: string;
  lstSttApproveStep = ['1'];
  process: any = [];
  canceledProcess= [];
  tempTrans: any = [];
  mappedTrans =[];
  lastNomalNode: number;
  lastCancelNode: number;
  constructor(
    private esService: CodxEsService,
    private shareService: CodxShareService,
    private cr: ChangeDetectorRef,
    private cache: CacheService,
  ) {
  }
  ngAfterViewInit(): void {
    this.esService.isSetupChange.subscribe((res) => {
      if (res) {
        this.initForm();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
  }

  initForm() {
    
    this.process=[];
    this.canceledProcess=[];
    this.cr.detectChanges();   
    if (this.transID != null) {
      if (this.lstSttApproveStep.includes(this.approveStatus)) {
        this.esService.getFormModel('EST04').then((res) => {
          if (res) {
            this.fmApprovalStep = res;
            this.shareService.viewApprovalStep(this.transID,this.isSettingMode).subscribe((res)=>{
              if (res && res?.length == 2) {
                let tempListStep = res[0] ?? [];
                if (res[1]?.length > 0 && res[0]?.length > 0) {
                  let apInfos = res[1];
                  for (let st of res[0]) {
                    if (st?.approvers) {
                      for (let ap of st?.approvers) {
                        let curAp = [];
                        if (ap?.roleType == 'P' || ap?.roleType == 'U') {
                          curAp = apInfos.filter(
                            (x) =>
                              x?.approver == ap?.approver &&
                              x?.roleType == ap?.roleType
                          );
                        } else {
                          curAp = apInfos.filter(
                            (x) => x?.roleType == ap?.roleType
                          );
                        }
                        if (curAp?.length > 0) {
                          ap.userIDs = curAp[0]?.userIDs;
                          if(ap?.userIDs == null ||ap?.userIDs?.length ==0){
                            ap.userID = curAp[0]?.userID;
                            ap.userName = curAp[0]?.userName;
                            ap.employeeID = curAp[0]?.employeeID;
                            ap.position = curAp[0]?.positionName ?? ap.position;
                            ap.orgUnitName = curAp[0]?.orgUnitName;
                          }
                        }
                      }
                    }
                  }                 
                  this.process = tempListStep?.sort((a,b)=> a?.stepNo - b?.stepNo);  
                  this.cr.detectChanges();              
                }                
                else if(res[1]?.length>0){
                  this.process = res[1];
                  this.cr.detectChanges();  
                }
                else{
                  this.process=[];
                  this.cr.detectChanges();  
                }                           
              } 
              else{
                this.process=[];
                this.cr.detectChanges();  
              }             
              this.cr.detectChanges();  
            });
          }
        });
      } else {
        if(!this.fmApprovalTrans){
          this.esService.getFormModel('EST04').then((res) => {
            if (res) this.fmApprovalTrans = res;
          });
        }
        // this.esService
        //   .getApprovalTransByTransID(this.transID)
        //   .subscribe((res :any) => {
        //     if (res) {
        //       this.process = res?.activedTran[0];
        //       this.canceledProcess = res?.canceledTran;
        //       this.cr.detectChanges();
        //     }
        //   });
        
        this.process=[];
        this.canceledProcess=[];
        this.cr.detectChanges();
        
          this.esService
          .getApprovalTree(this.transID)
          .subscribe((res :any) => {
            if (res?.length==2) {
              this.process=res[0];
              this.canceledProcess=res[1];
              this.lastNomalNode = this.process?.findLastIndex(x=>x.refLineID==null || x.refLineID==this.guidEmpty);
              if(this.lastNomalNode== null){
                this.lastNomalNode=this.process?.length-1;
              }
              this.lastCancelNode = this.process?.findLastIndex(x=>x.refLineID==null || x.refLineID==this.guidEmpty);
              if(this.lastCancelNode== null){
                this.lastCancelNode=this.canceledProcess?.length-1;
              }
              // this.mappedTrans=[];
              // this.tempTrans = res;
              // res?.forEach(tran=>{
              //   let tempItem = this.mapAuthorityTran(tran.recID);
              //   if(tempItem!=null){
              //     this.process.push(tempItem);
              //   }
              // });
              this.cr.detectChanges();
            }
          });
      }
    }
  }  

  mapAuthorityTran(recID){
    if(!this.mappedTrans.includes(recID)){
      let curTran = this.tempTrans.find(x=>x.recID == recID);
      if(curTran!=null){
        this.mappedTrans.push(curTran.recID);
        let items = this.tempTrans.filter(x=>x.refLineID == recID);
        if(items?.length>0){
          items?.forEach(itemChild=>{
            this.mappedTrans.push(itemChild.recID)
            itemChild.items=[];
            let child = this.mapAuthorityTran(itemChild?.recID);
            if(child!=null){
              itemChild.items?.push(child);
            }
          })
          curTran.items = items;
        }
      }
      return curTran;      
    }
    return null;
  }

  showCanceledTrans(show:boolean){
    if(show!=null){
      this.showCanceled =!show;
      this.cr.detectChanges();
    }
  }
  ngOnInit(): void {
    this.fmApprovalTrans = new FormModel();
    this.esService.getFormModel('EST021').then((fm) => {
      if (fm) {
        this.fmApprovalTrans = fm;
      }
    });
    this.formModel = new FormModel();
    this.formModel.formName = 'ApprovalSteps_Approvers';
    this.formModel.entityName = 'ES_ApprovalSteps_Approvers';
    this.formModel.gridViewName = 'grvApprovalSteps_Approvers';

    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.gridViewSetup = grv;
          this.positionDefault = this.gridViewSetup['Position']['headerText'];
        }
        console.log(this.gridViewSetup);
      });
    this.initForm();
  }

  getHour(date, leadtime: number) {
    var res = new Date(date);

    let lastTime = new Date(date);
    lastTime.setHours(res.getHours() + leadtime);
    let hour2 = lastTime.getHours();
    let minute2 = lastTime.getMinutes();

    res.setHours(hour2, minute2);
    return res;
  }

  getPercent(leadtime, duration) {
    if (!leadtime) leadtime = 0;
    if (!duration) duration = 0;
    if (duration <= leadtime) {
      if (leadtime != 0) return (duration / leadtime) * 100;
      return 0;
    } else {
      return (1 - leadtime / duration) * 100;
    }
  }
}
