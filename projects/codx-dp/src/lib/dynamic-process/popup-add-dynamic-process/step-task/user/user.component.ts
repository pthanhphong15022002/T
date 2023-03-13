import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CacheService, CallFuncService, FormModel, NotificationsService } from 'codx-core';

@Component({
  selector: 'codx-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @Input() dataSource: any = [];
  @Input() formModel: FormModel;
  @Input() default: string;
  @Input() fiedName: string;
  @Input() fiedNameTitle: string;
  @Input() title: string;
  @Input() icon: string;
  @Input() style = {};
  @Output() valueList = new EventEmitter();
  isPopupUserCbb = false;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
  ) { }

  ngOnInit(): void {
  }
  
  shareUser(share) {
    this.isPopupUserCbb = true;

    // this.callfc.openForm(share, '', 500, 500);
  }

  onDeleteOwner(objectID, datas) {
    let index = datas.findIndex((item) => item.objectID == objectID);
    if (index != -1){
      datas.splice(index, 1);
      this.valueList.emit(datas);
    } 
  }

  applyUser(event, datas) {
    this.isPopupUserCbb = false;
    if (!event) return;
    let listUser = event;
    datas[0] = {
      objectID: event.id,
      objectName: event.text || '',
      objectType: event.objectType || 'U',
      roleType: event.objectName || '',
    };
    this.valueList.emit(datas);
  }
}
