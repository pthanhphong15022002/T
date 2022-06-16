import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ViewModel } from 'codx-core';

@Component({
  selector: 'app-mwp',
  templateUrl: './mwp.component.html',
  styleUrls: ['./mwp.component.scss'],
})
export class MwpComponent implements OnInit, AfterViewInit {
  @ViewChild('dashboard') dashboard: TemplateRef<any>;
  @ViewChild('panelTemplate') panelLeft: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  constructor() { }
  ngAfterViewInit(): void {
    // this.views = [
    //   {
    //     type: 'list',
    //     icon: '',
    //     text: '',
    //     id: '1',
    //     active: false,
    //     sameData: false,
    //     model: {
    //       service: 'TM',
    //       assemblyName: 'TM',
    //       method: 'GetListDetailTasksAsync',
    //       className: 'TaskBusiness',
    //       panelLeftRef: this.panelLeft,
    //       panelRightRef: null,
    //       sideBarLeftRef: null,
    //       sideBarRightRef: null,
    //       itemTemplate: this.itemTemplate,
    //       widthAsideLeft: '550px',
    //       widthAsideRight: '550px',
    //     },
    //   },
    //   {
    //     type: 'listdetail',
    //     icon: '',
    //     text: '',
    //     id: '2',
    //     sameData: false,
    //     active: false,
    //     model: {
    //       service: 'TM',
    //       assemblyName: 'TM',
    //       method: 'GetListDetailTasksAsync',
    //       className: 'TaskBusiness',
    //       panelLeftRef: this.panelLeft,
    //       panelRightRef: null,
    //       sideBarLeftRef: null,
    //       sideBarRightRef: null,
    //       itemTemplate: this.itemTemplate,
    //       widthAsideLeft: '550px',
    //       widthAsideRight: '550px',
    //     },
    //   },
    // ];
  }
  views: Array<ViewModel> = [];
  ngOnInit(): void { }
}
