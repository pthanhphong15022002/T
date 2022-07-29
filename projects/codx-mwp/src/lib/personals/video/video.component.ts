import {
  AuthStore,
  CodxService,
  ApiHttpService,
  CodxListviewComponent,
  CacheService,
  AuthService,
} from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit {
  data: any = [];
  functionList = {
    entityName: '',
    funcID: '',
  };
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
  };
  file_video: any[] = [];
  predicate = `ObjectType=@0 && IsDelete=@1 && CreatedBy=@2 && ReferType=@3`;
  dataValue: any;
  user: any;

  @ViewChild('listView') listview: CodxListviewComponent;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private auth: AuthService,
    private authStore: AuthStore
  ) {
    this.cache.functionList('WP').subscribe((res) => {
      this.functionList.entityName = res.entityName;
      this.functionList.funcID = res.functionID;
    });
    this.user = this.authStore.get();
    this.dataValue = `WP_Comments;false;${this.user?.userID};video`;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.listview.dataService.requestEnd = (t, d) => {
      if (d) this.getFile(d);
    };
  }

  getFile(data) {
    if (data.length > 0) {
      data.forEach((f: any) => {
        if (f.referType == this.FILE_REFERTYPE.VIDEO) {
          f['srcVideo'] = 
          `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.auth.userValue.token}`;
          this.file_video.push(f);
        }
      });
      console.log("cheeck video", this.file_video);
      this.dt.detectChanges();
    }
  }
}
