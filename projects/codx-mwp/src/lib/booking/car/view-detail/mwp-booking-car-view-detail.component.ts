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
import { editAlert } from '@syncfusion/ej2-angular-spreadsheet';
import { DataRequest, UIComponent, ViewsComponent } from 'codx-core';
import moment from 'moment';
import { BookingService } from '../../../services/booking.services';

@Component({
  selector: 'mwp-booking-car-view-detail',
  templateUrl: 'mwp-booking-car-view-detail.component.html',
  styleUrls: ['mwp-booking-car-view-detail.component.scss'],
})
export class MWPBookingCarViewDetailComponent extends UIComponent implements OnChanges {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;  
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();  
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();  
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> = new EventEmitter();
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
  routerRecID:any;
  recID:any;
  tabControl: { name: string; textDefault: string; isActive: boolean; }[];
  constructor(
    private injector: Injector,
    private codxEpService: BookingService,
  ) {
    super(injector);    
    this.routerRecID = this.router.snapshot.params['id'];
    if(this.routerRecID!=null){
      this.hideFooter=true;
    }
  }

  onInit(): void {
    this.itemDetailStt = 1;
    let tempRecID:any;
    if(this.routerRecID!=null){
      tempRecID=this.routerRecID;
    }
    else{
      tempRecID=this.itemDetail?.currentValue?.recID
    }
    this.api
        .exec<any>('EP', 'BookingsBusiness', 'GetBookingByIDAsync', [
          tempRecID,
        ])
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.detectorRef.detectChanges();
          }
        });
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
      this.detectorRef.detectChanges();
    }
    this.setHeight();
    this.active = 1;
  }

  childClickMF(event, data) {   
    switch (event?.functionID) {
      case 'SYS02': //Xoa
        this.lviewDelete(data);
        break;

      case 'SYS03': //Sua.
        this.lviewEdit(data,event.text);
        break;
      case 'SYS04': //copy.
        this.lviewCopy(data,event.text);
        break;
    }
  }
  lviewEdit(data?,mfuncName?) {
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
  lviewCopy(data?,mfuncName?) {
    if (data) {      
      this.setPopupTitle.emit(mfuncName); 
      this.copy.emit(data);
    }
  }
  changeDataMF(event, data: any) {
    if (event != null && data != null) {
      // event.forEach(func => {
      //   func.disabled=true;
      // });
      if (data.approveStatus == '1') {
        event.forEach((func) => {
          if (
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
        });
      } else {
        event.forEach((func) => {
          if (func.functionID == 'SYS04' /*MF chép*/) {
            func.disabled = false;
          }
          if (
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ 
          ) {
            func.disabled = true;
          }
        });
      }
    }
  }
  sameDayCheck(sDate:any, eDate:any){
    return moment(new Date(sDate)).isSame(new Date(eDate),'day');
  }
  showHour(date:any){
    let temp= new Date(date);
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
