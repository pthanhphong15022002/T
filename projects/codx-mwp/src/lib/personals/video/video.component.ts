import { AuthStore, CodxService, ApiHttpService, CodxListviewComponent, CacheService, AuthService } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

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
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
  }
  file_video: any[] = [];


  @ViewChild('listview') listview: CodxListviewComponent;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private auth: AuthService,
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
    this.api.exec<any>('ERM.Business.DM', 'FileBussiness', 'GetFilesByObjectTypeAsync', 'WP_Comments').
      subscribe((files: any[]) => {
        if (files.length > 0) {
          files.forEach((f: any) => {
            if (f.referType == this.FILE_REFERTYPE.VIDEO) {
              f['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.auth.userValue.token}`;
              this.file_video.push(f);
            }
          });
          this.dt.detectChanges();
        }
      })
  }
}
