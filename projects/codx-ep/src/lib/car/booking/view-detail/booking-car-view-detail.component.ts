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
import { CodxEpService } from '../../../codx-ep.service';import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'booking-car-view-detail',
  templateUrl: 'booking-car-view-detail.component.html',
  styleUrls: ['booking-car-view-detail.component.scss'],
})
export class BookingCarViewDetailComponent extends UIComponent implements OnChanges {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;  
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();  
  @Output('release') release: EventEmitter<any> = new EventEmitter();  
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();  
  @Output('cancel') cancel: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> = new EventEmitter();
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() data: any;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  firstLoad = true;
  
  tabControl: TabModel[] = [];
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;  
  routerRecID:any;
  recID:any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService
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
      case 'EP7T1101': //Gửi duyệt
        this.lviewRelease(data);
        break;
        case 'EP7T1102': //Hủy gửi duyệt
        this.lviewCancel(data);
        break;
    }
  }
  lviewCancel(data?) {
    if (data) {      
      this.cancel.emit(data);
    }
  }
  lviewRelease(data?) {
    if (data) {      
      this.release.emit(data);
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
          if (//Ẩn: sửa - xóa - duyệt - hủy 
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/||
            func.functionID == 'EP7T1102' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      } else if (data.approveStatus == '3') {
        event.forEach((func) => {
          //Gửi duyệt
          if ( //Hiện: chép - hủy
          func.functionID == 'SYS04' /*MF chép*/||
          func.functionID == 'EP7T1102' /*MF hủy*/
          ) {
            func.disabled = false;
          }
          if (//Ẩn: sửa - xóa - gửi duyệt
            
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/
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
          if (//Ẩn: sửa - xóa - gửi duyệt - hủy          
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/||
            func.functionID == 'EP7T1102' /*MF hủy*/
          ) {
            func.disabled = true;
          }
        });
      }
      else {
        event.forEach((func) => {
          //Gửi duyệt
          if ( //Hiện: chép 
          func.functionID == 'SYS04' /*MF chép*/
          ) {
            func.disabled = false;
          }
          if (//Ẩn: sửa - xóa - gửi duyệt - hủy          
            func.functionID == 'SYS02' /*MF sửa*/ ||
            func.functionID == 'SYS03' /*MF xóa*/ ||
            func.functionID == 'EP7T1101' /*MF gửi duyệt*/||
            func.functionID == 'EP7T1102' /*MF hủy*/
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
