import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { BP_Processes, TabModel } from '../models/BP_Processes.model';

@Component({
  selector: 'lib-popup-view-detail-processes',
  templateUrl: './popup-view-detail-processes.component.html',
  styleUrls: ['./popup-view-detail-processes.component.scss'],
})
export class PopupViewDetailProcessesComponent implements OnInit {
  process: BP_Processes;
  viewMode = '4';
  name = '';
  offset = '0px';
  dialog!: DialogRef;
  data: any;
  moreFunc: any;
  title = '';
  tabControl: TabModel[] = [];
  all: TabModel[] = [
    { name: 'ViewList', textDefault: 'Viewlist', isActive: true },
    { name: 'Kanban', textDefault: 'Kanban', isActive: false },
    { name: 'Flowchart', textDefault: 'Flowchart', isActive: false },
  ];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt?.data;
    this.process = this.data?.data;
    this.moreFunc = this.data?.moreFunc;
    this.title = this.moreFunc?.customName;
  }

  ngOnInit(): void {
    if (this.tabControl.length == 0) {
      this.tabControl = this.all;
    } 
    //else {
    //   this.active = this.tabControl.findIndex(
    //     (x: TabModel) => x.isActive == true
    //   );
    // }
    this.changeDetectorRef.detectChanges();
  }

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
  }
}
