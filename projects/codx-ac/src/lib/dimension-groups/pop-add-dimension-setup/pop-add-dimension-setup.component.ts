import {
  ChangeDetectorRef,
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
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  DialogData,
} from 'codx-core';
import { Util } from 'konva/lib/Util';
import { CodxAcService } from '../../codx-ac.service';
import { DimensionControl } from '../../models/DimensionControl.model';
import { DimensionSetup } from '../../models/DimensionSetup.model';

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
  formModel: FormModel;
  dimensionSetup: DimensionSetup;
  type: any;
  isPopupCbb: any;
  dataCbx: any;
  dimensionControl: DimensionControl = {
    entityName: '',
    dimGroupID: '',
    recID: Guid.newGuid(),
    dimType: '',
  };
  objectDimensionControl: Array<DimensionControl> = [];
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
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
    this.formModel = this.form?.formModel;
    if (this.dimensionSetup == null) {
      this.dimensionSetup = this.form.formGroup.value;
      this.dimensionSetup.dimType = this.type;
      this.dimensionSetup.recID = Guid.newGuid();
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
          recID: Guid.newGuid(),
          dimType: this.type,
        });
      });
    }
    this.objectDimensionControl.forEach((element) => {
      value += element.entityName + ';';
    });
    this.dataCbx = value.substring(0, value.length - 1);
    this.isPopupCbb = false;
    console.log(this.objectDimensionControl);
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
//#region Guid
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
//#endregion
