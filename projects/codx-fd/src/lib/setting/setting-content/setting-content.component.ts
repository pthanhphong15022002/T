import { Component, Injector, Input, Optional } from '@angular/core';
import {
  UIComponent,
  LayoutService,
  PageTitleService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { CodxFdService } from '../../codx-fd.service';

@Component({
  selector: 'lib-setting-content',
  templateUrl: './setting-content.component.html',
  styleUrls: ['./setting-content.component.scss'],
})
export class SettingContentComponent extends UIComponent {
  constructor(
    private injector: Injector,
    private fdService: CodxFdService,
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    if (dt?.data) {
      this.groupSettings = dt?.data?.groupSettings;
      this.setingValues = dt?.data?.setingValues;
      this.curLineType = dt?.data?.curLineType;
      this.formName = dt?.data?.formName;
      this.cate = dt?.data?.cate;
      this.row = dt?.data?.row;
      this.firstLineType = this.curLineType + 1;
      this.isForm = true;
      this.dialog = dialog;
    }
  }

  @Input() groupSettings: Map<string, any[]>;
  @Input() setingValues: Map<string, Map<string, string>>;
  @Input() lstPolicies = [];
  @Input() curLineType;
  @Input() formName = 'FDParameters';
  @Input() formModel: FormModel;

  @Input() cate;
  curGroup = null;
  refQueue = [];
  isForm = false;
  firstLineType = 1;
  dialog;
  row;
  onInit(): void {
    if (this.isForm && this.row) {
      this.changeLineType(this.row, true);
    }
  }
  ngAfterViewInit(): void {}
  changeLineType(row, isNext) {
    if (isNext) {
      this.curLineType++;
      this.refQueue.push(row.recID);
    } else {
      this.curLineType--;
      this.refQueue.pop();
    }
    this.curGroup = row;

    this.detectorRef.detectChanges();
  }

  changeTabs() {
    this.curLineType = 1;
    this.detectorRef.detectChanges();
  }

  changeFieldValue(formName, transType, category, evt) {
    let isChange = false;
    if (this.setingValues[transType][evt.field] != evt.data) {
      isChange = true;
    }
    if (typeof evt.data === 'boolean') {
      this.setingValues[transType][evt.field] = evt.data ? '1' : '0';
    } else {
      this.setingValues[transType][evt.field] = evt.data;
    }
    if (isChange) {
      this.fdService
        .updateSettingValue(
          formName,
          transType,
          category,
          evt.field,
          this.setingValues[transType][evt.field]
        )
        .subscribe((res) => {
          console.log('update res', res);
        });
    }
  }
  changeActivePolicy(row, evt) {
    if (evt.data != row.actived) {
      this.fdService.updateActivePolicy(row.policyRecID).subscribe((res) => {
        if (res) {
          row.actived = evt.data;
          // this.detectorRef.detectChanges();
        }
      });
    }
  }

  openPopup(evt, row) {
    let obj = {
      groupSettings: this.groupSettings,
      setingValues: this.setingValues,
      curLineType: this.curLineType,
      formName: this.formName,
      cate: this.cate,
      row: row,
    };
    this.dialog = this.callfc.openForm(
      SettingContentComponent,
      '',
      500,
      800,
      '',
      obj,
      ''
    );
  }

  closePopUp() {
    this.dialog?.close();
  }
}
