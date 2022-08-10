import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiHttpService,
  CacheService,
  CodxService,
  LayoutService,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

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
  view: ViewsComponent;
  loaded = false;
  @ViewChild('template') template: TemplateRef<any>;
  constructor(
    private layout: LayoutService,
    private cacheService: CacheService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxService: CodxService,
    private router: Router
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

  navigate(evt: any, catagory: string) {
    this.catagory = catagory;
    var url = this.view?.function?.url;
    //this.settingService.setting = this.dataSetting[this.catagory];
    this.cacheService.valueList(this.listName).subscribe((res) => {
      debugger;
      if (res && res.datas) {
        const ds = (res.datas as any[]).find((item) => item.value == catagory);
        url += '/' + ds.default;
        console.log(ds);
        //this.router.navigateByUrl(url, { state: this.settingService });
        // this.codxService.navigate('', url, null, {
        //   setting: this.dataSetting[this.catagory],
        //   function: this.view.function,
        // });
        this.loaded = true;
      }
    });
    this.changeDetectorRef.detectChanges();
    console.log(evt);
  }

  viewChanged(evt: any, view: ViewsComponent) {
    debugger;
    this.view = view;
    var module = view.function!.module;
    var formName = view.function!.formName;
    this.cacheService.functionList(module).subscribe((f) => {
      if (f) {
        this.layout.setUrl(f.url);
        this.layout.setLogo(f.smallIcon);
      }
    });
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
        debugger;
        if (res) {
          this.dataSetting = res;
          this.itemMenu = Object.keys(res);
        }
        this.changeDetectorRef.detectChanges();
        var items = document.querySelectorAll(
          '.aside-menu .menu-item[data-id]'
        );
        if (items) {
          var item = items[0] as HTMLElement;
          item.click();
        }
        console.log(res);
      });
  }
}
