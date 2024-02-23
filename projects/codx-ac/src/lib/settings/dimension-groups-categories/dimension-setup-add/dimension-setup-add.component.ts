import {
  ChangeDetectionStrategy,
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
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-dimension-setup',
  templateUrl: './dimension-setup-add.component.html',
  styleUrls: ['./dimension-setup-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DimensionSetupAddComponent extends UIComponent implements OnInit
{
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  dialogData!: DialogData;
  headerText: string;
  dataDefault: any;
  isPopupCbb: any;
  dataCbx: any;
  objectDimensionControl: Array<any> = [];
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData?.data?.dataDefault };
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
  }
  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy() {
    this.onDestroy();
  }
  //#endregion

  //#region Function
  clickSave(e: any) {
    // if (!e || !e?.dataSelected) {
    //   this.isPopupCbb = false;
    //   return;
    // }
    // this.objectDimensionControl = [];
    // let data = e.dataSelected;
    // let value = '';
    // if (data && data.length > 0) {
    //   data.map((element: any) => {
    //     this.objectDimensionControl.push({
    //       entityName: element.EntityName,
    //       dimGroupID: null,
    //       recID: Util.uid(),
    //       dimType: this.type,
    //     });
    //   });
    // }
    // this.objectDimensionControl.forEach((element) => {
    //   value += element.entityName + ';';
    // });
    // this.dataCbx = value.substring(0, value.length - 1);
    // this.isPopupCbb = false;
  }
  openPopup() {
    //this.isPopupCbb = true;
  }
  //#endregion

  //#region CRUD
  onSave() {
    this.dialog.close({data:this.form.data});
  }
  //#endregion
}
