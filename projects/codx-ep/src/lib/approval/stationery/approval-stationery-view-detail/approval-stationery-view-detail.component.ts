import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Injector,
} from '@angular/core';
import { UIComponent, ViewsComponent } from 'codx-core';

@Component({
  selector: 'approval-stationery-view-detail',
  templateUrl: 'approval-stationery-view-detail.component.html',
  styleUrls: ['approval-stationery-view-detail.component.scss'],
})
export class ApprovalStationeryViewDetailComponent extends UIComponent implements OnChanges {
  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() override view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  itemDetailDataStt: any;
  itemDetailStt: any;
  active = 1;

  constructor(private injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {
    throw new Error('Method not implemented.');
  }

  ngOnChanges(changes: SimpleChanges): void {
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

  openFormFuncID(val: any, datas: any = null) {
    var funcID = val?.functionID;
    if (!datas) {
      datas = this.itemDetail;
    } else {
      var index = this.view.dataService.data.findIndex((object) => {
        return object.recID === datas.recID;
      });
      if (index >= 0) {
        datas = this.view.dataService.data[index];
      }
    }

    switch (val?.functionID) {
      case 'SYS03':
        //this.edit(datas);
        break;
      case 'SYS02':
        //this.delete(datas);
        break;
      case 'SYS04':
        //this.assign(datas);
        break;
    }
  }

  getDetailBooking(id: string) {}

  private setHeight() {
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
