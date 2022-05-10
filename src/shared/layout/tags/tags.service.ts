import { Injectable, OnDestroy } from "@angular/core";
import { ApiHttpService } from "codx-core";
import { Observable } from "rxjs";

@Injectable({
   providedIn: 'root',
})
export class TagsService implements OnDestroy {
   //public onOpenViewFileDialog = new BehaviorSubject<objectPara>(null);
   //isOnOpenViewFileDialog = this.onOpenViewFileDialog.asObservable();

   constructor(private api: ApiHttpService) { }

   ngOnDestroy() { }

   getTags(entityName: string): Observable<any> {
      return this.api.exec<any[]>("BS", "TagsBusiness", "GetTagsAsync", entityName);
   }
   saveTags(entityName: string, item: any): Observable<any> {
      return this.api.exec<any[]>("BS", "TagsBusiness", "SaveTagsAsync", [entityName, item]);
   }
   deleteTags(item: any): Observable<any> {
      return this.api.exec<any[]>("BS", "TagsBusiness", "DeleteTagsAsync", item);
   }
   getTagsChoose(entityName: string, guids: string): Observable<any> {
      return this.api.exec<any[]>("BS", "TagsBusiness", "GetTagsByIDAsync", [entityName, guids]);
   }
}