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
  ViewChild,
} from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { ApiHttpService } from 'codx-core';
import { TabModel } from './model/tabControl.model';
import { CodxShareService } from '../../codx-share.service';
import { isObservable } from 'rxjs';
import { CodxReferencesComponent } from '../codx-tasks/codx-references/codx-references.component';
import { CodxViewAssignComponent } from '../codx-tasks/codx-view-assign/codx-view-assign.component';

@Component({
  selector: 'codx-tabs',
  templateUrl: './codx-tabs.component.html',
  styleUrls: ['./codx-tabs.component.css'],
})
export class CodxTabsComponent implements OnInit, OnChanges {
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
  @Input() refID = ''; //
  @Input() refType = ''; // nghiep vụ giao việc
  @Input() sessionID = ''; // session cua tree
  @Input() listRefID = []; //danh sách task ref để vẽ tree
  @Input() isLoadedTree = true; //bang true neu da co dataTree truyền qua, bằng false để component se load tree
  @Input() vllStatus: any;
  @ViewChild('viewTreeAssign') viewTreeAssign: CodxViewAssignComponent;
  //references
  @Input() dataReferences: any[] = [];
  @Input() vllRefType: any = 'TM018';
  @Input() isLoadedDataRef = true; //mặc định gửi nguyên cục ref thì ko cần load data
  @Input() refIDRef = '';
  @Input() refTypeRef = '';
  @ViewChild('viewDataRef') viewDataRef: CodxReferencesComponent;

  //update quyen cho file tai TM
  @Input() isUpPermission = false;
  @Input() isEdit = true; //mac dinh bằng true - Thao them sua ngay 23/2/2023
  @Input() showFileApprove = false; //truyền bằng true sẽ hiện file gửi kí duyệt - Thao them sua ngay 25/10/2023
  @Input() listIDTransApprove = []; //truyền danh sach file kí duyệt - Thao them sua ngay 25/10/2023
  @Input() entityNameApprove = ''; //truyền entity nghiep vụ ki duyet file kí duyệt - Thao them sua ngay 25/10/2023
  //Attachment
  @Input() hideFolder: string = '1';
  @Input() type: string = 'inline';
  @Input() allowExtensions: string = '.jpg,.png,.pdf';
  @Input() allowMultiFile: string = '1';
  @Input() displayThumb: string = 'full';
  @Input() addPermissions: Permission[] = [];
  @Input() dataSelected: any;
  @Input() isFirstVer = false;
  opened = false;
  @Output() tabChange = new EventEmitter();
  //ApprovalProcess
  @Input() transID: string;
  @Input() approveStatus: string;

  @Input() referType: string = '';

  @Input() data:any; // data nghiệp vụ
  @Input() keyField:string = ""; // primary key nghiệp vụ
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
      // for (const property in changes) {
      //   if(property != "objectID") return;

      // }
      if (
        changes['objectID']?.previousValue == changes['objectID']?.currentValue
      )
        return;
      this.oCountFooter['attachment'] = 0;
      this.oCountFooter['comment'] = 0;
      this.loadingCount = true;
      let methodCountFile = 'CountAttachmentAsync';
      let resquetCountFile = [this.objectID, this.referType, this.entityName];

      //truyền danh sach file kí duyệt để đếm - Thao them ngay 26/10/2023 - Theo yêu cầu của Nhi
      if (this.showFileApprove && this.listIDTransApprove?.length > 0) {
        methodCountFile = 'CountAttachmentWithListObjectApproveFileAsync';
        resquetCountFile = [
          this.objectID,
          this.referType,
          this.entityName,
          this.listIDTransApprove.join(';'),
          this.entityNameApprove,
        ];
      }

      this.api
        .execSv('DM', 'DM', 'FileBussiness', methodCountFile, resquetCountFile)
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
      let arr = this.entityName.split('_');
      let service = arr[0];
      let className = '';
      if (service != 'TM')
        className = arr.slice(1, arr.length).join('') + 'Business';
      else className = 'TaskBusiness'; //Luc truoc tạo business chưa đúng logic
      let methol = 'AddPermissionFileAsync';
      this.api
        .exec<any>(service, className, methol, [this.objectID, createdBy])
        .subscribe();
    }
  }

  changeCountFooter(value: number, key: string) {
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.detectChanges();
  }

  //giao việc nếu dataTree thay đổi mà nghiệp vụ hiện tại ko get lại data để truyền qua thì gọi hàm này đê component tự get
  changeTreeAssign() {
    if (this.viewTreeAssign) {
      this.viewTreeAssign.listRefID = this.listRefID;
      this.viewTreeAssign.loadTree();
    } else this.isLoadedTree = false;
  }

  changeDataRef() {
    if (this.viewDataRef) {
      this.viewDataRef.refID = this.refIDRef;
      this.viewDataRef.refType = this.refTypeRef;
      this.viewDataRef.loadDataRef();
    }
  }
}
