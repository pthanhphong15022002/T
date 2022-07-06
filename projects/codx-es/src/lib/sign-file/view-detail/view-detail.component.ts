import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
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
  process;
  itemDetailDataStt;

  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  ngOnInit(): void {
    this.itemDetailStt = 1;
    this.taskViews = 1;
    this.itemDetailDataStt = 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.itemDetail && this.itemDetail !== null) {
      console.log('detail', this.itemDetail);

      this.esService
        .getApprovalTrans(this.itemDetail?.recID)
        .subscribe((res) => {
          this.process = res;

          this.df.detectChanges();
        });
    }
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

  getHour(date, leadtime) {
    //
    var res = new Date(date);
    console.log('time', res);

    res.setHours(res.getHours() + leadtime);
    return res;
  }

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }
  
  clickMF(e){
    console.log(e);
    
  }
}
