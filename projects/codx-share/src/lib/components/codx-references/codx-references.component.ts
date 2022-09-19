import { ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None
})
export class CodxReferencesComponent implements OnInit {
  @Input() funcID?: string// khởi tạo để test,, sau có thể xóa
  // @Input() entityName?: string// khởi tạo để test,, sau có thể xóa
  @Input() dataReferences: any[];
  @Input() vllRefType = 'TM018';
  @ViewChild('attachment') attachment: AttachmentComponent;
  message: string = '';
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  lstFile: any[] = [];
  //dataAvtar: any;

  constructor(private cache: CacheService, private dt: ChangeDetectorRef) {

  }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
  }

  uploadFile() {
    this.attachment.uploadFile();
  }

  showComments() { }

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
