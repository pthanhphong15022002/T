import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CacheService, CallFuncService, NotificationsService } from 'codx-core';

@Component({
  selector: 'codx-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @Input() dataSource: any = [];
  @Output() valueList = new EventEmitter();
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
  ) { }

  ngOnInit(): void {
  }
  shareUser(share) {
    this.callfc.openForm(share, '', 500, 500);
  }
  onDeleteOwner(objectID, datas) {
    let index = datas.findIndex((item) => item.objectID == objectID);
    if (index != -1){
      datas.splice(index, 1);
      this.valueList.emit(datas);
    } 
  }
  applyUser(event, datas) {
    if (!event) return;
    let listUser = event;
    listUser.forEach((element) => {
      if (!datas.some((item) => item.id == element.id)) {
        datas.push({
          objectID: element.id,
          objectName: element.text || '',
          objectType: element.objectType || '',
          roleType: element.objectName || '',
        });
      }
    });
    this.valueList.emit(datas);
  }

}
