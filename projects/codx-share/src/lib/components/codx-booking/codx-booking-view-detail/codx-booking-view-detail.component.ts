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
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';
import { EPCONST } from 'projects/codx-ep/src/lib/codx-ep.constant';
import moment from 'moment';
//import { CodxBookingComponent } from '../codx-booking.component';
@Component({
  selector: 'codx-booking-view-detail',
  templateUrl: 'codx-booking-view-detail.component.html',
  styleUrls: ['codx-booking-view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxBookingViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  //Input
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() viewMode = '1'; //1:Đặt; 2:Duyệt
  @Input() resourceType = '1'; //1:Phòng; 2:Xe; 6:VPP;
  @Input() formModel;
  @Input() data: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;

  //Output
  @Output('updateStatus') updateStatus: EventEmitter<any> = new EventEmitter();
  @Output('approve') approve: EventEmitter<any> = new EventEmitter();
  @Output('reject') reject: EventEmitter<any> = new EventEmitter();
  @Output('undo') undo: EventEmitter<any> = new EventEmitter();

  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;
  @ViewChild('attachment') tabModel;
  //@ViewChild('codxBooking') codxBooking: CodxBookingComponent;
  //MFunction Booking
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();
  @Output('release') release: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();
  @Output('invite') invite: EventEmitter<any> = new EventEmitter();
  @Output('cancel') cancel: EventEmitter<any> = new EventEmitter();
  @Output('allocate') allocate: EventEmitter<any> = new EventEmitter();
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
  loadedData:boolean;
  tabControl: TabModel[]= [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
    private authService: AuthService
  ) {
    super(injector);
    // this.routerRecID = this.router.snapshot.params['id'];
    // if (this.routerRecID != null) {
    //   //this.hideFooter = true;
    // }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onInit(): void {
    this.cache
      .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
      .subscribe((grv) => {
        if (grv) {
          this.grView = Util.camelizekeyObj(grv);
        }
      });
    // let tempRecID: any;
    // if (this.routerRecID != null) {
    //   tempRecID = this.routerRecID;
    // } else {
    //   tempRecID = this.itemDetail?.currentValue?.recID;
    // }
    this.detectorRef.detectChanges();
    this.setHeight();
  }
  ngAfterViewInit(): void {
    
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.itemDetail) {
      this.loadedData=false;
      if (this.viewMode == '1') {
        this.codxEpService
          .getBookingByRecID(changes.itemDetail?.currentValue?.recID)
          .subscribe((res) => {
            if (res) {
              this.itemDetail = res;
              this.refeshData(this.itemDetail);
              this.loadedData=true;
              this.detectorRef.detectChanges();
            }
          });
        this.detectorRef.detectChanges();
      } else if (this.viewMode == '2') {
        this.codxEpService
          .getApproveByRecID(
            changes.itemDetail?.currentValue?.approvalTransRecID
          )
          .subscribe((res) => {
            if (res) {
              this.itemDetail = res;
              this.refeshData(this.itemDetail);
              this.loadedData=true;
              this.detectorRef.detectChanges();
            }
          });
        this.detectorRef.detectChanges();
      }
    }
    this.setHeight();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  // getCacheData(){

  // }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//

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
          this.allocate.emit(data);
          break;
      }
    } else if (this.viewMode == '2') {
      let funcID = event?.functionID;
      switch (funcID) {
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
      }
    }
  }
  changeDataMF(event, data: any) {
    if (this.viewMode == '1') {
      if (event != null && data != null && this.funcID!=EPCONST.FUNCID.S_Allocate) {
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
        } else if (data.approveStatus == EPCONST.A_STATUS.Approved) {
          //Đã duyệt
          event.forEach((func) => {
            if (
              // Hiện: Mời - dời - Chép
              func.functionID == EPCONST.MFUNCID.Copy ||
              func.functionID == EPCONST.MFUNCID.R_Invite ||
              func.functionID == EPCONST.MFUNCID.R_Reschedule
            ) {
              func.disabled = false;
            }
            if (
              //Ẩn: sửa - xóa - duyệt - hủy
              func.functionID == EPCONST.MFUNCID.Delete ||
              func.functionID == EPCONST.MFUNCID.Edit ||
              func.functionID == EPCONST.MFUNCID.R_Release ||
              func.functionID == EPCONST.MFUNCID.C_Release ||
              func.functionID == EPCONST.MFUNCID.S_Release ||
              func.functionID == EPCONST.MFUNCID.R_Cancel ||
              func.functionID == EPCONST.MFUNCID.C_Cancel ||
              func.functionID == EPCONST.MFUNCID.S_Cancel
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
      }
      else if(event != null && data != null && this.funcID==EPCONST.FUNCID.S_Allocate){
        event.forEach((func) => {
          if (
            func.functionID == EPCONST.MFUNCID.Delete ||
            func.functionID == EPCONST.MFUNCID.Edit ||
            func.functionID == EPCONST.MFUNCID.Copy 
          ) {
            func.disabled = true;
          }
        });
      
      if (data?.issueStatus =='3') {
        event.forEach((func) => {
          if (func.functionID == EPCONST.MFUNCID.S_Allocate /*MF cấp phát*/) {
            func.disabled = true;
          }
        });
      }
    }
    } else if (this.viewMode == '2') {
      if (event != null && data != null) {
        event.forEach((func) => {
          if (func.functionID == EPCONST.MFUNCID.Copy) {
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
              func.functionID == EPCONST.MFUNCID.S_Undo
            ) {
              func.disabled = true;
            }
          });
        } else {
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
      tmpPer.objectID = this.itemDetail.createdBy;
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
        if (this.itemDetail?.createdBy == this.authService.userValue.userID) {
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

  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
}
