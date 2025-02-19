import {
  AuthService,
  ViewsComponent,
  AuthStore,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import {
  Component,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  Injector,
  AfterViewInit,
} from '@angular/core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';

@Component({
  selector: 'app-personals',
  templateUrl: './personals.component.html',
  styleUrls: ['./personals.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonalsComponent extends UIComponent  implements AfterViewInit{
  
  views: Array<ViewModel> | any = [];
  formName: any;
  gridViewName: any;
  employeeInfo: any;
  menuUrl: any;
  active = false;
  icon: any;
  default = true;
  showHeader: boolean = true;
  checkRefreshAvatar = false;
  user:any = null;
  headerMF = {
    POST: true,
    IMAGE: false,
    VIDEO: false,
    NOTEBOOK: false,
    STORAGE: false,
    INFORMATION: false,
  };
  predicatePortal = 'CreatedBy=@0 && (Category="1" || Category="3" || Category="4") && Stop=false';
  dataValuePortal = "";
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeft') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('templateContent') templateContent: ViewsComponent;
  @ViewChild("listPost") listPost:ListPostComponent;
  constructor(
    private injector:Injector,
    private changedt: ChangeDetectorRef,
    private auth: AuthService,
    private authStore: AuthStore,
    private codxShareSV: CodxShareService
  ) 
  {
    super(injector);
    var data: any = this.auth.user$;
    this.employeeInfo = data.source._value;
    this.active = true;
    this.user = this.authStore.get();
    
  }


  onInit(): void {
    this.router.params.subscribe((param) => {
      this.funcID = param['funcID'];
      this.menuUrl = this.funcID;
    });
    if(this.user)
    {
      this.dataValuePortal = this.user.userID;
    }

  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData:false,
        model: {
          panelLeftRef: this.templateContent
        }
      },
    ];
    this.detectorRef.detectChanges();
  }


  getFunctionList() {
    // if (this.funcID) {
    //   this.cachesv.functionList(this.funcID).subscribe((res: any) => {
    //     if (res) {
    //       this.pageTitle.setSubTitle(res.customName);
    //       this.formName = res.formName;
    //       this.gridViewName = res.gridViewName;
    //
    //       this.cachesv
    //         .moreFunction(this.formName, this.gridViewName)
    //         .subscribe((res: any) => {
    //
    //           this.moreFunc = res;
    //           this.changedt.detectChanges();
    //         });
    //     }
    //   });
    // }
  }

  activeMF(type) {
    this.headerMF.IMAGE = false;
    this.headerMF.VIDEO = false;
    this.headerMF.POST = false;
    this.headerMF.NOTEBOOK = false;
    this.headerMF.STORAGE = false;
    this.headerMF.INFORMATION = false;
    this.headerMF[type] = true;
    this.changedt.detectChanges();
  }
  // edit post
  editPost(item:any){
    if(this.listPost){
      this.listPost.editPost(item);
    }
  }
  // save post
  savePost(item:any){
    if(this.listPost){
      this.listPost.savePost(item);
    }
  }
  // share post
  sharePost(item:any){
    if(this.listPost){
      this.listPost.sharePost(item);
    }
  }
  // delete post
  deletePost(item:any){
    if(this.listPost){
      this.listPost.deletePost(item);
    }
  }
}
