import { DialogData, DialogRef, UIComponent, ViewModel } from 'codx-core';
import { Component, Injector, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'lib-popup-list-stationery',
  templateUrl: './popup-list-stationery.component.html',
  styleUrls: ['./popup-list-stationery.component.scss'],
})
export class PopupListStationeryComponent extends UIComponent {
  headerText: string = 'Danh sách yêu cầu';
  subHeaderText: string = 'Yêu cầu cho phòng';
  data: any;
  dialog: any;
  CbxName: any;
  isAfterRender = false;
  dialogListStationery: FormGroup;

  views: Array<ViewModel> | any = [];
  funcID: string;
  service = 'EP';
  assemblyName = 'EP';
  entity = 'EP_BookingStationery';
  className = 'BookingsBusiness';
  method = 'GetListStationeryAsync';
  idField = 'recID';

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data;
    this.dialog = dialog;
  }

  onInit(): void {
    this.epService
      .getComboboxName(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
      });
    this.initForm();
  }

  initForm() {
    this.epService
      .getFormGroup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        if (res) {
          this.dialogListStationery = res;
          this.isAfterRender = true;
        } else {
        }
      });
  }

  valueChange(event) {}

  search(event) {}

  click(event) {}

  clickMF(event, data) {}

  closeAddForm(event) {}

  setIconColor(resourceType) {
    let iconColor: string = '';
    switch (resourceType) {
      case '1':
        iconColor = '#104207';
        break;
      case '2':
        iconColor = '#29b112';
        break;
      case '6':
        iconColor = '#053b8b';
        break;
      default:
        iconColor = '';
        break;
    }

    return iconColor;
  }

  setIcon(resourceType) {
    let icon: string = '';
    switch (resourceType) {
      case '1':
        icon = 'icon-calendar_today';
        break;
      case '2':
        icon = 'icon-directions_car';
        break;
      case '6':
        icon = 'icon-desktop_windows';
        break;
      default:
        icon = '';
        break;
    }

    return icon;
  }
}
