import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CodxService, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-home-setting',
  templateUrl: './home-setting.component.html',
  styleUrls: ['./home-setting.component.css']
})
export class HomeSettingComponent implements OnInit {
  @ViewChild('main') main: TemplateRef<any>;

  views: Array<ViewModel> = [];

  constructor(private dt: ChangeDetectorRef,
    public codxService: CodxService,) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      active: true,
      type: ViewType.grid,
      sameData: true,
      model: {
        panelLeftRef: this.main,
      }
    }];
    this.dt.detectChanges();
  }
}
