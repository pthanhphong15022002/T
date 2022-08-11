import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Data } from '@syncfusion/ej2-grids';
import { ApiHttpService, AuthService, NotificationsService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from '../attachment/attachment.component';

@Component({
  selector: 'codx-files',
  templateUrl: './codx-files.component.html',
  styleUrls: ['./codx-files.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class CodxFilesComponent implements OnInit, OnChanges {
  @Input() funcID
  @Input() id :string = "";
  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() type: 'multiple' | 'single' = 'single';
  @Input() fileUpload: any[] = [];
  @Input() edit:boolean = false;
  @Input() field:string = "";
  @Output() getFile = new EventEmitter;
  @Output() onAfterViewInit = new EventEmitter;
  @ViewChild("codxATM") codxATM:AttachmentComponent;
  REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  file:any = null;
  file_img_video:any[] = [];
  file_application:any[] = [];
  lstFileAdd: any[] = [];
  lstFileDelete: any[] = [];
  user:any = null;
  constructor(
    private api:ApiHttpService,
    private auth:AuthService,
    private dt:ChangeDetectorRef,
    private dmSV:CodxDMService,
    private notifySV:NotificationsService
  ) 
  {
    this.user = this.auth.userValue;
  }
  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {
    if(this.objectID){
      this.getFileByObjectID();
    }
    else if(this.fileUpload && this.fileUpload.length > 0){
      this.convertFiles();
    }
    else{
      this.fileUpload = null;
    } 
  }

  ngAfterViewInit(){
this.onAfterViewInit.emit({codxATM: this.codxATM, codxFile: this});
  }



  getFileUpload(){
    this.fileUpload = this.file_img_video.concat(this.file_application);
    return this.fileUpload;
  }
  getFileByObjectID(){
    this.api.execSv(
      "DM","ERM.Business.DM",
      "FileBussiness",
      "GetFilesByIbjectIDAsync",
      this.objectID)
    .subscribe((result:any[]) => {
      if(result.length > 0){
        result.forEach((f:any) => {
          if(f.referType == this.REFERTYPE.IMAGE){
            this.file_img_video.push(f);
          }
          else if(f.referType == this.REFERTYPE.VIDEO){
            f['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.user.token}`;
            this.file_img_video.push(f);
          }
          else{
            this.file_application.push(f);
          }
        });
        this.fileUpload = result; 
        this.getFile.emit(this.fileUpload);
        this.dt.detectChanges();
      }
      else{
        this.fileUpload = [];
        this.dt.detectChanges();
        this.getFile.emit(this.fileUpload);
      }
    })
  }
  convertFiles(){
    if(this.fileUpload.length > 0){
      this.fileUpload.map((f:any) => {
        if(f.mimeType.indexOf("image") >= 0 )
        {
          this.file_img_video.push(f);
        }
        else if(f.mimeType.indexOf("video") >= 0){
          f['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.user.token}`;
          this.file_img_video.push(f);
        }
        else{
          this.file_application.push(f);
        }
      });
      this.getFile.emit(this.fileUpload);
      this.dt.detectChanges();
    }
    else {
      this.fileUpload = [];
      this.dt.detectChanges();
      this.getFile.emit(this.fileUpload);
    }
  }
  removeFile(file:any){
    let tmpFiles = [];
    switch(file.referType){
      case this.REFERTYPE.IMAGE:
      case this.REFERTYPE.VIDEO:
        tmpFiles = this.file_img_video.filter((f:any) => f.fileName != file.fileName);
        this.file_img_video = tmpFiles;
        break;
      case this.REFERTYPE.APPLICATION:
        tmpFiles = this.file_application.filter((f:any) => f.fileName != file.fileName);
        this.file_application = tmpFiles;
      break;
      default:
        break;
    }
    this.lstFileDelete.push(file);
    this.fileUpload = this.fileUpload.filter((f:any) => f.fileName != file.fileName);
    this.getFile.emit(this.fileUpload);
    this.dt.detectChanges();
  }

  addFiles(files:any){
    if(this.type == 'multiple'){
      files.forEach((f:any) => {
        if(f.mimeType.indexOf("image") >= 0 ){
          f['referType'] = this.REFERTYPE.IMAGE;
          let a = this.file_img_video.find(f2 => f2.fileName == f.fileName);
          if(a) return;
          this.file_img_video.push(f);
        }
        else if(f.mimeType.indexOf("video") >= 0)
        {
          f['referType'] = this.REFERTYPE.VIDEO;
          let a = this.file_img_video.find(f2 => f2.fileName == f.fileName);
          if(a) return;
          this.file_img_video.push(f);
        }
        else{
          f['referType'] = this.REFERTYPE.APPLICATION;
          let a = this.file_application.find(f2 => f2.fileName == f.fileName);
          if(a) return;
          this.file_application.push(f);
        }
      });
      this.lstFileAdd = this.lstFileAdd.concat(files);
      this.fileUpload = this.fileUpload.concat(files);
    }
    else 
    {
      if(files[0].mimeType.indexOf("image") >= 0 ){
        files[0]['referType'] = this.REFERTYPE.IMAGE;
        let a = this.file_img_video.find(f => f.fileName == files[0].fileName);
        if(a) return;
        this.file_img_video.push(files[0]);
      }
      else if(files[0].mimeType.indexOf("video") >= 0)
      {
        files[0]['referType'] = this.REFERTYPE.VIDEO;
        let a = this.file_img_video.find(f => f.fileName == files[0].fileName);
        if(a) return;
        this.file_img_video.push(files[0]);
      }
      else{
        files[0]['referType'] = this.REFERTYPE.APPLICATION;
        let a = this.file_application.find(f => f.fileName == files[0].fileName);
        if(a) return;
        this.file_application.push(files[0]);
      }
      this.lstFileAdd = files;
      this.fileUpload = files;
    }
    this.dt.detectChanges();

    this.getFile.emit(this.fileUpload);
  }

  saveFiles(){
    this.codxATM.objectId = this.objectID;
    this.dmSV.fileUploadList = this.lstFileAdd;
    return this.codxATM.saveFilesObservable();    
  }

  deleteFiles(objectID:string){
    this.api.execSv("DM",
    "ERM.Business.DM",
    "FileBussiness",
    "DeleteByObjectIDAsync",
    [objectID, 'WP_Comments', true]).subscribe();
  }

  valueChange(value:any, ){ // chưa xử lý chọn trùng file
    let files = value.data;
    if(files.length > 0) 
    {
      this.addFiles(files); 
    } 
  }

  uploadFile(){
    this.codxATM.uploadFile();
  }
}
