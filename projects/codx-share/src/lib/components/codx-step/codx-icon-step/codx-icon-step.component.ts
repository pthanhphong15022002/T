import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CacheService } from 'codx-core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'codx-icon-step',
  templateUrl: './codx-icon-step.component.html',
  styleUrls: ['./codx-icon-step.component.scss']
})
export class CodxIconStepComponent implements OnInit, OnChanges {
  @Input() icon = '';
  @Input() iconColor = '';
  @Input() listTypeTask = [];
  @Input() isStep = false;
  @Input() typeTask = '';
  @Input() size = 24;
  task;
  sizeBoder ='';
  sizeIcon = '';

  constructor(
    private cache: CacheService,
  ) { 
   
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if(this.listTypeTask?.length == 0){
      let data = await firstValueFrom(this.cache.valueList('DP004'));    
      if (data) {
        this.listTypeTask = data?.datas;
      }
    }
    this.task = this.listTypeTask?.find(type => type.value == this.typeTask);
    console.log(this.task);
  }
  async ngOnInit(): Promise<void> {
        this.sizeBoder = this.size.toString() + 'px';
        this.sizeIcon = (this.size - 10).toString();
  }

}
