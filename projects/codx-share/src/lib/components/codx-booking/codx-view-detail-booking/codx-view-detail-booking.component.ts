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
  AuthStore,
  CallFuncService,
  DialogRef,
  UIComponent,
  UIDetailComponent,
  Util,
  ViewsComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import moment from 'moment';
import { CodxShareService } from '../../../codx-share.service';
@Component({
  selector: 'codx-view-detail-booking',
  templateUrl: 'codx-view-detail-booking.component.html',
  styleUrls: ['codx-view-detail-booking.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxViewDetailBookingComponent
  extends UIDetailComponent
  implements OnChanges
{
  //Input
  data: any;

  @Input() resourceType = '1'; //1:Phòng; 2:Xe; 6:VPP;
  @Input() formModel;
  @Input() crrEntityName = EPCONST.ENTITY.R_Bookings;
  @Input() view: ViewsComponent;
  @Input() viewMode = '1';
  @Input() transRecID;

  //Output
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @Output('approve') approve: EventEmitter<any> = new EventEmitter();
  @Output('reject') reject: EventEmitter<any> = new EventEmitter();
  @Output('undo') undo: EventEmitter<any> = new EventEmitter();
  @Output('cardTrans') cardTrans: EventEmitter<any> = new EventEmitter();
  @Output('assignDriver') assignDriver: EventEmitter<any> = new EventEmitter();

  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  //@ViewChild('codxBooking') codxBooking: CodxBookingComponent;
  //MFunction Booking
  @Output('reloadData') reloadData: EventEmitter<any> = new EventEmitter();
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();
  @Output('release') release: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();
  @Output('invite') invite: EventEmitter<any> = new EventEmitter();
  @Output('cancel') cancel: EventEmitter<any> = new EventEmitter();
  @Output('allocate') allocate: EventEmitter<any> = new EventEmitter();
  @Output('setAllocateStatus') setAllocateStatus: EventEmitter<any> =
    new EventEmitter();
  @Output('reschedule') reschedule: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> =
    new EventEmitter();

  //MFunction Approve
  @Output('setPopupTitleOption') setPopupTitleOption: EventEmitter<any> =
    new EventEmitter();
  @ViewChild('reference') reference: TemplateRef<ElementRef>;

  firstLoad = true;
  id: string;
  active = 1;
  files = [];
  dialog!: DialogRef;
  routerRecID: any;
  listFilePermission = [];
  allowUploadFile = false;
  grView: any;
  loadedData: boolean;
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  curUser: any;
  runMode: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private codxShareService: CodxShareService,
    private callFuncService: CallFuncService,
    private authService: AuthService,
    private authStore: AuthStore
  ) {
    super(injector);
    this.funcID == this.funcID || this.view?.funcID;
    this.cache.functionList(this.funcID).subscribe((func) => {
      if (func) {
        this.runMode = func?.runMode;
        this.detectorRef.detectChanges();
      }
    });
    this.curUser = this.authStore.get();
    if (this.curUser == null) {
      this.curUser = this.authService?.userValue;
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.getCacheData();
    this.detectorRef.detectChanges();
    this.setHeight();
  }
  ngAfterViewInit(): void {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.recID) {
      this.getData(changes?.recID?.currentValue);
    }
    this.setHeight();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData() {
    this.funcID == this.funcID || this.view?.funcID;
    this.cache.functionList(this.funcID).subscribe((func) => {
      if (func) {
        this.runMode = func?.runMode;
        this.detectorRef.detectChanges();
      }
    });
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
          this.detectorRef.detectChanges();
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getData(recID) {
    this.recID = this.recID || recID;
    if (!this.recID) return;
    this.loadedData = false;
    if (this.runMode == '1') {
      this.codxEpService
        .getViewDetailBooking(this.recID, this.funcID)
        .subscribe((data) => {
          if (data) {
            this.data = data;
            this.refeshData(this.data);
            this.loadedData = true;
            this.detectorRef.detectChanges();
          }
        });
    } else {
      if (this.viewMode == '1') {
        this.codxEpService
          .getViewDetailBooking(this.recID, this.funcID)
          .subscribe((data) => {
            if (data) {
              this.data = data;
              this.refeshData(this.data);
              this.loadedData = true;
              this.detectorRef.detectChanges();
            }
          });
      } else if (this.viewMode == '2' && this.transRecID != null) {
        this.codxEpService
          .getApproveByRecID(this.transRecID)
          .subscribe((res) => {
            if (res) {
              this.data = res;
              this.refeshData(this.data);
              this.loadedData = true;
              this.detectorRef.detectChanges();
            }
          });
      }
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  childClickMF(event, data) {
    if (this.viewMode == '1') {
      switch (event?.functionID) {
        //System MF
        case EPCONST.MFUNCID.Delete:
          this.delete.emit(data);
          break;

        case EPCONST.MFUNCID.Edit:
          this.setPopupTitle.emit(event?.text);
          this.edit.emit(data);
          break;

        case EPCONST.MFUNCID.Copy:
          this.setPopupTitle.emit(event?.text);
          this.copy.emit(data);
          break;

        // Aproval Trans
        case EPCONST.MFUNCID.R_Release: //Gửi duyệt
        case EPCONST.MFUNCID.C_Release:
        case EPCONST.MFUNCID.S_Release:
          this.release.emit(data);
          break;
        case EPCONST.MFUNCID.R_Cancel: //Hủy gửi duyệt
        case EPCONST.MFUNCID.C_Cancel:
        case EPCONST.MFUNCID.S_Cancel:
          this.cancel.emit(data);
          break;

        //Room
        case EPCONST.MFUNCID.R_Reschedule: //Dời
          this.setPopupTitleOption.emit(event?.text);
          this.reschedule.emit(data);
          break;
        case EPCONST.MFUNCID.R_Invite: //Mời
          this.setPopupTitleOption.emit(event?.text);
          this.invite.emit(data);
          break;

        //Car

        //Stationery
        case EPCONST.MFUNCID.S_Allocate:
          this.setAllocateStatus.emit(EPCONST.A_STATUS.Approved);
          this.allocate.emit(data);
          break;
        case EPCONST.MFUNCID.S_Allocate:
          this.setAllocateStatus.emit(EPCONST.A_STATUS.Rejected);
          this.allocate.emit(data);
          break;
          default:
        //Biến động , tự custom
        var customData =
        {
          refID : "",
          refType : this.formModel?.entityName,
          dataSource: data,
        }

        this.codxShareService.defaultMoreFunc(
          event,
          data,
          null,
          this.formModel,
          this.view.dataService,
          this,
          customData
        );
        break;
      }
    } else if (this.viewMode == '2') {
      let mfuncID = event?.functionID;
      switch (mfuncID) {
        case EPCONST.MFUNCID.R_Approval:
        case EPCONST.MFUNCID.C_Approval:
        case EPCONST.MFUNCID.S_Approval:
          {
            this.approve.emit(data);
          }
          break;
        case EPCONST.MFUNCID.R_Reject:
        case EPCONST.MFUNCID.C_Reject:
        case EPCONST.MFUNCID.S_Reject:
          {
            this.reject.emit(data);
          }
          break;
        case EPCONST.MFUNCID.R_Undo:
        case EPCONST.MFUNCID.C_Undo:
        case EPCONST.MFUNCID.S_Undo:
          {
            this.undo.emit(data);
          }
          break;

        //Car
        case EPCONST.MFUNCID.C_CardTrans:
          this.setPopupTitleOption.emit(event?.text);
          this.cardTrans.emit(data);
          break;
        case EPCONST.MFUNCID.C_DriverAssign:
          this.setPopupTitleOption.emit(event?.text);
          this.assignDriver.emit(data);
          break;
      }
    }
  }
  changeDataMF(event, data: any) {
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } else {
      if (this.viewMode == '1') {
        if (
          event != null &&
          data != null &&
          this.crrEntityName != EPCONST.ENTITY.S_Distribution
        ) {
          if (data.approveStatus == EPCONST.A_STATUS.New) {
            //Mới tạo
            event.forEach((func) => {
              if (
                // Hiện: sửa - xóa - chép - gửi duyệt -
                func.functionID == EPCONST.MFUNCID.Delete ||
                func.functionID == EPCONST.MFUNCID.Edit ||
                func.functionID == EPCONST.MFUNCID.Copy ||
                func.functionID == EPCONST.MFUNCID.R_Release ||
                func.functionID == EPCONST.MFUNCID.C_Release ||
                func.functionID == EPCONST.MFUNCID.S_Release
              ) {
                func.disabled = false;
              }
              if (
                //Ẩn: dời - mời - hủy
                func.functionID == EPCONST.MFUNCID.R_Cancel ||
                func.functionID == EPCONST.MFUNCID.C_Cancel ||
                func.functionID == EPCONST.MFUNCID.S_Cancel ||
                func.functionID == EPCONST.MFUNCID.R_Invite ||
                func.functionID == EPCONST.MFUNCID.R_Reschedule
              ) {
                func.disabled = true;
              }
            });
          } else if (data.approveStatus == EPCONST.A_STATUS.Released) {
            //Gửi duyệt
            event.forEach((func) => {
              if (
                //Hiện: dời - mời - chép - hủy
                func.functionID == EPCONST.MFUNCID.Copy ||
                func.functionID == EPCONST.MFUNCID.R_Cancel ||
                func.functionID == EPCONST.MFUNCID.C_Cancel ||
                func.functionID == EPCONST.MFUNCID.S_Cancel ||
                func.functionID == EPCONST.MFUNCID.R_Invite ||
                func.functionID == EPCONST.MFUNCID.R_Reschedule
              ) {
                func.disabled = false;
              }
              if (
                //Ẩn: sửa - xóa - gửi duyệt

                func.functionID == EPCONST.MFUNCID.Delete ||
                func.functionID == EPCONST.MFUNCID.Edit ||
                func.functionID == EPCONST.MFUNCID.R_Release ||
                func.functionID == EPCONST.MFUNCID.C_Release ||
                func.functionID == EPCONST.MFUNCID.S_Release
              ) {
                func.disabled = true;
              }
            });
          } else if (data.approveStatus == EPCONST.A_STATUS.Rejected) {
            //Từ chối
            event.forEach((func) => {
              if (
                //Hiện: chép
                func.functionID == EPCONST.MFUNCID.Copy
              ) {
                func.disabled = false;
              }
              if (
                //Ẩn: còn lại
                func.functionID == EPCONST.MFUNCID.Edit ||
                func.functionID == EPCONST.MFUNCID.Delete ||
                func.functionID == EPCONST.MFUNCID.R_Cancel ||
                func.functionID == EPCONST.MFUNCID.C_Cancel ||
                func.functionID == EPCONST.MFUNCID.S_Cancel ||
                func.functionID == EPCONST.MFUNCID.R_Release ||
                func.functionID == EPCONST.MFUNCID.C_Release ||
                func.functionID == EPCONST.MFUNCID.S_Release ||
                func.functionID == EPCONST.MFUNCID.R_Invite ||
                func.functionID == EPCONST.MFUNCID.R_Reschedule
              ) {
                func.disabled = true;
              }
            });
          } else if (data?.approveStatus == EPCONST.A_STATUS.Approved) {
            //Đã duyệt
            event.forEach((func) => {
              if (
                // Hiện: Mời - dời - Chép
                func.functionID == EPCONST.MFUNCID.Copy ||
                func.functionID == EPCONST.MFUNCID.R_Invite ||
                func.functionID == EPCONST.MFUNCID.R_Reschedule ||
                func.functionID == EPCONST.MFUNCID.R_Cancel ||
                func.functionID == EPCONST.MFUNCID.C_Cancel ||
                func.functionID == EPCONST.MFUNCID.S_Cancel
              ) {
                func.disabled = false;
              }
              if (
                //Ẩn: sửa - xóa - duyệt - hủy
                func.functionID == EPCONST.MFUNCID.Delete ||
                func.functionID == EPCONST.MFUNCID.Edit ||
                func.functionID == EPCONST.MFUNCID.R_Release ||
                func.functionID == EPCONST.MFUNCID.C_Release ||
                func.functionID == EPCONST.MFUNCID.S_Release
              ) {
                func.disabled = true;
              }
            });
          } else {
            event.forEach((func) => {
              if (
                //Hiện: chép
                func.functionID == EPCONST.MFUNCID.Copy ||
                func.functionID == EPCONST.MFUNCID.Delete ||
                func.functionID == EPCONST.MFUNCID.Edit ||
                func.functionID == EPCONST.MFUNCID.R_Release ||
                func.functionID == EPCONST.MFUNCID.C_Release ||
                func.functionID == EPCONST.MFUNCID.S_Release
              ) {
                func.disabled = false;
              }
              if (
                //Ẩn: còn lại
                func.functionID == EPCONST.MFUNCID.R_Cancel ||
                func.functionID == EPCONST.MFUNCID.C_Cancel ||
                func.functionID == EPCONST.MFUNCID.S_Cancel ||
                func.functionID == EPCONST.MFUNCID.R_Invite ||
                func.functionID == EPCONST.MFUNCID.R_Reschedule
              ) {
                func.disabled = true;
              }
            });
          }
        } else if (
          event != null &&
          data != null &&
          this.crrEntityName == EPCONST.ENTITY.S_Distribution
        ) {
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.Copy
            ) {
              func.disabled = true;
            }
            if (
              data?.issueStatus == '1' &&
              data?.approveStatus == '5' &&
              (func.functionID == EPCONST.MFUNCID.S_Allocate ||
                func.functionID == EPCONST.MFUNCID.S_UnAllocate)
            ) {
              func.disabled = false;
            } else if (
              (data?.issueStatus != '1' || data?.approveStatus != '5') &&
              (func.functionID == EPCONST.MFUNCID.S_Allocate ||
                func.functionID == EPCONST.MFUNCID.S_UnAllocate)
            ) {
              func.disabled = true;
            }
          });
        }
      } else if (this.viewMode == '2') {
        event.forEach((func) => {
          if (
            func.functionID == EPCONST.MFUNCID.Copy ||
            func.functionID == EPCONST.MFUNCID.C_CardTrans ||
            func.functionID == EPCONST.MFUNCID.C_DriverAssign
          ) {
            func.disabled = true;
          }
        });
        if (data.approveStatus == '3') {
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject
            ) {
              func.disabled = false;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo ||
              func.functionID == EPCONST.MFUNCID.C_DriverAssign
            ) {
              func.disabled = true;
            }
          });
        } else if (data.approveStatus == '4') {
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = false;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject ||
              func.functionID == EPCONST.MFUNCID.C_DriverAssign
            ) {
              func.disabled = true;
            }
          });
        } else if (data?.approveStatus == '5' && data?.stepType != 'I') {
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject
            ) {
              func.disabled = true;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = false;
            }
            if (func.functionID == EPCONST.MFUNCID.C_DriverAssign) {
              if (data?.resources) {
                let driver = Array.from(data?.resources).filter((item: any) => {
                  return item.roleType == '2';
                });
                if (
                  (driver != null && driver.length > 0) ||
                  data?.driverName != null
                ) {
                  func.disabled = true;
                } else {
                  func.disabled = false;
                }
              }
            }
          });
        }
        // Xử lí cấp phát VPP là bước duyệt cuối (stepType=='I')
        else if (
          data?.approveStatus == '5' &&
          data?.stepType == 'I' &&
          data?.issueStatus == '1'
        ) {
          //Chưa cấp phát
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject
            ) {
              func.disabled = false;
            }
            if (
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = true;
            }
          });
        } else if (
          (data?.stepType == 'I' &&
            data?.approveStatus == '5' &&
            data?.issueStatus != '1') ||
          data?.approveStatus == '4'
        ) {
          //Đã cấp phát
          event.forEach((func) => {
            if (
              func.functionID == EPCONST.MFUNCID.R_Approval ||
              func.functionID == EPCONST.MFUNCID.C_Approval ||
              func.functionID == EPCONST.MFUNCID.S_Approval ||
              func.functionID == EPCONST.MFUNCID.R_Reject ||
              func.functionID == EPCONST.MFUNCID.C_Reject ||
              func.functionID == EPCONST.MFUNCID.S_Reject ||
              func.functionID == EPCONST.MFUNCID.R_Undo ||
              func.functionID == EPCONST.MFUNCID.C_Undo ||
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = true;
            }
          });
        }
      }
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  refeshData(res: any) {
    this.listFilePermission = [];
    if (this.resourceType == '6') {
      let tmpPer = new Permission();
      tmpPer.objectID = this.data.createdBy;
      tmpPer.objectType = 'U';
      tmpPer.read = true;
      tmpPer.share = true;
      tmpPer.download = true;
      tmpPer.isActive = true;
      this.listFilePermission.push(tmpPer);
    } else {
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
    if (this.viewMode == '1') {
      this.allowUploadFile = false;
      if (this.resourceType == '6') {
        if (this.data?.createdBy == this.authService.userValue.userID) {
          this.allowUploadFile = true;
        }
      } else {
        for (let u of res.resources) {
          if (
            res?.createdBy == this.authService?.userValue?.userID ||
            this.authService?.userValue?.userID == u?.userID
          ) {
            this.allowUploadFile = true;
          }
        }
      }
    }

    this.detectorRef.detectChanges();
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//
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

  meetingNow() {
    if (this.data?.onlineUrl != null) {
      let url =
        this.curUser?.userID == this.data?.createdBy ||
        this.curUser?.userID == this.data?.owner
          ? this.data?.onlineUrl2
          : this.data?.onlineUrl;
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
      )[0].style.height = main - header - 65 + 'px';
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
