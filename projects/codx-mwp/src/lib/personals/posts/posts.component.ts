import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Post } from '@shared/models/post';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ViewContainerRef,
  TemplateRef,
  Injector,
} from '@angular/core';
import {
  ApiHttpService,
  UploadFile,
  AuthStore,
  TenantStore,
  CacheService,
  CallFuncService,
  ViewsComponent,
  CRUDService,
  UIComponent,
} from 'codx-core';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent extends UIComponent implements OnInit {
  user: any;

  @ViewChild('lstComment', { read: ViewContainerRef })
  lstComment!: ViewContainerRef;
  @ViewChild('moreFC') moreFC: TemplateRef<any>;
  formModel = {
    entityName: 'WP_Comments',
    entityPermission: 'WP_Comments',
    gridViewName: 'grvWPComments',
    formName: 'WPComments',
    funcID: 'WP',
  };
  dataService: any;
  predicate:string = "";
  dataValue:string = "";
  viewComponents: ViewsComponent;

  constructor(private injector: Injector,
    private authStore: AuthStore,
  ) {
    super(injector);
    this.user = this.authStore.get();
  }

  onInit(): void {
    this.predicate = `CreatedBy=@0 && Stop="false" && (Category = @1 || Category = @2 || Category = @3)`;
    this.dataValue = `${this.user.userID};1;3;4`;
  }

  ngAfterViewInit() {
  }
}
