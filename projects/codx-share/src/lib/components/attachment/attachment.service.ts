import { ChangeDetectorRef, Injectable, NgModule, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, finalize, from, map, share } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { AuthService, NotificationsService } from "codx-core";
import { FolderService } from "@shared/services/folder.service";
import { FileService } from "@shared/services/file.service";
import { FileUpload } from "@shared/models/file.model";
import { lvFileClientAPI } from "@shared/services/lv.component";

@Injectable({
    providedIn: 'root'
})

export class AttachmentService {
    public data = new BehaviorSubject<any>(null);
    public fileListAdded: any;
    public openAttachment = new BehaviorSubject<boolean>(null);
    isOpenAttachment = this.openAttachment.asObservable();
   
    public fileList = new BehaviorSubject<FileUpload[]>(null);
    isFileList = this.fileList.asObservable();

    public breadcumb = new BehaviorSubject<string[]>(null);
    isBreadcum = this.breadcumb.asObservable();

    public breadcumbTree = new BehaviorSubject<string[]>(null);
    isBreadcumTree = this.breadcumbTree.asObservable();

    public folderId = new BehaviorSubject<string>(null);
    isFolderId = this.folderId.asObservable();

    public setDisableSave = new BehaviorSubject<boolean>(null);
    isSetDisableSave = this.setDisableSave.asObservable();
    
    public openForm = new BehaviorSubject<boolean>(null);
    isOpenForm = this.openForm.asObservable();

    public currentNode: string;  
    public parentFolderId: string;
    public isTree = false;
    public breadcumbLink: string[];
    public caches = new Map<string, Map<string, any>>();
    private cachedObservables = new Map<string, Observable<any>>();
    constructor(
        private domSanitizer: DomSanitizer,
        private auth: AuthService,
        private folderService: FolderService,
        private fileService: FileService,
        //  private confirmationDialogService: ConfirmationDialogService,  
        private notificationsService: NotificationsService
    ) {
        var data: any = this.auth.user$;        
    }

    ngOnInit(): void {

    }
    
    // <img alt="" class="w-100 mr-2" [src]='this.dmSV.getThumbnail(fileEditing.thumbnail)'>
    getThumbnail(data) {
        if (data != "") {
            var url = 'data:image/png;base64,' + data;
            return this.domSanitizer.bypassSecurityTrustUrl(data);
        }
        else
            return "";
    }

    loadTenant(name:any): Observable<any>
    {
      let paras = [name];
      let keyRoot = name;
      let key = JSON.stringify(paras).toLowerCase();
      if (this.caches.has(keyRoot)) {
        var c = this.caches.get(keyRoot);
        if (c && c.has(key)) {
          return c.get(key);
        }
      }
      else {
        this.caches.set(keyRoot, new Map<any, any>());
      }
  
      if (this.cachedObservables.has(key)) {
        this.cachedObservables.get(key)
      }
      let observable =  from(lvFileClientAPI.postAsync(`api/admin/apps/get/${name}`,""))
      .pipe(
        map((res) => {
          if (res) {
            let c = this.caches.get(keyRoot);
            c?.set(key, res);
            return res;
          }
          return null
        }),
        share(),
        finalize(() => this.cachedObservables.delete(key))
      );
      this.cachedObservables.set(key, observable);
      return observable;
    }
}