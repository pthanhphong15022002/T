import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
  lstDataLeft = [
    {
      value: '1',
      text: 'Cơ bản',
      datas: [
        { value: 'F', text: 'Forms', icon: 'icon-i-clipboard' },
        { value: 'T', text: 'Văn bản', icon: 'icon-i-layout-text-sidebar' },
        { value: 'L', text: 'Danh sách', icon: 'icon-i-list-check' },
        { value: 'PA', text: 'Dữ liệu liên kết', icon: 'icon-wb_cloudy' },
        { value: 'D', text: 'Ngày', icon: 'icon-today' },
        { value: 'A', text: 'Tệp đính kèm', icon: 'icon-attach_file' },
        { value: 'N', text: 'Số', icon: 'icon-i-bootstrap' },
        { value: 'YesNo', text: 'Yes/no', icon: 'icon-switch_left' },
        { value: 'User', text: 'Người', icon: 'icon-person' },
        { value: 'Share', text: 'Chia sẻ', icon: 'icon-i-people' },
      ],
    },
    {
      value: '2',
      text: 'Nâng cao',
      datas: [
        { value: 'Rank', text: 'Xếp hạng', icon: 'icon-i-star' },
        { value: 'Table', text: 'Bảng', icon: 'icon-i-table' },
        { value: 'Progress', text: 'Tiến độ', icon: 'icon-i-battery-half' },
        { value: 'Phone', text: 'Số điện thoại', icon: 'icon-i-telephone' },
        { value: 'Email', text: 'Email', icon: 'icon-email' },
        { value: 'Address', text: 'Địa chỉ', icon: 'icon-location_on' },
        {
          value: 'Expression',
          text: 'Công thức',
          icon: 'icon-i-calculator-fill',
        },
      ],
    },
    {
      value: '3',
      text: 'Form nhập liệu',
      datas: [
        { value: 'id17', text: 'Email', icon: 'icon-email' },
        { value: 'id18', text: 'Địa chỉ', icon: 'icon-location_on' },
        { value: 'id19', text: 'Công thức', icon: 'icon-i-calculator-fill' },
      ],
    },
  ];
  currentID: string = 'F';
  lstStepFields = [];
  dataCurrent: any = {};
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
    this.defaultForm();
    this.getControlType();
  }

  getControlType() {
    this.cache.valueList('BP002').subscribe((vll) => {
      if (vll && vll?.datas) {
        let datas = vll?.datas ?? [];
        let datas1 = [];
        let datas2 = [];
        for (var i = 0; i < datas.length; i++) {
          if (i >= 0 && i <= 8) {
            datas1.push(datas[i]);
          } else {
            datas2.push(datas[i]);
          }
        }
        this.lstDataLeft.find((x) => x.value == '1').datas = datas1;
        this.lstDataLeft
          .find((x) => x.value == '1')
          .datas.unshift({ value: 'F', text: 'Forms', icon: null });
        this.lstDataLeft.find((x) => x.value == '2').datas = datas2;
      }
    });
  }

  defaultForm() {
    let fieldForms = {};
    fieldForms['recID'] = Util.uid();
    fieldForms['controlType'] = 'F';
    let data = 'Forms';
    if (data) {
      const str = data as any;
      fieldForms['title'] = str;

      fieldForms['fieldName'] = this.bpSv.createAutoNumber(str);
    }
    this.dataCurrent = fieldForms;
    this.lstStepFields.push(fieldForms);
  }
  //#region change actived
  changeActived(data) {
    this.currentID = data?.value;
    this.detectorRef.markForCheck();
  }
  //#endregion

  //#region drop - kéo thả
  drop(event: CdkDragDrop<any[]>): void {
    const item = event.item.data;
    if (event.container === event.previousContainer) {
    } else {
      this.dataFormat = item;
      this.dataCurrent = this.setDataFields(item);
      this.lstStepFields.push(this.dataCurrent);
      this.formMatRef.loadData(this.lstStepFields);
      this.settingFielfs.loadData(this.dataCurrent);
    }
    this.detectorRef.markForCheck();
  }
  //#endregion

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
  //#endregion

  //#region event emit
  dataValueEmit(e) {
    if (e && e?.data) {
      var indx = this.lstStepFields.findIndex((x) => x.recID == e?.data?.recID);
      if (indx != -1) {
        if (e?.type == 'delete') {
          this.lstStepFields.splice(indx, 1);
          this.dataCurrent = this.lstStepFields[0];
          this.dataFormat = this.lstDataLeft
            .find((x) => x.datas.some((y) => y.value == 'F'))
            ?.datas?.find((y) => y.value == 'F');
        } else {
          this.lstStepFields[indx] = e?.data;
        }
      }
      this.formMatRef.loadData(this.lstStepFields);
    }
    this.detectorRef.markForCheck();
  }

  renderData(e) {
    if (e && e?.data) {
      if (this.dataCurrent?.recID != e?.data?.recID) {
        this.dataFormat = this.lstDataLeft
          .find((x) => x.datas.some((y) => y.value == e?.data?.controlType))
          ?.datas?.find((y) => y.value == e?.data?.controlType);
        this.dataCurrent = JSON.parse(
          JSON.stringify(
            this.lstStepFields.find((x) => x.recID == e?.data?.recID)
          )
        );
        this.settingFielfs.loadData(this.dataCurrent);
      }
    } else {
      this.dataFormat = this.lstDataLeft
        .find((x) => x.datas.some((y) => y.value == 'F'))
        ?.datas?.find((y) => y.value == 'F');
    }
    this.detectorRef.markForCheck();
  }

  dropLists(e) {
    if (e && e?.e) {
      this.lstStepFields = e?.e;
    }
  }
  //#endregion
}
