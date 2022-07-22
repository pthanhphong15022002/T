import { AuthStore, CodxService, ApiHttpService, CodxListviewComponent } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

  user: any;
  predicate = '';
  dataValue = '';
  dataSort: any;
  data: any = [];

  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(private authStore: AuthStore,
    private changedt: ChangeDetectorRef,
    private codxService: CodxService,
    private api: ApiHttpService,
    ) {
    this.user = this.authStore.get();
    this.predicate = `(CreatedBy="${this.user?.userID}")`;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.listview.dataService.requestEnd = (t, data) => {
      if (t == 'loaded')
        this.data = data;
    }
  }
}
