import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent implements OnInit {
  constructor(
    private esService: CodxEsService,
    private df: ChangeDetectorRef
  ) {}

  @Input() itemDetail;

  openNav = false;
  canRequest;
  itemDetailStt;
  taskViews;
  processes;
  itemDetailDataStt;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.itemDetail && this.itemDetail !== null) {

      this.itemDetail.title = this.itemDetail.title.toUpperCase();

      this.esService
        .getApprovalTrans(this.itemDetail?.recID)
        .subscribe((res) => {
          this.processes = res;
          this.df.detectChanges();
        });
    }
    this.itemDetail = this.itemDetail;
    if (this.itemDetail != null) {
      this.canRequest = this.itemDetail.approveStatus < 3 ? true : false;
    } 
  }

  changeNavState(state) {
    this.openNav = state;
  }

  clickChangeItemViewStatus(stt, recID) {
    this.itemDetailStt = stt;
  }

  setDate(date, leadtime) {
    //
    var res = new Date(date);
    res.setHours(res.getHours() + leadtime);
    return res;
  }

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }
}
