import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';

@Component({
  selector: 'lib-popup-add-auto-number',
  templateUrl: './popup-add-auto-number.component.html',
  styleUrls: ['./popup-add-auto-number.component.scss'],
})
export class PopupAddAutoNumberComponent implements OnInit {
  dialogAutoNum: FormGroup;
  dialog: DialogRef;
  isAfterRender = false;
  formModel: FormModel;
  formModelData: FormModel;

  headerText = 'Thiết lập số tự động';
  subHeaderText = '';

  constructor(
    private auth: AuthStore,
    private cache: CacheService,
    private fb: FormBuilder,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formModelData = data?.data;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.cache
      .gridViewSetup('AutoNumbers', 'grvAutoNumbers')
      .subscribe((gv) => {
        var model = {};
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              element.fieldName =
                element.fieldName.charAt(0).toLowerCase() +
                element.fieldName.slice(1);
              model[element.fieldName] = [];

              if (element.fieldName == 'owner') {
                model[element.fieldName].push(user.userID);
              }
              if (element.fieldName == 'createdOn') {
                model[element.fieldName].push(new Date());
              } else if (element.fieldName == 'stop') {
                model[element.fieldName].push(false);
              } else if (element.fieldName == 'orgUnitID') {
                model[element.fieldName].push(user['buid']);
              } else if (
                element.dataType == 'Decimal' ||
                element.dataType == 'Int'
              ) {
                model[element.fieldName].push(0);
              } else if (
                element.dataType == 'Bool' ||
                element.dataType == 'Boolean'
              )
                model[element.fieldName].push(false);
              else if (element.fieldName == 'createdBy') {
                model[element.fieldName].push(user.userID);
              } else {
                model[element.fieldName].push(null);
              }

              // if (element.isRequire) {
              //   model[element.fieldName].push(
              //     Validators.compose([Validators.required])
              //   );
              // } else {
              //   model[element.fieldName].push(Validators.compose([]));
              // }
            }
          }
          this.dialogAutoNum = this.fb.group(model, { updateOn: 'blur' });
          this.isAfterRender = true;
          console.log(this.dialogAutoNum);
        }
      });
  }

  valueChange(event) {}

  onSaveForm() {}
}
