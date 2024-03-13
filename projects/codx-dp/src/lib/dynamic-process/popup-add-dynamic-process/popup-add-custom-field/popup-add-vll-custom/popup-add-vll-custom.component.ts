import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { tempVllDP } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-popup-add-vll-custom',
  templateUrl: './popup-add-vll-custom.component.html',
  styleUrls: ['./popup-add-vll-custom.component.css'],
})
export class PopupAddVllCustomComponent implements OnInit {
  @ViewChild('viewComboxForm') viewComboxForm: ComboBoxComponent; ///cobx xem truoc ViewForm add VLL
  @ViewChild('toolDeleted') toolDeleted: TemplateRef<any>;

  crrVll: tempVllDP;
  titleForm = 'Value List'; //tesst
  formModelVll: FormModel = {
    formName: 'ValueList',
    gridViewName: 'grvValueList',
    entityName: 'SYS_ValueList',
  };
  listName: any;
  fomartVll = 'DPF'; //format

  datasVll = [];
  fieldsResourceVll = { text: 'textValue', value: 'value' };
  crrValue = '';

  idxEdit = -1;
  popover: any;
  idxDeleted = -1;

  listVllCus: any;
  dialog: DialogRef;
  action = 'add';
  isCheckBox = false;

  constructor(
    private changeRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.crrVll = JSON.parse(JSON.stringify(dt?.data?.data));
    this.datasVll = JSON.parse(JSON.stringify(dt?.data?.datasVll));
    this.action = dt?.data?.action;
    this.isCheckBox = dt?.data?.isCheckBox;
  }

  ngOnInit(): void {}

  onAddTextValue(e) {
    if (!e.value || e.value.trim() == '') return;

    let dataValue = {
      textValue: e.value,
      value: this.datasVll.length,
    };

    this.datasVll.push(dataValue);

    e.value = '';
    e.focus();
    if (this.viewComboxForm) this.viewComboxForm.refresh();
    this.changeRef.detectChanges();
  }

  onEditTextValue(e, i) {
    if (!e.value || e.value.trim() == '') return;
    let dataValue = {
      textValue: e.value,
      value: i,
    };
    this.datasVll[i] = dataValue;
    let eleAdd = document.getElementById('textAddValue');
    if (eleAdd) {
      eleAdd.focus();
      eleAdd.inputMode = '';
    }
    this.idxEdit = -1;

    if (!this.viewComboxForm) this.viewComboxForm.refresh();
    this.changeRef.detectChanges();
  }

  onChangeVll(e) {
    if (e.field == 'multiSelect') {
      this.crrVll[e.field] = e.data;
      return;
    }

    this.crrVll[e.field] = e.data;
  }

  deletedValue(i) {
    if (i == -1) return;
    this.datasVll.splice(i, 1);
    // this.idxDeleted = -1;
    if (this.viewComboxForm) this.viewComboxForm.refresh();
  }

  handelTextValue(i) {
    this.idxEdit = i;
    this.changeRef.detectChanges();
  }

  showPopoverDeleted(p, i) {
    this.idxDeleted = i;
    if (this.popover && this.popover.isOpen()) this.popover.close();
    p.open();
    this.popover = p;
  }

  saveVll() {
    if (!this.crrVll.note || this.crrVll.note.trim() == '') {
      this.notiService.notifyCode('CM049');
      return;
    }

    if (!this.datasVll || this.datasVll?.length == 0) {
      this.notiService.notifyCode('CM050');
      return;
    }
    let vl = [];
    if (this.crrVll.listType == '1') {
      vl = this.datasVll.map((x) => {
        return x.textValue;
      });
    } else {
      this.datasVll.forEach((x) => {
        vl.push(x.value);
        vl.push(x.textValue);
      });
    }
    this.crrVll.defaultValues = this.crrVll.customValues = vl.join(';');

    let menthol =
      this.action == 'edit'
        ? 'EditValuelistCustomsAsync'
        : 'AddValuelistCustomsAsync';

    this.api
      .execSv('SYS', 'SYS', 'ValueListBusiness', menthol, this.crrVll)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode(
            this.action == 'edit' ? 'SYS007' : 'SYS006'
          );
          this.dialog.close(this.crrVll);
        }
      });
  }
}
