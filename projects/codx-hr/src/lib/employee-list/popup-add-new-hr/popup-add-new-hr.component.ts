import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
} from '@angular/core';
import { UIComponent, DialogData, DialogRef, FormModel } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-add-new-hr',
  templateUrl: './popup-add-new-hr.component.html',
  styleUrls: ['./popup-add-new-hr.component.scss'],
})
export class PopupAddNewHRComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(inject);
    this.dialogRef = dialogRef;
    // this.formModel = ;
    this.funcID = this.dialogRef.formModel.funcID;
  }
  dialogRef: DialogRef;
  formModel: FormModel;
  funcID;

  data;
  title = '';
  hrID;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin nhân viên',
      name: 'tabInfoPersonal',
    },
    // {
    //   icon: 'icon-person',
    //   text: 'Nhân viên',
    //   name: 'tabInfoEmploy',
    // },
    // {
    //   icon: 'icon-receipt_long',
    //   text: 'Thông tin cá nhân',
    //   name: 'tabInfoPrivate',
    // },
    // {
    //   icon: 'icon-business_center',
    //   text: 'Pháp lý',
    //   name: 'tabInfoLaw',
    // },
  ];

  onInit(): void {
    //nho xoa
    this.hrID = 'Dang test';
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        this.formModel = res;
        console.log('form model', this.formModel);
      });
  }
  buttonClick(e: any) {
    console.log(e);
  }
  setTitle(e) {
    console.log('setTitle not done yet');

    this.title = e;
  }
  changeID(e) {
    console.log('changeID not done yet');
  }
  OnSaveForm() {
    console.log('save just add hr not done yet');
  }
}
