import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'view-step',
  templateUrl: './view-step.component.html',
  styleUrls: ['./view-step.component.scss']
})
export class ViewStepComponent implements OnInit, OnChanges  {
  @Input() stepID = '';
  step;
  loading = false;
  constructor(
    private api: ApiHttpService,
  ) {

  }

  ngOnInit(): void {
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes.stepID && changes.stepID?.currentValue){
      this.loading = true;
      this.api.exec<any>(
        'DP',
        'ViewInfoBusiness',
        'GetOneAsync',
        [changes.stepID?.currentValue]
      ).subscribe((rec) => {
        this.loading = false;
        if(rec){
          this.step = rec;
        }else{
          this.step = null;
        }
      })
    }
  }
}
