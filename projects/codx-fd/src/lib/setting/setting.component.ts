import { TemplateRef } from '@angular/core';
import { CodxFdService } from './../codx-fd.service';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormModel,
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
    private pageTitle: PageTitleService,
    private activatedRoute: ActivatedRoute
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
  formModel: FormModel;

  vllFD013 = 'FD013';
  views: Array<ViewModel> = [];
  curLineType = 1;
  curGroup = null;
  refQueue = [];
  lstPolicies = [];
  funcID;
  //ViewChild
  @ViewChild('tabsTmpl') tabsTmpl: TemplateRef<any>;

  onInit(): void {
    this.funcID = this.activatedRoute.snapshot.params['funcID'];

    this.cache.functionList(this.funcID).subscribe((res) => {
      this.formModel = res;
    });
    this.fdService
      .getSettings(this.formName)
      .subscribe((res: Map<string, any[]>) => {
        this.groupSettings = res;
        let lstFDPolicies = [];
        Object.values(this.groupSettings).forEach((settings) => {
          settings.forEach((setting) => {
            if (setting.reference == 'FDPolicies') {
              lstFDPolicies.push(setting.fieldName);
            }
          });
        });
        if (lstFDPolicies.length > 0) {
          this.fdService.getListPolicies(lstFDPolicies).subscribe((res: []) => {
            this.lstPolicies = res;
            console.log('policies', this.lstPolicies);
            this.lstPolicies.forEach((policy) => {
              Object.values(this.groupSettings).forEach((settings) => {
                let setting = settings.find(
                  (x) => x.fieldName == policy.policyID
                );
                if (setting) {
                  setting.actived = policy.actived;
                  setting.activedOn = policy.activedOn;
                  setting.policyRecID = policy.recID;
                }
              });
            });
          });
        }
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

  changeTabs() {
    this.curLineType = 1;
    this.detectorRef.detectChanges();
  }
}
