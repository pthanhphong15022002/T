import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CallFuncService, DataRequest, DialogRef, SidebarModel, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';
import { BookingRoomComponent } from '../booking-room.component';
import { PopupAddBookingRoomComponent } from '../popup-add-booking-room/popup-add-booking-room.component';

@Component({
  selector: 'booking-room-view-detail',
  templateUrl: 'booking-room-view-detail.component.html',
  styleUrls: ['booking-room-view-detail.component.scss'],
})
export class BookingRoomViewDetailComponent extends UIComponent implements OnChanges {
  @ViewChild('itemDetailTemplate') itemDetailTemplate;  
  @ViewChild('subTitleHeader') subTitleHeader;
  @ViewChild('attachment') attachment;
  @ViewChild('bookingRoom') bookingRoom : BookingRoomComponent;
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
  files = [];
  dialog!: DialogRef;

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
  ) {
    super(injector);
  }

  onInit(): void {
    this.itemDetailStt = 1;
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
        this.files=[];
        this.api.execSv(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'GetFilesForOutsideAsync',
          [this.funcID, this.itemDetail.recID, 'EP_BookingRooms']
        ).subscribe((res:[])=>{
          if(res){
            this.files=res;
          }
        });
      //this.itemDetail = changes.itemDetail.currentValue;
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
  changeDataMF(event, data:any) {        
    if(event!=null && data!=null){
      // event.forEach(func => {        
      //   func.disabled=true;        
      // });
      if(data.approveStatus=='1'){
        event.forEach(func => {
          if(func.functionID == "SYS02" /*MF sửa*/ || func.functionID == "SYS03"/*MF xóa*/ || func.functionID == "SYS04"/*MF chép*/)
          {
            func.disabled=false;
          }
        });  
      }
      else{
        event.forEach(func => {
          if(func.functionID == "SYS04"/*MF chép*/)
          {
            func.disabled=false;
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
