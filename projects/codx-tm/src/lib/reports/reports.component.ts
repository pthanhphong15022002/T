import { Component, OnInit, OnDestroy } from '@angular/core';
import { CodxService } from 'codx-core';
import { CodxTMService, LayoutModel } from '../codx-tm.service';

@Component({
  selector: 'lib-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  constructor(public codxService: CodxService, 
    private tmService: CodxTMService,) { }

  ngOnInit(): void {
    this.tmService.layoutcpn.next(new LayoutModel(true, 'Báo cáo', false, false));

  }

}
