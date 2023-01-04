import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { ApiHttpService, AuthService, AuthStore, CallFuncService } from 'codx-core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'codx-view-files',
  templateUrl: './codx-view-files.component.html',
  styleUrls: ['./codx-view-files.component.css']
})
export class CodxViewFilesComponent implements OnInit {

  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() formModel:any = "";
  @Input() allowEdit: boolean = false;
  @Input() fileCount: number = 0;


  @Output() filesReturned = new EventEmitter();
  @Output() filesRemoved = new EventEmitter();
  @Output() filesAdded = new EventEmitter();
  @Output() fileClicked = new EventEmitter();
  
  user: any = null;
  files:any[] = [];
  filesDelete:any[] = [];
  filesAdd:any[] = [];
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  constructor(
    private api:ApiHttpService,
    private auth: AuthStore,
    private callfc: CallFuncService,
    private dt: ChangeDetectorRef
  )
  {
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.getFileByObjectID(this.objectID);
  }
  // get files by objectID
  getFileByObjectID(objectID:string){
    if(objectID){
      this.api
      .execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      [this.objectID])
      .subscribe((res:any[]) => {
        if(res?.length > 0){
          res.forEach((f: any) => {
            if(f.referType == this.FILE_REFERTYPE.VIDEO)
            {
              f["source"] = `${environment.urlUpload}/${f.url}`; 
            }
          });
          this.files = res;
          this.filesReturned.emit(res);
        }
      });
    }
  }

  // click filed
  clickViewDetail(fileSelected: any) {
    if(fileSelected){
      this.fileClicked.emit(fileSelected);
    }
  }
  // add files
  addFiles(files:any[]){
    if(files.length > 0){
      files.forEach((f) => {
        if(f.mimeType.includes('image'))
        {
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
        }
        else if(f.mimeType.includes('video'))
        {
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
        }
        else 
        {
          f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        }
      });
      this.filesAdd = this.filesAdd.concat(files);
      this.files = this.filesAdd.slice();
      this.dt.detectChanges();
      }
  }
  // remove files
  removeFiles(file: any) {
    if(file)
    {
      if(file.hasOwnProperty('recID')){
        let _index = this.files.findIndex(x => x.recID == file.recID);
        if(_index >=0)
        {
          this.files.splice(_index,1);
        }
      }
      else
      {
        let _index = this.files.findIndex(x => x.fileName == file.fileName && !file.hasOwnProperty('recID'));
        if(_index >=0)
        {
          this.files.splice(_index,1);
        }
      }
      this.filesDelete.push(file);
      this.dt.detectChanges();
    }
  }
}
