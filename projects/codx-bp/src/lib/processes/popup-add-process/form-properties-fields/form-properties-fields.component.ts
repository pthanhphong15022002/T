import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-form-properties-fields',
  templateUrl: './form-properties-fields.component.html',
  styleUrls: ['./form-properties-fields.component.scss'],
})
export class FormPropertiesFieldsComponent {
  dialog!: DialogRef;
  dataCurrent: any = {id: 'id0', name: 'Forms', icon: 'icon-i-clipboard'};
  lstDataLeft = [
    {
      id: '1',
      name: 'Cơ bản',
      datas: [
        { id: 'id0', name: 'Forms', icon: 'icon-i-clipboard' },
        { id: 'id1', name: 'Văn bản', icon: 'icon-i-layout-text-sidebar' },
        { id: 'id2', name: 'Danh sách', icon: 'icon-i-list-check' },
        { id: 'id3', name: 'Dữ liệu liên kết', icon: 'icon-wb_cloudy' },
        { id: 'id4', name: 'Ngày', icon: 'icon-today' },
        { id: 'id5', name: 'Tệp đính kèm', icon: 'icon-attach_file' },
        { id: 'id6', name: 'Số', icon: 'icon-i-bootstrap' },
        { id: 'id7', name: 'Yes/no', icon: 'icon-switch_left' },
        { id: 'id8', name: 'Người', icon: 'icon-person' },
        { id: 'id9', name: 'Chia sẻ', icon: 'icon-i-people' },
      ],
    },
    {
      id: '2',
      name: 'Nâng cao',
      datas: [
        { id: 'id10', name: 'Xếp hạng', icon: 'icon-i-star' },
        { id: 'id11', name: 'Bảng', icon: 'icon-i-table' },
        { id: 'id12', name: 'Tiến độ', icon: 'icon-i-battery-half' },
        { id: 'id13', name: 'Số điện thoại', icon: 'icon-i-telephone' },
        { id: 'id14', name: 'Email', icon: 'icon-email' },
        { id: 'id15', name: 'Địa chỉ', icon: 'icon-location_on' },
        { id: 'id16', name: 'Công thức', icon: 'icon-i-calculator-fill' },
      ],
    },
    {
      id: '3',
      name: 'Form nhập liệu',
      datas: [
        { id: 'id17', name: 'Email', icon: 'icon-email' },
        { id: 'id18', name: 'Địa chỉ', icon: 'icon-location_on' },
        { id: 'id19', name: 'Công thức', icon: 'icon-i-calculator-fill' },
      ],
    },
  ];

  lstStepFields = [];
  constructor(
    private detectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
  }

  //#region change actived
  changeActived(data) {
    this.dataCurrent = data;
    this.detectorRef.markForCheck();
  }
  //#endregion
}
