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
  selectedOptions: string;
  dimControls$: Observable<any[]>;

  constructor(
    private injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.selectedOptions = dialogData.data.selectedOptions;
  }

  //#endregion

  //#region Init
  onInit(): void {
    this.formTitle$ = this.cache
      .moreFunction('DIM', 'grvDIM')
      .pipe(
        map((data) => data.find((m) => m.functionID === 'ACT03')?.defaultName)
      );

    this.dimControls$ = this.cache.valueList('AC069').pipe(
      map((data) => data.datas),
      tap((data) => console.log(data))
    );
  }
  //#endregion

  //#region Event
  handleClickSave(): void {
    this.dialogRef.close(this.selectedOptions);
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
