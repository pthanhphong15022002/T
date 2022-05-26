import { LayoutModel, TmService } from '@modules/tm/tm.service';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { CodxService, LayoutInitService, LayoutService } from 'codx-core';
import { LayoutComponent } from '../_layout/layout.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  @ViewChild('main') main: TemplateRef<any>;
  constructor(
    public codxService: CodxService,
    private tmService: TmService,
  ) { }

  views: Array<ViewModel> = [];

  ngOnInit(): void {
    this.tmService.layoutcpn.next(new LayoutModel(true, 'Thiết lập', false, false));
  }

  ngOnDestroy(): void {
    this.tmService.layoutcpn.next(new LayoutModel(false, 'Quản lý công việc', true, false));
  }
}
