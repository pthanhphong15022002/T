import {
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { CacheService, DialogData, DialogRef, Util } from 'codx-core';
import { FormFormatValueComponent } from './form-format-value/form-format-value.component';
import { CodxBpService } from '../../../codx-bp.service';
import { tempVllBP } from '../../../models/models';
import { SettingFieldsComponent } from './setting-fields/setting-fields.component';

@Component({
  selector: 'lib-form-properties-fields',
  templateUrl: './form-properties-fields.component.html',
  styleUrls: ['./form-properties-fields.component.scss'],
})
export class FormPropertiesFieldsComponent implements OnInit {
  @ViewChild('formMatRef') formMatRef: FormFormatValueComponent;
  @ViewChild('settingFielfs') settingFielfs: SettingFieldsComponent;

  dialog!: DialogRef;
  dataFormat: any = { value: 'F', text: 'Forms', icon: 'icon-i-clipboard' };
  vllBP002: any;
  dataCurrent: any = {};
  lstStepFields = [];
  currentID: string = 'F';
  table: Array<any> = [];

  tempVllBP: tempVllBP;
  isForm: boolean = true;
  process: any;
  action = 'add';
  type: any;
  basic = [
    'Text',
    'ValueList',
    'ComboBox',
    'DateTime',
    'Attachment',
    'Number',
    'YesNo',
    'User',
    'Share',
  ];
  advanced = [
    'Rank',
    'Table',
    'Progress',
    'Phone',
    'Email',
    'Address',
    'Expression',
  ];
  constructor(
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private bpSv: CodxBpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.process = dt?.data?.process;
    this.action = dt?.data?.action ?? 'add';
    this.type = dt?.data?.type;
    this.dataCurrent = dt?.data?.dataCurrent;
    this.vllBP002 = dt?.data?.vllBP002;
    this.lstStepFields = dt?.data?.lstStepFields ?? [];
    this.isForm = dt?.data?.isForm ?? false;
  }
  ngOnInit(): void {
    if (this.vllBP002 && this.vllBP002?.datas?.length > 0) {
      this.vllBP002.datas.forEach((elm) => {
        if (this.basic.includes(elm.value)) elm.groupType = 0;
        else if (this.advanced.includes(elm.value)) elm.groupType = 1;
      });
      if (this.lstStepFields?.length > 0) {
        this.lstStepFields.forEach((ele) => {
          let dataForm = this.vllBP002.datas.find(
            (x) => x.value == ele.fieldType
          );
          if (ele?.fieldType == 'Title') {
            this.dataCurrent = ele;
            this.dataFormat = JSON.parse(JSON.stringify(dataForm));
          }
          dataForm.recID = ele?.recID;
          this.table.push({
            name: '',
            columnOrder: this.table.length,
            children: [dataForm],
          });
        });
      } else {
        this.setDefaultTitle();
      }
    } else {
      this.getVll();
    }
  }

  setDefaultTitle() {
    const createField = (value, fieldType, isForm = false) => {
      const recID = Util.uid();
      const fieldName = this.bpSv.createAutoNumber(
        value,
        this.lstStepFields,
        'fieldName'
      );
      const title = this.bpSv.createAutoNumber(
        value,
        this.lstStepFields,
        'title'
      );

      const field = {
        recID,
        fieldName,
        title,
        dataType: 'String',
        fieldType,
        controlType: 'TextBox',
        isRequired: true,
        defaultValue: null,
        description: isForm ? 'Câu trả lời' : '',
      };

      if (isForm) {
        field.defaultValue = title;
      }

      return field;
    };

    const dataVllTitle = this.vllBP002?.datas?.find((x) => x.value === 'Title');
    const dataVllSubTitle = this.vllBP002?.datas?.find(
      (x) => x.value === 'SubTitle'
    );

    const titleField = createField(dataVllTitle?.text, dataVllTitle?.value);
    const lst = [titleField];

    this.dataFormat = dataVllTitle;
    this.dataCurrent = titleField;

    const data = { ...this.dataFormat, recID: this.dataCurrent.recID };
    this.table.push({
      name: '',
      columnOrder: this.table.length,
      children: [data],
    });
    if (this.isForm) {
      const subTitleField = createField(
        dataVllSubTitle?.text,
        dataVllSubTitle?.value,
        true
      );
      lst.push(subTitleField);
      const dataSub = { ...dataVllSubTitle, recID: subTitleField.recID };
      this.table.push({
        name: '',
        columnOrder: this.table.length,
        children: [dataSub],
      });
    }
    this.lstStepFields = [...this.lstStepFields, ...lst];
  }

  //#region setting drop keo tha - anh Chung
  getVll() {
    this.cache.valueList('BP002').subscribe((item) => {
      if (item) {
        item.datas.forEach((elm) => {
          if (this.basic.includes(elm.value)) elm.groupType = 0;
          else if (this.advanced.includes(elm.value)) elm.groupType = 1;
        });
        this.vllBP002 = item;
        if (this.type != 'table') {
          this.setDefaultTitle();
        } else {
          if (this.action == 'edit') {
            this.dataFormat = this.vllBP002.datas.find(
              (x) => x.value == this.dataCurrent?.fieldType
            );
            this.dataFormat.recID = this.dataCurrent?.recID;
            let object = {
              name: '',
              id: this.type != 'table' ? this.table.length : 0,
              children: [this.dataFormat],
            };
            this.lstStepFields.push(this.dataCurrent);
            this.table.splice(0, 0, object);
          }
        }
      }
    });
  }

  trackByFn(i: number) {
    return i;
  }

  drop(event: any) {
    if (event.previousContainer !== event.container) {
      // copyArrayItem(
      //   event.previousContainer.data,
      //   event.container.data,
      //   event.previousIndex,
      //   event.currentIndex
      // );
      let data = JSON.parse(
        JSON.stringify(event.previousContainer.data[event.previousIndex])
      );
      data.parentID = this.table.length;
      this.dataFormat = data;
      this.dataCurrent = JSON.parse(JSON.stringify(this.setDataFields(data)));
      data.recID = this.dataCurrent?.recID;
      let object = {
        name: '',
        id: this.type != 'table' ? this.table.length : 0,
        children: [data],
      };
      if (this.type != 'table') {
        this.lstStepFields.push(this.dataCurrent);
        this.table.splice(event.currentIndex, 0, object);
      } else {
        if (this.lstStepFields?.length > 0) {
          this.lstStepFields[0] = this.dataCurrent;
          this.table[0] = object;
        } else {
          this.lstStepFields.push(this.dataCurrent);
          this.table.splice(event.currentIndex, 0, object);
        }
      }
    } else {
      this.table[event.currentIndex].id = event.previousIndex;
      this.table[event.previousIndex].id = event.currentIndex;
      this.table[event.currentIndex].children.forEach((elm) => {
        elm.parentID = event.previousIndex;
      });
      this.table[event.previousIndex].children.forEach((elm) => {
        elm.parentID = event.currentIndex;
      });
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      console.log('drop 1 == ');
    }
    this.table = this.table.filter(
      (x) => x.children != null && x.children.length > 0
    );
    this.detectorRef.markForCheck();
  }

  drop2(event: any) {
    let data = JSON.parse(
      JSON.stringify(event.previousContainer.data[event.previousIndex])
    );
    if (
      event.previousContainer === event.container &&
      event.event.target.id == event.container.id
    ) {
      //delete this.table[data.parentID].children[event.previousIndex];
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else if (event.event.target.id != event.container.id) {
      var object = {
        name: '',
        id: 0,
        children: [data],
      };

      let index = this.table.findIndex((x) => x.id == data.parentID);
      this.table[index].children.splice(event.previousIndex, 1);
      if (event.event.target.id != event.container.id) {
        (object.id = object.children[0].parentID = this.table.length),
          this.table.push(object);
      } else {
        (object.id = object.children[0].parentID = data.parentID + 1),
          this.table.splice(data.parentID + 1, 0, object);
      }
    } else {
      (event.previousContainer.data[event.previousIndex].parentID =
        event.container.data[0].parentID),
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
    }

    this.table = this.table.filter(
      (x) => x.children != null && x.children.length > 0
    );
    this.detectorRef.markForCheck();
  }

  evenPredicate(name: string) {
    return (item: CdkDrag<any>) => {
      return name == item.data;
    };
  }

  exited(event: any) {
    // const currentIdx = event.container.data.findIndex(
    //   (f) => f.id === event.item.data.id
    // );
    // this.menu.splice(currentIdx + 1, 0, {
    //   ...event.item.data,
    //   temp: true,
    // });
    console.log('exited: ', event);
  }
  entered() {
    console.log('entered: 12');
    //this.menu = this.menu.filter((f) => !f.temp);
  }
  //#endregion
  //#region
  setDataFields(data): any {
    if (!data) {
      return null;
    }

    const field: any = {
      recID: Util.uid(),
      fieldType: data.value,
      isRequired: false,
    };

    if (data.text) {
      const str = data.text;
      const autoNumberTitle = this.bpSv.createAutoNumber(
        str,
        this.lstStepFields,
        'title'
      );
      const autoNumberFieldName = this.bpSv.createAutoNumber(
        str,
        this.lstStepFields,
        'fieldName'
      );

      field.title = autoNumberTitle;
      field.fieldName = autoNumberFieldName;
    }

    if (['Text', 'ValueList', 'ComboBox', 'Attachment'].includes(data.value)) {
      field.dataType = 'String';

      if (['ValueList', 'ComboBox'].includes(data.value)) {
        field.refType = data.value === 'ValueList' ? '2' : '3';
        field.controlType = 'ComboBox';
      } else if (data.value == 'Text') {
        field.dataFormat = '';
        field.controlType = 'TextBox';
      } else {
        field.controlType = 'Attachment';
      }
    }

    if (data.value == 'DateTime') {
      field.dataFormat = 'd';
      field.dataType = 'DateTime';
      field.controlType = 'MaskBox';
    }

    if (data.value == 'Number') {
      field.dataFormat = 'I';
      field.dataType = 'Decimal';
      field.controlType = 'TextBox';
    }

    if (data.value == 'YesNo') {
      field.dataType = 'Bool';
      field.controlType = 'Switch';
    }

    if (data.value == 'User') {
      field.dataType = 'String';
      field.refValue = 'Users';
      field.refType = '3';
      field.controlType = 'ComboBox';
    }

    if (data.value === 'Rank') {
      field.controlType = 'Rank';
      field.dataType = 'Decimal';
      field.rank = {
        type: '1',
        icon: null,
        minValue: 0,
        maxValue: 5,
        color: '#0078FF',
      };
    }

    if (data.value === 'Progress') {
      field.dataType = 'Decimal';
      field.controlType = 'Progress';
      field.rank = {
        type: '3',
        icon: null,
        minValue: 0,
        maxValue: 100,
        color: '#0078FF',
      };
    }

    if (['Phone', 'Email', 'Address'].includes(data.value)) {
      field.dataType = 'String';
      field.dataFormat = data.value;
      field.controlType = 'TextBox';
    }

    if (data.value == 'Expression') {
      field.dataType = 'String';
      field.controlType = 'TextBox';
      field.refType = 'E';
      field.description = 'Exp [So_luong] * [Don_gia]';
    }

    if (data.value == 'Table') {
      field.dataType = 'String';
      field.controlType = 'Table';
      const tbFormat = {
        hasIndexNo: false,
        sum: '',
      };
      field.tableFormat = JSON.stringify(tbFormat);
      let tables = [];
      let column1 = {
        recID: Util.uid(),
        fieldName: 'cot_1',
        title: 'cot_1',
        fieldType: 'Text',
        isRequired: false,
        dataType: 'String',
        dataFormat: '',
        controlType: 'TextBox',
      };
      tables.push(column1);
      let column2 = {
        recID: Util.uid(),
        fieldName: 'cot_2',
        title: 'cot_2',
        fieldType: 'Text',
        isRequired: false,
        dataType: 'String',
        dataFormat: '',
        controlType: 'TextBox',
      };
      tables.push(column2);

      let column3 = {
        recID: Util.uid(),
        fieldName: 'cot_3',
        title: 'cot_3',
        fieldType: 'Text',
        isRequired: false,
        dataType: 'String',
        dataFormat: '',
        controlType: 'TextBox',
      };
      tables.push(column3);
      field.dataFormat = JSON.stringify(tables);
    }

    return field;
  }

  returnData(data) {
    let dataField = {};
    const indx = this.lstStepFields.findIndex(
      (x) => data.value == x.fieldType && x.recID == data.recID
    );
    dataField = indx != -1 ? this.lstStepFields[indx] : null;
    return dataField;
  }

  dataForm(type) {
    return this.lstStepFields?.find((x) => x.fieldType == 'Title')
      ? type
        ? this.lstStepFields?.find((x) => x.fieldType == 'Title')[type]
        : null
      : this.lstStepFields?.find((x) => x.fieldType == 'Title');
  }
  //#endregion
  //#region event emit
  dataValueEmit(e) {
    if (e && e?.data) {
      var indx = this.lstStepFields.findIndex((x) => x.recID == e?.data?.recID);
      if (indx != -1) {
        if (e?.type == 'delete') {
          this.lstStepFields.splice(indx, 1);
          this.dataCurrent = this.lstStepFields.find(
            (x) => x.fieldType == 'Title'
          );
          let idxTab = this.table.findIndex((x) =>
            x.children.some((y) => y.recID == e?.data?.recID)
          );
          if (idxTab != -1) {
            this.table.splice(idxTab, 1);
          }

          this.dataFormat = this.vllBP002.datas.find((x) => x.value == 'Title');
        } else {
          this.lstStepFields[indx] = e?.data;
          this.dataCurrent = this.lstStepFields[indx];
        }
      }
      if (e?.data?.fieldType == 'ValueList' || e?.data?.fieldType == 'Table') {
        this.table = JSON.parse(JSON.stringify(this.table));
      }
    }
    this.detectorRef.markForCheck();
  }

  selectedItem(data: any) {
    if (this.dataCurrent?.recID != data?.recID) {
      this.dataFormat = this.table
        .find((x) => x.children.some((y) => y.value == data?.value))
        ?.children?.find((y) => y.value == data?.value);
      this.dataCurrent = JSON.parse(
        JSON.stringify(this.lstStepFields.find((x) => x.recID == data?.recID))
      );
      this.settingFielfs.loadData(this.dataCurrent);
      this.table = JSON.parse(JSON.stringify(this.table));
      this.detectorRef.markForCheck();
    }
  }

  selectForm(indx) {
    this.dataFormat = this.vllBP002.datas.find((x) => x.value == 'Title');
    this.dataCurrent = JSON.parse(
      JSON.stringify(this.lstStepFields.find((x) => x.fieldType == 'Title'))
    );
    this.detectorRef.markForCheck();
  }

  renderData(e) {
    if (e && e?.data) {
      if (this.dataCurrent?.recID != e?.data?.recID) {
        this.dataFormat = this.table
          .find((x) => x.children.some((y) => y.value == e?.data?.value))
          ?.children?.find((y) => y.value == e?.data?.value);
        this.dataCurrent = JSON.parse(
          JSON.stringify(
            this.lstStepFields.find((x) => x.recID == e?.data?.recID)
          )
        );
      }
    } else {
    }
    this.detectorRef.markForCheck();
  }
  //#region  save field
  onSave() {
    this.dialog.close(
      this.type == 'table' ? this.dataCurrent : this.lstStepFields
    );
  }
  //#endregion
}
