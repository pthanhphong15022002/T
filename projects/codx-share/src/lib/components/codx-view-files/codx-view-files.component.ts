import { I } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthService, AuthStore, CallFuncService, FormModel } from 'codx-core';
import { Observable,forkJoin, map, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../codx-share.service';
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
  size:number = 0;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  constructor(
    private api:ApiHttpService,
    private auth: AuthStore,
    private callfc: CallFuncService,
    private dt: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private codxShareSV: CodxShareService,

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
            let _fileImgVid = res.filter(f => f.referType == this.FILE_REFERTYPE.IMAGE || f.referType == this.FILE_REFERTYPE.VIDEO);
            this.images = _fileImgVid.length;
          }
          let _files = res.filter(f => f.referType === this.FILE_REFERTYPE.IMAGE);
          switch(_files.length)
          {
            case 1:
              _files[0]["source"] = this.codxShareSV.getThumbByUrl(_files[0].url,600);
              break;
            case 2:
              _files[0]["source"] = this.codxShareSV.getThumbByUrl(_files[0].url,300);
              _files[1]["source"] = this.codxShareSV.getThumbByUrl(_files[1].url,300);
              break;
            case 3:
              _files[0]["source"] = this.codxShareSV.getThumbByUrl(_files[0].url,600);
              _files[1]["source"] = this.codxShareSV.getThumbByUrl(_files[1].url,300);
              _files[2]["source"] = this.codxShareSV.getThumbByUrl(_files[2].url,300);
              break;
            default:
              _files.map(f => {
                f["source"] = this.codxShareSV.getThumbByUrl(f.url,300);
              })   
              break
          }
          res.map(f => {
            if(f.referType == this.FILE_REFERTYPE.VIDEO){
              f["source"] = `${environment.urlUpload}`+"/"+f.url; 
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
    files.forEach((f) => {
      if(f.mimeType.includes('image'))
      {
        f["source"] = f.avatar;
        f['referType'] = this.FILE_REFERTYPE.IMAGE;
        this.images++;
      }
      else if(f.mimeType.includes('video'))
      {
        f['source'] = f.data.changingThisBreaksApplicationSecurity;
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

  