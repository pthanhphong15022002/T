import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'lib-customized-multi-select-popup',
  templateUrl: './customized-multi-select-popup.component.html',
  styleUrls: ['./customized-multi-select-popup.component.css'],
})
export class CustomizedMultiSelectPopupComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  formTitle$: Observable<string>;
  selectedOptions: { value: string; text: string }[] = [];
  dimControls$: Observable<any[]>;

  constructor(
    private injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    try {
      this.selectedOptions = JSON.parse(dialogData.data.selectedOptions) ?? [];
    } catch {}
  }

  //#endregion

  //#region Init
  onInit(): void {
    this.formTitle$ = this.cache
      .moreFunction('DIM', 'grvDIM')
      .pipe(
        map((data) => data.find((m) => m.functionID === 'ACT03')?.defaultName)
      );

    this.cache
      .viewSettingValues('AC1')
      .pipe(
        tap((o) => console.log(o)),
        map((data) => JSON.parse(data.dataValue).ACS155.split(';')),
        tap((o) => console.log(o))
      )
      .subscribe((settingValues) => {
        this.dimControls$ = this.cache.valueList('AC069').pipe(
          map((data) =>
            data.datas.map((d) => ({
              value: d.value,
              text: d.text,
              checked: this.selectedOptions?.some((o) => o.value === d.value),
              disabled: !settingValues.includes(d.value),
            }))
          ),
          tap((data) => console.log(data))
        );
      });
  }
  //#endregion

  //#region Event
  handleClickSave(): void {
    console.log(this.selectedOptions);
    this.dialogRef.close(JSON.stringify(this.selectedOptions));
  }

  handleChange(e, data): void {
    console.log(e);

    if (e.data) {
      if (!this.selectedOptions?.some((o) => o.value === data.value)) {
        this.selectedOptions.push({ value: data.value, text: data.text });
      }
    } else {
      this.selectedOptions = this.selectedOptions.filter(
        (o) => o.value !== data.value
      );
    }
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
