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
} from '@angular/core';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import {
  CodxEsService,
  GridModels,
} from 'projects/codx-es/src/lib/codx-es.service';
import { formatDtDis } from '../../../../../codx-od/src/lib/function/default.function';
import { DispatchService } from '../../../../../codx-od/src/lib/services/dispatch.service';

@Component({
  selector: 'codx-approval-step',
  templateUrl: './codx-approval-step.component.html',
  styleUrls: ['./codx-approval-step.component.scss'],
})
export class CodxApprovalStepComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() transID: string = '';
  @Input() approveStatus: string = '';

  gridViewSetup: any = {};

  process: any = [];
  // lstStep: any = [];
  constructor(
    private esService: CodxEsService,
    private cr: ChangeDetectorRef,
    private cache: CacheService
  ) {}
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
      if (this.approveStatus == '1') {
        this.esService.getFormModel('EST04').then((res) => {
          if (res) {
            let fmApprovalStep = res;
            let gridModels = new GridModels();
            gridModels.dataValue = this.transID;
            gridModels.predicate = 'TransID=@0';
            gridModels.funcID = fmApprovalStep.funcID;
            gridModels.entityName = fmApprovalStep.entityName;
            gridModels.gridViewName = fmApprovalStep.gridViewName;
            gridModels.pageSize = 20;

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
        this.esService.getApprovalTrans(this.transID).subscribe((res) => {
          if (res) {
            this.process = res;
            this.cr.detectChanges();
          }
        });
      }
    }
  }

  ngOnInit(): void {
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
