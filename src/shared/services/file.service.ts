import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { HttpClient, HttpBackend, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { provideRoutes, Router } from '@angular/router';
import { A } from '@angular/cdk/keycodes';
import { ApiHttpService, DataRequest } from 'codx-core';
// import { DataReturn } from '@modules/od/models/info.model';
import { DataReturn, FileDownload, FileInfo, FileUpload } from '@shared/models/file.model';
//import { AESCryptoService } from '../aescrypto/aescrypto.service';
//import { ApiHttpService } from '..';

@Injectable({
    providedIn: 'root',
})
export class FileService implements OnDestroy {
    //private API_DM_URL = `${environment.apiUrl}/dm`;

    options = new DataRequest();
   
    ngOnDestroy() {

    }

    constructor(
        // private httpBackend: HttpBackend,
        //private http: HttpClient,
        private router: Router,
        //  private aesCrypto: AESCryptoService,
        private api: ApiHttpService
    ) {
      //  this.options.pageLoading = false;
        this.options.pageSize = 1;
        this.options.funcID = "";
        this.options.srtDirections
    }

    getModeStore(): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "GetModeStoreAsync", [""]);
    }

    isAllowAddFile(fizeSize): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "AllowAddAsync", [fizeSize]);
    }

    UpdateThumbnail(id): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "UpdateThumbnailAsync", [id]);
    }

    searchFile(textSearch: string, pageNo: number, pageSize: number): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "SearchAsync", [textSearch, pageNo, pageSize]);
    }

    searchFileAdv(funcID:string , textSearch: string, predicates: string, paras: string, pageNo: number, pageSize: number, searchAdvance: boolean): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "SearchAdvAsync", [textSearch, predicates, paras, pageNo, pageSize, searchAdvance,funcID]);
    }

    updatePermisson(data: any): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "UpdatePermissionAsync", [data]);
    }

    getTotalHdd(): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "GetTernantHddAsync", [""]);
    }

    deleteFileToTrash(id: string, folderId: string, deleted: boolean): Observable<any> {
        return this.api.exec<boolean>("DM", "FileBussiness", "DeleteFileToTrashAsync", [id, folderId, deleted]);
    }

    restoreFile(id: string, fileName: string, rewrite: string = "0"): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "RestoreFileAsync", [id, fileName, rewrite]);
    }

    setViewFile(id: string, rating: string, comment: string): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "SetViewAsync", [id, rating, comment]);
    }

    bookmarkFile(id: string): Observable<any> {
        return this.api.exec<FileInfo>("DM", "FileBussiness", "BookmarkFileAsync", id);
    }

    getAllowSizeUpload(): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "GetAllowSizeUploadAsync", [""]);
    }

    getFileContent(id: string): Observable<any> {
        return this.api.exec<any>("DM", "LibrOfficeBusiness", "GetFileContentAsync", [id]);
    }

    // dung 1 lan   

    getFile(id: string, isHistory: boolean = true): Observable<any> {
        return this.api.exec<FileInfo>("DM", "FileBussiness", "GetFileAsync", [id, isHistory]);
    }

    getFileNyObjectID(objectID: string): Observable<any> {
        return this.api.exec<FileInfo[]>("DM", "FileBussiness", "GetFilesByObjectIDAsync", [objectID]);
    }

    downloadFile(id: string): Observable<any> {
        return this.api.exec<FileDownload>("DM", "FileBussiness", "DownloadFileAsync", id);
    }

    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    deleteFileByObjectIDType(objectID: string,  objectType: string,  forever: boolean): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "DeleteByObjectIDAsync", [objectID, objectType, forever]);
    }
    
    updateFileByObjectIDType(objectID_old: string, objectID_new: string,  objectType: string): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "UpdateFileByObjectIDTypeAsync", [objectID_old, objectID_new, objectType]);
    }
    getFileDuplicate(fileName: string, folderId): Observable<any> {
        return this.api.exec<string>("DM", "FileBussiness", "GetFileNameDuplicateAsync", [fileName, folderId]);
    }

    copyFile(id: string, fileName: string, id_to: string, move: number = 0, rewrite: number = 0): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "CopyFileAsync", [id, fileName, id_to, move, rewrite]);
    }

    // updateFile(id: string, fileName: string): Observable<any> { 
    //     return this.api.exec<FileInfo[]>("DM", "FileBussiness", "UpdateFileAsync", [id, fileName]);
    // }  

    // updateFile(id: string, folderID: string, objectID: string, objectType: string, cate: string, fileName: string, data: ArrayBuffer): Observable<any> {    
    //     var bytes = new Int8Array(data as ArrayBuffer);  
    //     var item = this.arrayBufferToBase64(data);
    //     return this.api.exec<FileInfo>("DM", "FileBussiness", "UpdateFileAsync", [id, folderID, objectID, objectType, cate, item, fileName]);        
    // }   

    requestOrShareFile(file: FileUpload): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);
        return this.api.execSv<FileInfo>("DM", "DM", "FileBussiness", "RequestOrShareFileAsync", file);
    }

    updateFile(file: FileUpload): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "UpdateFileAsync", file);
    }

    // uploadFile(file: FileUpload): Observable<any> {
    //     //  var bytes = new Int8Array(data as ArrayBuffer); 
    //     //  var item = this.arrayBufferToBase64(data);
    //     return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "UpdateFileAsync", file);
    // }

    getThumbnail(id: string, pathDisk: string): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "GetThumbnailAsync", [id, pathDisk]);
    }

    renameFile(id: string, fileName: string): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "RenameFileAsync", [id, fileName]);
    }

    addMultiFileObservable(list: FileUpload[] , isDM: boolean = false): Observable<DataReturn[] | null> {
        //var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);
        // return this.api
        // .execSv<Array<any>>(
        //   this.service,
        //   this.assemblyName,
        //   this.className,
        //   this.method,
        //   this.request
        // )
        // .pipe(
        //   finalize(() => {
        //     /*  this.onScrolling = this.loading = false;
        //     this.loaded = true; */
        //   }),
        //   map((response: any) => {
        //     return response[0]
        //   })
        // );

        let data = JSON.stringify(list);
        return this.api.execSv<DataReturn[]>("DM", "DM", "FileBussiness", "AddMultiFileAsync", [data,isDM]).pipe(
            map(data => {
                return data;                
            }),
            catchError((err) => {
              return of(undefined);
            }),
            finalize(() => null)
        );
    }

    addMultiFile(list: FileUpload[] , isDM: boolean = false): Observable<DataReturn[]> {
        //var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);
        let data = JSON.stringify(list);
        return this.api.execSv<DataReturn[]>("DM", "DM", "FileBussiness", "AddMultiFileAsync", [data,isDM]);
    }

    UpdateRequestAsync(id: string, objectID: string, status: string, isActive: boolean): Observable<any> {
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "UpdateRequestAsync", [id, objectID, status, isActive]);
    }

    updateVersionFile(file: FileUpload): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "UpdateVersionFileAsync", file);
    }

    updateVersionFileObservable(file: FileUpload): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "UpdateVersionFileAsync", file).pipe(
            map(data => {
                return data;                
            }),
            catchError((err) => {
              return of(undefined);
            }),
            finalize(() => null)
        );
    }

    getChunkFile(file: FileUpload): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);        
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "GetChunkInfoFileAsync", file);
    }

    addChunkFile(file: FileUpload): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);        
        return this.api.execSv<string>("DM", "DM", "FileBussiness", "CreateChunkFileAsync", file);
    }

    GetPathServer(path): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);        
        return this.api.execSv<string>("DM", "DM", "FileBussiness", "GetPathServerAsync", path);
    }

    //Observable<any>
    addFile(file: FileUpload , isDM : boolean = false): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);        
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "AddFileAsync", [file,isDM]);
    }

    addFileObservable(file: FileUpload, isDM:boolean = false): Observable<any> {
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "AddFileAsync", [file,isDM]).pipe(
            map(data => {
                return data;                
            }),
            catchError((err) => {
              return of(undefined);
            }),
            finalize(() => null)
        );

      //  return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "AddFileAsync", file);
    }

    addFileTemp(folderID: string, objectID: string, objectType: string, cate: string, fileName: string, data: ArrayBuffer): Observable<any> {
        var bytes = new Int8Array(data as ArrayBuffer);
        var item = this.arrayBufferToBase64(data);
        return this.api.exec<DataReturn>("DM", "FileBussiness", "AddFileAsync", [folderID, objectID, objectType, cate, item, fileName]);
    }

    GetFiles(parentId: string): Observable<any> {
        /* const request = {
             IsJson: true,
             Data: parentId,
         };
         return this.http.post<FileInfo[]>(`${this.API_DM_URL}/GetListActiveFiles`, request).pipe(
             map((data: FileInfo[]) => {
                 return data;
             }),
             catchError((err) => {
                 return of(undefined);
             })
         );*/
        //return this.api.exec<FolderInfo[]>("DM", "FolderBussiness", "GetFoldersAsync", parentId);
        this.options.entityName = "DM_FileInfo";      
        this.options.pageSize = 20;         
        //return this.api.exec<FileInfo[]>("DM", "FileBussiness", "GetFilesAsync", parentId);
        var data = this.api.exec<FileInfo[]>("DM", "FileBussiness", "GetFilesAsync", [this.options, parentId]);
        // var fileIbfo = data[0]
      //  console.log(data);
        return data;
    }
}
