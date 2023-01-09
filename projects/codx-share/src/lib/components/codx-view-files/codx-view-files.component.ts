import { X } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { async } from '@firebase/util';
import { ApiHttpService, AuthService, AuthStore, CallFuncService, FormModel } from 'codx-core';
import { Observable,forkJoin, map, from } from 'rxjs';
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
          if(this.images == 0)
          {
            this.images == res.length;
          }
          res.forEach((f: any) => {
            if(f.referType == this.FILE_REFERTYPE.VIDEO)
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
      let fileImages = this.files.filter(x => x.referType == this.FILE_REFERTYPE.IMAGE);
      this.images = fileImages.length;
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
          this.filesDelete.push(file);
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
      this.dt.detectChanges();
    }
  }

  // click upload file
  uploadFiles(){
    debugger
    this.codxATM.uploadFile();
  }
  // attachment return file
  atmReturnedFile(arrFiles:any){
    if(arrFiles?.data)
    {
      this.addFiles(arrFiles.data);
    }
  }

  // save files
  saveFiles(){
    let _$obs1 = new Observable<any>();
    let _$obs2 = new Observable<any>();

    // kiểm tra thêm file mới
    if(this.filesAdd.length > 0)
    {
      this.codxATM.objectId = this.objectID;
      this.codxATM.fileUploadList = JSON.parse(JSON.stringify(this.filesAdd));
      _$obs1 = from(this.codxATM.saveFilesObservable());
    }
    // kiểm tra xóa file cũ
    if(this.filesDelete.length > 0)
    {
      let _arrRecID = this.filesDelete.map(x => {
        if(X.hasOwnProperty('recID')){
          return x.recID;
        }
      });
      _$obs2 = this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "DeleteFileAsync",
        [_arrRecID]);
    }
    return forkJoin([_$obs1,_$obs2]).pipe(map(result => {
      console.log(result);
    }));
  }
}
