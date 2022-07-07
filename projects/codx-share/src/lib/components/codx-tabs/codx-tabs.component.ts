import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { TabModel } from './model/tabControl.model';

@Component({
  selector: 'codx-tabs',
  templateUrl: './codx-tabs.component.html',
  styleUrls: ['./codx-tabs.component.css'],
})
export class CodxTabsComponent implements OnInit {
  @Input() active = 1;
  @Input() entityName!: string;
  @Input() objectID!: any;
  @Input() TabControl: TabModel[] = [];
  private all = ['Attachment', 'History', 'Comment', 'Reference', 'Approve'];
  constructor(
    injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.TabControl.length == 0) {
      this.all.forEach((res, index) => {
        var tabModel = new TabModel();
        tabModel.name = tabModel.textDefault = res;
        if (index == 0) tabModel.isActive = true;
        else tabModel.isActive = false;
        this.TabControl.push(tabModel);
      });
    } else {
      this.active = this.TabControl.findIndex(
        (x: TabModel) => x.isActive == true
      );
    }
    this.changeDetectorRef.detectChanges();
  }
}
