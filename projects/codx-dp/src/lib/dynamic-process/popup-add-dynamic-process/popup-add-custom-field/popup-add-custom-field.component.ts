import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef } from 'codx-core';
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

  constructor(
    private changdef: ChangeDetectorRef,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.cache
      .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
        }
      });
  }

  ngOnInit(): void {}

  valueChangeCbx(e) {}

  valueChange(e) {
  }

  valueChangeRating(e) {
  
  }

  saveData() {
    this.dialog.close(this.field);
  }
}
