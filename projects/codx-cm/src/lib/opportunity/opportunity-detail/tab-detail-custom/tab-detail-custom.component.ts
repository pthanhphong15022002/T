import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'codx-tab-detail-custom',
  templateUrl: './tab-detail-custom.component.html',
  styleUrls: ['./tab-detail-custom.component.scss']
})
export class TabDetailCustomComponent implements OnInit {
  @Input() tabType: any;
  @Input() data: any;
  constructor() { }

  ngOnInit(): void {
  }

}
