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
        this.options.pageLoading = false;
        this.options.pageSize = 20;
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

    searchFile(textSearch: string,model:DataRequest): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "SearchAsync", [textSearch, model]);
    }

    filterFile(funcID:string , paras: string, pageNo: number, pageSize: number): Observable<any> {
        return this.api.exec<any>("DM", "FileBussiness", "FilterAsync", [funcID,  paras, pageNo, pageSize]);
    }
    updatePermisson(data: any): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "UpdatePermissionAsync", [data]);
    }

    getTotalHdd(): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FileBussiness", "GetTernantHddAsync", [""]);
    }

    deleteFileToTrash(id: string, folderId: string, deleted: boolean , objectID:string = ""): Observable<any> {
        return this.api.exec<boolean>("DM", "FileBussiness", "DeleteFileToTrashAsync", [id, folderId, deleted,objectID]);
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

    getFile(id: string, isHistory: boolean = true , viewFile : boolean = false): Observable<any> {
        return this.api.exec<FileInfo>("DM", "FileBussiness", "GetFileAsync", [id, isHistory , viewFile ]);
    }

    getFileNyObjectID(objectID: string): Observable<any> {
        return this.api.exec<FileInfo[]>("DM", "FileBussiness", "GetFilesByObjectIDAsync", [objectID]);
    }
    getFileByDataRequest(dataRequest: DataRequest): Observable<any> {
        return this.api.exec<FileInfo[]>("DM", "FileBussiness", "GetFilesByGridModelAsync", dataRequest);
    }
    downloadFile(id: string): Observable<any> {
        return this.api.exec<FileDownload>("DM", "FileBussiness", "DownloadFileAsync", [id]);
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

    copyFileOrFolder(id: string, fileName: string, id_to: string, move: number = 0, rewrite: number = 0): Observable<any> {
        
        return this.api.exec<DataReturn>("DM", "FileBussiness", "CopyFileOrFolderAsync", [id, fileName, id_to, move, rewrite]);
        
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

    addMultiFileObservable(list: FileUpload[] , actionType: string , entityName:string , isDM: boolean = false  , folder:object = null , folderID: string = "" , folderName: string = "" , parentID:string= "" , idField:string = "" ): Observable<DataReturn[] | null> {
        let data = JSON.stringify(list);
        return this.api.execSv<DataReturn[]>("DM", "DM", "FileBussiness", "AddMultiFileAsync", [data,isDM ,folder,folderID,folderName,parentID,idField,entityName,actionType]).pipe(
            map(data => {
                return data;                
            }),
            catchError((err) => {
              return of(undefined);
            }),
            finalize(() => null)
        );
    }

    addMultiFile(list: FileUpload[] , actionType: string , entityName:string , isDM: boolean = false ,  folder:object = null , folderID: string = "" , folderName: string = "", parentID:string= "" , idField:string = "" ): Observable<DataReturn[]> {
        //var bytes = new Int8Array(data as ArrayBuffer);
        //  var item = this.arrayBufferToBase64(data);
        let data = JSON.stringify(list);
        return this.api.execSv<DataReturn[]>("DM", "DM", "FileBussiness", "AddMultiFileAsync", [data,isDM , folder, folderID , folderName,parentID,idField,entityName,actionType]);
    }

    UpdateRequestAsync(id: string, objectID: string, status: string, isActive: boolean , funcID: string = ""): Observable<any> {
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "UpdateRequestAsync", [id, objectID, status, isActive,funcID]);
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
    addFile(file: FileUpload , actionType: string , entityName:string , isDM : boolean = false , folder:object = null , folderID: string = "" , folderName: string = "" , parentID:string = ""  , idField:string = "" , ): Observable<any> {
        //  var bytes = new Int8Array(data as ArrayBuffer); 
        //  var item = this.arrayBufferToBase64(data);        
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "AddFileAsync", [file,isDM , folder , folderID , folderName,parentID,idField,entityName , actionType]);
    }

    addFileObservable(file: FileUpload , actionType: string , entityName:string , isDM:boolean = false , folder:object = null , folderID: string = "" , folderName: string = "", parentID:string = "" , idField:string = ""): Observable<any> {
        return this.api.execSv<DataReturn>("DM", "DM", "FileBussiness", "AddFileAsync", [file,isDM , folder , folderID , folderName,parentID,idField,entityName,actionType]).pipe(
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
        //var bytes = new Int8Array(data as ArrayBuffer);
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
        //return this.api.exec<FileInfo[]>("DM", "FileBussiness", "GetFilesAsync", parentId);
        return this.api.execSv<FileInfo[]>("DM","DM", "FileBussiness", "GetFilesAsync", [this.options, parentId]);
        // var fileIbfo = data[0]
      //  console.log(data);
    }


}
