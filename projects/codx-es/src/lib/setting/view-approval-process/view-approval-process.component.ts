import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CodxEsService, GridModels } from '../../codx-es.service';

@Component({
  selector: 'lib-view-approval-process',
  templateUrl: './view-approval-process.component.html',
  styleUrls: ['./view-approval-process.component.scss'],
})
export class ViewApprovalProcessComponent implements OnInit {
  @Input() transID: string = '';
  @Input() approveStatus: string = '';

  process;
  lstStep;
  constructor(private esService: CodxEsService) {}

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
                }
              });
            }
          }
        });
      } else {
        this.esService.getApprovalTrans(this.transID).subscribe((res) => {
          if (res) {
            this.process = res;
            this.lstStep = [];
            console.log(this.process);
          }
        });
      }
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  getHour(date, leadtime) {
    //
    var res = new Date(date);
    console.log('time', res);

    res.setHours(res.getHours() + leadtime);
    return res;
  }
}
