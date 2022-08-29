import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { AttachmentComponent } from '../attachment/attachment.component';

@Component({
  selector: 'codx-references',
  templateUrl: './codx-references.component.html',
  styleUrls: ['./codx-references.component.css'],
})
export class CodxReferencesComponent implements OnInit {
  @Input() formModel?: FormModel;
  // @Input() data: any;
  @Input() vllStatus = 'TMT004';
  @Input() vllRefType = 'TM018';
  dataVll: any;
  @ViewChild('attachment') attachment: AttachmentComponent;
  message: string = '';
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstFile: any[] = [];

  data ={
   memo :"Công văn dự án 1000 USD" ,
   createByName :"Lê Thi Hoài Thương",
   
  }

  constructor(private cache: CacheService, private dt: ChangeDetectorRef) {
    this.cache.valueList(this.vllRefType).subscribe((res) => {
      if (res) this.dataVll = res;
    });
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {}

  uploadFile() {}

  showComments() {}

  selectedFiles(event: any) {
    if (event.data.length > 0) {
      let files = event.data;
      files.map((e: any) => {
        if (e.mimeType.indexOf('image') >= 0) {
          e['referType'] = this.REFERTYPE.IMAGE;
        } else if (e.mimeType.indexOf('video') >= 0) {
          e['referType'] = this.REFERTYPE.VIDEO;
        } else {
          e['referType'] = this.REFERTYPE.APPLICATION;
        }
      });
      this.lstFile = files;
      this.dt.detectChanges();
    }
  }
  removeFile(file: any) {
    this.lstFile = this.lstFile.filter((e: any) => e.fileName != file.fileName);
    this.dt.detectChanges();
  }
}
