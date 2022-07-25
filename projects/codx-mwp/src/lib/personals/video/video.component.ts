import { AuthStore, CodxService, ApiHttpService, CodxListviewComponent, CacheService } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  data: any = [];
  functionList = {
    entityName: '',
    funcID: '',
  }


  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
  ) {
    this.cache.functionList('WP').subscribe(res => {
      this.functionList.entityName = res.entityName;
      this.functionList.funcID = res.functionID;
    })
  }

  ngOnInit(): void {
    this.getFile();
  }

  ngAfterViewInit() {
  }

  getFile() {
    this.api.exec<any>('ERM.Business.DM', 'FileBussiness', 'GetFilesByObjectTypeAsync', 'WP_Comments').subscribe(res => {
      if (res) {
        this.data = res;
        console.log("check getFile", res);
      }
    })
  }
}
