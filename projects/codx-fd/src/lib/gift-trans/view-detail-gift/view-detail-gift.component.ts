import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiHttpService, FormModel } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'fd-detail-gift',
  templateUrl: './view-detail-gift.component.html',
  styleUrls: ['./view-detail-gift.component.scss']
})
export class ViewDetailGiftComponent implements OnInit, OnChanges {

  @Input() objectID: string = "";
  @Input() formModel: FormModel;
  service: string = "FD";
  assemblyName: string = "ERM.Business.FD";
  className: string = "GiftTransBusiness"
  data: any = null;
  TabControl: TabModel[] = [
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
    }
  ];
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    if (this.objectID) {
      this.getDataInfor(this.objectID);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['objectID'] && (changes['objectID'].currentValue != changes['objectID'].previousValue)) {
      this.getDataInfor(this.objectID);
    }
  }

  getDataInfor(objectID: string) {
    if (!objectID) return;
    this.api.execSv(this.service, this.assemblyName, this.className, "GetGiftTranInforAsync", objectID)
      .subscribe((res: any) => {
        if (res) {
          console.log(res);
          this.data = res;
          this.dt.detectChanges();
        }
      })
  }

  clickUpdateGiftTran() {
    let status = "2";
    this.api.execSv(this.service, this.assemblyName, this.className, "UpdateStatusAsync", [this.data.recID, status]).subscribe((res: any) => {
      if (res) {
        this.data.status == status;
        this.dt.detectChanges();
      }
    });
  }
}
