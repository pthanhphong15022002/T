import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { ContactAddComponent } from '../contact-add/contact-add.component';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-address',
  templateUrl: './address-add.component.html',
  styleUrls: ['./address-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressAddComponent extends UIComponent{
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  dialog: DialogRef;
  dialogData: DialogData;
  headerText: string;
  dataDefault:any;
  objectID:any;
  objectName : any;
  objectType : any;
  private destroy$ = new Subject<void>();
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
    this.dataDefault = dialogData.data?.dataDefault;
  }
  //#endregion

  //#region Init
  onInit(): void {
    // this.cache.message('AC0033').subscribe((res) => {
    //   if (res) {
    //     this.lblAdd = res?.customName;
    //   }
    // });

    // this.cache.message('AC0034').subscribe((res) => {
    //   if (res) {
    //     this.lblEdit = res?.customName;
    //   }
    // });
    // this.cache.moreFunction('Contacts', 'grvContacts').subscribe((res) => {
    //   if (res && res.length) {
    //     let m = res.find((x) => x.functionID == 'ACS20501');
    //     if (m) {
    //       this.lblContacts = m.defaultName.toLowerCase();
    //     }
    //   }
    // })
  }
  ngAfterViewInit() {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  
  //#endregion Function

  //#region Method
  onSave() {
    let validate = this.form.validation();
    if(validate) return;
    this.dialog.close({...this.form.data});
  }
  //#endregion
}
