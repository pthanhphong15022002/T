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
  formModel: FormModel;
  fmApprovalTrans: FormModel;
  fmApprovalStep: FormModel;
  gridViewSetup: any = {};

  positionDefault: string;
  lstSttApproveStep = ['1'];
  process: any = [];
  canceledProcess= [];
  // lstStep: any = [];
  constructor(
    private esService: CodxEsService,
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
    if (this.transID != null) {
      if (this.lstSttApproveStep.includes(this.approveStatus)) {
        this.esService.getFormModel('EST04').then((res) => {
          if (res) {
            this.fmApprovalStep = res;
            let gridModels = new DataRequest();
            gridModels.dataValue = this.transID;
            gridModels.predicate = 'TransID=@0';
            gridModels.funcID = this.fmApprovalStep.funcID;
            gridModels.entityName = this.fmApprovalStep.entityName;
            gridModels.gridViewName = this.fmApprovalStep.gridViewName;
            gridModels.pageLoading = false;
            gridModels.srtColumns = 'StepNo';
            gridModels.srtDirections = 'asc';

            if (gridModels.dataValue != null) {
              this.esService.getApprovalSteps(gridModels).subscribe((res) => {
                if (res && res?.length >= 0) {                  
                  this.process = res;
                  this.cr.detectChanges();
                }
              });
            }
          }
        });
      } else {
        if(!this.fmApprovalTrans){
          this.esService.getFormModel('EST04').then((res) => {
            if (res) this.fmApprovalTrans = res;
          });
        }
        this.esService
          .getApprovalTransByTransID(this.transID)
          .subscribe((res :any) => {
            if (res) {
              this.process = res?.activedTran[0];
              this.canceledProcess = res?.canceledTran;
              console.log(this.process)
              console.log('canceled',this.canceledProcess)
              this.cr.detectChanges();
            }
          });
      }
    }
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
