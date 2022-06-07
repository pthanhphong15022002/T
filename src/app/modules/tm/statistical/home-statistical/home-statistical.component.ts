import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { TmService } from '@modules/tm/tm.service';
import { CodxService } from 'codx-core';
import { ViewModel } from 'codx-core/lib/layout/views/view-model';

@Component({
  selector: 'app-home-statistical',
  templateUrl: './home-statistical.component.html',
  styleUrls: ['./home-statistical.component.scss']
})
export class HomeStatisticalComponent implements OnInit,AfterViewInit {
  @ViewChild('main') main: TemplateRef<any>;

  constructor(private dt: ChangeDetectorRef,
    public codxService: CodxService,
    private tmService: TmService,) { }
  ngAfterViewInit(): void {
    this.views = [{
      id: '1',
      type: 'content',
      sameData: false,
      active: true,
      model: {
        panelLeftRef: this.main,
      }
    }];
    this.dt.detectChanges();
  }

  views: Array<ViewModel> = [];

  ngOnInit(): void {
   
  }

}
