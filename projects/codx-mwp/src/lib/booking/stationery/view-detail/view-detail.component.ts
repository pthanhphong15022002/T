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
import { UIComponent, ViewsComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
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
  @Output('copy') copy: EventEmitter<any> = new EventEmitter();
  @Output('edit') edit: EventEmitter<any> = new EventEmitter();
  @Output('delete') delete: EventEmitter<any> = new EventEmitter();
  @Output('setPopupTitle') setPopupTitle: EventEmitter<any> =
    new EventEmitter();
  @ViewChild('reference') reference: TemplateRef<ElementRef>;
  @Input() itemDetail: any;
  @Input() formModel;
  @Input() data: any;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  firstLoad = true;
  id: string;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;

  tabControl: TabModel[] = [];
  routerRecID: any;
  constructor(injector: Injector) {
    super(injector);
    this.routerRecID = this.router.snapshot.params['id'];
    if (this.routerRecID != null) {
      this.hideFooter = true;
    }
  }

  onInit(): void {
    this.itemDetailStt = 1;
    let tempRecID: any;
    if (this.routerRecID != null) {
      tempRecID = this.routerRecID;
    } else {
      tempRecID = this.itemDetail?.currentValue?.recID;
    }
    this.api
      .exec<any>('EP', 'BookingsBusiness', 'GetBookingByIDAsync', [tempRecID])
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
        this.lviewEdit(data, event.text);
        break;
      case 'SYS04': //Copy.
        this.lviewCopy(data, event.text);
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
      this.copy.emit(data);
    }
  }

  lviewDelete(data?) {
    if (data) {
      this.delete.emit(data);
    }
  }

  changeDataMF(event, data: any) {
    if (event != null && data != null && this.funcID == 'EP8T12') {
      event.forEach((func) => {
        if (
          func.functionID == 'SYS02' /*MF sửa*/ ||
          func.functionID == 'SYS03' /*MF xóa*/ ||
          func.functionID == 'SYS04' /*MF chép*/
        ) {
          func.disabled = true;
        }
      });
    }
    if (event != null && data != null && data.issueStatus == 3) {
      event.forEach((func) => {
        if (func.functionID == 'EPT40303' /*MF cấp phát*/) {
          func.disabled = true;
        }
      });
    }
  }

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  clickChangeItemViewStatus(stt) {
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
