import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { ColumnTable } from 'projects/codx-dp/src/lib/models/models';
import { CodxDpService } from 'projects/codx-dp/src/public-api';
import { PopupAddColumnTableComponent } from './popup-add-column-table/popup-add-column-table.component';

@Component({
  selector: 'lib-popup-setting-table',
  templateUrl: './popup-setting-table.component.html',
  styleUrls: ['./popup-setting-table.component.css'],
})
export class PopupSettingTableComponent implements OnInit, AfterViewInit {
  @ViewChild('formTable') formTable: CodxFormComponent;

  settingWidth = false;
  settingCount = false;
  isShowMore = false;
  widthDefault = '550';
  isShowButton = true;
  countName = 'STT'; //test tính resource langue sau
  dialog: DialogRef;
  formModelColumn: FormModel;
  listColumns = [];
  idxEdit: any;
  column: any;
  processNo: any;
  titleAction = 'Thiết lập bảng'; //test
  actionEdit = 'Chỉnh sửa';
  actionAdd = 'Thêm mới';
  grvSetup: any;
  user: any;

  constructor(
    private changdef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.grvSetup = dt?.data?.grvSetup;
    this.listColumns = JSON.parse(JSON.stringify(dt?.data?.listColumns));
    if (this.listColumns?.length > 0) {
      this.settingWidth = this.listColumns[0]?.settingWidth ?? false;
    }
    this.widthDefault = this.dialog.dialog.width
      ? this.dialog.dialog.width.toString()
      : '550';
    this.processNo = dt?.data?.processNo; //de sinh vll

    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc && mFuc?.length > 0) {
        Array.from<any>(mFuc).forEach((mf) => {
          if (mf.functionID == 'SYS01') this.actionAdd = mf.customName;
          if (mf.functionID == 'SYS03') this.actionEdit = mf.customName;
        });
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  valueChange(e) {
    if (e.field == 'settingWidth' || e.field == 'settingCount') {
      let value = e.data;
      if (e.field == 'settingWidth') this.settingWidth = value;
      else this.settingCount = value;
      if (this.listColumns?.length > 0) {
        this.listColumns.forEach((x) => {
          x[e.field] = value;
        });
      }
      this.changdef.detectChanges();
      return;
    }
  }

  saveData() {
    if (!this.listColumns || this.listColumns?.length == 0) {
      // this.notiService.notify('Bảng dữ liệu chưa được thiết lập', '3'); //chơ mes Khanh
      this.notiService.notifyCode('DP041');
      return;
    }

    this.dialog.close([this.listColumns, this.processNo]);
  }

  showMore() {
    let isShowMore = !this.isShowMore;
    let width = '1100';
    // tạm tắt
    // if (isShowMore) {
    //   let element = document.getElementById('table');
    //   if (element) {
    //     width = (element.offsetWidth + 50).toString();
    //   }
    // }
    // if (Number.parseFloat(width) <= Number.parseFloat(this.widthDefault))
    //   return;

    this.isShowMore = isShowMore;
    if (Number.parseFloat(width) > Util.getViewPort().width - 100)
      width = (Util.getViewPort().width - 100).toString();

    this.dialog.setWidth(this.isShowMore ? width : this.widthDefault);
    this.changeRef.detectChanges();
  }

  // ----------------------------------COLUM----------------------------------//
  addColumn() {
    this.column = new ColumnTable();
    this.column.recID = Util.uid();
    this.column.settingWidth = this.settingWidth;
    this.column.settingCount = this.settingCount;
    let obj = {
      data: this.column,
      action: 'add',
      titleAction: this.actionAdd,
      grvSetup: this.grvSetup,
      processNo: this.processNo,
    };
    let option = new DialogModel();
    option.FormModel = this.dialog.formModel;
    option.zIndex = 1050;
    let dialogAddColumn = this.callfc.openForm(
      PopupAddColumnTableComponent,
      '',
      550,
      750,
      '',
      obj,
      '',
      option
    );

    dialogAddColumn.closed.subscribe((res) => {
      if (res && res?.event?.length > 0) {
        this.listColumns.push(JSON.parse(JSON.stringify(res?.event[0])));
        if (!this.processNo && res?.event[1]) this.processNo = res?.event[1];
      }
    });
  }

  editColumn(value, index) {
    this.idxEdit = index;
    this.column = JSON.parse(JSON.stringify(value));
    let obj = {
      data: this.column,
      action: 'edit',
      titleAction: this.actionEdit,
      grvSetup: this.grvSetup,
      processNo: this.processNo,
    };

    let option = new DialogModel();
    option.FormModel = this.dialog.formModel;
    option.zIndex = 1050;

    let dialogAddColumn = this.callfc.openForm(
      PopupAddColumnTableComponent,
      '',
      550,
      750,
      '',
      obj,
      '',
      option
    );

    dialogAddColumn.closed.subscribe((res) => {
      if (res && res?.event?.length > 0) {
        let idx = this.listColumns.findIndex(
          (x) => x.recID == this.column.recID
        );
        if (idx != -1) {
          this.listColumns[idx] = JSON.parse(JSON.stringify(res?.event[0]));
          this.idxEdit = -1;
        }

        if (!this.processNo && res?.event[1]) this.processNo = res?.event[1];
        this.changeRef.detectChanges();
      }
    });
  }

  deleteColumn(idx) {
    this.notiService.alertCode('SYS030').subscribe((res) => {
      if (res?.event && res?.event?.status == 'Y') {
        this.listColumns.splice(idx, 1);
        this.changeRef.detectChanges();
      }
    });
  }

  //------------------------------------END---------------------------------//
}
