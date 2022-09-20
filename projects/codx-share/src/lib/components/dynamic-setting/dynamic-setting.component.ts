import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  valuelist = {};
  view: ViewsComponent;
  loaded = false;
  @ViewChild('template') template: TemplateRef<any>;
  constructor(
    private layout: LayoutService,
    private cacheService: CacheService,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxService: CodxService
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
    this.loaded = false;
    var res = this.valuelist as any;
    if (res && res.datas) {
      this.catagory = catagory;
      var url = this.view?.function?.url;
      var state = {
        setting: this.dataSetting[this.catagory],
        function: this.view.function,
        valuelist: this.valuelist,
      };
      const ds = (res.datas as any[]).find((item) => item.value == catagory);
      var path = window.location.pathname;
      if (path.endsWith('/' + ds.default)) {
        history.pushState(state, '', path);
      } else {
        url += '/' + ds.default;
        this.codxService.navigate('', url, null, state);
      }
      this.loaded = true;
    }
    this.changeDetectorRef.detectChanges();
    console.log(evt);
  }

  viewChanged(evt: any, view: ViewsComponent) {
    this.view = view;
    var module = view.function!.module;
    var formName = view.function!.formName;
    //this.layout.setLogo(null);
    this.cacheService.functionList(module).subscribe((f) => {
      if (f) {
        // this.layout.setUrl(f.url);
        // this.layout.setLogo(f.smallIcon);
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
        if (res) {
          this.dataSetting = res;
          this.itemMenu = Object.keys(res);
        }
        this.changeDetectorRef.detectChanges();

        var path = window.location.pathname;
        var arrPath = path.split('/');
        var catagory = arrPath[arrPath.length - 1];
        this.cacheService.valueList(this.listName).subscribe((res) => {
          if (res && res.datas) {
            this.valuelist = res;
            const ds = (res.datas as any[]).find(
              (item) => item.default == catagory
            );
            if (ds) {
              var ele = document.querySelector(
                '.aside-menu .menu-item[data-id="' + ds.value + '"]'
              );
              var e = ele as HTMLElement;
              e.click();
            } else {
              var items = document.querySelectorAll(
                '.aside-menu .menu-item[data-id]'
              );
              var item = items[0] as HTMLElement;
              item.click();
            }
          }
        });
      });
  }
}
