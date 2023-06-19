import { AfterViewInit, Component, Injector, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  UIComponent,
  CallFuncService,
  LayoutService,
  NotificationsService,
  AuthStore,
  DialogData,
  DialogRef,
} from 'codx-core';
import { report_BG_TrackLogs } from '../../../models/report-classes.model';

@Component({
  selector: 'lib-using-history',
  templateUrl: './using-history.component.html',
  styleUrls: ['./using-history.component.scss'],
})
export class UsingHistoryComponent
  extends UIComponent
  implements AfterViewInit
{
  ready: boolean = false;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private route: ActivatedRoute,
    private layout: LayoutService,
    private notifySvr: NotificationsService,
    private authStore: AuthStore,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.auth = authStore.get();
    this.tenantID = dt.data;
    this.cache.gridViewSetup('TrackLogs', 'grvTrackLogs').subscribe((res) => {
      if (res) {
        this.grvTrackLogs = res;
        console.log('rtacklog', res);
      }
    });
  }
  ngAfterViewInit(): void {
    this.ready = true;
  }
  grvTrackLogs;
  dialog;
  auth;
  tenantID;
  lstTrackLogs: report_BG_TrackLogs[] = [];
  onInit() {
    // this.api
    //   .execSv(
    //     'BG',
    //     'ERM.Business.BG',
    //     'TrackLogsBusiness',
    //     'UsingHistoryAsync',
    //     [this.tenantID]
    //   )
    //   .subscribe((res: report_BG_TrackLogs[]) => {
    //     this.lstTrackLogs = res;
    //     console.log('lstUsingHis', this.lstTrackLogs);
    //   });
  }

  closePopup() {
    this.dialog.close();
  }
}
