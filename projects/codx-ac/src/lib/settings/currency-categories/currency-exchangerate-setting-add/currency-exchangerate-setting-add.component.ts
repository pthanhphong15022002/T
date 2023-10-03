import { ChangeDetectionStrategy, Component, Injector, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-currency-exchangerate-setting-add',
  templateUrl: './currency-exchangerate-setting-add.component.html',
  styleUrls: ['./currency-exchangerate-setting-add.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangeRateSettingAddComponent extends UIComponent implements OnInit {

  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  headerText: string;
  dialog: any;
  dialogData:DialogData;
  dataDefault:any;
  multiplication: any;
  division: any;
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dialogData: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = {...dialogData?.data?.dataDefault};
    if (dialogData?.data?.dataDefault?.multi){
      this.multiplication = true;
      this.division = false;
    }else{
      this.multiplication = false;
      this.division = true;
    }
  }
  //#endregion Contructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Function

  /**
   * *Hàm xử lí thay đổi value
   * @param e 
   */
  valueChange(e: any) {
    switch(e.field.toLowerCase()){
      case 'currencydate':
        if (e.component.name.toLowerCase() == 'currentdate') {
          this.form.data.calculation = '1';
        } else {
          this.form.data.calculation = '2';
        }
        break;
      case 'currencymulti':
        if (e.component.name.toLowerCase() == 'multiplication') {
          this.form.data.multi = true;
          this.multiplication = true;
          this.division = false;
        } else {
          this.form.data.multi = false;
          this.multiplication = false;
          this.division = true;
        }
        break;
    }
  }
  //#endregion Function

  //#region Method

  /**
   * *Hàm lưu thiết lập tỷ giá
   */
  onSave() {
    this.dialog.close({calculation:this.form.data.calculation,multi:this.form.data.multi});
  }
  //#endregion Method
}
