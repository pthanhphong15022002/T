import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
} from 'codx-core';
import { BehaviorSubject } from 'rxjs';
import { CodxAdService } from '../../codx-ad.service';
import { AD_CompanySettings } from '../../models/AD_CompanySettings.models';
import { CompanySettingComponent } from '../company-setting.component';

@Component({
  selector: 'lib-popup-personal',
  templateUrl: './popup-personal.component.html',
  styleUrls: ['./popup-personal.component.css'],
  providers: [CompanySettingComponent],
})
export class PopupPersonalComponent implements OnInit {
  data: any;
  option: any = 'personal';
  dialog: DialogRef;
  items: AD_CompanySettings;
  title: string = 'Người đại diện';
  dataUpdate = new BehaviorSubject<any>(null);
  isUpdate = this.dataUpdate.asObservable();

  @ViewChild('imageAvatar') imageAvatar: ImageViewerComponent;
  @Output() loadDataImg = new EventEmitter();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private adService: CodxAdService,

    private loadData: CompanySettingComponent,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.items = this.data;
  }
  saveData() {}

  update() {
    this.adService
      .updateInformationCompanySettings(this.items, this.option)
      .subscribe((response) => {
        if (response[0]) {
          this.imageAvatar
            .updateFileDirectReload(response[0].recID)
            .subscribe((result) => {
              if (result) {
                this.loadDataImg.emit();
                this.dialog.close(response[0]);
              }
            });
        } else {
          this.notiService.notifyCode('SYS021');
        }
      });
    this.changeDetectorRef.detectChanges();
  }

  txtValueContactName(e: any) {
    this.items.contactName = e.data;
  }

  txtValueJobTitle(e: any) {
    this.items.jobTitle = e.data;
  }

  txtValueEmail(e: any) {
    this.items.personalEmail = e.data;
  }

  txtValuePhone(e: any) {
    this.items.mobile = e.data;
  }

  @ViewChild(CompanySettingComponent)
  public childCmp: CompanySettingComponent;
}
