import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-campaign',
  templateUrl: './popup-add-campaign.component.html',
  styleUrls: ['./popup-add-campaign.component.scss'],
})
export class PopupAddCampaignComponent implements OnInit {
  dialog: any;
  data: any;
  action = '';
  titleAction = '';
  autoNumber: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private callFc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog.dataService.dataSelected));
    this.action = dt?.data?.action;
    this.titleAction = dt?.data?.title;

    this.autoNumber = dt?.data?.autoNumber;
  }
  ngOnInit(): void {
    if (this.action == 'add') this.data.campaignID = this.autoNumber;
  }

  beforeSave(op) {
    var data = [];
    if (this.action === 'add' || this.action == 'copy') {
      op.method = 'AddCampaignsAsync';
      op.className = 'CampaignsBusiness';
    } else {
      op.method = 'EditCampaignsAsync';
      op.className = 'CampaignsBusiness';
    }
    data = [this.data];
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close([res.save]);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res.update);
        }
      });
  }

  onSave() {
    if (this.action == 'edti') {
      this.onUpdate();
    } else {
      this.onAdd();
    }
  }
}
