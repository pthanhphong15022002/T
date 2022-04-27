import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('asideLeft') asideLeft: TemplateRef<any>;

  constructor() { }

  views: Array<ViewModel> = [{
    id: '1',
    type: 'content',
    active: false
  }];

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'content',
      active: false,
      model: {
        panelLeftRef: this.panelLeftRef,
        sideBarLeftRef: this.asideLeft,
      }
    }];
  }
}
