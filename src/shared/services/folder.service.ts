import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { HttpClient, HttpBackend, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { provideRoutes, Router } from '@angular/router';
import { ApiHttpService, DataRequest } from 'codx-core';
import { FolderInfo } from '@shared/models/folder.model';
import { DataReturn } from '@shared/models/file.model';


@Injectable({
    providedIn: 'root',
})
export class FolderService implements OnDestroy {
    //private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
    //private API_DM_URL = `${environment.apiUrl}/dm`;
    isLoadingSubject: BehaviorSubject<boolean>;
    options = new DataRequest();
    constructor(
        // private httpBackend: HttpBackend,
        //private http: HttpClient,
        private router: Router,
        //private aesCrypto: AESCryptoService,
        private api: ApiHttpService
    ) {
        this.options.pageLoading = false;
        this.options.pageSize = 50;
        this.options.funcID = "";        
    }

    //postFile(fileToUpload: File): Observable<boolean> {
    //    const endpoint = 'your-destination-url';
    //    const formData: FormData = new FormData();
    //    formData.append('fileKey', fileToUpload, fileToUpload.name);
    //    return this.httpClient
    //        .post(endpoint, formData, { headers: yourHeadersConfig })
    //        .map(() => { return true; })
    //        .catch((e) => this.handleError(e));
    //}
    /*
     * getContactPersons(token: string): Observable<ContactPerson[]> {
    return this.tokenService.getParameters(token).pipe(
        switchMap((data: Params) => this.http.get<Properties>(
            `${this.baseUrl}/abc/${data.param1}/properties/${data.param2}`)),
        map((data: Properties) => data.contactPersons));
}
     */
    // GetFolders
    getFoldersByFunctionID(funncID: string): Observable<any> {
        //GetFoldersByFunctionIdAsync           
        var data = this.api.exec<FolderInfo[]>("DM", "FolderBussiness", "GetFoldersByFunctionIdAsync", [funncID]);
        return data;
    }

    getFolders(parentId: string): Observable<any> {
        this.options.entityName = "DM_FolderInfo";
        this.options.pageLoading = false;

      //  if (folderType)
        //return this.api.exec<FolderInfo[]>("DM", "FolderBussiness", "GetFoldersAsync", [this.options, parentId]);
        //return this.api.exec<FileInfo[]>("DM", "FileBussiness", "GetFilesAsync", parentId);
        var data = this.api.exec<FolderInfo[]>("DM", "FolderBussiness", "GetFoldersAsync", [this.options,  parentId]);
        // var fileIbfo = data[0]
        return data;
    }

    getFolderByFolderType(typeMenu: any): Observable<any> {
        return this.api.exec<FolderInfo>("DM", "FolderBussiness", "GetFoldersByTypeAsync", typeMenu);
    }

    bookmarkFolder(id: string): Observable<any> {
        return this.api.exec<FolderInfo>("DM", "FolderBussiness", "BookmarkFolderAsync", id);
    }

    emptyTrash(id: string): Observable<any> {
        return this.api.exec<boolean>("DM", "FolderBussiness", "EmptyTrashAsync", id);
    }

    renameFolder(id: string, folderName: string): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FolderBussiness", "ReplaceFolderNameAsync", [id, folderName]);
    }

    copyFolder(id: string, fullName: string, id_to: string, move: number = 0, rewrite = 0): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FolderBussiness", "CopyFolderAsync", [id, fullName, id_to, move, rewrite]);
    }

    restoreFolder(id: string): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FolderBussiness", "RestoreFolderAsync", id);
    }

    deleteFolderToTrash(id: string, deleted: boolean): Observable<any> {
        return this.api.exec<boolean>("DM", "FolderBussiness", "DeleteFolderAsync", [id, deleted]);
    }

    addListFolders(list: any): Observable<any> {
        return this.api.exec<FolderInfo[]>("DM", "FolderBussiness", "AddListFoldersAsync", [list]);
        /*
         loadUserByRole(role: any) {
            this.options.pageLoading = false;
            this.options.pageSize = 20;
            this.options.entityName = "";
            this.options.funcID = "";
            this.options.predicate = "RoleID=@0";
            this.options.dataValue = role;
            this.api
            .execSv<Array<any>>(
                "Service",
                "ERM.Business.CM",
                "DataBusiness",
                "LoadDataAsync",
                this.options
            ).pipe(finalize(() => (this.onScrolling = this.loading = false)),
                map((response) => {
                if (response == null || response.length < 2) {
                    return [];
                } else {
                    const datas = response[0] as Array<any>;

                }
                }));
        }
        */
    }

    updateFolderCache(folderId: string, moduleId: string, folderPath: string, folderID): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FolderBussiness", "UpdateFolderCacheAsync", [folderId, moduleId, folderPath, folderID]);
    }

    updateFolder(data: any): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FolderBussiness", "UpdateFolderAsync", [data]);
    }

    requestOrShareFolder(data: any): Observable<any> {
        return this.api.exec<FolderInfo>("DM", "FolderBussiness", "RequestOrShareFolderAsync", [data]);
    }

    UpdateRequestAsync(id: string, objectID: string, status: string, isActive: boolean): Observable<any> {
        return this.api.execSv<DataReturn>("DM", "DM", "FolderBussiness", "UpdateRequestAsync", [id, objectID, status, isActive]);
    }

    updateFolderPermisson(data: any): Observable<any> {
        return this.api.exec<DataReturn>("DM", "FolderBussiness", "UpdateFolderPermissionAsync", [data]);
    }

    addFolder(data: any): Observable<any> {
        /*const request = {
            IsJson: true,
            FullName: folderName,
            ParentFolderId: parentId,
        };
        return this.http.post<FolderInfo>(`${this.API_DM_URL}/AddFolder`, request).pipe(
            map((data: FolderInfo) => {
                return data;
            }),
            catchError((err) => {
                return of(undefined);
            })
        );*/
        return this.api.exec<DataReturn>("DM", "FolderBussiness", "AddFolderAsync", [data]);
    }

    getFolder(Id: string): Observable<any> {
        return this.api.exec<FolderInfo>("DM", "FolderBussiness", "GetFolderByIdAsync", Id);
    }


    ngOnDestroy() {

    }
}