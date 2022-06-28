import { AuthStore, CodxService, ApiHttpService } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

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
  check = "62908918ad16643a2ff34a43";
  data: any = [];
  checkPredicate = '';

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

  }

  valueProperty(event) {
    this.data = event?.datas;
  }
}
