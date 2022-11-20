import { Component, OnInit, Optional } from '@angular/core';
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
  dialog: DialogRef;
  data : any
  moreFunc : any
  title  =''
  tabControl: TabModel[] = [
    { name: 'ViewList', textDefault: 'Dashboard', isActive: true },
    { name: 'Kanban', textDefault: 'Kanban', isActive: false },
    { name: 'Flowchart', textDefault: 'Flowchart', isActive: false },
  ];

  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.data = dt?.data ;
    this.process = this.data?.data ;
    this.moreFunc =this.data?.moreFunc ;
    this.title = this.moreFunc?.customName
  }

  ngOnInit(): void {}

  clickMenu(item) {}
}
