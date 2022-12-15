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
import { CallFuncService, DataRequest, DialogRef, SidebarModel, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';
import { BookingRoomComponent } from '../booking-room.component';
import { PopupAddBookingRoomComponent } from '../popup-add-booking-room/popup-add-booking-room.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
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
  @ViewChild('bookingRoom') bookingRoom: BookingRoomComponent;
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();
  @Output('release') release: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();  
  @Output('invite') invite: EventEmitter<any> = new EventEmitter();
  @Output('reschedule') reschedule: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> = new EventEmitter();
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

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
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
      this.api
        .exec<any>('EP', 'BookingsBusiness', 'GetBookingByIDAsync', [
          changes.itemDetail?.currentValue?.recID,
        ])
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.detectorRef.detectChanges();
          }
        });
      this.files = [];
      this.api.execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesForOutsideAsync',
        [this.funcID, this.itemDetail.recID, 'EP_BookingRooms']
      ).subscribe((res: []) => {
        if (res) {
          this.files = res;
        }
      });
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
    }
  }
  lviewRelease(data?) {
    if (data) {      
      this.release.emit(data);
    }
  }

  lviewReschedule(data?, mfuncName?) {
    if (data) {
      this.setPopupTitle.emit(mfuncName);
      this.edit.emit(data);
    }
  }

  lviewInvite(data?, mfuncName?) {
    if (data) {
      this.setPopupTitle.emit(mfuncName);
      this.edit.emit(data);
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
      // event.forEach((func) => {
      //   func.disabled = true;
      // });
      if (data.approveStatus == '1') {
        event.forEach((func) => {
          if (
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/||            
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = false;
          } 

          if (            
            func.functionID == 'EP4T1102' /*MF sửa*/ ||
            func.functionID == 'EP4T1101' /*MF xóa*/ 
          ) {
            func.disabled = true;
          }

        });
      } else if(data.approveStatus == '5' || data.approveStatus == '3'){
        event.forEach((func) => {
          if (
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/
          ) {
            func.disabled = true;
          }
          if (            
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
        });
      } else{
        event.forEach((func) => {
          if (func.functionID == 'SYS04' /*MF chép*/) {
            func.disabled = false;
          }
          if (                
            func.functionID == 'EP4T1103' /*MF gửi duyệt*/||
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP4T1102' /*MF mời*/ ||
            func.functionID == 'EP4T1101' /*MF dời*/ 
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
