import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CallFuncService, DataRequest, DialogRef, SidebarModel, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';
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

  openFormFuncID(value, datas: any = null) {
    
    let funcID = value?.functionID;
    // if (!datas) datas = this.data;
    // else {
    //   var index = this.view.dataService.data.findIndex((object) => {
    //     return object.recID === datas.recID;
    //   });
    //   datas = this.view.dataService.data[index];
    // }
    switch (funcID) {
      case 'EPT40101':
      case 'EPT40201':
      case 'EPT40301':
        {
          alert('Duyệt');
          //this.approve(value)
        }
        break;
      case 'EPT40102':
      case 'EPT40201':
      case 'EPT40301':
        {
          alert('Ký');
        }
        break;
      case 'EPT40103':
      case 'EPT40203':
      case 'EPT40303':
        {
          alert('Đồng thuận');
        }
        break;
      case 'EPT40104':
      case 'EPT40204':
      case 'EPT40304':
        {
          alert('Đóng dấu');
        }
        break;
      case 'EPT40105':
      case 'EPT40205':
      case 'EPT40305':
        {
          alert('Từ chối');
        }
        break;
      case 'EPT40106':
      case 'EPT40206':
      case 'EPT40306':
        {
          alert('Làm lại');
        }
        break;
      default:
        '';
        break;
    }
  }
  clickMF(event, data) {
    //this.popupTitle=event?.text + " " + this.funcIDName;
    switch (event?.functionID) {     

      case 'SYS02': //Xoa
        this.delete(data);
        break;

      case 'SYS03': //Sua.
        this.edit(data);
        break;
    }
  }
  edit(evt?) {
    if (evt) {
      this.itemDetailTemplate.dataService
        .edit(this.itemDetailTemplate.dataService.dataSelected)
        .subscribe((res) => {          
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = this.view?.dataService;
          option.FormModel = this.formModel;
          this.dialog = this.callFuncService.openSide(
            PopupAddBookingRoomComponent,
            [evt, false],
            option
          );
        });
    }
  }
  delete(evt?) {
    let deleteItem = this.itemDetailTemplate.dataService.dataSelected;
    if (evt) {
      deleteItem = evt;
    }
    this.itemDetailTemplate.dataService.delete([deleteItem]).subscribe((res) => {
    });
  }  
  
  changeDataMF(event, data: any) {}

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
