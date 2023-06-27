import { type } from 'os';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  ViewModel,
  ViewType,
  CacheService,
  RequestModel,
  RequestOption,
  DataRequest,
} from 'codx-core';

@Component({
  selector: 'lib-test-journal',
  templateUrl: './test-journal.component.html',
  styleUrls: ['./test-journal.component.css'],
})
export class TestJournalComponent extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  subViews: Array<ViewModel> = [];
  viewActive: number = 5;
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
    this.subViews = [
      {
        type: ViewType.list,
        active: true,
      },
      {
        type: ViewType.smallcard,
      },
    ];
    this.cache.valueList('AC085').subscribe((res) => {
      if (res) {
        this.vll85 = res.datas;
      }
    });
    this.cache.valueList('AC086').subscribe((res) => {
      if (res) {
        this.vll86 = res.datas;
        console.log(res.datas);
      }
    });
  }

  ngAfterViewInit() {
    this.views = [
      {
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

  viewChanged(view) {
    this.viewActive = view.type;
    this.subViews?.filter(function (v) {
      if (v.type == view.type) v.active = true;
      else v.active = false;
    });
  }
}
