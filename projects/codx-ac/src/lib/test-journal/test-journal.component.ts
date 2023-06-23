import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-test-journal',
  templateUrl: './test-journal.component.html',
  styleUrls: ['./test-journal.component.css'],
})
export class TestJournalComponent extends UIComponent implements OnInit {
  views: Array<ViewModel> = [];
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  constructor(private injector: Injector, private change: ChangeDetectorRef) {
    super(injector);
  }
  override onInit(): void {}
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
