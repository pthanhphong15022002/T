import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'booking-stationery-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class BookingStationeryViewDetailComponent
  extends UIComponent
  implements OnChanges
{
  @ViewChild('itemDetailTemplate') itemDetailTemplate;
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

  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService
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
      this.detectorRef.detectChanges();
    }
    this.setHeight();
    this.active = 1;
  }

  openFormFuncID(value, datas: any = null) {
    let funcID = value?.functionID;
    switch (funcID) {
      case 'EPT40101':
      case 'EPT40201':
      case 'EPT40301':
        {
          alert('Duyệt');
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

  changeDataMF(event, data: any) {
    console.log(event);
    console.log(data);
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
