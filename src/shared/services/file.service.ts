import { Injectable } from '@angular/core';
import { ApiHttpService, UploadFile } from 'codx-core';
import { FileDownload, FileInfo, FolderInfo } from '@shared/models/file.model';
import { Observable, of } from 'rxjs';
import { finalize, share, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();

  constructor(private api: ApiHttpService) { }

  uploadAvatar(file: UploadFile, funcID: string, objectID: string, objectType: string): Observable<any> {
    file.category = "0";
    var keyRoot = funcID + objectID + objectType;
    if (this.caches.has(keyRoot))
      this.caches.delete(keyRoot);

    return this.api.exec("DM", "FileBussiness", "UploadFilesAsync", [funcID, objectID, objectType], [file]);
  }

  loadAvatar(id: string = "", funcID: string = "", objectID: string = "", objectType: string = "", type: string = "", width: number = 0, objectName = ""): Observable<any> {
    var paras = [id, funcID, objectID, objectType, type, width, objectName];
    var keyRoot = funcID + objectID + objectType;
    var key = JSON.stringify(paras).toLowerCase();

    //Get from CacheData
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return of(c.get(key));
      }
    } else
      this.caches.set(keyRoot, new Map<string, any>());

    //Get from CacheObservable
    if (this.cachedObservables.has(key))
      return this.cachedObservables.get(key);

    const observable = this.api.execSv<FileDownload>("DM", "DM", "FileBussiness", "GetAvatarAsync", paras).pipe(
      tap(res => {
        if (res) {
          var c = this.caches.get(keyRoot);
          c.set(key, res);
          return res;
        }
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadAvatarMultiple(id: string = "", funcID: string = "", objectID: string = "", objectType: string = "", type: string = "", width: number = 0, numberImages = 1): Observable<any> {
    return this.api.execSv<FileDownload>("DM", "DM", "FileBussiness", "GetAvatarMultipleAsync", [id, funcID, objectID, objectType, type, width, numberImages]);
  }

  addFile(file: any): Observable<any> {
    return this.api.execSv<FileInfo>("DM", "DM", "FileBussiness", "AddFileAsync", file);
  }

  addFolder(folderName: string, parentId: string): Observable<any> {
    return this.api.exec<FolderInfo>("DM", "FolderBussiness", "AddFolderAsync", [folderName, parentId]);
  }

  deleteFile(id: any): Observable<any> {
    return this.api.execSv<any>("DM", "DM", "FileBussiness", "DeleteFileAsync", [id, true]);
  }

  downloadFile(id: string): Observable<any> {
    return this.api.exec<FileDownload>("DM", "FileBussiness", "DownloadFileAsync", id);
  }

  arrayBufferToBase64(buffer: any) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  base64ToArrayBuffer(base64: string) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  getAvatar(filename: string) {
    var ext = filename.substring(filename.lastIndexOf('.'), filename.length) || filename;

    if (ext == null) {
      // alert(1);
      return "file.svg";
    }
    else {
      switch (ext) {
        case ".txt":
          return "txt.svg";
        case ".doc":
        case ".docx":
          return "doc.svg";
        case ".7z":
        case ".rar":
        case ".zip":
          return "zip.svg";
        case ".jpg":
          return "jpg.svg";
        case ".mp4":
          return "mp4.svg";
        case ".xls":
        case ".xlsx":
          return "xls.svg";
        case ".pdf":
          return "pdf.svg";
        case ".png":
          return "png.svg";
        case ".js":
          return "javascript.svg";
        default:
          return "file.svg";
      }
    }
  }

  getNow() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var ret = dd + '/' + mm + '/' + yyyy;
    return ret;
  }
}
