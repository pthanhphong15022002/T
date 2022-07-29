import { ChangeDetectorRef, Injectable, NgModule, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { AuthService, NotificationsService } from "codx-core";
import { FolderService } from "@shared/services/folder.service";
import { FileService } from "@shared/services/file.service";
import { FileUpload } from "@shared/models/file.model";

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
    private titlemessage = 'Thông báo';
    private copymessage = 'Bạn có muốn lưu lên không ?';
    private renamemessage = 'Bạn có muốn lưu với tên {0} không ?';
    private FOLDER_NAME = "Quản lý tài liệu cá nhân";
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

}