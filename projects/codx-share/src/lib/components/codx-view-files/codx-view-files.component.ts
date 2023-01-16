import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthService, AuthStore, CallFuncService, FormModel } from 'codx-core';
import { Observable,forkJoin, map, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from '../attachment/attachment.component';

@Component({
  selector: 'codx-view-files',
  templateUrl: './codx-view-files.component.html',
  styleUrls: ['./codx-view-files.component.css']
})
export class CodxViewFilesComponent implements OnInit {

  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() formModel:FormModel = null;
  @Input() allowEdit: boolean = false;
  @Input() images: number = 0;

  @Output() fileClicked = new EventEmitter();
  

  @ViewChild("codxATM") codxATM:AttachmentComponent;
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
    private sanitizer: DomSanitizer,
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
    if(objectID)
    {
      let size = 500;
      if(this.images != 0)
      {
        
      }
      this.api
      .execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      [this.objectID])
      .subscribe((res:any[]) => {
        if(res?.length > 0)
        {
          if(this.images == 0)
          {
            this.images = res.length;
          }
          res.forEach((f: any) => {
            if(f.referType == this.FILE_REFERTYPE.IMAGE || f.referType == this.FILE_REFERTYPE.VIDEO)
            {
              f["source"] = `${environment.urlUpload}/${f.url}`; 
            }
          });
          this.files = res;
        }
      });
    }
  }

  // click filed
  clickViewDetail(fileSelected: any) {
    this.fileClicked.emit(fileSelected);
  }
  

  // click upload file
  uploadFiles(){
    this.codxATM.uploadFile();
  }
  // attachment return file
  atmReturnedFile(arrFiles:any){
    if(arrFiles?.data)
    {
      this.addFiles(arrFiles.data);
    }
  }
  // add files
  addFiles(files:any[]){
    if(files.length > 0){
      files.forEach((f) => {
        if(f.mimeType.includes('image'))
        {
          f["source"] = f.avatar;
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
          this.images++;
        }
        else if(f.mimeType.includes('video'))
        {
          f['source'] = f.data;
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
          this.images++;
        }
        else 
        {
          f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        }
      });
      this.filesAdd = this.filesAdd.concat(files);
      this.files = JSON.parse(JSON.stringify(this.filesAdd));
      this.dt.detectChanges();
      }
  }
  // remove files
  removeFiles(file: any) {
    if(file)
    {
      let _index = -1;
      if(file.hasOwnProperty('recID')){
        _index = this.files.findIndex(x => x.recID == file.recID);
        this.filesDelete.push(file);
      }
      else
      {
        _index = this.files.findIndex(x => x.fileName == file.fileName && !file.hasOwnProperty('recID'));
        
      }
      if(_index >=0)
      {
        this.files.splice(_index,1);
        let _fileImages = this.files.filter(x => (x.referType == this.FILE_REFERTYPE.IMAGE || x.referType == this.FILE_REFERTYPE.VIDEO));
        this.images = _fileImages.length;
      }
      
      this.dt.detectChanges();
    }
  }
  // save
  save():Observable<any>{
    if(this.filesDelete.length > 0) // delete files
    {
        this.deleteFiles(this.filesDelete);
    }
    return this.saveFiles(this.filesAdd).pipe(map(res => {
        return res;
    }));
  }
  // delete files
  deleteFiles(arrFiles:any[]){
    if(arrFiles.length > 0)
    {
      let _fileIDs = arrFiles.map(x => x.recID);
      this.api.execSv<any>(
        "DM",
        "ERM.Business.DM",
        "FilesBusiness",
        "DeleteFilesAsync",
        [_fileIDs])
        .subscribe();
    }
  }
  saveFiles(arrFiles:any[]):Observable<boolean>{
    if(arrFiles.length > 0){
      this.codxATM.objectId = this.objectID;
      this.codxATM.fileUploadList = JSON.parse(JSON.stringify(arrFiles));
      return this.codxATM.saveFilesMulObservable().pipe(map(res => {
        if(res)
        {
          return true;
        }
        else return false;
      }));
    }
    return of(true);
  }
}

  