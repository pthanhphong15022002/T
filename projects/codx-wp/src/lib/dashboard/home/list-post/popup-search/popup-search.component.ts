import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import { modelChanged } from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  RequestModel,
  Util,
} from 'codx-core';

@Component({
  selector: 'lib-post-search',
  templateUrl: './popup-search.component.html',
  styleUrls: ['./popup-search.component.scss'],
})
export class PopupSearchPostComponent implements OnInit {
  @Input() formModel: FormModel = null;
  dialogRef: DialogRef = null;
  lstData: any[] = null;
  strEmtyData: string = '';
  funcID: string = '';
  entityName: string = '';
  predicateWP: string =
    '(ApproveControl=@0 or (ApproveControl=@1 && ApproveStatus = @2)) && Stop =false && Category !=@3';
  dataValueWP: string = '0;1;5;2';
  lstUserTag: any[] = [];
  lstUserShare: any[] = [];
  filter: any = {};
  page: number = 0;
  pageSize: number = 5;
  countData: number = 0;
  strData: string = '';
  mssgResult: string = '';
  CATEGORY = {
    POST: '1',
    COMMENTS: '2',
    FEEDBACK: '3',
    SHARE: '4',
  };
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    @Optional() dialogData: DialogData,
    @Optional() dialogRef: DialogRef
  ) {
    this.dialogRef = dialogRef;
  }
  ngOnInit(): void {
    this.getMessage('WP025');
    this.searchEvent('');
  }

  // get message
  getMessage(mssgCode: string) {
    if (!mssgCode) return;
    this.cache.message(mssgCode).subscribe((mssg: any) => {
      if (mssg && mssg?.defaultName) {
        this.mssgResult = mssg.defaultName;
        this.strData = Util.stringFormat(this.mssgResult, '0');
        this.dt.detectChanges();
      }
    });
  }
  searchEvent(searchValue: string) {
    this.api
      .execSv<any>('SYS', 'Core', 'DataBusiness', 'SearchFullTextAdvAsync', [
        {
          query: searchValue,
          filter: this.filter,
          functionID: 'WP',
          entityName: 'WP_Comments',
          page: this.page,
          pageSize: this.pageSize,
        },
      ])
      .subscribe((res: any) => {
        if (res) {
          this.lstData = res[0];
          this.countData = res[1];
          this.strData = Util.stringFormat(this.mssgResult, this.countData);
          this.dt.detectChanges();
          console.log('SearchFullTextAdvAsync: ', res);
        }
      });
  }

  clickClosePopup() {
    this.dialogRef.close();
  }

  openPopupEdit(item) {}
  removePost(item) {}
  openPopupShare(item) {}
  openPopupSave(item) {}
  valueChange($event) {}
  naviagteWPNew(post: any) {}
  clickViewDetail($event) {}
  getFiles($event, item) {}
}
