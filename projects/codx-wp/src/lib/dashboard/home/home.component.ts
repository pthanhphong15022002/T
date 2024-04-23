import {
  Component,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  DialogModel,
  PageTitleService,
  ViewModel,
  ViewType,
  CRUDService,
  UIComponent,
  AuthStore,
} from 'codx-core';
import { PopupSearchPostComponent } from './list-post/popup-search/popup-search.component';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
@Component({
  selector: 'codx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent extends UIComponent implements OnDestroy {
  views: Array<ViewModel> | any = [];
  dataService: CRUDService = null;
  predicatePortal: string = '';
  dataValuePortal: String = '';
  user: any = null;

  subcription = Subscription.EMPTY;
  @ViewChild('content') content: TemplateRef<any>;
  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private page: PageTitleService,
  ) {
    super(injector);
    this.user = this.auth.get();
  }
  ngOnDestroy(): void {
   this.subcription.unsubscribe();
  }

  onInit(): void {
    this.subcription = this.router.params.subscribe((params) => {
      let funcID = params['funcID'];
      this.cache.functionList(funcID)
      .subscribe((f) => {
        if (f) 
          this.page.setSubTitle(f.customName);
      });
    });
    this.predicatePortal = '(Category = @0 || Category = @1 || Category = @2) && (ApproveControl=@3 || ( ApproveControl=@4 && (ApproveStatus=@5 || (ApproveStatus != @6 && CreatedBy =@7))))';
    this.dataValuePortal = `1;3;4;0;1;5;4;` +this.user?.userID;
  }


  
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        showFilter: false,
        sameData: false,
        model: {
          panelLeftRef: this.content,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  
  clickShowPopupSearch() {
    let option = new DialogModel();
    option.FormModel = this.view.formModel;
    option.IsFull = true;
    this.callfc.openForm(
      PopupSearchPostComponent,
      '',
      0,
      0,
      '',
      null,
      '',
      option
    );

    // this.api.execSv("HR","ERM.Business.HR","HRBusiness_Old","SeenEmployeeInfoAsync", ["SYNC_EOFFICE_EMPLOYEE",new Date(2024,3,15)])
    // .subscribe()

  }
}
