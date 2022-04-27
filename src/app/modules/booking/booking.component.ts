import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-tm',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit, AfterViewInit {
  @ViewChild('panelTemplate') panelLeft: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;

  views: Array<ViewModel> = [
  ];

  constructor() { }

  ngAfterViewInit(): void {
    this.views = [{
      type: 'list',
      active: false,
      id: '1',
      model: {
        panelLeftRef: this.panelLeft,
        itemTemplate: this.itemTemplate
      }
    },
    {
      type: 'listdetail',
      active: false,
      id: '2',
      model: {
        panelLeftRef: this.panelLeft,
        itemTemplate: this.itemTemplate
      }
    }]
  }

  ngOnInit(): void {
  }

}
