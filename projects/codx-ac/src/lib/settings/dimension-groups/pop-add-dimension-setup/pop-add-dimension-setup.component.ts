import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  DialogRef,
  FormModel,
  DialogData,
  Util,
} from 'codx-core';
import { DimensionSetup } from '../../../models/DimensionSetup.model';
import { DimensionControl } from '../../../models/DimensionControl.model';

@Component({
  selector: 'lib-pop-add-dimension-setup',
  templateUrl: './pop-add-dimension-setup.component.html',
  styleUrls: ['./pop-add-dimension-setup.component.css'],
})
export class PopAddDimensionSetupComponent
  extends UIComponent
  implements OnInit
{
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  dimensionSetup: DimensionSetup = new DimensionSetup();
  type: any;
  isPopupCbb: any;
  dataCbx: any;
  objectDimensionControl: Array<DimensionControl> = [];
  constructor(
    inject: Injector,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.isPopupCbb = false;
    this.dataCbx = '';
    let value = '';
    if (dialogData.data?.data != null) {
      this.dimensionSetup = dialogData.data?.data;
    }
    if (dialogData.data?.dataControl != null) {
      dialogData.data?.dataControl.forEach((element) => {
        if (element.dimType == this.type) {
          this.objectDimensionControl.push(element);
          value += element.entityName + ';';
        }
        this.dataCbx = value.substring(0, value.length - 1);
      });
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    if (this.dimensionSetup.dimType == null) {
      this.dimensionSetup.dimType = this.type;
    }
  }
  //#endregion

  //#region Function
  valueChange(e: any) {
    this.dimensionSetup[e.field] = e.data;
  }
  clickSave(e: any) {
    if (!e || !e?.dataSelected) {
      this.isPopupCbb = false;
      return;
    }
    this.objectDimensionControl = [];
    let data = e.dataSelected;
    let value = '';
    if (data && data.length > 0) {
      data.map((element: any) => {
        this.objectDimensionControl.push({
          entityName: element.EntityName,
          dimGroupID: null,
          recID: Util.uid(),
          dimType: this.type,
        });
      });
    }
    this.objectDimensionControl.forEach((element) => {
      value += element.entityName + ';';
    });
    this.dataCbx = value.substring(0, value.length - 1);
    this.isPopupCbb = false;
  }
  openPopup() {
    this.isPopupCbb = true;
  }
  //#endregion

  //#region CRUD
  onSave() {
    window.localStorage.setItem(
      'datadimensionSetup',
      JSON.stringify(this.dimensionSetup)
    );
    window.localStorage.setItem(
      'datadimensionControl',
      JSON.stringify(this.objectDimensionControl)
    );
    window.localStorage.setItem('type', JSON.stringify(this.type));
    this.dialog.close();
  }
  //#endregion
}
