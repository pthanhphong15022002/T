import {
  Component,
  Injector,
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
@Component({
  selector: 'codx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent extends UIComponent {
  views: Array<ViewModel> | any = [];
  dataService: CRUDService = null;
  predicatePortal: string = '';
  dataValuePortal: String = '';
  user: any = null;
  @ViewChild('content') content: TemplateRef<any>;
  constructor(
    private injector: Injector,
    private auth: AuthStore,
    private page: PageTitleService,
    private apihttp:HttpClient
  ) {
    super(injector);
    this.user = this.auth.get();
  }

  onInit(): void {
    this.router.params.subscribe((params) => {
      let funcID = params['funcID'];
      this.cache.functionList(funcID).subscribe((f) => {
        if (f) {
          this.page.setSubTitle(f.customName);
        }
      });
    });
    this.predicatePortal = 'Category = @0 || Category = @1 || Category = @2';
    this.dataValuePortal = `1;3;4`;
  }


  
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        model: {
          panelLeftRef: this.content,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  test(){
    if(this.user){
      this.apihttp.get("http://localhost:9002/api/reportdowload/abc",
       {
        headers:
        {
          "lvtk": this.auth.get().token
        },
        params:{
          "reportID":"2c28c0d8-f521-ee11-94bb-00155d035517",
          "objectID":"ef247c60-245a-11ee-ab0c-7486e22779bf"
        }
      }).subscribe((res:any) => {
        debugger
      });
    }
  }
  //open popup search portal
  clickShowPopupSearch() {
    let option = new DialogModel();
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
  }
}
