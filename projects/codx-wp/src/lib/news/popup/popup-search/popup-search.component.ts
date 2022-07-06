import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiHttpService, CacheService, CodxService, DataRequest, ViewModel, ViewType } from 'codx-core';
import { ElecticSearchComponent } from './electic-search/electic-search.component';

@Component({
  selector: 'app-popup-search',
  templateUrl: './popup-search.component.html',
  styleUrls: ['./popup-search.component.scss']
})
export class PopupSearchComponent implements OnInit, AfterViewInit {

  formGroup: FormGroup;
  startDateValue: Date;
  endDateValue: Date;
  listValueList = [];
  listTag: any;
  totalRowCount = 0;
  dataSearch: any;
  views: Array<ViewModel> = [];
  @ViewChild('templateElectic') Electic : ElecticSearchComponent;

  constructor(
    private api: ApiHttpService,
    private codxService: CodxService,
    private cache: CacheService,
    private dt: ChangeDetectorRef
  ) {
    this.cache.valueList('L1492').subscribe((res) => {
      this.listValueList = res.datas;
    });
  }
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loadData();
  }


  loadData() {
    this.api.execSv("BS", "ERM.Business.BS", "TagsBusiness", "GetListTmpTagsByName", "WP_News").subscribe(
      (res) => {
        this.listTag = res;
        this.dt.detectChanges();
      });
  }

  clickTag(data: any) {
    data.isChecked = !data.isChecked;
    this.dt.detectChanges();
  }

  clickSearchElectic(textSearch: any) {
    this.api.execNonDB<any>(
      "Background",
      "ElastisSearchBusinesss",
      "SearchObjectAsync",
      [textSearch, "WPT02", "tester"]
    )
      .subscribe((res) => {
        console.log('clickSearchElectic', res)
        this.Electic.dataSource = res.data;
        this.totalRowCount = res.total
        this.dt.detectChanges();
      });
  }
}
