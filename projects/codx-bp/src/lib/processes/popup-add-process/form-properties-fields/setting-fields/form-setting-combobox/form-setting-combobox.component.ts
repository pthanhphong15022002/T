import {
  ChangeDetectorRef,
  Component,
  Optional,
  ViewChild,
} from '@angular/core';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  CacheService,
  CodxInputComponent,
  DialogData,
  DialogRef,
} from 'codx-core';

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
    text: 'headerText',
    value: 'fieldName',
  };
  gridViewSetup: any;
  lstDatas = [];
  datas: any = {};
  constructor(
    private cache: CacheService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.titleAction = dt?.data?.title;
    this.lstDatas =
      dt?.data?.lstCbx?.length > 0
        ? JSON.parse(JSON.stringify(dt?.data?.lstCbx))
        : [];
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((grid) => {
        if (grid) {
          this.gridViewSetup = grid;
          this.setLstGrid();
        }
      });
  }

  setLstGrid() {
    for (var key in this.gridViewSetup) {
      let field = this.gridViewSetup[key];
      this.lstGrids.push(field);
    }
  }

  //#region value change
  valueChange(e) {
    if(e && e?.data){
      this.data[e?.field] = e?.data;
    }
  }

  //#region combobox
  cbxContact(e, index) {
    if (e && e?.itemData && e?.value != null && e?.value?.trim() != '') {
      const data = e?.itemData;
      if (index != -1) {
        if (this.lstDatas[index]) {
          this.lstDatas[index]['fieldName'] = data?.fieldName;
          this.lstDatas[index]['headerText'] = data?.headerText;
        }
      } else {
        let tmp = {};
        tmp['fieldName'] = data?.fieldName;
        tmp['headerText'] = data?.headerText;
        tmp['allowShow'] = this.datas?.allowShow ?? false;
        tmp['allowSave'] = this.datas?.allowSave ?? false;
        tmp['allowFilter'] = this.datas?.allowFilter ?? false;
        this.lstDatas.push(tmp);
        const idxGrid = this.lstGrids.findIndex(
          (x) => x.fieldName == tmp['fieldName']
        );
        if (idxGrid != -1) {
          this.lstGrids.splice(idxGrid, 1);
        }

        this.datas = {};
        if (this.cbxNew) {
          this.cbxNew.value = '';
          this.cbxNew.dataSource = this.lstGrids;
          this.cbxNew.refresh();
        }
        if (this.cbx) {
          this.cbx.dataSource = this.lstGrids;
          this.cbx.refresh();
        }
      }
    } else {
      if (index != -1) {
        const fieldName = this.lstDatas[index]?.fieldName;
        const idxGrid = this.lstGrids.findIndex(
          (x) => x.fieldName == fieldName
        );
        if (idxGrid == -1) {
          for (let key in this.gridViewSetup) {
            if (key == fieldName) {
              this.lstGrids.push(this.gridViewSetup[key]);
            }
          }
          if (this.cbxNew) {
            this.cbxNew.dataSource = this.lstGrids;
            this.cbxNew.refresh();
          }
          if (this.cbx) {
            this.cbx.dataSource = this.lstGrids;
            this.cbx.refresh();
          }
        }
        this.lstDatas.splice(index, 1);
      }
    }
    this.detectorRef.detectChanges();
  }

  valueChangeCheckBox(e, index) {
    if (e) {
      if (index != -1) {
        this.lstDatas[index][e?.field] = e?.data ?? false;
      } else {
        this.datas[e?.field] = e?.data ?? false;
      }
      this.detectorRef.detectChanges();
    }
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
  onSave() {
    if(this.lstDatas?.length > 0){
      this.data.dataFormat = JSON.stringify(this.lstDatas);
    }
    this.dialog.close(this.data);
  }
  //#endregion
}
