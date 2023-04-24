import { I } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthService, AuthStore, CallFuncService, DialogModel, FormModel, NotificationsService, Util } from 'codx-core';
import { Observable,forkJoin, map, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../codx-share.service';
import { AttachmentComponent } from '../attachment/attachment.component';
import { ViewFileDialogComponent } from '../viewFileDialog/viewFileDialog.component';
import { arrangeChild } from '@syncfusion/ej2-angular-diagrams';
import { Permission } from '@shared/models/file.model';

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
  documents: number = 0;
  lstFileRemove:any[] = [];
  size:number = 0;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };

  defaultImage = "../../../assets/media/svg/files/blank-image.svg"
  readonly loaderImage = '../../../assets/media/img/loader.gif';
  
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
        if(Array.isArray(res)){
          // this.fileMedias = res.filter(f => f.referType == this.FILE_REFERTYPE.IMAGE || f.referType == this.FILE_REFERTYPE.VIDEO);
          // this.fileDocuments = res.filter(f => f.referType === this.FILE_REFERTYPE.APPLICATION);
          // mode grid view file ở dạng khung chat
          if(this.format == "grid")
          {
            res.forEach((x:any) => {
              if(x.referType === this.FILE_REFERTYPE.IMAGE)
                x["source"] = this.codxShareSV.getThumbByUrl(x.url,200);
              else if(x.referType === this.FILE_REFERTYPE.VIDEO)
                x["source"] = `${environment.urlUpload}/${x.url}`; 
            });
          }
          // view file portal
          else{
            this.medias = res.reduce((count,ele) => (ele.referType == this.FILE_REFERTYPE.IMAGE || ele.referType == this.FILE_REFERTYPE.VIDEO) ? count = count + 1 : count, 0);
            this.documents = res.length - this.medias;
            if(this.medias > 0){
              switch(this.medias){
                case 1:
                  res.forEach((x:any) => {
                    if(x.referType === this.FILE_REFERTYPE.IMAGE)
                    {
                      x.source = this.codxShareSV.getThumbByUrl(x.url,900);
                      return;
                    }
                    else
                    {
                      x.source = `${environment.urlUpload}/${x.url}`;
                      return;
                    }
                  });
                  break;
                case 2:
                  // this.fileMedias.forEach((x:any) => {
                  //   if(x.referType === this.FILE_REFERTYPE.IMAGE)
                  //     x.source = this.codxShareSV.getThumbByUrl(x.url,450);
                  //   else
                  //     x.source = `${environment.urlUpload}/${x.url}`;
                  // });

                  res.forEach((x:any) => {
                    if(x.referType === this.FILE_REFERTYPE.IMAGE)
                      x.source = this.codxShareSV.getThumbByUrl(x.url,450);
                    else
                      x.source = `${environment.urlUpload}/${x.url}`;
                  });
                  break;
                case 3:
                  // this.fileMedias.forEach((x :any,index) => {
                  //   if(x.referType === this.FILE_REFERTYPE.IMAGE)
                  //   {
                  //     if(index == 0)
                  //       x.source = this.codxShareSV.getThumbByUrl(x.url,900);
                  //     else
                  //       x.source = this.codxShareSV.getThumbByUrl(x.url,450);
                  //   }
                  //   else
                  //     x.source = `${environment.urlUpload}/${x.url}`;
                  // });
                  res.forEach((x :any,index:number) => {
                    if(x.referType === this.FILE_REFERTYPE.IMAGE)
                      x.source = this.codxShareSV.getThumbByUrl(x.url,index == 0 ? 900 : 450);
                    else 
                      x.source = `${environment.urlUpload}/${x.url}`;
                  });
                  break;
                default:
                  // this.fileMedias.forEach((x:any) => {
                  //   if(x.referType === this.FILE_REFERTYPE.IMAGE)
                  //     x.source = this.codxShareSV.getThumbByUrl(x.url,450);
                  //   else
                  //     x.source = `${environment.urlUpload}/${x.url}`;
                  // });   

                  res.forEach((x:any) => {
                    if(x.referType === this.FILE_REFERTYPE.IMAGE)
                      x.source = this.codxShareSV.getThumbByUrl(x.url,450);
                    else
                      x.source = `${environment.urlUpload}/${x.url}`;
                  });   
                  break;
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
  atmReturnedFile(event:any){
    if(event.data)
    {
      this.selectFiles(event.data);
    }
  }
  // add files
  selectFiles(files:any[]){
    debugger
    if(Array.isArray(files)){
      files.map((f:any) => {
        f.recID = Util.uid();
        f.isNew = true;
        if(f.mimeType.includes('image'))
        {
          f.source = f.avatar;
          f.referType = this.FILE_REFERTYPE.IMAGE;
          // this.fileMedias.push(f);
        }
        else if(f.mimeType.includes('video'))
        {
          f.source = f.data.changingThisBreaksApplicationSecurity;
          f.referType = this.FILE_REFERTYPE.VIDEO;
          // this.fileMedias.push(f);
        }
        else 
        {
          f.referType = this.FILE_REFERTYPE.APPLICATION;
          // this.fileDocuments.push(f);
        }
      });
      this.files = this.files.concat(files);
      this.medias = this.files.reduce((count,ele) => (ele.referType == this.FILE_REFERTYPE.IMAGE || ele.referType == this.FILE_REFERTYPE.VIDEO) ? count = count + 1 : count, 0);
      this.documents = this.files.length - this.medias;
      this.dt.detectChanges();
    }
  }
  // remove files
  removeFiles(data: any) {
    debugger
    if(this.files.length > 0){
      let idx = this.files.findIndex(x => x.recID === data.recID);
      if(idx != -1 )
      {
        this.files.splice(idx,1);
        if(!data.isNew)
        {
          this.lstFileRemove.push(data);
        }
        this.medias = this.files.reduce((count,ele) => (ele.referType == this.FILE_REFERTYPE.IMAGE || ele.referType == this.FILE_REFERTYPE.VIDEO) ? count = count + 1 : count, 0);
        this.documents = this.files.length - this.medias;
        this.dt.detectChanges();
      }
    }
  }
  // save
  save():Observable<boolean>{
    debugger
    if(this.objectID)
    {
      let lstFileAdd = this.files.filter(x => x.isNew);
      let $obs1 =  this.deleteFiles(this.lstFileRemove);
      let $obs2 = this.addFiles(lstFileAdd,this.objectID);
      return forkJoin([$obs1,$obs2],(res1,res2) => {
        return (res1 && res2);
      });
    }
    return of(false);
  }
  // delete files
  deleteFiles(files:any[]) :Observable<boolean>{
    debugger
    if(files.length > 0)
    {
      let _fileIDs = files.map(x => x.recID);
      return this.api.execSv<any>(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "DeleteFilesAsync",
        [_fileIDs])
        .pipe(map((res:any) => {
          return res ? true : false;
        }));
    }
    return of(true);
  }
  addFiles(files:any[],objectID:string):Observable<boolean>{
    if(files.length > 0){
      this.codxATM.objectId = objectID;
      var p = new Permission()
      p.read = true;
      p.download = true;
      p.objectType = "9";
      p.isActive = true;
      if(!Array.isArray(this.codxATM.addPermissions)){
        this.codxATM.addPermissions = [];
      }
      this.codxATM.addPermissions.push(p);
      this.codxATM.fileUploadList = JSON.parse(JSON.stringify(files));
      return this.codxATM.saveFilesMulObservable()
      .pipe(map((res:any) => {
        return res ? true : false;
      }));
    }
    else return of(true);
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
  clickFileDocument(file:any){
    if(file.recID)
    {
      this.fileSV.getFile(file.recID)
      .subscribe((item:any) => {
        if(item)
        {
          var option = new DialogModel();
          option.IsFull = true;
          this.callfc.openForm(ViewFileDialogComponent,item.fileName,0,0,"",item,"",option);
        }
      })
     
    }
    else
    {
      var option = new DialogModel();
      option.IsFull = true;
      this.callfc.openForm(ViewFileDialogComponent,file.fileName,0,0,"",file,"",option);
    }
  }
  // get file media
  getFileMedia(data:any[]):any[]{
    let files = [];
    if(Array.isArray(data))
    {
      files = data.filter(x => x.referType == this.FILE_REFERTYPE.IMAGE || x.referType == this.FILE_REFERTYPE.VIDEO);
    }
    return files;
  }
}

  