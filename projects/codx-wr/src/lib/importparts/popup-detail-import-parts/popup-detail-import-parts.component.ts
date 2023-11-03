import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { ApiHttpService, DataRequest, DialogData, DialogRef } from 'codx-core';
import { Observable, finalize, map, firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-popup-detail-import-parts',
  templateUrl: './popup-detail-import-parts.component.html',
  styleUrls: ['./popup-detail-import-parts.component.css'],
})
export class PopupDetailImportPartsComponent {
  request = new DataRequest();
  predicates = 'SessionID=@0';
  dataValues = '';
  service = 'WR';
  assemblyName = 'ERM.Business.Core';
  className = 'DataBusiness';
  method = 'LoadDataAsync';

  data: any;
  lstImportParts = [];
  dialog: DialogRef;
  loaded: boolean;
  constructor(
    private api: ApiHttpService,
    private detectoref: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.loadData();
  }

  async loadData() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.data?.recID;
    this.request.entityName = 'WR_tempImportParts';
    this.request.pageLoading = false;
    this.lstImportParts = await firstValueFrom(this.fetch());
    this.loaded = true;
    this.detectoref.detectChanges();
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response ? response[0] : [];
        })
      );
  }
}
