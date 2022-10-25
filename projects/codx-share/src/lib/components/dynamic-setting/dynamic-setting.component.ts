import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CodxService,
  LayoutService,
  PageTitleService,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CatagoryComponent } from './catagory/catagory.component';

@Component({
  selector: 'codx-setting-paramater',
  templateUrl: './dynamic-setting.component.html',
  styleUrls: ['./dynamic-setting.component.css'],
})
export class DynamicSettingComponent implements OnInit {
  views: Array<ViewModel> = [];
  listName = 'SYS001';
  dataSetting = {};
  itemMenu = [];
  catagory = '';
  valuelist = {};
  view: ViewsComponent;
  loaded = false;
  components = new Map<string, ComponentRef<CatagoryComponent>>();
  currentView!: CatagoryComponent;
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild('content', { read: ViewContainerRef, static: false })
  content!: ViewContainerRef;
  constructor(
    private layout: LayoutService,
    private pageTitle: PageTitleService,
    private cacheService: CacheService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        active: true,
        model: {
          panelLeftRef: this.template,
        },
      },
    ];
  }

  loadContent(evt: any, catagory: string){
    this.loaded = false;
    var res = this.valuelist as any;
    if (res && res.datas) {
      this.catagory = catagory;
      let componentRef: ComponentRef<CatagoryComponent>;
    
      this.hideCurrentView();
      this.acitveMenuView();
      if (this.components.has(catagory)) {
        componentRef = this.components.get(catagory)!;
        componentRef.location.nativeElement.classList.remove(
          'animate__slideOutLeft',
          'd-none'
        );
        componentRef.location.nativeElement.classList.add(
          'animate__slideInRight'
        );
        this.currentView = componentRef.instance;
        return;
      } else {
        let component: Type<any> = CatagoryComponent;
        componentRef = this.content.createComponent<CatagoryComponent>(component);
        componentRef.location.nativeElement.classList.add(
          'd-block',
          'animate__animated',
          'animate__slideInRight'
        );
        componentRef.instance.category = this.catagory;
        componentRef.instance.setting = this.dataSetting[this.catagory];
        componentRef.instance.function =this.view.function;
        componentRef.instance.valuelist = this.valuelist;

        this.components.set(this.catagory, componentRef);
        this.currentView = componentRef.instance;
        this.changeDetectorRef.detectChanges();
      }
    }
  }
  
  private hideCurrentView() {
    if (this.currentView?.category) {
      var curRef = this.components.get(this.currentView.category)!;
      if (curRef?.location?.nativeElement) {
        curRef.location.nativeElement.classList.remove('animate__slideInRight');
        curRef.location.nativeElement.classList.add(
          'animate__slideOutLeft',
          'd-none'
        );
      }
    }
  }

  private acitveMenuView() {
    // this.views?.filter(function (v) {
    //   if (v.type == view.type) v.active = true;
    //   else v.active = false;
    // });
  }
  
  viewChanged(evt: any, view: ViewsComponent) {
    this.view = view;
    var formName = view.function!.formName;
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
    this.loadSetting(formName);
  }

  loadSetting(formName: string) {
    this.api
      .execSv<any>(
        'SYS',
        'SYS',
        'SettingsBusiness',
        'GetSettingByFormAsync',
        formName
      )
      .subscribe((res) => {
        if (res) {
          this.dataSetting = res;
          this.itemMenu = Object.keys(res);
          this.catagory = this.itemMenu[0];
        }
        this.changeDetectorRef.detectChanges();
        this.cacheService.valueList(this.listName).subscribe((res) => {
          if (res && res.datas) {
            this.valuelist = res;

            this.loadContent(null, this.catagory);
          }
        });
      });
  }
}
