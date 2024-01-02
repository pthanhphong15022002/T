import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
  constructor(
    private detectorRef: ChangeDetectorRef,
    private cache: CacheService,
    private bpSv: CodxBpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.getVll();
  }

  getVll() {
    let basic = [
      'Text',
      'ValueList',
      'Combobox',
      'Datetime',
      'Attachment',
      'Number',
      'YesNo',
      'User',
      'Share',
    ];
    let advanced = [
      'Rank',
      'Table',
      'Progress',
      'Phone',
      'Email',
      'Address',
      'Expression',
    ];
    this.cache.valueList('BP002').subscribe((item) => {
      if (item) {
        item.datas.forEach((elm) => {
          if (basic.includes(elm.value)) elm.groupType = 0;
          else if (advanced.includes(elm.value)) elm.groupType = 1;
        });
        this.vllBP002 = item;
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
      this.dataCurrent = this.setDataFields(data);
      data.recID = this.dataCurrent?.recID;
      let object = {
        name: '',
        id: this.table.length,
        children: [data],
      };
      this.lstStepFields.push(this.dataCurrent);
      console.log('drop 1 != :', data);
      this.table.splice(event.currentIndex, 0, object);
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

  //#region
  setDataFields(data) {
    if (data) {
      let field = {};
      field['recID'] = Util.uid();
      field['controlType'] = data?.value;
      if (data && data?.text) {
        const str = data?.text;
        const count = this.lstStepFields.filter(
          (x) => x.controlType == field['controlType']
        ).length;
        field['title'] = str + (count > 0 ? count.toString() : '');
        field['fieldName'] = this.bpSv.createAutoNumber(str);
      }
      if (data?.value == 'YesNo') {
        field['dataType'] = 's';
        field['dataFormat'] = true;
      }
      if (data?.value == 'User') {
        field['dataType'] = 'd';
      }
      if (data?.value == 'Rank') {
        field['rank'] = {
          type: '1',
          icon: null,
          minValue: 0,
          maxValue: 5,
          color: null,
        };
      }
      if (data?.value == 'Progress') {
        field['rank'] = {
          type: '3',
          icon: null,
          minValue: 0,
          maxValue: 100,
          color: '#3699ff',
        };
      }
      return field;
    }
    return null;
  }

  returnData(data){
    let dataField = {};
    const indx = this.lstStepFields.findIndex(x => data.value == x.controlType && x.recID == data.recID);
    dataField = indx != -1 ? this.lstStepFields[indx] : null;
    return dataField;
  }
  //#endregion
  //#region event emit
  dataValueEmit(e) {
    if (e && e?.data) {
      var indx = this.lstStepFields.findIndex((x) => x.recID == e?.data?.recID);
      if (indx != -1) {
        if (e?.type == 'delete') {
          this.lstStepFields.splice(indx, 1);
          this.dataCurrent = this.lstStepFields[0];
        } else {
          this.lstStepFields[indx] = e?.data;
          this.dataCurrent = JSON.parse(
            JSON.stringify(this.lstStepFields[indx])
          );
        }
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
    }
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
    this.dialog.close(this.lstStepFields);
  }
  //#endregion
}
