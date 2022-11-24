import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ApiHttpService } from 'codx-core';
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
  @Input() id!: any;
  @Input() formModel!: any;
  @Input() TabControl: TabModel[] = [];
  //tree task
  @Input() dataTree: any[] = [];
  @Input() vllStatus: any;
  //references
  @Input() dataReferences: any[] = [];
  @Input() vllRefType: any = 'TM018';
  //Attachment
  @Input() hideFolder: string = '1';
  @Input() type: string = 'inline';
  @Input() allowExtensions: string = '.jpg,.png';
  @Input() allowMultiFile: string = '1';
  @Input() displayThumb: string = 'full';
  opened = false;
  @Output() tabChange = new EventEmitter();

  private all: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
    // { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  constructor(
    injector: Injector,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.TabControl.length == 0) {
      this.TabControl = this.all;
      // this.all.forEach((res, index) => {
      //   var tabModel = new TabModel();
      //   tabModel.name = tabModel.textDefault = res;
      //   if (index == 0) tabModel.isActive = true;
      //   else tabModel.isActive = false;
      //   this.TabControl.push(tabModel);
      // });
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

  navChange(evt: any) {
    this.tabChange.emit(evt);
  }
}
