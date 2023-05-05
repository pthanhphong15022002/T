import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'codx-type-task',
  templateUrl: './codx-type-task.component.html',
  styleUrls: ['./codx-type-task.component.scss']
})
export class CodxTypeTaskComponent implements OnInit {
  listJobType = [];
  dialog!: DialogRef;
  jobType: any;
  constructor(
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
   this.dialog = dialog;
  }

  ngOnInit(): void {
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listJobType = res?.datas?.map((item) => {
          return {
            ...item,
            color: { background: item['color'] },
            checked: false,
          };
        });
        this.jobType = this.listJobType[0];
        this.jobType['checked'] = true;
      }
    });
  }
  getTypeJob(value) {
    if (this.jobType) {
      this.jobType['checked'] = false;
    }
    this.jobType = value;
    this.jobType['checked'] = true;
  }
  handlerContinue(){
    this.dialog.close(this.jobType);
  }

}
