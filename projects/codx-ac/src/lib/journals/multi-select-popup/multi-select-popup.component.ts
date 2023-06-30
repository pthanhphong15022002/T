import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-multi-select-popup',
  templateUrl: './multi-select-popup.component.html',
  styleUrls: ['./multi-select-popup.component.css'],
})
export class MultiSelectPopupComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  selectedOptions: string[] = [];
  showAll: boolean = false;
  visibleIdimControls: any[];
  formTitle$: Observable<string>;

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.selectedOptions = dialogData.data.selectedOptions?.split(';') ?? [];
    this.showAll = dialogData.data.showAll;
  }

  //#endregion

  //#region Init
  onInit(): void {
    this.formTitle$ = this.acService.getDefaultNameFromMoreFunctions(
      'DIM',
      'grvDIM',
      'ACT03'
    );

    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        tap((o) => console.log(o)),
        map((arr) => arr.filter((f) => f.category === '1')?.[0]),
        map((data) => JSON.parse(data.dataValue)?.IDIMControl?.split(';')),
        tap((o) => console.log(o))
      )
      .subscribe((settingIdimControls) => {
        this.cache
          .valueList('AC069')
          .pipe(
            map((data) =>
              data.datas
                .filter((d) =>
                  this.showAll ? true : settingIdimControls?.includes(d.value)
                )
                .map((d) => ({
                  value: d.value,
                  text: d.text,
                  checked: this.selectedOptions?.includes(d.value),
                }))
            )
          )
          .subscribe((res) => {
            this.visibleIdimControls = res;
          });
      });
  }
  //#endregion

  //#region Event
  onClickSave(): void {
    this.dialogRef.close(
      this.selectedOptions
        .filter((s) => this.visibleIdimControls.some((v) => v.value === s))
        .join(';')
    );
  }

  onChange(e, data): void {
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
