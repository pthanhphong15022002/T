import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Post } from '@shared/models/post';
import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { ApiHttpService, UploadFile, AuthStore, TenantStore, CacheService, CallFuncService, ViewsComponent } from 'codx-core';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  user: any;

  @ViewChild('lstComment', { read: ViewContainerRef }) lstComment!: ViewContainerRef;
  @ViewChild('moreFC') moreFC :TemplateRef<any>;
  formModel = {
    entityName: 'WP_Comments',
    entityPermission: 'WP_Comments',
    gridViewName: 'grvWPComments',
    formName: 'WPComments',
    funcID: 'WP',
  }

  viewComponents: ViewsComponent;

  constructor(private authStore: AuthStore,
    private tenantStore: TenantStore,
    private cache: CacheService,
    private api: ApiHttpService,
    private dt:ChangeDetectorRef,
    private callfc:CallFuncService,
    ) {
      this.user = this.authStore.get();
      this.cache.functionList('').subscribe(res => {
        if(res) {}
      })
     }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.loadListPostComponent();
  }

  loadListPostComponent() { 
    var a = this.lstComment.createComponent(ListPostComponent);
    a.instance.predicateWP = `CreatedBy="${this.user?.userID}" && Category="1" && Stop="false" && ApproveControl="0"`;
    a.instance.isShowCreate = false;
    a.instance.formModel = this.formModel;
  }

  removePost(e) {
    
  }
}
