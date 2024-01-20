import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import {
  CacheService,
  FormModel,
} from 'codx-core';
import {
  CodxEsService,
} from 'projects/codx-es/src/lib/codx-es.service';

@Component({
  selector: 'codx-approver-step',
  templateUrl: './codx-approver-step.component.html',
  styleUrls: ['./codx-approver-step.component.scss'],
})
export class CodxApproverStepComponent
  implements OnInit
{
  @Input() trans: any;
  formModel: FormModel;
  fmApprovalTrans: FormModel;
  fmApprovalStep: FormModel;
  gridViewSetup: any = {};
  guidEmpty='00000000-0000-0000-0000-000000000000';
  positionDefault: string;
  
  constructor(
    private esService: CodxEsService,
    private cr: ChangeDetectorRef,
    private cache: CacheService,
  ) {
  }
  ngOnInit(){}
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
