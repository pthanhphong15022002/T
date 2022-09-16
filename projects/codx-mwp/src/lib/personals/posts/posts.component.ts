import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Post } from '@shared/models/post';
import { Component, OnInit, ViewChild, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { ApiHttpService, UploadFile, AuthStore, TenantStore, CacheService, CallFuncService } from 'codx-core';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  user: any;

  @ViewChild('lstComment', { read: ViewContainerRef }) lstComment!: ViewContainerRef;

  constructor(private authStore: AuthStore,
    private tenantStore: TenantStore,
    private cache: CacheService,
    private api: ApiHttpService,
    private dt:ChangeDetectorRef,
    private callfc:CallFuncService,
    ) {
      this.user = this.authStore.get();
     }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.loadListPostComponent();
  }

  private loadListPostComponent() { 
    var a = this.lstComment.createComponent(ListPostComponent);
    a.instance.predicateWP = `(CreatedBy="${this.user?.userID}")`;
    a.instance.isShowCreate = false;
  }

}
