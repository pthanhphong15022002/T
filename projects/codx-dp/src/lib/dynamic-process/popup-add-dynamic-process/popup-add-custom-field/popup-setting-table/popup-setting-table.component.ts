import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  Optional,
  Renderer2,
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
import {
  CdkDragDrop,
  CdkDragRelease,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'lib-popup-setting-table',
  templateUrl: './popup-setting-table.component.html',
  styleUrls: ['./popup-setting-table.component.css'],
})
export class PopupSettingTableComponent implements OnInit, AfterViewInit {
  @ViewChild('formTable') formTable: CodxFormComponent;

  settingWidth = false;
  settingCount = false;
  totalColumns = false;
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
  //table drop
  columns: any;
  pos: any;
  data: any;
  release: boolean = true;
  actionField = 'add';

  constructor(
    private changdef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private cache: CacheService,
    public renderer2: Renderer2,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.grvSetup = dt?.data?.grvSetup;
    this.actionField = dt?.data?.action;
    this.listColumns = JSON.parse(JSON.stringify(dt?.data?.listColumns));
    if (this.listColumns?.length > 0) {
      this.settingWidth = this.listColumns[0]?.settingWidth ?? false;
      this.settingCount = this.listColumns[0]?.settingCount ?? false;
      this.totalColumns =
        this.listColumns.findIndex((x) => x?.totalColumns) != -1;
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
    if (
      e.field == 'settingWidth' ||
      e.field == 'settingCount' ||
      e.field == 'totalColumns'
    ) {
      let value = e.data;
      // if (e.field == 'settingWidth') this.settingWidth = value;
      // else this.settingCount = value;

      this[e.field] = value;
      if (this.listColumns?.length > 0) {
        this.listColumns.forEach((x) => {
          if (
            (e.field == 'totalColumns' && x.dataType == 'N') ||
            e.field != 'totalColumns'
          )
            x[e.field] = value;
        });
      }
      this.changdef.detectChanges();
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
    this.column.totalColumns = false;
    let obj = {
      data: this.column,
      action: 'add',
      titleAction: this.actionAdd,
      grvSetup: this.grvSetup,
      processNo: this.processNo,
      listColumns: this.listColumns,
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
        let data = JSON.parse(JSON.stringify(res?.event[0]));
        if (data.dataType == 'N') data.totalColumns = this.totalColumns;
        this.listColumns.push(data);
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
      disable: this.actionField == 'edit',
      listColumns: this.listColumns,
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

  valueChangeColumns(e) {
    if (this.listColumns?.length > 0) {
      this.listColumns.forEach((x) => {
        if (e.field == x.fieldName && (x.dataType == 'N' || x.dataType == 'CF'))
          x.totalColumns = e.data;
      });
    }
  }

  //------------------------------------END---------------------------------//

  //--------------------------------------------------------------------------//
  ///----------------Drag and drop table column HTML--------------------------- //
  //--------------------------------------------------------------------------//

  dropRow(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.listColumns, event.previousIndex, event.currentIndex);
  }
  dropCol(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.listColumns, event.previousIndex, event.currentIndex);
  }
  mouseDown(event, el: any = null) {
    el = el || event.target;
    this.pos = {
      x: el.getBoundingClientRect().left - event.clientX + 'px',
      y: el.getBoundingClientRect().top - event.clientY + 'px',
      width: el.getBoundingClientRect().width + 'px',
    };
  }
  onDragRelease(event: CdkDragRelease) {
    this.renderer2.setStyle(
      event.source.element.nativeElement,
      'margin-left',
      '0px'
    );
  }

  isNumeric(value: string | number): boolean {
    return value != null && value !== '' && !isNaN(Number(value.toString()));
  }

  calculateDifference(quote: number, expiring: number) {
    const difference = quote - expiring;
    return {
      numericValue: difference,
      percentageValue: difference / expiring,
    };
  }

  sumQuotes(fieldName: string): any {
    if (fieldName.toLowerCase() !== 'quotesummary') {
      const sumQuoted = this.listColumns
        .filter((item) => item.dataType === 'quote')
        .map((item) => item[fieldName])
        .filter((item) => item)
        .reduce((sum, item) => {
          return sum + item;
        }, 0);

      return sumQuoted;
    }

    return 'Sum Quoted';
  }
  //------------------------------------END---------------------------------//
}
