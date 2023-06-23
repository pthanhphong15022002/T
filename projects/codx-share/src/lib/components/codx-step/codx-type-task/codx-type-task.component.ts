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
  isShowGroup = true;
  constructor(
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
   this.dialog = dialog;
   this.isShowGroup = dt?.data?.isShowGroup == undefined ? this.isShowGroup : dt?.data?.isShowGroup;
  }

  ngOnInit(): void {
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listJobType = res?.datas?.map((item) => {
          return {
            ...item,
            checked: false,
          };
        });
        if(!this.isShowGroup){
          this.listJobType = this.listJobType.filter((item) => item?.value != 'G')
        }
        this.listJobType
        this.jobType = this.isShowGroup ? this.listJobType[1] : this.listJobType[0];
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
    this.listJobType;
  }
  handlerContinue(){
    this.dialog.close(this.jobType);
  }

}
