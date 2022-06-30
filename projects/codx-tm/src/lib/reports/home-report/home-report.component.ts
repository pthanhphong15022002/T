import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CodxService, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-home-report',
  templateUrl: './home-report.component.html',
  styleUrls: ['./home-report.component.css']
})
export class HomeReportComponent implements OnInit {
  @ViewChild('main') main: TemplateRef<any>;

  views: Array<ViewModel> = [];
  constructor(private dt: ChangeDetectorRef,
    public codxService: CodxService,) { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.views = [{
      active: true,
      type: ViewType.content,
      sameData: true,
      model: {
        panelLeftRef: this.main,
      }
    }];
    this.dt.detectChanges();
  }
}
