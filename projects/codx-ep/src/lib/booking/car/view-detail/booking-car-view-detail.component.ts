import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DataRequest, UIComponent, ViewsComponent } from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'booking-car-view-detail',
  templateUrl: 'booking-car-view-detail.component.html',
  styleUrls: ['booking-car-view-detail.component.scss'],
})
export class BookingCarViewDetailComponent extends UIComponent implements OnChanges {
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
  files = [
    {
      id: '6322a7433821591f25a3ff77',
      recID: '41894ed5-34ad-11ed-945f-00155d035517',
      fileID: '6322a7436e021f501d602bf6',
      fileName: 'Tuyên dương học sinh giỏi.pdf',
      eSign: true,
      comment: '.pdf',
      createdOn: '2022-09-14T21:17:07.028-07:00',
      areas: [],
      createdBy: 'ADMIN',
      modifiedOn: null,
      modifiedBy: null,
      write: true,
      delete: true,
      share: true,
      assign: true,
      includeTables: null,
      updateColumns: '',
      unbounds: null,
    },
  ];

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
