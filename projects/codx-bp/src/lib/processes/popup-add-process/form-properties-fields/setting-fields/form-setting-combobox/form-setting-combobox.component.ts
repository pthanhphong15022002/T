import {
  ChangeDetectorRef,
  Component,
  Optional,
  ViewChild,
} from '@angular/core';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  ApiHttpService,
  CacheService,
  CodxInputComponent,
  DialogData,
  DialogRef,
} from 'codx-core';
import { CodxBpService } from 'projects/codx-bp/src/public-api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-form-setting-combobox',
  templateUrl: './form-setting-combobox.component.html',
  styleUrls: ['./form-setting-combobox.component.scss'],
})
export class FormSettingComboboxComponent {
  @ViewChild('cbx') cbx: ComboBoxComponent;
  @ViewChild('cbxNew') cbxNew: ComboBoxComponent;
  @ViewChild('allowShowNew') allowShowNew: CodxInputComponent;
  @ViewChild('allowSaveNew') allowSaveNew: CodxInputComponent;
  @ViewChild('allowFilterNew') allowFilterNew: CodxInputComponent;

  dialog!: DialogRef;
  titleAction = '';
  data: any;
  lstCbx = [];
  filter: any;
  lstGrids = [];
  fields = {
    text: 'fieldName',
    value: 'fieldName',
  };
  lstGrids2 = [];
  gridViewSetup: any;
  datas: any = {};
  tableName: any;
  linkFunction: any;
  cbb: any;
  listFields: any;
  displayNembers: any;
  fieldFilters: any;
  fieldSortings: any;
  sortingDirection: any;
  headerTexts: any;
  comboboxType: any = '3';
  constructor(
    private api: ApiHttpService,
    private bpService: CodxBpService,
    private cache: CacheService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.titleAction = dt?.data?.title;
    this.comboboxType = dt?.data?.comboboxType;
  }

  ngOnInit(): void {
    if (this.data.refValue) {
      this.getDataCombobox(this.data.refValue);
    }
  }

  getGridView(formName: any, gridViewName: any) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((grid) => {
      if (grid) {
        this.gridViewSetup = grid;
        this.setLstGrid();
      }
    });
  }

  setLstGrid() {
    for (var key in this.gridViewSetup) {
      let field = this.gridViewSetup[key];
      this.lstGrids2.push(field);
    }
  }
  //#region value change
  valueChange(e) {
    // if(e && e?.data){
    //   this.data[e?.field] = e?.data;
    // }

    if (
      e?.field == 'tableName' &&
      e?.component?.itemsSelected &&
      e?.component?.itemsSelected[0]
    ) {
      this.getDataCombobox(e?.data);
    }
  }

  getDataCombobox(data: any) {
    this.cache.combobox(data).subscribe((item) => {
      if (item) {
        this.cbb = item;
        this.listFields = item.tableFields.split(';');
        this.displayNembers = item.displayMembers.split(';');
        this.fieldFilters = item.fieldFilter.split(';');
        this.fieldSortings = (item.fieldSorting || '').split(';');
        this.sortingDirection = (item.sortingDirection || '').split(';');
        this.headerTexts = (item.columnHeader || '').split(';');
        for (var i = 0; i < this.listFields.length; i++) {
          var obj = {
            fieldName: this.listFields[i],
            headerText: this.headerTexts[i] || '',
            isDisplay: this.displayNembers.some((x) => x == this.listFields[i]),
            isFilter: this.fieldFilters.some((x) => x == this.listFields[i]),
            isSort: this.fieldSortings.some((x) => x == this.listFields[i]),
            sortingDirection: this.sortingDirection[i] || '',
          };

          if (!this.displayNembers[i]) this.displayNembers[i] = '';
          if (!this.fieldFilters[i]) this.fieldFilters[i] = '';
          if (!this.fieldSortings[i]) this.fieldSortings[i] = '';
          if (!this.sortingDirection[i]) this.sortingDirection[i] = '';
          if (!this.headerTexts[i]) this.headerTexts[i] = '';
          this.lstGrids.push(obj);
        }
        this.addNewRow();
        this.tableName = item.tableName;
        var linkFunction = item.linkFunction;
        if (linkFunction) {
          this.cache.functionList(linkFunction).subscribe((item) => {
            if (item) {
              this.getGridView(item.formName, item.gridViewName);
            }
          });
        }
      }
    });
  }

  //#region combobox

  addNewRow() {
    var obj = {
      fieldName: '',
      headerText: '',
      isDisplay: false,
      isFilter: false,
      isSort: false,
      sortingDirection: '',
    };
    var i = this.lstGrids.length;
    this.listFields[i] = '';
    this.displayNembers[i] = '';
    this.fieldFilters[i] = '';
    this.fieldSortings[i] = '';
    this.sortingDirection[i] = '';
    this.headerTexts[i] = '';
    this.lstGrids.push(obj);
  }
  onComboBoxFocus(event: any, type, cbx): void {
    // Mở danh sách thả xuống khi ô input được focus
    if (cbx) {
      cbx.showPopup();
    }
  }
  //#endregion
  //#endregion
  isActived(value) {}

  //#region  save
  async onSave() {
    // if(this.lstDatas?.length > 0){
    //   this.data.dataFormat = JSON.stringify(this.lstDatas);
    // }
    let i = this.listFields.length - 1;
    if (!this.listFields[i]) {
      this.listFields.splice(i, 1);
      this.displayNembers.splice(i, 1);
      this.fieldFilters.splice(i, 1);
      this.fieldSortings.splice(i, 1);
      this.sortingDirection.splice(i, 1);
      this.headerTexts.splice(i, 1);
    }
    var processNo = '';

    if (!this.data.refValue) {
      processNo = await firstValueFrom(
        this.bpService.genAutoNumber('BPT01', 'BP_Processes', 'ProcessNo')
      );
    }
    this.fieldSortings = this.fieldSortings.filter((x) => x);
    this.sortingDirection = this.sortingDirection.filter((x) => x);
    this.cbb.comboboxName = !this.data.refValue
      ? 'BPCBB' + processNo
      : this.cbb.comboboxName;
    this.cbb.comboboxType = this.data.refType;
    this.cbb.tableFields = this.listFields.join(';');
    this.cbb.displayMembers = this.displayNembers.join(';');
    this.cbb.fieldSorting = this.fieldSortings.join(';');
    this.cbb.sortingDirection = this.sortingDirection.join(';');
    this.cbb.fieldFilter = this.fieldFilters.join(';');
    this.cbb.columnHeader = this.headerTexts.join(';');
    this.cbb.entityAttributes = this.cbb.tableFields;
    this.cbb.isUserDefined = true;
    //Lưu Cbb
    var method = 'AddComboboxAsync';
    if (this.data.refValue) method = 'UpdateComboboxAsync';
    this.api
      .execSv('SYS', 'SYS', 'ComboboxListBusiness', method, this.cbb)
      .subscribe((item) => {
        if (item) {
          if (!this.data?.refValue) this.data.refValue = this.cbb.comboboxName;
          this.cache.setCombobox(this.data.refValue, this.cbb);
          this.dialog.close(this.data);
        }
      });
  }

  valueChangeGrid(e: any, field: any, index: any, item: any = null) {
    if (field == 'displayNembers') {
      if (e?.currentTarget.checked) this.displayNembers.splice(index, 0, item);
      else this.displayNembers = this.displayNembers.filter((x) => x != item);
    } else if (field == 'fieldName') {
      var headerText = this.gridViewSetup[e?.value].headerText;
      this.listFields[index] = e?.value;
      this.headerTexts[index] = headerText;
      this.lstGrids[index].headerText = headerText;
      if (index == this.lstGrids.length - 1) this.addNewRow();
    } else if (field == 'headerText') {
      this.headerTexts[index] = e?.target?.value;
    } else if (field == 'fieldSortings') {
      if (e?.currentTarget.checked) this.fieldSortings.splice(index, 0, item);
      else this.fieldSortings = this.fieldSortings.filter((x) => x != item);
    } else if (field == 'fieldFilters') {
      if (e?.currentTarget.checked) this.fieldFilters.splice(index, 0, item);
      else this.fieldFilters = this.fieldFilters.filter((x) => x != item);
    } else if (field == 'sortingDirection') {
      this.sortingDirection[index] = e?.target?.value;
    } else this.cbb[field] = e?.target?.value;
  }
  //#endregion
}
