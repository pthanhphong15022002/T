import {
  Component,
  Optional,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CacheService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CM_DealsCompetitors } from 'projects/codx-cm/src/lib/models/cm_model';
import { CodxCmService } from 'projects/codx-cm/src/projects';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-add-dealcompetitor',
  templateUrl: './popup-add-dealcompetitor.component.html',
  styleUrls: ['./popup-add-dealcompetitor.component.css'],
})
export class PopupAddDealcompetitorComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;

  data = new CM_DealsCompetitors();
  dialog: any;
  action = '';
  title = '';
  gridViewSetup: any;
  lstDealCompetitors = [];
  isAddCompetitor = true;
  lstCbx = [];
  fieldCompetitor = { text: 'competitorName', value: 'recID' };
  showLabelAttachment = false;
  isHaveFile = false;
  competitorName: any;
  currentRate = 1;
  hovered = 0;
  competitorID: any;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private cmSv: CodxCmService,
    private changeDetector: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.action = dt?.data?.action;
    if (this.action != 'add') {
      this.data = JSON.parse(JSON.stringify(dt?.data?.data));
      this.currentRate = parseInt(this.data.rating);
    } else {
      this.data.recID = Util.uid();
      this.currentRate = 1;
    }
    this.data.dealID = dt?.data?.dealID;
    this.gridViewSetup = dt?.data?.gridViewSetup;
    this.lstDealCompetitors = dt?.data?.lstDealCompetitors;
  }
  async ngOnInit() {
    if (this.action == 'copy') {
      this.data.competitorID = null;
      this.data.recID = Util.uid();
    }
    this.lstCbx = await this.loadCompetitor();
    if (this.action == 'edit') this.competitorID = this.data?.competitorID;
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }
  //#region load combobox
  async loadCompetitor() {
    var options = new DataRequest();
    options.entityName = 'CM_Competitors';
    options.pageLoading = false;
    var lst = await firstValueFrom(this.cmSv.loadDataAsync('CM', options));
    if (lst != null) lst = this.checkListContact(lst);
    return lst;
  }

  checkListContact(lst = []) {
    lst = lst.filter(
      (competitor1) =>
        !this.lstDealCompetitors.some(
          (competitor2) =>
            competitor2.competitorID === competitor1.recID &&
            competitor2.competitorID != this.data?.competitorID
        )
    );

    return lst;
  }
  //#endregion
  async onSave() {
    if (!this.isAddCompetitor) {
      if (this.competitorName == null || this.competitorName.trim() == '') {
        {
          this.notiService.notifyCode(
            'SYS009',
            0,
            '"' + this.gridViewSetup['CompetitorID'].headerText + '"'
          );
          return;
        }
      }
      this.cmSv.addCompetitorByName(this.competitorName).subscribe((x) => {
        if (x) {
          this.competitorID = x;
          this.addHandle();
        } else {
          this.dialog.close();
          this.notiService.notifyCode('SYS023');
        }
      });
    } else {
      this.addHandle();
    }
  }

  async addHandle() {
    if(this.competitorID != this.data.competitorID) this.data.competitorID = this.competitorID;
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
    if (this.attachment?.fileUploadList?.length > 0) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.beforeSave();
        }
      });
    } else {
      this.beforeSave();
    }
  }

  beforeSave() {
    this.data.rating = this.currentRate > 0 ? this.currentRate.toString() : '1';
    if (this.action == 'add' || this.action == 'copy') {
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

    const hasDifferentCompetitorID = this.lstDealCompetitors.some(
      (x) =>
        x.competitorID == this.data?.competitorID && x.recID != this.data?.recID
    );
    if (hasDifferentCompetitorID) {
      return false;
    } else {
      return true;
    }
  }

  async changeRadio(e) {
    if (e.field === 'yes' && e.component.checked === true) {
      this.isAddCompetitor = true;
    } else if (e.field === 'no' && e.component.checked === true) {
      this.isAddCompetitor = false;
    }
  }

  valueChange(e) {
    if (e.data) {
      this.competitorName = e?.data;
    }
  }
  cbxChange(e) {
    if (this.competitorID != e) {
      this.competitorID = e;
    }
  }

  //#region file

  addFile(e) {
    this.attachment.uploadFile();
  }
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  fileAdded(e) {}
  //#endregion
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
