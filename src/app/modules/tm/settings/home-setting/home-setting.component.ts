import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TmService } from '@modules/tm/tm.service';
import { CodxService } from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-home-setting',
  templateUrl: './home-setting.component.html',
  styleUrls: ['./home-setting.component.scss']
})
export class HomeSettingComponent implements OnInit {
  @ViewChild('main') main: TemplateRef<any>;
  constructor(
    private dt: ChangeDetectorRef,
    public codxService: CodxService,
    private tmService: TmService,
  ) { }

  views: Array<ViewModel> = [];
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'grid',
      sameData: false,
      active: true,
      model: {
        panelLeftRef: this.main,
      }
    }];
    this.dt.detectChanges();
  }

}
