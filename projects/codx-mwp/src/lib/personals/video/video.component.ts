import {
  AuthStore,
  CodxService,
  ApiHttpService,
  CodxListviewComponent,
  CacheService,
  AuthService,
  ScrollComponent,
  CRUDService,
} from 'codx-core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  Injector,
} from '@angular/core';
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
  dtService: CRUDService;

  @ViewChild('listView') listview: CodxListviewComponent;

  constructor(
    private injector: Injector,
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private auth: AuthService,
    private authStore: AuthStore
  ) {
    this.cache.functionList('WP').subscribe((res) => {
      if (res) {
        this.functionList.entityName = res.entityName;
        this.functionList.funcID = res.functionID;
      }
    });
    this.user = this.authStore.get();
    this.dataValue = `WP_Comments;false;${this.user?.userID};video`;
    var dataSv = new CRUDService(injector);
    dataSv.request.gridViewName = 'grvFileInfo';
    dataSv.request.entityName = 'DM_FileInfo';
    dataSv.request.formName = 'FileInfo';
    //dataSv.request.pageSize = 15;
    this.dtService = dataSv;
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
    this.listview.dataService.requestEnd = (t, d) => {
      if (t == 'loaded') {
        if (d) this.getFile(d);
      }
    };
  }

  getFile(data) {
    // if (data.length > 0) {
    //   data.forEach((f: any) => {
    //     if (f.referType == this.FILE_REFERTYPE.VIDEO) {
    //       f[
    //         'srcVideo'
    //       ] = `${environment.urlUpload}/${f.pathDisk}`;
    //       //this.file_video.push(f);
    //       this.listview.dataService.data = [
    //         ...this.listview.dataService.data,
    //         ...[],
    //       ];
    //     }
    //   });
    //   console.log("check data", this.listview.dataService.data)
    //   this.dt.detectChanges();
    // }
  }

  getSrcVideo(data) {
    return (data['srcVideo'] = `${environment.urlUpload}/${data.pathDisk}`);
  }
}
