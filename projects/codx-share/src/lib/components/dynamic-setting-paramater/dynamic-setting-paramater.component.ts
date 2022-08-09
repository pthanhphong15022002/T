import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  LayoutService,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'codx-setting-paramater',
  templateUrl: './dynamic-setting-paramater.component.html',
  styleUrls: ['./dynamic-setting-paramater.component.css'],
})
export class DynamicSettingParamaterComponent implements OnInit {
  views: Array<ViewModel> = [];
  @ViewChild('template') template: TemplateRef<any>;
  constructor(
    private layout: LayoutService,
    private cacheService: CacheService,
    private api: ApiHttpService
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

  viewChanged(evt: any, view: ViewsComponent) {
    debugger;
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
        'CM',
        'SettingsBusiness',
        'GetSettingByFormAsync',
        formName
      )
      .subscribe((res) => {
        debugger;
        console.log(res);
      });
  }
}
