import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ViewModel, ViewsComponent, ApiHttpService, CodxService, CallFuncService, ViewType, SidebarModel, DialogModel, AuthService } from 'codx-core';
import { environment } from 'src/environments/environment';
import { PopupAddComponent } from '../popup/popup-add/popup-add.component';
import { PopupSearchComponent } from '../popup/popup-search/popup-search.component';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewDetailComponent implements OnInit {

  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  entityName: string = "WP_News";
  category: string = "";
  recID: string = "";
  funcID: string = "";
  dataItem: any;
  listViews = [];
  listTag = [];
  listNews = [];
  views: Array<ViewModel> = [];
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;
  constructor(private api: ApiHttpService,
    private codxService: CodxService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private callfc: CallFuncService,
    private changedt: ChangeDetectorRef,
    private sanitizer: DomSanitizer
    ) { }
  ngOnInit(): void {
    this.route.params.subscribe((p: any) => {
      this.recID = p["recID"];
      this.category = p["category"];
      this.funcID = p["funcID"];
      this.loadData(this.recID);
    });
    this.api
      .exec<any[]>('BS', 'TagsBusiness', 'GetModelDataAsync', this.entityName)
      .subscribe((o: any) => {
        if (o) {
          this.listTag = o.datas;
          this.changedt.detectChanges();
        }
      });

  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        }
      },
    ];
    this.changedt.detectChanges();
  }
  loadData(recID: string) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "GetNewsInforAsync", recID).subscribe(
      (res) => {
        if (res) {
          this.dataItem = res[0];
          console.log(this.dataItem)
          this.dataItem.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.dataItem.contents);
          this.listViews = res[1];
          this.listNews = res[2];
        }
      }
    );
  }
  clickViewDeital(data: any) {
    this.api.execSv("WP", "ERM.Business.WP", "NewsBusiness", "UpdateViewNewsAsync", data.recID).subscribe(
      (res) => {
        if (res) {
          this.codxService.navigate('', '/wp/news/'+this.funcID+'/'+data.category+'/'+data.recID);
          this.loadData(data.recID);
        }
      });
  }
  clickTag(tag: any) {
    this.codxService.navigate('', '/wp/news/' + this.funcID + '/tag/' + tag.value);
  }

  clickShowPopupCreate(newsType: string) {
    let option = new DialogModel();
    option.DataService = this.codxViews.dataService;
    option.FormModel = this.codxViews.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupAddComponent, '', 0, 0, '', {type:newsType}, '', option);
  }

  searchField: string = "";
  tagUsers: any;
  show() {
    if (this.searchField == '' || this.searchField == null) return true;
    for (let index = 0; index < this.tagUsers.length; index++) {
      const element: any = this.tagUsers[index];
      if (
        element.objectName != null &&
        element.objectName
          .toLowerCase()
          .includes(this.searchField.toLowerCase())
      ) {
        return true;
      }
    }
    return false;
  }


  getShareUser(shareControl, commentID) {
    if (shareControl == '1') {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentsBusiness',
          'GetShareOwnerListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) this.tagUsers = res;
        });
    } else {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentsBusiness',
          'GetShareUserListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res) {
            this.tagUsers = res;
          }
        });
    }
  }
  clickShowPopupSearch() {
    let option = new DialogModel();
    option.FormModel = this.codxViews.formModel;
    option.IsFull = true;
    this.callfc.openForm(PopupSearchComponent,"",0,0,"",{funcID: this.funcID},"",option);
  }
}
