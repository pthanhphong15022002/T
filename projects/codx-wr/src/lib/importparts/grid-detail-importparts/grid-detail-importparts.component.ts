import { Component, Input, SimpleChanges } from '@angular/core';
import { ApiHttpService, DataRequest, FormModel } from 'codx-core';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'lib-grid-detail-importparts',
  templateUrl: './grid-detail-importparts.component.html',
  styleUrls: ['./grid-detail-importparts.component.css']
})
export class GridDetailImportpartsComponent {
  @Input() dataSelected: any;
  @Input() formModel: FormModel;
  lstImportParts = [];
  loaded: boolean;
  request = new DataRequest();
  predicates = 'SessionID=@0';
  dataValues = '';
  service = 'WR';
  assemblyName = 'ERM.Business.Core';
  className = 'DataBusiness';
  method = 'LoadDataAsync';
  id: any;
  constructor(private api: ApiHttpService){

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelected']) {
      if (
        changes['dataSelected'].currentValue != null
      ) {
        if (changes['dataSelected']?.currentValue.recID == this.id) return;
        this.id = changes['dataSelected']?.currentValue.recID;
        this.loadData();
      } else {
        if (!this.loaded) this.loaded = true;
      }
    }

  }

  loadData() {
    this.loaded = false;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.dataSelected?.recID;
    this.request.entityName = 'WR_tempImportParts';
    this.request.pageLoading = false;
    this.fetch().subscribe(async (item) => {
      this.loaded = true;
      this.lstImportParts = item;
    });
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
