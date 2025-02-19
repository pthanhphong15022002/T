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
  FormModel,
} from 'codx-core';
import { report_BG_TrackLogs } from '../../../models/report-classes.model';

@Component({
  selector: 'lib-using-history',
  templateUrl: './using-history.component.html',
  styleUrls: ['./using-history.component.scss'],
})
export class UsingHistoryComponent extends UIComponent {
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
    this.formTrackLogs.formName = 'TrackLogs';
    this.formTrackLogs.gridViewName = 'grvTrackLogs';
    // this.cache.gridViewSetup('TrackLogs', 'grvTrackLogs').subscribe((res) => {
    //   if (res) {
    //     this.formTrackLogs = res;
    //     console.log('rtacklog', res);
    //   }
    // });
  }
  formTrackLogs: FormModel = new FormModel();
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
