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
import { AuthService, CallFuncService, DataRequest, DialogRef, SidebarModel, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';
import { BookingRoomComponent } from '../booking-room.component';
import { PopupAddBookingRoomComponent } from '../popup-add-booking-room/popup-add-booking-room.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { Permission } from '@shared/models/file.model';
@Component({
  selector: 'booking-room-view-detail',
  templateUrl: 'booking-room-view-detail.component.html',
  styleUrls: ['booking-room-view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BookingRoomViewDetailComponent extends UIComponent implements OnChanges {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;  
  @ViewChild('attachment') tabModel;
  @ViewChild('bookingRoom') bookingRoom: BookingRoomComponent;
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();
  @Output('release') release: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();  
  @Output('invite') invite: EventEmitter<any> = new EventEmitter(); 
  @Output('cancel') cancel: EventEmitter<any> = new EventEmitter();
  @Output('reschedule') reschedule: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> = new EventEmitter();
  
  @Output('setPopupTitleOption') setPopupTitleOption: EventEmitter<any> = new EventEmitter();
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() data: any;
  @Input() override view: ViewsComponent;
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
  listFilePermission= [];
  isEdit= false;
renderFooter=false;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
    private authService: AuthService,
  ) {
    super(injector);
    this.routerRecID = this.router.snapshot.params['id'];
    if (this.routerRecID != null) {
      this.hideFooter = true
    }
  }

  onInit(): void {
    this.itemDetailStt = 1;
    let tempRecID: any;
    if (this.routerRecID != null) {
      tempRecID = this.routerRecID;
    }
    else {
      tempRecID = this.itemDetail?.currentValue?.recID
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
      this.renderFooter=false;
      this.api
        .exec<any>('EP', 'BookingsBusiness', 'GetBookingByIDAsync', [
          changes.itemDetail?.currentValue?.recID,
        ])
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            debugger;
            this.listFilePermission=[];
            if(res.bookingAttendees!=null && res.bookingAttendees!=''){
              let listAttendees = res.bookingAttendees.split(";");
              listAttendees.forEach((item) => {
                if(item!=''){
                  let tmpPer= new Permission()
                  tmpPer.objectID= item;//
                  tmpPer.objectType= 'U';
                  tmpPer.read= true;
                  tmpPer.share=  true;
                  tmpPer.download=  true;
                  tmpPer.isActive=  true;
                  this.listFilePermission.push(tmpPer);
                }
                
              });
              //this.tabModel.addPermissions=this.listFilePermission;
              this.renderFooter=true;
              this.detectorRef.detectChanges();

            }
            if(this.itemDetail?.createdBy==this.authService.userValue.userID){

              this.isEdit = true;
            }
            this.detectorRef.detectChanges();

          }
        });
      // this.files = [];
      // this.api.execSv(
      //   'DM',
      //   'ERM.Business.DM',
      //   'FileBussiness',
      //   'GetFilesForOutsideAsync',
      //   [this.funcID, this.itemDetail.recID, 'EP_BookingRooms']
      // ).subscribe((res: []) => {
      //   if (res) {
      //     this.files = res;
      //   }
      // });
      //this.itemDetail = changes.itemDetail.currentValue;
      this.detectorRef.detectChanges();
    }
    this.setHeight();
    this.active = 1;
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
    switch (event?.functionID) {
      case 'SYS02': //Xoa
        this.lviewDelete(data);
        break;

      case 'SYS03': //Sua.
        this.lviewEdit(data, event.text);
        break;

      case 'SYS04': //copy.
        this.lviewCopy(data, event.text);
        break;
      case 'EP4T1101': //Dời
        this.lviewReschedule(data, event?.text);
        break;
      case 'EP4T1102': //Mời
        this.lviewInvite(data, event?.text);
        break;
      case 'EP4T1103': //Gửi duyệt
        this.lviewRelease(data);
        break;
        case 'EP4T1104': //Hủy gửi duyệt
        this.lviewCancel(data);
        break;
    }
  }
  lviewRelease(data?) {
    if (data) {      
      this.release.emit(data);
    }
  }

  lviewReschedule(data?, mfuncName?) {
    if (data) {
      this.setPopupTitleOption.emit(mfuncName);
      this.reschedule.emit(data);
    }
  }

  lviewInvite(data?, mfuncName?) {
    if (data) {
      this.setPopupTitleOption.emit(mfuncName);
      this.invite.emit(data);
    }
  }

  lviewCancel(data?) {
    if (data) {      
      this.cancel.emit(data);
    }
  }

  lviewEdit(data?, mfuncName?) {
    if (data) {
      this.setPopupTitle.emit(mfuncName);
      this.edit.emit(data);
    }
  }
  
  lviewDelete(data?) {
    if (data) {
      this.delete.emit(data);
    }
  }
  lviewCopy(data?, mfuncName?) {
    if (data) {
      this.setPopupTitle.emit(mfuncName);
      this.copy.emit(data);
    }
  }
  changeDataMF(event, data: any) {
    if (event != null && data != null) {
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
          if (//Ẩn: sửa - xóa - duyệt - hủy 
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '3') {
        event.forEach((func) => {
          //Gửi duyệt
          if ( //Hiện: dời - mời - chép - hủy
          func.functionID == 'EP4T1102' /*MF mời*/ ||
          func.functionID == 'EP4T1101' /*MF dời*/ ||
          func.functionID == 'SYS04' /*MF chép*/||
          func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = false;
          }
          if (//Ẩn: sửa - xóa - gửi duyệt
            
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = true;
          }
        });
      }
      else if (data.approveStatus == '4') {
        event.forEach((func) => {
          //Gửi duyệt
          if ( //Hiện: chép
          func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (//Ẩn: còn lại            
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      }
      else  {
        event.forEach((func) => {
          //Gửi duyệt
          if ( //Hiện: chép
          func.functionID == 'EP4T1103' /*MF gửi duyệt*/||
          func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (//Ẩn: còn lại            
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1104' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      }
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
