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
  @Input() viewDefaut = ''; //Thao defaut cho TM, ai muon df gi truyen vao chu tab dùng chung
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
  //ApprovalProcess
  @Input() transID: string;
  @Input() approveStatus: string;

  private all: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  constructor(
    injector: Injector,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.TabControl.length == 0) {
      if (this.viewDefaut == '') this.TabControl = this.all;
      else {
        let arrViewDefault = this.viewDefaut.split(';');
        this.all.forEach((res) => {
          let index = arrViewDefault.findIndex((x) => x == res.name);
          if (index != -1) this.TabControl.push(res);
        });
        if(this.TabControl.length > 0) this.TabControl[0].isActive = true ;
      }
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
