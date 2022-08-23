import { Component, ViewEncapsulation, OnInit, AfterViewInit, ChangeDetectorRef, Optional, ViewChild, TemplateRef } from "@angular/core";
import { ApiHttpService, AuthStore, NotificationsService, CacheService, DialogData, DialogRef } from "codx-core";
import { AttachmentComponent } from "projects/codx-share/src/lib/components/attachment/attachment.component";
import { AttachmentService } from "projects/codx-share/src/lib/components/attachment/attachment.service";

@Component({
  selector: 'popup-add-report',
  templateUrl: './popup-add-report.component.html',
  styleUrls: ['./popup-add-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAddReportComponent implements OnInit, AfterViewInit {
  @ViewChild('tabInfo') tabInfo : TemplateRef<any>;
  @ViewChild('tabParam') tabParam : TemplateRef<any>;
  @ViewChild('tabSignature') tabSignature : TemplateRef<any>;
  @ViewChild('attachment') attachment : AttachmentComponent;

  title: string = 'Thêm mới báo cáo';
  tabContent: any[] = [];
  tabTitle: any[] = [];
  dialog: any;
  data: any;
  checkFile = false;

  menuInfo= {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'Description',
    subName: 'Description Info',
    subText: 'Description Info',
  };
  menuParam= {
    icon: 'icon-assignment_turned_in',
    text: 'Tham số báo cáo',
    name: 'Report parameters',
    subName: 'Report parameters',
    subText: 'Report parameters',
  };
  menuSignature= {
    icon: 'icon-assignment',
    text: 'Chữ ký',
    name: 'Sinatures',
    subName: 'Sinatures',
    subText: 'Sinatures',
  };
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    public atSV: AttachmentService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ){
    this.data = dt.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.tabContent = [
      this.tabInfo,
      this.tabParam,
      this.tabSignature
    ];
    this.tabTitle = [
      this.menuInfo,
      this.menuParam,
      this.menuSignature
    ];

    if(!this.data || Object.keys(this.data).length == 0){
      this.data = {};
      this.data.recID = GuId.newGuid();
    }
  }

  setTitle(evt:any){

  }

  buttonClick(evt:any){

  }

  popup() {
    this.attachment.uploadFile();
    this.checkFile = true;
  }

}
class GuId {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
