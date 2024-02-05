import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-view-list-bp-tasks',
  templateUrl: './view-list-bp-tasks.component.html',
  styleUrls: ['./view-list-bp-tasks.component.css'],
})
export class ViewListBpTasksComponent implements OnInit {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Output() dbClickEvent = new EventEmitter<any>();
  info: any;
  instance: any;
  process: any;
  sumDuration = 0;
  constructor(private shareService: CodxShareService, private api: ApiHttpService) {}
  ngOnInit(): void {
    this.getInfo();
    this.getProcessAndInstances();
    this.getTimeDurationdAndInterval();
  }
  getInfo() {
    let paras = [this.dataSelected.createdBy];
    let keyRoot = 'UserInfo' + this.dataSelected.createdBy;
    let info = this.shareService.loadDataCache(
      paras,
      keyRoot,
      'SYS',
      'AD',
      'UsersBusiness',
      'GetOneUserByUserIDAsync'
    );
    if (isObservable(info)) {
      info.subscribe((item) => {
        this.info = item;
      });
    } else this.info = info;
  }

  getProcessAndInstances(){
    this.api.execSv<any>('BP','ERM.Business.BP','ProcessTasksBusiness','GetProcessAndInstanceAsync', this.dataSelected.instanceID).subscribe((res) => {
      if(res){
        this.instance = res[0];
        this.process = res[1];
      }
    })
  }

  getTimeDurationdAndInterval(){
    let sumDuration = 0;
    if(this.dataSelected.duration == null){
      this.dataSelected.duration = 0;
    }

    if(this.dataSelected.interval == null || this.dataSelected.interval?.trim() == ''){
      this.dataSelected.interval = '0';
    }
    this.sumDuration = sumDuration;
  }

  dbClick(data){
    this.dbClickEvent.emit({data: data});
  }
}
