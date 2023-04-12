import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'lib-single-select-popup',
  templateUrl: './single-select-popup.component.html',
  styleUrls: ['./single-select-popup.component.css'],
})
export class SingleSelectPopupComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  formTitle: string = '';
  parentAccounts: { AccountID: string; AccountName: string }[] = [];
  selectedOption: string;

  constructor(
    private injector: Injector,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.selectedOption = dialogData.data.selectedOption;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .moreFunction('ChartOfAccounts', 'grvChartOfAccounts')
      .pipe(map((data) => data.find((m) => m.functionID === 'ACT01')))
      .subscribe((res) => (this.formTitle = res.defaultName));

    this.loadComboboxData('ParentAccounts').subscribe((res) => {
      console.log(res);
      this.parentAccounts = res;
    });
  }
  //#endregion

  //#region Event
  handleClickSave(): void {
    this.dialogRef.close(this.selectedOption);
  }
  //#endregion

  //#region Method
  loadComboboxData(name: string): Observable<any> {
    const dataRequest = new DataRequest();
    dataRequest.comboboxName = name;
    dataRequest.pageLoading = false;
    return this.api
      .execSv('AC', 'ERM.Business.Core', 'DataBusiness', 'LoadDataCbxAsync', [
        dataRequest,
      ])
      .pipe(
        filter((p) => !!p),
        map((p) => JSON.parse(p[0]))
      );
  }
  //#endregion

  //#region Function
  //#endregion
}
