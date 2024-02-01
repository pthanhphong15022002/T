import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-view-list-bp-tasks',
  templateUrl: './view-list-bp-tasks.component.html',
  styleUrls: ['./view-list-bp-tasks.component.css'],
})
export class ViewListBpTasksComponent {
  @Input() dataSelected: any;
  @Input() formModel: any;
  @Output() dbClickEvent = new EventEmitter<any>();
  info: any;
  constructor(private shareService: CodxShareService) {}

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

  dbClick(data){
    this.dbClickEvent.emit({data: data});
  }
}
