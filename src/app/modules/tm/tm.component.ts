import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-tm',
  templateUrl: './tm.component.html',
  styleUrls: ['./tm.component.scss']
})
export class TmComponent implements OnInit, AfterViewInit {
  @ViewChild('panelTemplate') panelLeft: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  constructor() { }
  ngAfterViewInit(): void {
    this.views = [{
      type: 'list',
      icon: '',
      text: '',
      id: '1',
      active: false,
      model: {
        service: 'TM',
        assemblyName: 'TM',
        method: 'TaskBusiness',
        className: 'GetListDetailTasksAsync',
        panelLeftRef: this.panelLeft,
        panelRightRef: null,
        sideBarLeftRef: null,
        sideBarRightRef: null,
        itemTemplate: this.itemTemplate,
        widthAsideLeft: '550px',
        widthAsideRight: '550px'
      }
    },
    {
      type: 'listdetail',
      icon: '',
      text: '',
      id: '2',
      active: false,
      model: {
        service: 'TM',
        assemblyName: 'TM',
        method: 'TaskBusiness',
        className: 'GetListDetailTasksAsync',
        panelLeftRef: this.panelLeft,
        panelRightRef: null,
        sideBarLeftRef: null,
        sideBarRightRef: null,
        itemTemplate: this.itemTemplate,
        widthAsideLeft: '550px',
        widthAsideRight: '550px'
      }
    }
    ]
  }
  views: Array<ViewModel> = [
  ];
  ngOnInit(): void {
  }

}
