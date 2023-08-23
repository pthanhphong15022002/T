import { TemplateRef } from '@angular/core';
import { CodxFdService } from './../codx-fd.service';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  LayoutService,
  PageTitleService,
  UIComponent,
  ViewModel,
  ViewType,
  ViewsComponent,
} from 'codx-core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent extends UIComponent implements OnInit {
  constructor(
    private injector: Injector,
    private fdService: CodxFdService,
    private layout: LayoutService,
    private pageTitle: PageTitleService
  ) {
    super(injector);
    this.cache.valueList(this.vllFD013).subscribe((res) => {
      this.lstCategory = res?.datas;
      console.log('lstCategory', this.lstCategory);
    });
  }

  // Get Data
  groupSettings: Map<string, any[]>;
  setingValues: Map<string, Map<string, string>>;
  lstCategory = [];

  //default value
  formName = 'FDParameters';
  vllFD013 = 'FD013';
  views: Array<ViewModel> = [];
  curLineType = 1;
  curGroup = null;
  refQueue = [];
  //ViewChild
  @ViewChild('tabsTmpl') tabsTmpl: TemplateRef<any>;

  onInit(): void {
    this.fdService
      .getSettings(this.formName)
      .subscribe((res: Map<string, any[]>) => {
        this.groupSettings = res;
        console.log('getSettings', res);
      });

    this.fdService.getSettingValues(this.formName).subscribe((res) => {
      this.setingValues = res;
      console.log('setting values', res);
    });
    this.refQueue = [null];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelRightRef: this.tabsTmpl,
          widthLeft: '100%',
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  viewChanged(evt: any, view: ViewsComponent) {
    this.view = view;
    this.layout.setLogo(null);
    this.pageTitle.setBreadcrumbs([]);
  }

  changeLineType(row, isNext) {
    if (isNext) {
      this.curLineType++;
      this.refQueue.push(row.recID);
    } else {
      this.curLineType--;
      this.refQueue.pop();
    }
    this.curGroup = row;

    this.detectorRef.detectChanges();
  }

  changeTabs() {
    this.curLineType = 1;
    this.detectorRef.detectChanges();
  }

  changeFieldValue(formName, transType, category, evt) {
    let isChange = false;
    if (this.setingValues[transType][evt.field] != evt.data) {
      isChange = true;
    }
    if (typeof evt.data === 'boolean') {
      this.setingValues[transType][evt.field] = evt.data ? '1' : '0';
    } else {
      this.setingValues[transType][evt.field] = evt.data;
    }
    if (isChange) {
      this.fdService
        .updateSettingValue(
          formName,
          transType,
          category,
          evt.field,
          this.setingValues[transType][evt.field]
        )
        .subscribe((res) => {
          console.log('update res', res);
        });
    }
  }
}
