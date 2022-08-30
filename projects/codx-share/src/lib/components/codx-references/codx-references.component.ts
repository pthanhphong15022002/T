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
  @Input() funcID?: string// khởi tạo để test,, sau có thể xóa
  @Input() entityName?: string// khởi tạo để test,, sau có thể xóa
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

  ngOnInit(): void {}
  ngAfterViewInit(): void {
     //data view test
     this.dataReferences = [
      {
        memo: 'Công văn dự án 1000 USD',
        createByName: 'Lê Thi Hoài Thương',
        createdOn: new Date(),
        recID: '00cfeb10-a433-43e3-b6b3-876e25bf20a3',
      },
    ];
    //end data test
  }

  uploadFile() {
    this.attachment.uploadFile();
  }

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
