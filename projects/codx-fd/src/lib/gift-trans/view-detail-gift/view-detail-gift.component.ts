import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DialogRef, FormModel, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { PopupSendGiftComponent } from '../popup-send-gift/popup-send-gift.component';
import { CodxFdService } from '../../codx-fd.service';

@Component({
  selector: 'fd-detail-gift',
  templateUrl: './view-detail-gift.component.html',
  styleUrls: ['./view-detail-gift.component.scss']
})
export class ViewDetailGiftComponent extends UIComponent implements OnInit, OnChanges {

  @Input() objectID: string = "";
  @Input() formModel: FormModel;
  @Output() changeStatus: EventEmitter<string> = new EventEmitter<string>();
  dialogConfirmStatus!: DialogRef;
  vllConfirmStatus: string = "1";
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
    inject: Injector,
    private dt: ChangeDetectorRef,
    private serviceFD: CodxFdService,
  ) {
    super(inject);
  }


  onInit(): void {
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

  sendGift() {
    var data = {
      moreFunc: {
        formName: "GiftTrans",
        gridViewName: "grvGiftTrans",
      },
      fieldDefault: "GiftTrans",
      valueDefault: "2"
    };
    this.dialogConfirmStatus = this.callfc.openForm(
      PopupSendGiftComponent,
      '',
      500,
      350,
      '',
      data
    );
    this.dialogConfirmStatus.closed.subscribe((e) => {
      if (e && e.event == "oke") {
        this.serviceFD.sendGift(
          this.data.recID,
          "2",
          e.event,
          this.funcID
        ).subscribe((res: any) => {
          if(res){
            this.data.status = "2";
            this.changeStatus.emit("2");
            this.dt.detectChanges();
          }
        });
      }
    });
  }
}
