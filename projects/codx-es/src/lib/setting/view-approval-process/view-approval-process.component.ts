import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CacheService } from 'codx-core';
import { last } from 'rxjs';
import { CodxEsService, GridModels } from '../../codx-es.service';

@Component({
  selector: 'lib-view-approval-process',
  templateUrl: './view-approval-process.component.html',
  styleUrls: ['./view-approval-process.component.scss'],
})
export class ViewApprovalProcessComponent implements OnInit {
  @Input() transID: string = '';
  @Input() approveStatus: string = '';

  gridViewSetup: any = {};

  process: any = [];
  lstStep: any = [];
  constructor(
    private esService: CodxEsService,
    private cr: ChangeDetectorRef,
    private cache: CacheService
  ) {}

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
                  this.lstStep = res;
                  this.process = [];
                  this.cr.detectChanges();
                }
              });
            }
          }
        });
      } else {
        this.esService
          .getApprovalTransByTransID(this.transID)
          .subscribe((res) => {
            if (res) {
              this.process = res;
              this.lstStep = [];
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
    let hour = res.getHours();
    let minute = res.getMinutes();

    let lastTime = new Date(date);
    lastTime.setHours(res.getHours() + leadtime);
    let hour2 = lastTime.getHours();
    let minute2 = lastTime.getMinutes();

    res.setHours(hour2, minute2);
    return res;
  }
}
