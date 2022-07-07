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
  @Input() funcID!: string;
  @Input() entityName!: string;
  @Input() objectID!: any;
  @Input() formModel!: any;
  @Input() TabControl: TabModel[] = [];
  //Attachment
  @Input() hideFolder: string = '1';
  @Input() type: string = 'inline';
  @Input() allowExtensions: string = '.jpg,.png';
  @Input() allowMultiFile: string = '1';
  @Input() displayThumb: string = 'full';
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

  fileAdded(e: any) {
    console.log(e);
  }

  getfileCount(e: any) {
    console.log(e);
  }
}
