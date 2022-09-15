import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UIComponent, Util, ViewsComponent } from 'codx-core';

@Component({
  selector: 'view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent extends UIComponent implements OnChanges {
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

  constructor(private injector: Injector) {
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
    console.log('event', value);
    let funcID = value?.functionID;
    // if (!datas) datas = this.data;
    // else {
    //   var index = this.view.dataService.data.findIndex((object) => {
    //     return object.recID === datas.recID;
    //   });
    //   datas = this.view.dataService.data[index];
    // }
    switch (funcID) {
      case 'EPT40101' || 'EPT40201' || 'EPT40301':
        {
          alert('Duyệt');
        }
        break;
      case 'EPT40102' || 'EPT40201' || 'EPT40301':
        {
          alert('Ký');
        }
        break;
      case 'EPT40103' || 'EPT40203' || 'EPT40303':
        {
          alert('Đồng thuận');
        }
        break;
      case 'EPT40104' || 'EPT40204' || 'EPT40304':
        {
          alert('Đóng dấu');
        }
        break;
      case 'EPT40105' || 'EPT40205' || 'EPT40305':
        {
          alert('Từ chối');
        }
        break;
      case 'EPT40106' || 'EPT40206' || 'EPT40306':
        {
          alert('Làm lại');
        }
        break;
      default:
        '';
        break;
    }
  }

  changeDataMF(event, data: any) {}

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
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
