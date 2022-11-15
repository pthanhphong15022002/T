import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'app-sort-session',
  templateUrl: './sort-session.component.html',
  styleUrls: ['./sort-session.component.scss'],
})
export class SortSessionComponent extends UIComponent implements OnInit {
  formModel: any;
  dialog: DialogRef;
  data: any;
  dataSession: any;
  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.data = JSON.parse(JSON.stringify(dt.data.data));
  }

  onInit(): void {
    if (this.data) {
      let eleSort = document.getElementsByClassName('example-boundary-sort')[0];
      if (eleSort) {
        eleSort.parentElement.setAttribute(
          'style',
          'padding: 0 0 0 5px !important'
        );
      }
    }
  }

  onSave() {
    this.api
      .execAction('SV_Questions', this.dataSession, 'UpdateAsync')
      .subscribe((res) => {
        if (res) {
          this.data.sort((a, b) => a.seqNo - b.seqNo);
          this.notification.notifyCode('SYS007');
        } else this.notification.notifyCode('SYS021');
        this.dialog.close(this.data);
      });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
    this.data.forEach((x, index) => {
      x.seqNo = index;
    });
    this.dataSession = JSON.parse(JSON.stringify(this.data));
    this.dataSession.forEach((x) => {
      x['modifiedOn'] = new Date();
      delete x.children;
      delete x.active;
    });
  }
}
