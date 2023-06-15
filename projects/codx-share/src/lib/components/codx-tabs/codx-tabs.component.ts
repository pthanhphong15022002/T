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
  //tree task
  @Input() dataTree: any[] = [];
  @Input() vllStatus: any;
  //references
  @Input() dataReferences: any[] = [];
  @Input() vllRefType: any = 'TM018';
  //update quyen cho file tai TM
  @Input() isUpPermission = false;
  @Input() isEdit = true; //mac dinh bằn true - Thao them sua ngay 23/2/2023
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
  @Input() referType: string = ''; //de mac định the any moi luu dc file cho task dung-VTHAO sua ngay 9/2/2023

  //Quotations - CM
  // @Input() customerID : string ;
  // @Input() funcIDQuotations ='CM0202' ;
  // @Input() refType: string;
  // @Input() refID: string;
  // @Input() predicates : string ;
  // @Input() dataValues :string;
  // @Input() salespersonID: string;
  // @Input() consultantID: string;
  // @Input() disableRefID = false;
  // @Input() disableCusID = false;
  // @Input() disableContactsID = false;
  
  private all: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true,icon: "icon-i-clock-history" },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false,icon: "icon-i-paperclip" },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false,icon: "icon-i-chat-right" },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false,icon: "icon-i-clipboard-check" },
    { name: 'References', textDefault: 'Nguồn công việc', isActive: false,icon: "icon-i-link" },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false,icon: "" },
  ];

  oCountFooter: any = {};
  constructor(
    injector: Injector,
    private api: ApiHttpService,
    private shareService : CodxShareService,
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
    } else 
    {
      this.activeTabControl();
    }

    this.CheckTabControlApproval();
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
    this.CheckTabControlApproval();
    this.changeDetectorRef.detectChanges();
  }

  CheckTabControlApproval()
  {
    var funcList = this.shareService.loadFunctionList(this.funcID) as any;
    if(isObservable(funcList))
    {
      funcList.subscribe((fc : any) => {
        if(fc.runMode == "1") this.tabcontrolApproval()
      })
    }
    else if(funcList.runMode == "1") this.tabcontrolApproval()
    this.changeDetectorRef.detectChanges();
  }
  tabcontrolApproval()
  {
    this.TabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },
      { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
      { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
    ];
    this.activeTabControl();
  }
  activeTabControl()
  {
    this.TabControl.map(x => x.icon = this.all.find(e => e.name.toLowerCase() == x.name.toLowerCase())?.icon ?? "");
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

  changeCountFooter(value:number,key:string){
    let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
    oCountFooter[key] = value;
    this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
    this.changeDetectorRef.detectChanges();
  }
}
