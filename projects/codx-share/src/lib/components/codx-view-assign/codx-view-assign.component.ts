import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-assign',
  templateUrl: './codx-view-assign.component.html',
  styleUrls: ['./codx-view-assign.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxViewAssignComponent implements OnInit, OnChanges {
  @Input() formModel?: FormModel;
  @Input() dataTree = [];
  @Input() vllStatus = 'TMT007';
  dialog: any;
  isClose = true;
  isShow = false;
  constructor(private dt: ChangeDetectorRef) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    this.dt.detectChanges();
  }

  ngOnInit(): void {}

  selectionChange(parent) {
    var id = parent?.data.taskID;
    var element = document.getElementById(id);
    if (element) {
      this.isClose = element.classList.contains('icon-add_box');
      this.isShow = element.classList.contains('icon-indeterminate_check_box');
      if (this.isClose) {
        element.classList.remove('icon-add_box');
        element.classList.add('icon-indeterminate_check_box');
      } else if (this.isShow) {
        element.classList.remove('icon-indeterminate_check_box');
        element.classList.add('icon-add_box');
      }
    }
  }

}
