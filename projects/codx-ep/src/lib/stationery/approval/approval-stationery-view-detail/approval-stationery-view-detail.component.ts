import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Injector,
  EventEmitter,
  Output,
  ElementRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NotificationsService, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
@Component({
  selector: 'approval-stationery-view-detail',
  templateUrl: 'approval-stationery-view-detail.component.html',
  styleUrls: ['approval-stationery-view-detail.component.scss'],
})
export class ApprovalStationeryViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @Input() itemDetail: any;
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Output('approve') approve: EventEmitter<any> = new EventEmitter();
  @Output('reject') reject: EventEmitter<any> = new EventEmitter();
  @Output('undo') undo: EventEmitter<any> = new EventEmitter();
  @Input() funcID;
  @Input() formModel;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;
  tabControl: TabModel[] = [];
  listFilePermission = [];
  isEdit: boolean = true;

  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private codxEpService: CodxEpService
  ) {
    super(injector);
  }

  onInit(): void {
    this.itemDetailStt = 1;
  }
  ngAfterViewInit(): void {
    this.tabControl = [
      { name: 'History', textDefault: 'Lịch sử', isActive: true },
      { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
      { name: 'Comment', textDefault: 'Bình luận', isActive: false },

      { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
    ];
  }
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.itemDetail &&
      changes.itemDetail?.previousValue?.recID !=
        changes.itemDetail?.currentValue?.recID
    ) {
      this.api
        .exec<any>('EP', 'BookingsBusiness', 'GetApprovalBookingByIDAsync', [
          changes.itemDetail?.currentValue?.recID,
          changes.itemDetail?.currentValue?.approvalTransRecID,
        ])
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.listFilePermission=[];
            let tmpPer = new Permission();
            tmpPer.objectID = this.itemDetail.createdBy; //
            tmpPer.objectType = 'U';
            tmpPer.read = true;
            tmpPer.share = true;
            tmpPer.download = true;
            tmpPer.isActive = true;
            this.listFilePermission.push(tmpPer);
            this.detectorRef.detectChanges();
          }
        });
      this.detectorRef.detectChanges();
    }
    this.setHeight();
    this.active = 1;
  }

  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;
    switch (funcID) {
      case 'EPT40301':
        {
          //alert('Duyệt');
          this.approve.emit(datas);
        }
        break;
      case 'EPT40302':
        {
          //alert('Từ chối');
          this.reject.emit(datas);
        }
        break;
      case 'EPT40306':
        {
          //alert('Thu hồi');
          this.undo.emit(datas);
        }
        break;
    }
  }

  changeDataMF(event, data: any) {
    if (event != null && data != null) {
      event.forEach((func) => {
        if (
          func.functionID == 'SYS02' /*Delete*/ ||
          func.functionID == 'SYS03' /*Edit*/ ||
          func.functionID == 'SYS04' /*Copy*/
        ) {
          func.disabled = true;
        }
      });
      if (data.approveStatus == '3') {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40301' /*MF Duyệt*/ ||
            func.functionID == 'EPT40302' /*MF từ chối*/
          ) {
            func.disabled = false;
          }
          if (
            func.functionID == 'EPT40306' /*MF Undo*/ //||
          ) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40301' /*MF Duyệt*/ ||
            func.functionID == 'EPT40302' /*MF từ chối*/
          ) {
            func.disabled = true;
          }
          if (func.functionID == 'EPT40306' /*MF Undo*/) {
            func.disabled = false;
          }
        });
      }
    }
  }

  private setHeight() {
    let main,
      header = 0;
    let ele = document.getElementsByClassName(
      'codx-detail-main'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      main = Array.from(ele)[0]?.offsetHeight;
    }

    let eleheader = document.getElementsByClassName(
      'codx-detail-header'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      header = Array.from(eleheader)[0]?.offsetHeight;
    }

    let nodes = document.getElementsByClassName(
      'codx-detail-body'
    ) as HTMLCollectionOf<HTMLElement>;
    if (nodes.length > 0) {
      Array.from(
        document.getElementsByClassName(
          'codx-detail-body'
        ) as HTMLCollectionOf<HTMLElement>
      )[0].style.height = main - header - 27 + 'px';
    }
  }
}
