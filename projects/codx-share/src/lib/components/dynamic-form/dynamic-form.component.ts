import { FormGroup } from '@angular/forms';
import { UIComponent, FormModel, DialogRef } from 'codx-core';
import { Component, Injector, Input } from '@angular/core';

@Component({
  selector: 'codx-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent extends UIComponent {
  @Input() formModel: FormModel;
  @Input() data: any;
  @Input() isAdd: boolean = true;
  formGroup: FormGroup
  dialog: DialogRef;
  funcID: string;
  formName: string;
  gridViewName: string;

  constructor(private inject: Injector,) {
    super(inject)
  }

  onInit(): void {
    debugger;
    const { funcID, formName, gridViewName } = this.formModel
    this.funcID = funcID
    this.formName = formName
    this.gridViewName = gridViewName
    var obj: { [key: string]: any } = {};
    this.cache.gridViewSetup(formName, gridViewName).subscribe((gv) => {
      if (gv) {
        for (const key in gv) {
          if (Object.prototype.hasOwnProperty.call(gv, key)) {
            const element = gv[key];
            if (element?.referedValue != null) {
              obj[key] = element.referedValue;
              console.log(obj[key])
            }
          }
        }
      }
    })
  }

  beforeSave(option: any) {
    let itemData = this.formGroup.value;
    if (!itemData.recID) {
      this.isAdd = true;
    } else {
      this.isAdd = false;
    }
    option.method = this.dialog.dataService.method;
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

}
