import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DataRequest,
  NotificationsService,
  UIComponent,
  ViewsComponent,
  DialogRef,
} from 'codx-core';
import moment from 'moment';
import { CodxEpService } from '../../../codx-ep.service';
import { DriverModel } from '../../../models/bookingAttendees.model';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { PopupDriverAssignComponent } from '../popup-driver-assign/popup-driver-assign.component';
@Component({
  selector: 'approval-car-view-detail',
  templateUrl: 'approval-car-view-detail.component.html',
  styleUrls: ['approval-car-view-detail.component.scss'],
})
export class ApprovalCarViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @Output('driverAssigned') driverAssigned: EventEmitter<any> =
    new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> =
    new EventEmitter();
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() data: any;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  firstLoad = true;
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;
  cbbDriver: any[];
  listDriver = [];
  popupDialog: DialogRef;
  popupTitle: any;
  dialog: any;
  tabControl: TabModel[] = [];
  fields: Object = { text: 'driverName', value: 'driverID' };
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService
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
            this.detectorRef.detectChanges();
          }
        });
      this.detectorRef.detectChanges();
    }
    this.setHeight();
    this.active = 1;
  }
  sameDayCheck(sDate: any, eDate: any) {
    return moment(new Date(sDate)).isSame(new Date(eDate), 'day');
  }
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
  }
  clickMF(value, datas: any = null) {
    let funcID = value?.functionID;
    // if (!datas) datas = this.data;
    // else {
    //   var index = this.view.dataService.data.findIndex((object) => {
    //     return object.recID === datas.recID;
    //   });
    //   datas = this.view.dataService.data[index];
    // }
    switch (funcID) {
      case 'EPT40201':
        {
          //alert('Duyệt');
          this.approve(datas, '5');
        }
        break;
      case 'EPT40205':
        {
          //alert('Từ chối');
          this.approve(datas, '4');
        }
        break;
      case 'EPT40204':
        {
          this.popupTitle = value.text;
          this.lviewSetPopupTitle(this.popupTitle);
          this.lviewDriverAssign(datas);
        }
        break;

      default:
        '';
        break;
    }
  }
  approve(data: any, status: string) {
    this.codxEpService
      .getCategoryByEntityName(this.formModel.entityName)
      .subscribe((res: any) => {
        this.codxEpService
          .approve(
            data?.approvalTransRecID, //ApprovelTrans.RecID
            status,
            '',
            ''
          )
          .subscribe((res: any) => {
            if (res?.msgCodeError == null && res?.rowCount >= 0) {
              if (status == '5') {
                this.notificationsService.notifyCode('SYS034'); //đã duyệt
                data.approveStatus = '5';
              }
              if (status == '4') {
                this.notificationsService.notifyCode('SYS034'); //bị hủy
                data.approveStatus = '4';
              }
              this.updateStatus.emit(data);
            } else {
              this.notificationsService.notifyCode(res?.msgCodeError);
            }
          });
      });
  }

  changeDataMF(event, data: any) {
    if (event != null && data != null) {
      event.forEach((func) => {
        if (
          func.functionID == 'SYS04' /*Copy*/ ||
          func.functionID == 'EPT40203'
        ) {
          func.disabled = true;
        }
      });
      if (data.approveStatus == '3') {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40201' /*MF Duyệt*/ ||
            func.functionID == 'EPT40202' /*MF từ chối*/
          ) {
            func.disabled = false;
          }
          if (func.functionID == 'EPT40204' /*MF phân công tài xế*/) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          if (
            func.functionID == 'EPT40201' /*MF Duyệt*/ ||
            func.functionID == 'EPT40202' /*MF từ chối*/
          ) {
            func.disabled = true;
          }
          if (func.functionID == 'EPT40204' /*MF phân công tài xế*/) {
            if (data.approveStatus == 5 && data.driverName == null)
              func.disabled = false;
            else {
              func.disabled = true;
            }
          }
        });
      }
    }
  }
  lviewSetPopupTitle(data) {
    if (data) {
      this.setPopupTitle.emit(data);
    }
  }
  lviewDriverAssign(data) {
    if (data) {
      this.driverAssigned.emit(data);
    }
  }
  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  clickChangeItemViewStatus(stt, recID) {
    this.itemDetailStt = stt;
  }

  setHeight() {
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
