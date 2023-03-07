import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-popup-type-task',
  templateUrl: './popup-type-task.component.html',
  styleUrls: ['./popup-type-task.component.css']
})
export class PopupTypeTaskComponent implements OnInit {
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
        // console.log(res.datas);
        
        // let data = [];
        // res.datas.forEach((element) => {
        //   if (['T', 'E', 'M', 'C', 'S'].includes(element['value'])) {
        //     data.push(element);
        //   }
        // });
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
