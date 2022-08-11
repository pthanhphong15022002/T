import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { TabModel } from './model/tabControl.model';

@Component({
  selector: 'codx-approval-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css'],
})
export class ApprovalTabsComponent implements OnInit , OnChanges{
  @Input() active = 1;
  @Input() transID!: string;
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
  private all = ['Lịch sử', 'Thảo luận', 'Đính kèm', 'Liên kết', 'Xét duyệt', 'Quy trình duyệt'];
  constructor(
    injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    
  }

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
