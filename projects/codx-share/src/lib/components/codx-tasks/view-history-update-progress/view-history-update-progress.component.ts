import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ApiHttpService, FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-history-update-progress',
  templateUrl: './view-history-update-progress.component.html',
  styleUrls: ['./view-history-update-progress.component.css'],
})
export class ViewHistoryUpdateProgressComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() formModel: FormModel;
  @Input() objectID;
  loadFirst = true;
  listHistoryProgress = [];
  crrObject: any;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private api: ApiHttpService
  ) {
    this.loadFirst = false;
  }

  ngOnInit() {}
  ngAfterViewInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.crrObject != this.objectID) {
      this.crrObject = this.objectID;
      this.getDataHistoryProgress();
    }
  }

  getDataHistoryProgress() {
    this.api
      .execSv(
        'BG',
        'ERM.Business.BG',
        'TrackLogsBusiness',
        'GetDataHistoryProgressAsync',
        [this.objectID]
      )
      .subscribe((res: any[]) => {
        if (res && res?.length > 0) {
          this.listHistoryProgress = JSON.parse(JSON.stringify(res));
        } else this.listHistoryProgress = [];
        this.loadFirst = true;
        this.detectorRef.detectChanges();
      });
  }
}
