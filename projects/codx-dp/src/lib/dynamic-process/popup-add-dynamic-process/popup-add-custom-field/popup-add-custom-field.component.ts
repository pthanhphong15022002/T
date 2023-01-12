// import { Options } from '@angular-slider/ngx-slider';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, Util } from 'codx-core';
import { DP_Steps_Fields } from '../../../models/models';

@Component({
  selector: 'lib-popup-add-custom-field',
  templateUrl: './popup-add-custom-field.component.html',
  styleUrls: ['./popup-add-custom-field.component.css'],
})
export class PopupAddCustomFieldComponent implements OnInit {
  title = 'Thêm trường tùy chỉnh';
  dialog: DialogRef;
  field: DP_Steps_Fields;
  grvSetup: any;
  action ='add' ;
  titleAction ='Thêm' ;
  // value: number = 100;
  // options: Options = {
  //   floor: 0,
  //   ceil: 10,
  //   step: 1,
  //   showTicks: true,
  //   showTicksValues: true
  // };
  constructor(
    private changdef: ChangeDetectorRef,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.field = JSON.parse(JSON.stringify(dt?.data[0])) 
    this.action= dt?.data[1]
    this.titleAction= dt?.data[2]
  
    
    this.cache
      .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
        }
      });
  }

  ngOnInit(): void {
    if (!this.field.recID) this.field.recID = Util.uid();
  }

  valueChangeCbx(e) {}

  valueChange(e) {
    if (e && e.data && e.field) this.field[e.field] = e.data;
  }
  valueChangeIcon(e){
   debugger
  }
  valueChangeRating(e) {}

  saveData() {
    this.dialog.close(this.field);
  }
}
