import { Component, Optional, OnInit } from '@angular/core';
import {
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CM_DealsCompetitors } from 'projects/codx-cm/src/lib/models/cm_model';
import { CodxCmService } from 'projects/codx-cm/src/projects';

@Component({
  selector: 'lib-popup-add-dealcompetitor',
  templateUrl: './popup-add-dealcompetitor.component.html',
  styleUrls: ['./popup-add-dealcompetitor.component.css'],
})
export class PopupAddDealcompetitorComponent implements OnInit {
  data = new CM_DealsCompetitors();
  dialog: any;
  action = '';
  title = '';
  gridViewSetup: any;
  lstDealCompetitors = [];
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.data.dealID = dt?.data?.dealID;
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.action = dt?.data?.action;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.lstDealCompetitors = dt?.data?.lstDealCompetitors;
  }
  ngOnInit(): void {
    // if (this.action == 'add') {
    //   this.data.recID = Guid.newGuid();
    // }
  }

  onSave() {
    if (
      this.data?.competitorID == null ||
      this.data?.competitorID.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CompetitorID'].headerText + '"'
      );
      return;
    }

    if (!this.checkCompetitorID()) {
      this.notiService.notifyCode(
        'CM003',
        0,
        '"' + this.gridViewSetup['CompetitorID'].headerText + '"'
      );
      return;
    }

    this.beforeSave();
  }

  beforeSave() {
    if (this.action == 'add') {
      this.cmSv.addDealCompetitor(this.data).subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notifyCode('SYS006');
        } else {
          this.dialog.close();
          this.notiService.notifyCode('SYS023');
        }
      });
    } else {
      this.cmSv.updateDealCompetitorAsync(this.data).subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notifyCode('SYS007');
        } else {
          this.dialog.close();
          this.notiService.notifyCode('SYS021');
        }
      });
    }
  }

  checkCompetitorID() {
    if (!this.lstDealCompetitors || !Array.isArray(this.lstDealCompetitors)) {
      return true;
    }

    const hasDifferentCompetitorID = this.lstDealCompetitors.some(x => x.competitorID == this.data?.competitorID && x.recID != this.data?.recID);
    if (hasDifferentCompetitorID) {
      return false;
    }else{
      return true;
    }
  }

  valueChange(e) {
    if (e.data) {
      this.data[e.field] = e?.data;
    }
  }
}
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
