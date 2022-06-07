import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LayoutModel, TmService } from '@modules/tm/tm.service';
import { CodxService } from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-statistical',
  templateUrl: './statistical.component.html',
  styleUrls: ['./statistical.component.scss']
})
export class StatisticalComponent implements OnInit,  OnDestroy {
  @ViewChild('main') main: TemplateRef<any>;

  constructor( public codxService: CodxService,
    private tmService: TmService,) { }

    views: Array<ViewModel> = [];

  ngOnDestroy(): void {
    this.tmService.layoutcpn.next(new LayoutModel(false, 'Báo cáo', true, false));

  }

  ngOnInit(): void {
    this.tmService.layoutcpn.next(new LayoutModel(true, 'Thống kê', false, false));
  }

}
