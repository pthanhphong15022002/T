import { mergeMap } from 'rxjs';
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
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> =
    new EventEmitter();
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

  constructor(private injector: Injector, private epService: CodxEpService) {
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
            this.epService
              .getEmployeeByOrgUnitID(this.itemDetail?.buid)
              .subscribe((res) => {
                if (res) {
                  this.itemDetail.empQty = res;
                } else {
                  this.itemDetail.empQty = 1;
                }
                this.detectorRef.detectChanges();
              });
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
        this.lviewEdit(data, event.text);
        break;
      case 'SYS04': //Copy.
        this.lviewEdit(data, event.text);
        break;
    }
  
  }
  lviewEdit(data?, mfuncName?) {
    if (data) {
      this.setPopupTitle.emit(mfuncName);
      this.edit.emit(data);
    }
  }

  lviewCopy(data?, mfuncName?) {
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
