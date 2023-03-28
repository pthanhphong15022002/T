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
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthService,
  CallFuncService,
  DialogRef,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
import { BookingRoomComponent } from '../booking/booking-room.component';
import { CodxEpService } from '../../codx-ep.service';
@Component({
  selector: 'booking-room-view-detail',
  templateUrl: 'booking-room-view-detail.component.html',
  styleUrls: ['booking-room-view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BookingRoomViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;
  @ViewChild('attachment') tabModel;
  @ViewChild('bookingRoom') bookingRoom: BookingRoomComponent;
  //MFunction Booking
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();
  @Output('release') release: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();
  @Output('invite') invite: EventEmitter<any> = new EventEmitter();
  @Output('cancel') cancel: EventEmitter<any> = new EventEmitter();
  @Output('reschedule') reschedule: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> =
    new EventEmitter();

  //MFunction Approve
  @Output('setPopupTitleOption') setPopupTitleOption: EventEmitter<any> =
    new EventEmitter();
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @Output('approve') approve: EventEmitter<any> = new EventEmitter();
  @Output('reject') reject: EventEmitter<any> = new EventEmitter();
  @Output('undo') undo: EventEmitter<any> = new EventEmitter();
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() type;
  @Input() formModel;
  @Input() data: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  tabControl: TabModel[] = [];
  firstLoad = true;
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;
  files = [];
  dialog!: DialogRef;
  routerRecID: any;
  listFilePermission = [];
  allowUploadFile = false;
  renderFooter = false;
  grView: any;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
    private authService: AuthService
  ) {
    super(injector);
    this.routerRecID = this.router.snapshot.params['id'];
    if (this.routerRecID != null) {
      this.hideFooter = true;
    }
    if (this.type == null) {
      this.type = '1';
    }
  }

  onInit(): void {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
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
      this.renderFooter = false;
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
      for (let u of res.resources) {
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
  showHour(date: any) {
    let temp = new Date(date);
    let time =
      ('0' + temp.getHours()).toString().slice(-2) +
      ':' +
      ('0' + temp.getMinutes()).toString().slice(-2);
    return time;
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
        case 'EP4T1101': //Dời
          this.setPopupTitleOption.emit(event?.text);
          this.reschedule.emit(data);
          break;
        case 'EP4T1102': //Mời
          this.setPopupTitleOption.emit(event?.text);
          this.invite.emit(data);
          break;
        case 'EP4T1103': //Gửi duyệt
          this.release.emit(data);
          break;
        case 'EP4T1104': //Hủy gửi duyệt
          this.cancel.emit(data);
          break;
      }
    } else if (this.type == '2') {
      let funcID = event?.functionID;
      switch (funcID) {
        case 'EPT40101':
          {
            //alert('Duyệt');
            this.approve.emit(data);
          }
          break;
        case 'EPT40105':
          {
            //alert('Từ chối');
            this.reject.emit(data);
          }
          break;
        case 'EPT40106':
          {
            //alert('Thu hồi');
            this.undo.emit(data);
          }
          break;
      }
    }
  }
  // lviewRelease(data?) {
  //   if (data) {
  //     this.release.emit(data);
  //   }
  // }

  // lviewReschedule(data?, mfuncName?) {
  //   if (data) {
  //     this.setPopupTitleOption.emit(mfuncName);
  //     this.reschedule.emit(data);
  //   }
  // }

  // lviewInvite(data?, mfuncName?) {
  //   if (data) {
  //     this.setPopupTitleOption.emit(mfuncName);
  //     this.invite.emit(data);
  //   }
  // }

  // lviewCancel(data?) {
  //   if (data) {
  //     this.cancel.emit(data);
  //   }
  // }

  // lviewEdit(data?, mfuncName?) {
  //   if (data) {
  //     this.setPopupTitle.emit(mfuncName);
  //     this.edit.emit(data);
  //   }
  // }

  // lviewDelete(data?) {
  //   if (data) {
  //     this.delete.emit(data);
  //   }
  // }
  // lviewCopy(data?, mfuncName?) {
  //   if (data) {
  //     this.setPopupTitle.emit(mfuncName);
  //     this.copy.emit(data);
  //   }
  // }
  changeDataMF(event, data: any) {
    if (this.type == '1') {
      if (event != null && data != null) {
      }
      if (data.approveStatus == '1') {
        event.forEach((func) => {
          //Mới tạo
          if (
            // Hiện: sửa - xóa - chép - gửi duyệt -
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: dời - mời - hủy
            func.functionID == 'EP4T1102' /*MF sửa*/ ||
            func.functionID == 'EP4T1101' /*MF xóa*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '5') {
        event.forEach((func) => {
          //Đã duyệt
          if (
            // Hiện: Mời - dời - Chép
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - duyệt - hủy
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '3') {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: dời - mời - chép - hủy
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS04' /*MF chép*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: sửa - xóa - gửi duyệt

            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
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
            //Ẩn: còn lại
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else {
        event.forEach((func) => {
          //Gửi duyệt
          if (
            //Hiện: chép
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/ ||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (
            //Ẩn: còn lại
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      }
    } else if (this.type == '2') {
      if (event != null && data != null) {
        event.forEach((func) => {
          if (func.functionID == 'SYS04' /*Copy*/) {
            func.disabled = true;
          }
        });
        if (data.approveStatus == '3') {
          event.forEach((func) => {
            if (
              func.functionID == 'EPT40101' /*MF Duyệt*/ ||
              func.functionID == 'EPT40105' /*MF từ chối*/
            ) {
              func.disabled = false;
            }
            if (func.functionID == 'EPT40106' /*MF Thu Hồi*/) {
              func.disabled = true;
            }
          });
        } else {
          event.forEach((func) => {
            if (
              func.functionID == 'EPT40101' /*MF Duyệt*/ ||
              func.functionID == 'EPT40105' /*MF từ chối*/
            ) {
              func.disabled = true;
            }
            if (func.functionID == 'EPT40106' /*MF Thu Hồi*/) {
              func.disabled = false;
            }
          });
        }
      }
    }
  }

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  clickChangeItemViewStatus(stt, recID) {
    this.itemDetailStt = stt;
  }
  meetingNow(url: string) {
    if (url != null) {
      window.open(url, '_blank');
    }
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
