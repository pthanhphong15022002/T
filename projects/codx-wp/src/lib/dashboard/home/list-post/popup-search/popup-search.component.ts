import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  UserModel,
} from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-post-search',
  templateUrl: './popup-search.component.html',
  styleUrls: ['./popup-search.component.scss'],
})
export class PopupSearchPostComponent implements OnInit,OnDestroy {
  
  dialogRef: DialogRef = null;
  lstData: any[] = null;
  predicateWP: string = '(ApproveControl=@0 or (ApproveControl=@1 && ApproveStatus = @2)) && Stop =false && Category !=@3';
  dataValueWP: string = '0;1;5;2';
  page: number = 1;
  pageSize: number = 5;
  countData: number = 0;
  CATEGORY = {
    POST: '1',
    COMMENTS: '2',
    FEEDBACK: '3',
    SHARE: '4',
  };
  user:UserModel;
  filters:Map<string,any> = new Map<string,any>();
  objQueryFilter:Map<string,any> = new Map<string,any>();
  destroy$ = new Subject<void>();
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private auth: AuthStore,
    @Optional() dialogData: DialogData,
    @Optional() dialogRef: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.user = auth.get();
  }
  
  ngOnInit(): void {
    this.objQueryFilter.set("query","");
    this.objQueryFilter.set("functionID","WP");
    this.objQueryFilter.set("entityName","WP_Comments");
    this.objQueryFilter.set("page",this.page);
    this.objQueryFilter.set("pageSize",this.pageSize);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();    
  }

  searchEvent(textValue: string) {
    this.objQueryFilter.set("query",textValue);
    this.getFullTextSearch();
  }

  clickClosePopup() {
    this.dialogRef.close();
  }

  valueChange(event:any) {
    let field = event.field;
    let value = event.data;
    // if(field.includes("WP_News"))
    // {
    //   this.filters.set("category","4");
    //   this.filters.set("refType","WP_News")
    // }
    switch(field)
    {
      case"fromDate":
        value = event.data.fromDate;
        if(value)
          this.filters.set("CreatedOn",this.user.userID);
        else
          this.filters.delete("CreatedOn");
        break;
      case"toDate":
        value = event.data.fromDate;
        if(value)
          this.filters.set("CreatedOn",value);
        else
          this.filters.delete("CreatedOn");
        break;
      case "all":
        break;
      case "owner":
        if(value)
          this.filters.set("CreatedBy",this.user.userID);
        else
          this.filters.delete("CreatedBy");
          break;
      case "tag":
        break;
      case "share":
        break;
      case "publlic":
        if(value)
          this.filters.set("ShareControl","9");
        else
          this.filters.delete("ShareControl");
        break;
      case "WP_News.Owner":
      case "WP_News.Tag":
      case "WP_News.Share":
      case "WP_News.Publlic":
        break;
      case "image":
        break;
      case "video":
        break;
      default:
        break;
    }
    this.getFullTextSearch();
  }



  getFullTextSearch(){
    let dQueryFilter = {};
    for (let [key,value] of this.objQueryFilter) {
      dQueryFilter[key] = value;
    };
    if(this.filters)
    {
      dQueryFilter["filter"] = {};
      for(let [key,value]  of this.filters){
        dQueryFilter["filter"][key] = [value];
      }
    }
    this.api
    .execSv<any>('WP', 'WP', 'CommentsBusiness', 'SearchPostAsync', [dQueryFilter])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) 
      {
        this.lstData = res[0];
        this.countData = res[1];
        this.dt.detectChanges();
      }
    });
  }


  openPopupEdit(item) {}
  removePost(item) {}
  openPopupShare(item) {}
  openPopupSave(item) {}
  naviagteWPNew(post: any) {}
  clickViewDetail($event) {}
  getFiles($event, item) {}
}
