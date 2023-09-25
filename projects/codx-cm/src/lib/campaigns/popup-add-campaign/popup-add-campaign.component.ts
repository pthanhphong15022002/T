import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-add-campaign',
  templateUrl: './popup-add-campaign.component.html',
  styleUrls: ['./popup-add-campaign.component.scss'],
})
export class PopupAddCampaignComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload: ImageViewerComponent;

  dialog: any;
  data: any;
  action = '';
  titleAction = '';
  autoNumber: any;
  avatarChange = false;
  gridViewSetup: any;
  count = 0;
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
    this.gridViewSetup = dt?.data?.gridViewSetup
    this.autoNumber = dt?.data?.autoNumber;
  }
  ngOnInit(): void {
    if (this.action != 'edit') this.data.campaignID = this.autoNumber;
  }

  //#region save
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
          this.dialog.close(res.save);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.dialog.close(res.update);
        }
      });
  }

  async onSave() {
    this.count = this.cmSv.checkValidate(this.gridViewSetup, this.data);
    if (this.count > 0) {
      return;
    }

    if(new Date(this.data?.startDate) >= new Date(this.data?.endDate)){
      this.notiService.notifyCode('Vui lòng chọn thời gian kết thúc lớn hơn thời gian bắt đầu');
      return;
    }

    if (this.avatarChange) {
      await firstValueFrom(
        this.imageUpload.updateFileDirectReload(this.data?.recID)
      );
    }
    if (this.action == 'edit') {
      this.onUpdate();
    } else {
      this.onAdd();
    }
  }
  //#endregion

  //#region avata
  changeAvatar() {
    this.avatarChange = true;
  }
  //#endregion
}
