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
import { Permission } from '@shared/models/file.model';
import { ApiHttpService } from 'codx-core';
import { TabModel } from './model/tabControl.model';
import { CodxShareService } from '../../codx-share.service';
import { isObservable } from 'rxjs';

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
  @Input() listTab: string[] = [];
  //tree task
  @Input() dataTree: any[] = [];
  @Input() vllStatus: any;
  //references
  @Input() dataReferences: any[] = [];
  @Input() vllRefType: any = 'TM018';
  //update quyen cho file tai TM
  @Input() isUpPermission = false;
  @Input() isEdit = true; //mac dinh bằng true - Thao them sua ngay 23/2/2023
  //Attachment
  @Input() hideFolder: string = '1';
  @Input() type: string = 'inline';
  @Input() allowExtensions: string = '.jpg,.png,.pdf';
  @Input() allowMultiFile: string = '1';
  @Input() displayThumb: string = 'full';
  @Input() addPermissions: Permission[] = [];
  @Input() dataSelected: any;
  opened = false;
  @Output() tabChange = new EventEmitter();
  //ApprovalProcess
  @Input() transID: string;
  @Input() approveStatus: string;

  @Input() referType: string = 'attach'; //de mac định the nay moi luu dc file cho task dung-VTHAO sua ngay 9/2/2023

  private all: TabModel[] = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      icon: 'icon-i-clock-history',
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      icon: 'icon-i-paperclip',
    },
    {
      name: 'Comment',
      textDefault: 'Bình luận',
      isActive: false,
      icon: 'icon-i-chat-right',
    },
    {
      name: 'AssignTo',
      textDefault: 'Giao việc',
      isActive: false,
      icon: 'icon-i-clipboard-check',
    },
    {
      name: 'References',
      textDefault: 'Nguồn công việc',
      isActive: false,
      icon: 'icon-i-link',
    },
    {
      name: 'Approve',
      textDefault: 'Xét duyệt',
      isActive: false,
      icon: 'icon-edit-one', // VTHAO thêm tạm icon để view đỡ xấu
    },
  ];

  oCountFooter: any = {};
  constructor(
    injector: Injector,
    private api: ApiHttpService,
    private shareService: CodxShareService,
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
    if (this.TabControl.length == 0 && this.listTab.length == 0) {
      this.TabControl = this.all;
    } else {
      this.activeTabControl();
    }

    this.CheckTabControlApproval();
    this.changeDetectorRef.detectChanges();
  }

  loadingCount: boolean = false;
  ngOnChanges(changes: SimpleChanges) {
    if (this.objectID && !this.loadingCount) {
      this.loadingCount = true;
      this.api
        .execSv('DM', 'DM', 'FileBussiness', 'CountAttachmentAsync', [
          this.objectID,
          this.referType,
          this.entityName,
        ])
        .subscribe((res) => {
          if (res) this.oCountFooter['attachment'] = res;
          this.loadingCount = false;
        });
      this.api
        .execSv('BG', 'BG', 'TrackLogsBusiness', 'CountFooterAsync', [
          this.objectID,
          this.referType,
          this.transID,
        ])
        .subscribe((res) => {
          if (res) this.oCountFooter['comment'] = res;
          this.loadingCount = false;
        });
    }
    debugger
    if (
      changes['dataTree'] &&
      changes['dataTree']?.currentValue != changes['dataTree']?.previousValue
    ) {
      this.dataTree = changes['dataTree']?.currentValue
    }
    this.CheckTabControlApproval();
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit() {}

  CheckTabControlApproval() {
    var funcList = this.shareService.loadFunctionList(this.funcID) as any;
    if (isObservable(funcList)) {
      funcList.subscribe((fc: any) => {
        if (fc.runMode == '1') this.tabcontrolApproval();
      });
    } else if (funcList.runMode == '1') this.tabcontrolApproval();
    this.changeDetectorRef.detectChanges();
  }
  tabcontrolApproval() {
    this.TabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
      { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
      {
        name: 'Approve',
        textDefault: 'Xét duyệt',
        isActive: false,
        icon: 'icon-edit-one', // VTHAO thêm tạm icon để view đỡ xấu
      },
    ];
    this.activeTabControl();
  }
  activeTabControl() {
    if (this.listTab.length > 0) {
      this.TabControl = [];
      this.listTab.forEach((element) => {
        let tab = this.all.find(
          (x) => x.name.toLowerCase() == element.toLowerCase()
        );
        if (tab) this.TabControl.push(tab);
      });
    }
    this.TabControl.map(
      (x) =>
        (x.icon =
          this.all.find((e) => e.name.toLowerCase() == x.name.toLowerCase())
            ?.icon ?? x.icon)
    );
    this.active = this.TabControl.findIndex(
      (x: TabModel) => x.isActive == true
    );
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
          createdBy,
        ])
        .subscribe();
    }
  }

  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.detectChanges();
  }
}
