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
import { AuthService, UIComponent, ViewsComponent } from 'codx-core';
import moment from 'moment';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
import { CodxEpService } from '../../codx-ep.service';

@Component({
  selector: 'booking-car-view-detail',
  templateUrl: 'booking-car-view-detail.component.html',
  styleUrls: ['booking-car-view-detail.component.scss'],
})
export class BookingCarViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();
  @Output('release') release: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();
  @Output('cancel') cancel: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> =
    new EventEmitter();
  //MFunction Approve
  @Output('setPopupTitleOption') setPopupTitleOption: EventEmitter<any> =
    new EventEmitter();
  @Output('approve') approve: EventEmitter<any> = new EventEmitter();
  @Output('reject') reject: EventEmitter<any> = new EventEmitter();
  @Output('undo') undo: EventEmitter<any> = new EventEmitter();
  @Output('assignDriver') assignDriver: EventEmitter<any> = new EventEmitter();
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() data: any;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @Input() type = '1';
  firstLoad = true;

  tabControl: TabModel[] = [];
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;
  routerRecID: any;
  recID: any;
  listFilePermission = [];
  allowUploadFile = false;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxEpService: CodxEpService
  ) {
    super(injector);
    this.routerRecID = this.router.snapshot.params['id'];
    if (this.routerRecID != null) {
      this.hideFooter = true;
    }
  }

  onInit(): void {
    this.itemDetailStt = 1;
    let tempRecID: any;
    if (this.routerRecID != null) {
      tempRecID = this.routerRecID;
    } else {
      tempRecID = this.itemDetail?.currentValue?.recID;
    }
    this.detectorRef.detectChanges();
    this.setHeight();
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
      if (this.type == '1') {
        this.codxEpService
          .getBookingByRecID(changes.itemDetail?.currentValue?.recID)
          .subscribe((res) => {
            if (res) {
              this.itemDetail = res;
              this.refeshData(this.itemDetail);
              this.detectorRef.detectChanges();
            }
          });
        this.detectorRef.detectChanges();
      } else if (this.type == '2') {
        this.codxEpService
          .getApproveByRecID(changes.itemDetail?.currentValue?.recID)
          .subscribe((res) => {
            if (res) {
              this.itemDetail = res;
              this.refeshData(this.itemDetail);
              this.detectorRef.detectChanges();
            }
          });
        this.detectorRef.detectChanges();
      }
    }
    this.setHeight();
    this.active = 1;
  }
  refeshData(res: any) {
    this.listFilePermission = [];
    if (res?.bookingAttendees != null && res?.bookingAttendees != '') {
      let listAttendees = res.bookingAttendees.split(';');
      listAttendees.forEach((item) => {
        if (item != '') {
          let tmpPer = new Permission();
          tmpPer.objectID = item; //
          tmpPer.objectType = 'U';
          tmpPer.read = true;
          tmpPer.share = true;
          tmpPer.download = true;
          tmpPer.isActive = true;
          this.listFilePermission.push(tmpPer);
        }
      });
    }
    if (res?.listApprovers != null && res?.listApprovers.length > 0) {
      res.listApprovers.forEach((item) => {
        if (item != '') {
          let tmpPer = new Permission();
          tmpPer.objectID = item; //
          tmpPer.objectType = 'U';
          tmpPer.read = true;
          tmpPer.share = true;
          tmpPer.download = true;
          tmpPer.isActive = true;
          this.listFilePermission.push(tmpPer);
        }
      });
    }
    if (this.type == '1') {
      this.allowUploadFile = false;
      for (let u of res.bookingAttendees) {
        if (
          res?.createdBy == this.authService?.userValue?.userID ||
          this.authService?.userValue?.userID == u?.userID
        ) {
          this.allowUploadFile = true;
        }
      }
    }

    this.detectorRef.detectChanges();
  }
  childClickMF(event, data) {
    if (this.type == '1') {
      switch (event?.functionID) {
        case 'SYS02': //Xoa
          this.delete.emit(data);
          break;

        case 'SYS03': //Sua.
          this.setPopupTitle.emit(event?.text);
          this.edit.emit(data);
          break;

        case 'SYS04': //copy.
          this.setPopupTitle.emit(event?.text);
          this.copy.emit(data);
          break;

        case 'EP7T1101': //Gửi duyệt
          this.release.emit(data);
          break;
        case 'EP7T1102': //Hủy gửi duyệt
          this.cancel.emit(data);
          break;
      }
    } else if (this.type == '2') {
      let funcID = event?.functionID;
      switch (funcID) {
        case 'EPT40201': //Duyệt
          {
            this.approve.emit(data);
          }
          break;
        case 'EPT40202': //Từ chối
          {
            this.reject.emit(data);
          }
          break;
        case 'EPT40204': {
          //Phân công tài xế

          this.setPopupTitleOption.emit(event?.text);
          this.assignDriver.emit(data);
          break;
        }
        case 'EPT40206':
          {
            //alert('Thu hồi');
            this.undo.emit(data);
          }
          break;
      }
    }
  }

  changeDataMF(event, data: any) {
    if (this.type == '1') {
      if (event != null && data != null) {
        if (data.approveStatus == '1') {
          event.forEach((func) => {
            //Mới tạo
            if (
              // Hiện: sửa - xóa - chép - gửi duyệt -
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'SYS04' /*MF chép*/ ||
              func.functionID == 'EP7T1101' /*MF gửi duyệt*/
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: hủy
              func.functionID == 'EP7T1102' /*MF hủy*/
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == '5') {
          event.forEach((func) => {
            //Đã duyệt
            if (
              // Hiện: Chép
              func.functionID == 'SYS04' /*MF chép*/
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: sửa - xóa - duyệt - hủy
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'EP7T1101' /*MF gửi duyệt*/ ||
              func.functionID == 'EP7T1102' /*MF hủy*/
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == '3') {
          event.forEach((func) => {
            //Gửi duyệt
            if (
              //Hiện: chép - hủy
              func.functionID == 'SYS04' /*MF chép*/ ||
              func.functionID == 'EP7T1102' /*MF hủy*/
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: sửa - xóa - gửi duyệt

              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'EP7T1101' /*MF gửi duyệt*/
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == '4') {
          event.forEach((func) => {
            //Gửi duyệt
            if (
              //Hiện: chép
              func.functionID == 'SYS04' /*MF chép*/
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: sửa - xóa - gửi duyệt - hủy
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'EP7T1101' /*MF gửi duyệt*/ ||
              func.functionID == 'EP7T1102' /*MF hủy*/
            ) {
              func.disabled = true;
            }
          });
        } else {
          event.forEach((func) => {
            //Gửi duyệt
            if (
              //Hiện: chép
              func.functionID == 'EP7T1101' /*MF gửi duyệt*/ ||
              func.functionID == 'SYS02' /*MF sửa*/ ||
              func.functionID == 'SYS03' /*MF xóa*/ ||
              func.functionID == 'SYS04' /*MF chép*/
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: hủy
              func.functionID == 'EP7T1102' /*MF hủy*/
            ) {
              func.disabled = true;
            }
          });
        }
      }
    } else if (this.type == '2') {
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
            if (
              func.functionID == 'EPT40204' /*MF phân công tài xế*/ ||
              func.functionID == 'EPT40206' /*Thu hoi*/
            ) {
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
            if (func.functionID == 'EPT40204') {
              func.disabled = false;
            }
            if (func.functionID == 'EPT40204' /*MF phân công tài xế*/) {
              let havedDriver = false;
              if (data?.resources) {
                for (let i = 0; i < data?.resources.length; i++) {
                  if (data?.resources[i].roleType == '2') {
                    havedDriver = true;
                  }
                }
              }
              if (!havedDriver) {
                func.disabled = false;
              } else {
                func.disabled = true;
              }
            }
          });
        }
      }
    }
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
