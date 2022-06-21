import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CodxService, ViewModel } from 'codx-core';
import { CodxTMService, LayoutModel } from '../codx-tm.service';

@Component({
  selector: 'lib-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit, OnDestroy {
  @ViewChild('main') main: TemplateRef<any>;

  constructor(public codxService: CodxService, 
    private tmService: CodxTMService,

    ) { }
    views: Array<ViewModel> = [];

  ngOnInit(): void {
    this.tmService.layoutcpn.next(new LayoutModel(true, 'Thiết lập', false, false));
  }
  ngOnDestroy(): void {
    this.tmService.layoutcpn.next(new LayoutModel(false, 'Quản lý công việc', true, false));
  }
}
