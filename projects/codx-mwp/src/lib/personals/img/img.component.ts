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
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { FileService } from '@shared/services/file.service';
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';

@Component({
  selector: 'app-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss'],
})
export class ImgComponent implements OnInit, AfterViewInit {
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
    private injector: Injector
  ) {
    this.cache.functionList('WP').subscribe((res) => {
      this.functionList.entityName = res.entityName;
      this.functionList.funcID = res.functionID;
    });
    this.user = this.auth.get();
    this.dataValue = `WP_Comments;false;${this.user?.userID};image`;
    var dataSv = new CRUDService(injector);
    dataSv.request.gridViewName = 'grvFileInfo';
    dataSv.request.entityName = 'DM_FileInfo';
    dataSv.request.formName = 'FileInfo';
    this.dtService = dataSv;
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    ScrollComponent.reinitialization();
  }

  // getFile() {
  //   this.api.exec<any>('ERM.Business.DM', 'FileBussiness', 'GetFilesByObjectTypeAsync', 'WP_Comments').
  //     subscribe((files: any[]) => {
  //       if (files.length > 0) {
  //         files.forEach((f: any) => {
  //           if (f.referType == this.FILE_REFERTYPE.IMAGE && (f.thumbnail != '' || f.thumbnail != null)) {
  //             this.file_img.push(f);
  //           }
  //         });
  //         this.dt.detectChanges();
  //       }
  //     })
  // }

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
}
