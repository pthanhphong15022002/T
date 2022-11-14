import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'app-sort-session',
  templateUrl: './sort-session.component.html',
  styleUrls: ['./sort-session.component.scss'],
})
export class SortSessionComponent extends UIComponent implements OnInit {
  formModel: any;
  dialog: DialogRef;
  recID: any;
  data: any;
  constructor(
    private injector: Injector,
    @Optional() dialogRef: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(injector);
    this.dialog = dialogRef;
    this.recID = dt.data.data;
  }

  onInit(): void {
    this.loadData();
  }

  loadData() {
    this.api
      .exec('ERM.Business.SV', 'QuestionsBusiness', 'GeSessionAsync', [
        this.recID,
      ])
      .subscribe((res) => {
        if (res) this.data = res;
        let eleSort = document.getElementsByClassName(
          'example-boundary-sort'
        )[0];
        if (eleSort) {
          eleSort.parentElement.setAttribute(
            'style',
            'padding: 0 0 0 5px !important'
          );
        }
      });
  }

  onSave() {
    
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
    this.data.forEach((x, index) => {
      x.seqNo = index;
    });
  }
}
