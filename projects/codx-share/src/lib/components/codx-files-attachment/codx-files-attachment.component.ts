import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Permission } from '@shared/models/file.model';

@Component({
  selector: 'codx-files-attachment',
  templateUrl: './codx-files-attachment.component.html',
  styleUrls: ['./codx-files-attachment.component.css']
})
export class CodxFilesAttachmentComponent {
  @Input() allowMultiFile: string = '1';
  @Input() entityName!: string;
  @Input() objectID!: any;
  @Input() isEdit = true;
  @Input() hideFolder: string = '1';
  @Input() type: string = 'inline';
  @Input() formModel!: any;
  @Input() funcID!: string;
  @Input() dataSelected: any;
  @Input() displayThumb: string = 'full';
  @Input() referType: string = ''; 
  @Input() addPermissions: Permission[] = [];
  @Input() heightScroll :any;
  @Output() fileAdded = new EventEmitter<any>();
  @Output() fileCount = new EventEmitter<any>();
  @Output() fileSave = new EventEmitter<any>();

  fileAddeds(e:any)
  {
    this.fileAdded.emit(e);
  }

  fileCounts(e:any)
  {
    this.fileCount.emit(e);
  }

  fileSaves(e:any)
  {
    this.fileSave.emit(e);
  }
}
