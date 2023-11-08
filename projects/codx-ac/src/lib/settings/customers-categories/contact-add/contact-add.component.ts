import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
@Component({
  selector: 'lib-pop-add-contact',
  templateUrl: './contact-add.component.html',
  styleUrls: ['./contact-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  dialog: DialogRef;
  dialogData: DialogData;
  headerText: string;
  dataDefault:any;
  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = {...dialogData.data?.dataDefault};
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
  }
  //#endregion

  //#region Function
  clearContact() {
    this.form.formGroup.reset();
    //this.contact = new Contact();
  }
  
  //#endregion

  //#region Method
  onSave() {
    let validate = this.form.validation(true,false); //? chekc validate tỷ giá
    if(validate) return;
    this.dialog.close({contact:{...this.form.data}});
  }
  onSaveAdd() {
    
  }
  //#endregion
}
