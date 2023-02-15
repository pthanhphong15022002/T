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
  //update quyen cho file tai TM
  @Input() isUpPermission = false;
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
  @Input() referType: string = ''; //de mac định the any moi luu dc file cho task dung-VTHAO sua ngay 9/2/2023
  private all: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];

  oCountFooter: any = {};
  constructor(
    injector: Injector,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.api
    //   .execSv('BG', 'BG', 'TrackLogsBusiness', 'CountFooterAsync', [
    //     this.objectID,
    //     this.referType,
    //     this.transID,
    //   ])
    //   .subscribe((res) => {
    //     this.oCountFooter = res;
    //   });
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

  ngOnChanges() {
    if (this.objectID) {
      this.api
        .execSv('BG', 'BG', 'TrackLogsBusiness', 'CountFooterAsync', [
          this.objectID,
          this.referType,
          this.transID,
        ])
        .subscribe((res) => {
          if (res) this.oCountFooter = res;
        });
    }
  }

  fileAdded(e: any) {
    console.log(e);
  }

  getfileCount(e: any) {
    console.log(e);
  }

  navChange(evt: any) {
    let footer = document.querySelector('.codx-detail-footer');
    if (footer) {
      var f = footer as HTMLElement;
      let clss = f.classList;
      if (!clss.contains('expand')) {
        clss.remove('collape');
        clss.add('expand');
      }
    }
    this.tabChange.emit(evt);
  }

  //xu ly quyen file tm
  fileSave(e) {
    if (e && typeof e === 'object' && this.isUpPermission) {
      var createdBy = Array.isArray(e) ? e[0].data.createdBy : e.createdBy;
      this.api
        .execSv<any>('TM', 'TM', 'TaskBusiness', 'AddPermissionFileAsync', [
          this.objectID,
          createdBy
        ])
        .subscribe();
    }
  }
}
