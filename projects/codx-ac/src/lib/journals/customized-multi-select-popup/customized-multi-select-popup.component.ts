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
  selectedOptions: string[] = [];
  dimControls$: Observable<any[]>;

  constructor(
    private injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.selectedOptions = dialogData.data.selectedOptions?.split(",") ?? [];
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
      .viewSettingValues('ACParameters')
      .pipe(
        tap((o) => console.log(o)),
        map((arr) => arr.filter((f) => f.category === '1')?.[0]),
        map((data) => JSON.parse(data.dataValue)?.IDIMControl?.split(';')),
        tap((o) => console.log(o))
      )
      .subscribe((settingValues) => {
        this.dimControls$ = this.cache.valueList('AC069').pipe(
          map((data) =>
            data.datas
              .filter((d) => settingValues.includes(d.value))
              .map((d) => ({
                value: d.value,
                text: d.text,
                checked: this.selectedOptions?.some((o) => o === d.value),
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
    this.dialogRef.close(this.selectedOptions.toString());
  }

  handleChange(e, data): void {
    console.log(e);

    if (e.data) {
      if (!this.selectedOptions?.some((o) => o === data.value)) {
        this.selectedOptions.push(data.value);
      }
    } else {
      this.selectedOptions = this.selectedOptions.filter(
        (o) => o !== data.value
      );
    }
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
