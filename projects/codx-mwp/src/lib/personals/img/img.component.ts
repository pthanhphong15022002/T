import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  CodxService,
  ApiHttpService,
  CodxListviewComponent,
  CacheService,
  AuthService,
  CallFuncService,
  CRUDService,
  ScrollComponent,
} from 'codx-core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  Injector,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import { FileService } from '@shared/services/file.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';

@Component({
  selector: 'app-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss'],
})
export class ImgComponent implements OnInit, AfterViewInit {
  urlUpload = environment.urlUpload;
  data: any = [];
  user: any;
  functionList = {
    entityName: '',
    funcID: '',
  };
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
  };
  file_img: any[] = [];
  predicate = `ObjectType=@0 && IsDelete=@1 && CreatedBy=@2 && ReferType=@3`;
  dataValue: any;
  dtService: CRUDService;

  @ViewChild('listView') listView: CodxListviewComponent;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private fileService: FileService,
    private callfc: CallFuncService,
    private auth: AuthStore,
    private shareService: CodxShareService,
    private injector: Injector
  ) {
    this.user = this.auth.get();
    this.dataValue = `WP_Comments;false;${this.user?.userID};image`;
  }

  ngOnInit(): void {
    this.cache.functionList('WP').subscribe((res) => {
      if (res) {
        this.functionList.entityName = res.entityName;
        this.functionList.funcID = res.functionID;
      }
    });
  }

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  openImg(item) {
    this.fileService.getFile(item.recID).subscribe((data) => {
      this.callfc.openForm(
        ViewFileDialogComponent,
        data.fileName,
        1000,
        800,
        '',
        data,
        ''
      );
    });
  }

  getThumb(file: any) {
    if (file.pathDisk) {
      return this.shareService.getThumbByUrl(file.pathDisk, 300);
    }
    return '/assets/themes/wp/default/img/Image_NoData.svg';
  }
}
