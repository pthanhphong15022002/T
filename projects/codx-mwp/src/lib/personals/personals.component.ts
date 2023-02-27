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
} from '@angular/core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { ListPostComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/list-post.component';

@Component({
  selector: 'app-personals',
  templateUrl: './personals.component.html',
  styleUrls: ['./personals.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonalsComponent extends UIComponent {
  
  views: Array<ViewModel> | any = [];
  formName: any;
  gridViewName: any;
  employeeInfo: any;
  menuUrl: any;
  active = false;
  icon: any;
  funcID = '';
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
  predicatePortal = '(Category = @0 || Category = @1 || Category = @2) && (ApproveControl=@3 or (ApproveControl=@4 && ApproveStatus = @5)) && Stop = false && @CreatedBy = @6';
  dataValuePortal = '1;3;4;0;1;5;';
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
    if(this.user){
      this.dataValuePortal += this.user.userID;
    }
  }


  onInit(): void {
    this.router.params.subscribe((param) => {
      this.funcID = param['funcID'];
      this.menuUrl = this.funcID;
    });
    this.refreshAvatar();
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

  refreshAvatar() {
    this.codxShareSV.dataRefreshImage.subscribe((res) => {
      if (res) {
        this.checkRefreshAvatar = !this.checkRefreshAvatar;
        this.employeeInfo['modifiedOn'] = res?.modifiedOn;
        this.changedt.detectChanges();
      }
    });
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
