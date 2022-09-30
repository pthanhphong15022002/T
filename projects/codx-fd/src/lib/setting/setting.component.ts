import { DOCUMENT } from '@angular/common';
import {
  HostListener,
  Inject,
  Output,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { CodxFdService } from './../codx-fd.service';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  TenantStore,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Observable } from 'rxjs';
import { SettingService } from './setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})

export class SettingComponent extends UIComponent implements OnInit {
  tenant: string;
  func = {};
  funcChildFED2042 = [];
  range = [];
  parameter;
  titlePage = 'Thiết lập';
  modelForm = { title: '', fieldName: 0, number: 0 };
  functionList: any;
  range$: Observable<any>;
  lstChildOfFED2041$: Observable<any>;
  views: Array<ViewModel> = [];
  funcChildFDS02$: Observable<any>;
  currentActive = 1;
  funcID: any;

  @ViewChild('notificationFedback') notificationFedback: ElementRef;
  @ViewChild('itemCategory') itemCategory: ElementRef;
  @ViewChild('itemRankDedication') itemRankDedication: ElementRef;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;

  @Output() scrollPosition: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('elementId', {static: true}) ell: ElementRef;
 
  constructor(
    private injector: Injector,
    private changedr: ChangeDetectorRef,
    private tenantStore: TenantStore,
    private at: ActivatedRoute,
    private fdsv: CodxFdService,
    private settingSV: SettingService,
    private el: ElementRef
  ) {
    super(injector);
    this.tenant = this.tenantStore.get()?.tenant;
    this.at.params.subscribe((params) => {
      if (params.funcID) {
        this.funcID = params.funcID;
      }
    });
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) this.functionList = res;
    });
  }

  onInit(): void {
    this.LoadData();
    this.range$ = this.api.exec('BS', 'RangeLinesBusiness', 'GetByIDAsync', [
      'KUDOS',
    ]);
    this.funcChildFDS02$ = this.api.exec(
      'SYS',
      'FunctionListBusiness',
      'GetFuncByPredicateAsync',
      ['ParentID=@0', 'FDS02']
    );
    this.getParameter();
  }

  ngAfterViewInit() {
    this.views = [
      {
        active: true,
        type: ViewType.content,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
        },
      },
    ];
    let myInterval = setInterval(() => {
      this.at.queryParamMap.subscribe((params: any) => {
        if (params && params?.params?.index && params?.params?.redirectPage) {
          this.currentActive = params && params?.params?.index;
          this.scrollToID(params?.params?.redirectPage);
        }
      });
    }, 200);
    setTimeout(() => {
      clearInterval(myInterval);
      return;
    }, 3000);
    this.detectorRef.detectChanges();
  }

  
  
  scroll(el: HTMLElement, numberActive) {
    if (el)
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    this.currentActive = numberActive;
  }

  scrollToID(id) {
    let el = document.getElementById(id);
    if (el) {
      var html = el as HTMLElement;
      if (html)
        html.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
    }
  }

  LoadData() {
    this.api
      .exec('SYS', 'FunctionListBusiness', 'GetFuncByParentAsync', ['FDS'])
      .subscribe((result) => {
        if (result) this.func = result;
      });
  }

  getParameter() {
    this.settingSV.getParameter().subscribe((result) => {
      if (result?.length > 0) this.parameter = JSON.parse(result[0].dataValue);
    });
  }

  goHomePage(functionID) {
    this.codxService.navigate('', 'fd/home/', {
      queryParams: { funcID: functionID },
    });
  }

  LoadDetail(data) {
    this.codxService.navigate('', data.url);
  }

  LoadCategory(func) {
    this.codxService.navigate('', '/', {
      queryParams: { funcID: func.url },
    });
  }

  LoadWallet(func) {
    this.codxService.navigate('', '/fd/wallet', {
      queryParams: { funcID: func.functionID },
    });
  }

  LoadDedicationRank(func) {
    this.codxService.navigate('', '/fd/dedication-rank', {
      queryParams: { funcID: func },
    });
  }

  backLocation() {
    if (this.funcID == 'FDS') {
      this.goHomePage('FDT01');
      return;
    }
    // this.location.back();
  }

  valueChange(value, e) {
    let item = {};
    item[value.field] = value.data;
    this.onSaveParameter(item);
  }

  onSaveParameter(item) {
    // return this.api
    //   .callSv('SYS', 'ERM.Business.SYS', 'SettingValuesBusiness', 'SaveParamsOfPolicyAsync', [
    //     'FDParameters',
    //     null,
    //     JSON.stringify(item),
    //   ])
    //   .subscribe((res) => {
    //     if (res && res.msgBodyData[0]) {
    //       if (res.msgBodyData[0] == true) {
    //         return;
    //       }
    //     }
    //   });
  }

  open(content, typeContent) {
    this.modelForm.number = this.parameter[typeContent];
    this.modelForm.fieldName = typeContent;
    // this.modalService.open(content, {
    //   ariaLabelledBy: 'modal-basic-title',
    //   centered: true,
    //   size: 'sm',
    // });
    this.changedr.detectChanges();
  }

  onSavePopup() {
    let item = {};
    item[this.modelForm.fieldName] = this.modelForm.number;
    this.parameter[this.modelForm.fieldName] = this.modelForm.number;
    this.onSaveParameter(item);
    // this.modalService.dismissAll();
  }

  onSectionChange(data: any) {
    //this.currentSection = sectionId;
    this.fdsv.active = data.current;
    this.currentActive = data.index;
  }
}
