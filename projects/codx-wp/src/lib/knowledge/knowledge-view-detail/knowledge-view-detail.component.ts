import {
  AfterViewInit,
  Component,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Post } from '@shared/models/post';
import { DialogModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { WP_Comments } from '../../models/WP_Comments.model';
import { PopupAddCommentComponent } from '../../news/popup/popup-add-comment/popup-add-comment.component';
import { PopupAddComponent } from '../../news/popup/popup-add/popup-add.component';
import { PopupSearchComponent } from '../../news/popup/popup-search/popup-search.component';
import { Subject, takeUntil } from 'rxjs';
import { PopupAddKnowledgeComponent } from '../popup/popup-add-knowledge/popup-add-knowledge.component';
import { NEWSTYPE } from '../models/Knowledge.model';

@Component({
  selector: 'wp4-knowledge-view-detail',
  templateUrl: './knowledge-view-detail.component.html',
  styleUrls: ['./knowledge-view-detail.component.scss'],
})
export class KnowledgeViewDetailComponent
  extends UIComponent
  implements AfterViewInit, OnDestroy
{
  NEWSTYPE_POST = NEWSTYPE.POST;
  NEWSTYPE_VIDEO = NEWSTYPE.VIDEO;
  entityName: string = 'WP_News';
  category: string = '';
  recID: string = '';
  data: any;
  listTags = [];
  views: Array<ViewModel> = [];
  userPermission: any = null;
  moreFunction: any = null;
  private destroy$ = new Subject<void>();

  @ViewChild('tmpContent') tmpContent: TemplateRef<any>;
  constructor(private injector: Injector) {
    super(injector);
  }

  onInit(): void {
    this.router.params.subscribe((params: any) => {
      if (params) {
        this.recID = params['recID'];
        this.category = params['category'];
        this.funcID = params['funcID'];
        this.load(this.recID);
        this.getUserPermission(this.funcID);
        this.getDataTagAsync('WP_News');
      }
    });
    this.cache
      .moreFunction('CoDXSystem', '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((mFuc: any) => {
        this.moreFunction = mFuc;
      });
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.content,
        showFilter: false,
        sameData: false,
        model: {
          panelLeftRef: this.tmpContent,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dataByViews: any[] = [];
  dataByCategorys: any[] = [];
  load(recID: string) {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'GetDetailPostAsync', [
        recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.data = res[0];
          this.dataByViews = res[1];
          this.dataByCategorys = res[2];
          this.detectorRef.detectChanges();
        }
      });
  }

  getUserPermission(funcID: string) {
    if (funcID && !this.userPermission) {
      funcID = funcID + 'P';
      this.api
        .execSv(
          'SYS',
          'ERM.Business.SYS',
          'CommonBusiness',
          'GetUserPermissionsAsync',
          [funcID]
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.userPermission = res;
            this.detectorRef.detectChanges();
          }
        });
    }
  }

  getDataTagAsync(entityName: string) {
    if (entityName) {
      this.api
        .execSv('BS', 'BS', 'TagsBusiness', 'GetModelDataAsync', [entityName])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res) {
            this.listTags = res.datas;
            this.detectorRef.detectChanges();
          }
        });
    }
  }

  clickViewDeital(data: any) {
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdateViewAsync',
        data.recID
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.codxService.navigate(
      '',
      `${this.view.function.url}/${data.category}/${data.recID}`
    );
  }

  clickTag(tag: any) {
    this.codxService.navigate('', `wp2/news/${this.funcID}/tag/${tag.value}`);
  }

  openPopupAdd(type: string) {
    if (this.view) {
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      let post = new Post();
      if (this.category && this.category != 'home')
        post.category = this.category;
      post.newsType = type;
      let data = {
        action: 'Thêm',
        type: type,
        data: post,
      };
      this.callfc.openForm(
        PopupAddKnowledgeComponent,
        '',
        0,
        0,
        '',
        data,
        '',
        option
      );
    }
  }

  clickShowPopupSearch() {
    let option = new DialogModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.IsFull = true;
    this.callfc.openForm(
      PopupSearchComponent,
      '',
      0,
      0,
      '',
      this.view.funcID,
      '',
      option
    );
  }

  openPopupShare(data: any) {
    if (data) {
      let post = new WP_Comments();
      post.shares = JSON.parse(JSON.stringify(data));
      post.refID = data.recID;
      let obj = {
        data: post,
        refType: 'WP_News',
        status: 'share',
        headerText: 'Thêm',
      };
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.zIndex = 100;
      this.callfc.openForm(
        PopupAddCommentComponent,
        '',
        700,
        650,
        '',
        obj,
        '',
        option
      );
    }
  }
}
