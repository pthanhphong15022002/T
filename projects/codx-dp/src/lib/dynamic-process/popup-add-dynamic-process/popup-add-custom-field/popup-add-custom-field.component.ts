import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  SliderTickEventArgs,
  SliderTickRenderedEventArgs,
} from '@syncfusion/ej2-angular-inputs';
import {
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
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
  action = 'add';
  titleAction = 'Thêm';
  //
  value: number = 5;
  min: number = 0;
  max: number = 10;
  step = '1';
  type: string = 'MinRange';
  format: string = 'n0';
  ticks: Object = {
    placement: 'Both',
    largeStep: 1,
    smallStep: 1,
    showSmallTicks: true,
  };
  tooltip: Object = { isVisible: true, placement: 'Before', showOn: 'Hover' };

  fields = { text: 'stepName', value: 'recID' };
  stepList = [];
  itemView = '';
  vllDynamic = 'DP0271';
  constructor(
    private changdef: ChangeDetectorRef,
    private cache: CacheService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.field = JSON.parse(JSON.stringify(dt?.data[0]));
    this.action = dt?.data[1];
    this.titleAction = dt?.data[2];
    this.stepList = dt?.data[3];

    this.value = this.field.rank;
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
    this.changdef.detectChanges();
  }

  valueChangeCbx(e) {}

  valueChange(e) {
    // if (e?.field == 'dataType') {
    //   if(this.field.dataType != e.data) this.field.dataFormat =null ;
    //   switch (e?.data) {
    //     case 'N':
    //       this.vllDynamic = 'DP0271';
    //       break;
    //     case 'L':
    //       this.vllDynamic = 'DP0272';
    //       break;
    //     case 'T':
    //       this.vllDynamic = 'DP0273';
    //       break;
    //     case 'D':
    //       this.vllDynamic = 'DP0274';
    //       break;
    //     case 'P':
    //       this.vllDynamic = 'DP0275';
    //       break;
    //   }
    // }
    if (e && e.data && e.field) this.field[e.field] = e.data;
    this.changdef.detectChanges();
  }
  changeRequired(e) {
    this.field.isRequired = e.data;
  }
  valueChangeIcon(e) {
    if (e) this.field.rankIcon = e;
  }

  sliderChange(e) {
    this.field.rank = e?.value;
  }
  // khong dc xoa
  // renderingTicks(args: SliderTickEventArgs) {
  //   if (args.tickElement.classList.contains('e-large')) {
  //     args.tickElement.classList.add('e-custom');
  //   }
  // }
  //thay doi view duoiw
  // renderedTicks(args: SliderTickRenderedEventArgs) {
  //   let li = args.ticksWrapper.getElementsByClassName('e-large');
  //   let remarks: any = ['', '', '', '', '', '', '', '', '', '', '', ''];
  //   for (let i = 0; i < li.length; ++i) {
  //     (li[i].querySelectorAll('.e-tick-both')[1] as HTMLElement).innerText =
  //       remarks[i];
  //   }
  // }
  cbxChange(value) {
    if (value) this.field['stepID'] = value;
  }

  saveData() {
    if (this.field.fieldName == null || this.field.fieldName.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['FieldName']?.headerText + '"'
      );
      return;
    }
    if (!this.field.dataType) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['DataType']?.headerText + '"'
      );
      return;
    }
    if (!this.field.dataFormat) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['DataFormat']?.headerText + '"'
      );
      return;
    }

    if (this.field.note == null || this.field.note.trim() == '') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['Note']?.headerText + '"'
      );
      return;
    }

    this.dialog.close(this.field);
  }
}
