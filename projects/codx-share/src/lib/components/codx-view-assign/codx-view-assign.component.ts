import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CacheService, FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-assign',
  templateUrl: './codx-view-assign.component.html',
  styleUrls: ['./codx-view-assign.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxViewAssignComponent implements OnInit, OnChanges {
  @Input() formModel?: FormModel;
  @Input() dataTree = [];
  listRoles = [];
  vllStatusAssign = 'TM007';
  vllStatus = 'TM004';
  dialog: any;
  isClose = true;
  isShow = false;
  vllRole = 'TM002';

  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    public sanitizer: DomSanitizer
  ) {
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dt.detectChanges();
  }

  ngOnInit(): void {}

  selectionChange(parent) {
    // var id = parent?.data.taskID;
    // var element = document.getElementById(id);
    // if (element) {
    //   this.isClose = element.classList.contains('icon-add_box');
    //   this.isShow = element.classList.contains('icon-indeterminate_check_box');
    //   if (this.isClose) {
    //     element.classList.remove('icon-add_box');
    //     element.classList.add('icon-indeterminate_check_box');
    //   } else if (this.isShow) {
    //     element.classList.remove('icon-indeterminate_check_box');
    //     element.classList.add('icon-add_box');
    //   }
    // }
  }
  clickTemp(e) {
    e.stopPropagation();
  }
}
