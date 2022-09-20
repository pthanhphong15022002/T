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
import { ApiHttpService, TenantStore } from 'codx-core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  tenant: string;
  func = {};
  funcChildFED2042 = [];
  range = [];
  parameter;
  titlePage = 'Thiết lập';
  modelForm = { title: '', fieldName: 0, number: 0 };
  range$: Observable<any>;
  lstChildOfFED2041$: Observable<any>;
  funcChildFDS02$: Observable<any>;
  @ViewChild('notificationFedback') notificationFedback: ElementRef;
  @ViewChild('itemCategory') itemCategory: ElementRef;
  @ViewChild('itemRankDedication') itemRankDedication: ElementRef;
  public currentActive = 1;
  private funcID;
  private page;
  constructor(
    private location: Location,
    private api: ApiHttpService,
    private changedr: ChangeDetectorRef,
    private tenantStore: TenantStore,
    private router: Router,
    private at: ActivatedRoute,
    private modalService: NgbModal,
    private fdsv: CodxFdService,
    injector: Injector
  ) {
    this.tenant = this.tenantStore.get()?.tenant;
  }

  ngOnInit(): void {
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
    this.at.queryParams.subscribe((params) => {
      if (params.page) {
        this.funcID = params.funcID;
        this.router.navigate(['/' + this.tenant + '/fd/setting'], {
          queryParams: { funcID: 'FDS' },
        });
        this.page = params.page;
      }
      if (params.funcID) {
        this.funcID = params.funcID;
      }
    });
  }

  ngAfterViewInit() {
    if (this.page) {
      this.scrollToID(this.page);
      return;
    }
  }

  scroll(el: HTMLElement, numberActive) {
    el.scrollIntoView({ behavior: 'smooth' });
    this.currentActive = numberActive;
  }

  scrollToID(id) {
    let el = document.getElementById(id);
    el.scrollIntoView({ behavior: 'smooth' });
  }

  LoadData() {
    this.api
      .exec('SYS', 'FunctionListBusiness', 'GetFuncByParentAsync', ['FDS'])
      .subscribe((result) => {
        if (result) this.func = result;
      });
  }

  getParameter() {
    this.api
      .execSv<Array<any>>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByPredicate',
        ['FormName=@0 && TransType=null', 'FDParameters']
      )
      .subscribe((result) => {
        if (result?.length > 0) debugger;
        // this.parameter = this.fdsv.convertListToObject(
        //   result,
        //   'fieldName',
        //   'fieldValue'
        // );
      });
  }

  goHomePage(functionID) {
    this.router.navigate(['/' + this.tenant + '/fd/home'], {
      queryParams: { funcID: functionID },
    });
  }

  LoadDeatail(data) {
    this.router.navigate(['/' + this.tenant + '/fd/detail'], {
      queryParams: { funcID: data.functionID },
    });
  }

  LoadCategory(func) {
    this.router.navigateByUrl(this.tenant + '/' + func.url);
  }

  LoadWallet(func) {
    this.router.navigate(['/' + this.tenant + '/fd/wallet'], {
      queryParams: { funcID: func.functionID },
    });
  }

  LoadDedicationRank(func) {
    this.router.navigate(['/' + this.tenant + '/fd/dedication-rank'], {
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
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'sm',
    });
    this.changedr.detectChanges();
  }

  onSavePopup() {
    let item = {};
    item[this.modelForm.fieldName] = this.modelForm.number;
    this.parameter[this.modelForm.fieldName] = this.modelForm.number;
    this.onSaveParameter(item);
    this.modalService.dismissAll();
  }

  onSectionChange(data: any) {
    //this.currentSection = sectionId;
    this.fdsv.active = data.current;
    this.currentActive = data.index;
  }
}
