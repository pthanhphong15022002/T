import { Component } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { DialogModel } from 'codx-core';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';

@Component({
  selector: 'lib-property-text',
  templateUrl: './property-text.component.html',
  styleUrls: ['./property-text.component.css']
})
export class PropertyTextComponent extends BasePropertyComponent{

  openAutoNumberForm()
  {
    this.cache
    .valueList('BP026')
    .subscribe((res) => {
      if (res && res.datas.length > 0) {
        let data = {
          autoNoCode: "",
          description: res.datas[0]?.text,
          disableAssignRule: true,
          autoAssignRule: "",
          referenceAutoNumer: 'BP026'
        };
        let option = new DialogModel();
        option.IsFull = true;
        let dialog = this.callFuc.openForm(
          PopupAddAutoNumberComponent,
          '',
          0,
          0,
          '',
          data,
          '',
          option
        );
        dialog.closed.subscribe((res) => {
          if (res.event) {
            // this.formJournal.form.setValue(
            //   'voucherFormat',
            //   res.event.autoNoCode,
            //   {}
            // );
          }
        });
      }
    });
  }
}
