import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType, CacheService } from 'codx-core';

@Component({
  selector: 'lib-test-journal',
  templateUrl: './test-journal.component.html',
  styleUrls: ['./test-journal.component.css'],
})
export class TestJournalComponent extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  vll85: Array<any> = [];
  vll86: Array<any> = [];
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  constructor(
    private injector: Injector,
    private change: ChangeDetectorRef,
    cache: CacheService
  ) {
    super(injector);
  }
  override onInit(): void {
    this.cache.valueList('AC085').subscribe((res) => {
      if (res) {
        this.vll85 = res.datas;
      }
    });
    this.cache.valueList('AC086').subscribe((res) => {
      if (res) {
        this.vll86 = res.datas;
      }
    });
  }
  ngAfterViewInit() {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    this.change.detectChanges();
  }
}
