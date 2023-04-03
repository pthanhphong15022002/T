import { I } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthService, AuthStore, CallFuncService, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { Observable,forkJoin, map, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../codx-share.service';
import { AttachmentComponent } from '../attachment/attachment.component';
import { ViewFileDialogComponent } from '../viewFileDialog/viewFileDialog.component';

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
  @Input() medias: number = 0;
  @Input() format:string = "";

  @Output() selectFile = new EventEmitter();
  @Output() fileEmit = new EventEmitter();

  @ViewChild("codxATM") codxATM:AttachmentComponent;
  user: any = null;
  files:any[] = [];
  fileMedias:any[] = [];
  fileDocuments:any[] = []
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
    private codxShareSV: CodxShareService,
    private notifySvr: NotificationsService,
    private fileSV:FileService

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
        if(Array.isArray(res) && res.length > 0){
          this.fileMedias = res.filter(f => f.referType == this.FILE_REFERTYPE.IMAGE || f.referType == this.FILE_REFERTYPE.VIDEO);
          this.fileDocuments = res.filter(f => f.referType === this.FILE_REFERTYPE.APPLICATION);
          // view file chat
          if(this.format == "grid"){
            res.forEach((x:any) => {
              if(x.referType === this.FILE_REFERTYPE.IMAGE){
                x["source"] = this.codxShareSV.getThumbByUrl(x.url,200);
              }
              else if(x.referType === this.FILE_REFERTYPE.VIDEO){
                x["source"] = `${environment.urlUpload}/${x.url}`; 
              }
            });
          }
          // view file portal
          else {
            if(Array.isArray(this.fileMedias))
            {
              this.medias = this.fileMedias.length;
              switch(this.medias){
                case 1:
                case 2:
                  this.fileMedias.forEach(x => {
                    if(x.referType === this.FILE_REFERTYPE.IMAGE){
                      x["source"] = this.codxShareSV.getThumbByUrl(x.url,900/this.medias);
                    }
                    else
                    {
                      x["source"] = `${environment.urlUpload}/${x.url}`;
                    }
                  });
                  break;
                case 3:
                  this.fileMedias.forEach((x,index) => {
                    if(x.referType === this.FILE_REFERTYPE.IMAGE)
                    {
                      if(index == 0)
                        x["source"] = this.codxShareSV.getThumbByUrl(x.url,900);
                      else
                        x["source"] = this.codxShareSV.getThumbByUrl(x.url,450);
                    }
                    else
                    {
                      x["source"] = `${environment.urlUpload}/${x.url}`;
                    }
                  });
                  break;
                default:
                  this.fileMedias.forEach(x => {
                    if(x.referType === this.FILE_REFERTYPE.IMAGE)
                      x["source"] = this.codxShareSV.getThumbByUrl(x.url,450);
                    else
                      x["source"] = `${environment.urlUpload}/${x.url}`;
                  });   
                  break
              }
            }
            
          }
          this.files = JSON.parse(JSON.stringify(res));
        }
      });
    }
  }

  // click filed
  clickViewDetail(file: any) {
    this.selectFile.emit(file);
  }
  
  // click upload file
  uploadFiles(){
    this.codxATM.uploadFile();
  }
  // attachment return file
  atmReturnedFile(evetn:any){
    if(evetn.data)
    {
      this.addFiles(evetn.data);
    }
  }
  // add files
  addFiles(files:any[]){
    if(Array.isArray(files)){
      files.map((f) => {
        if(f.mimeType.includes('image'))
        {
          f["source"] = f.avatar;
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
          this.fileMedias.push(f);
        }
        else if(f.mimeType.includes('video'))
        {
          f['source'] = f.data.changingThisBreaksApplicationSecurity;
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
          this.fileMedias.push(f);
        }
        else 
        {
          f['referType'] = this.FILE_REFERTYPE.APPLICATION;
          this.fileDocuments.push(f);
        }
      });
      this.filesAdd = this.filesAdd.concat(files);
      this.files = JSON.parse(JSON.stringify(this.filesAdd));
      this.medias = this.fileMedias.length;
      this.dt.detectChanges();
    }
  }
  // remove files
  removeFiles(file: any) {
    this.deleteFiles
    let _key = file.hasOwnProperty('recID') ? "recID" : "fileName";
    let _index = this.files.findIndex(x => x[_key] === file.recID);
    if(_index > -1 )
    {
      this.files.splice(_index,1);
      this.filesDelete.push(file);
    }
    if(file.referType === this.FILE_REFERTYPE.APPLICATION)
    {
      this.fileDocuments = this.fileDocuments.filter(x => x[_key] !== file[_key]);
    }
    else
    {
      this.fileMedias = this.fileMedias.filter(x =>x[_key] !== file[_key]);
      this.medias = this.fileMedias.length;
    }
    this.dt.detectChanges();
  }
  // save
  save():Observable<boolean>{
    let $obs1 =  this.deleteFiles(this.filesDelete);
    let $obs2 = this.saveFiles(this.filesAdd);
    return forkJoin([$obs1,$obs2],(res1,res2)=>{
      if(res1 && res2) return true;
      return false;
    });
  }
  // delete files
  deleteFiles(files:any[]) :Observable<boolean>{
    if(Array.isArray(files) && files.length > 0)
    {
      let _fileIDs = files.map(x => x.recID);
      return this.api.execSv<any>(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "DeleteFilesAsync",
        [_fileIDs]).pipe(map((res:boolean) => {
          if(!res){
            this.notifySvr.notify("Xóa file không thành công!");
            return false;
          }
          return res;
        }));
    }
    return of(true);
  }
  saveFiles(files:any[]):Observable<boolean>{
    if(!this.objectID && !files){
      return of(false);
    }
    else{
      if(Array.isArray(files) && files.length > 0){
        this.codxATM.objectId = this.objectID;
        this.codxATM.fileUploadList = JSON.parse(JSON.stringify(files));
        return this.codxATM.saveFilesMulObservable().pipe(map((res:any) => {
          if(!res){
            this.notifySvr.notify("Thêm file không thành công!");
            return false;
          }
          return true;
        }));
      }
      else return of(true);
    }
  }
  // format file size
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  //click view file document
  clickFileDocument(file){
    if(file?.recID)
    {
      this.fileSV.getFile(file.recID).subscribe(item=>{
        if(item)
        {
          var option = new DialogModel();
          option.IsFull = true;
          this.callfc.openForm(ViewFileDialogComponent,item.fileName,0,0,"",item,"",option);
        }
      })
     
    }
    // else this.notifySvr.notifyCode("SYS032")
    else{
      var option = new DialogModel();
      option.IsFull = true;
      this.callfc.openForm(ViewFileDialogComponent,file.fileName,0,0,"",file,"",option);
    }
  }
}

  