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
  typeDisableds = [];
  constructor(
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
   this.dialog = dialog;
   this.typeDisableds = dt?.data?.typeDisableds == undefined ? [] : dt?.data?.typeDisableds;
  }
  //Cuôc gọi:C,	Công việc: T, Email: E,	Cuộc họp: M, Khảo sát: S,	Báo giá: Q,	Hợp đồng CO,	Công tác: B, Nhap lieu: F
  ngOnInit(): void {
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listJobType = res?.datas?.map((item) => {
          return {
            ...item,
            checked: false,
          };
        });
        if(this.typeDisableds?.length > 0){
          this.listJobType = this.listJobType.filter((item) => !this.typeDisableds.includes(item?.value));
        }
        this.jobType = this.typeDisableds.includes('G') ? this.listJobType[0] : this.listJobType[1];
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
