import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxGridviewComponent, FormModel, UIComponent } from 'codx-core';
import { CodxTnService } from '../../codx-tn.service';
import { tmp_Modules } from '../../model/tmpModule.model';

@Component({
  selector: 'lib-buy-module',
  templateUrl: './buy-module.component.html',
  styleUrls: ['./buy-module.component.scss'],
})
export class BuyModuleComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private routeActive: ActivatedRoute,
    private tnService: CodxTnService
  ) {
    super(inject);
    this.routeActive.queryParams.subscribe((params) => {
      if (params) {
        this.moduleID = params?.moduleID;
        this.mode = params?.mode ?? this.mode;
      }
    });
  }

  @ViewChild('moduleTmpl') moduleTmpl: ElementRef;
  @ViewChild('moduleQuantityTmpl') moduleQuantityTmpl: ElementRef;
  @ViewChild('moduleNetAmt') moduleNetAmt: ElementRef;
  @ViewChild('childModuleQuantityTmpl') childModuleQuantityTmpl: ElementRef;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  orderFormodel: FormModel = {
    formName: 'OrderModules',
    gridViewName: 'grvOrderModules',
    entityName: 'TN_OrderModules',
  };

  moduleID;
  //mode: 'trial' | 'buy' | 'extend'
  mode: string = 'trial';

  nMonths = 0;
  currency = 'VND';
  cNetAmt: number = 0;
  pNetAmt: number = 0;
  orderFormControl;
  moduleDetailGridClmn = [];
  moduleGridHeaderText = {
    apps: 'Ứng dụng',
    operator: 'NV nghiệp vụ',
    employee: 'Nhân viên',
    netAmt: 'Thành tiền',
  };

  onInit(): void {
    this.cache
      .gridViewSetup(
        this.orderFormodel.formName,
        this.orderFormodel.gridViewName
      )
      .subscribe((grv) => {
        if (grv) {
          this.orderFormControl = grv;
        }
      });
  }

  ngAfterViewInit() {
    this.moduleDetailGridClmn = [
      {
        headerText: this.moduleGridHeaderText['apps'],
        template: this.moduleTmpl,
        width: '250',
      },
      {
        headerText: this.moduleGridHeaderText['operator'],
        template: this.moduleQuantityTmpl,
        width: '100',
      },
      {
        headerText: this.moduleGridHeaderText['employee'],
        template: this.childModuleQuantityTmpl,
        width: '100',
      },
    ];

    if (this.mode != 'trial') {
      this.moduleDetailGridClmn.push({
        headerText: this.moduleGridHeaderText['netAmt'],
        template: this.moduleNetAmt,
        width: '150',
      });
    }
    this.tnService.getDefaultSetting().subscribe((res: any) => {
      console.log('res', res);

      let curMD = this.gridView.dataSource.find(
        (x) => x.moduleID == this.moduleID
      );
      if (curMD) {
        let mdQuantity = 0;
        let childQuantity = 0;
        switch (this.mode) {
          case 'trial':
            mdQuantity = res.TrialUsers;
            childQuantity = res.TrialEmps;
            this.nMonths = Number(res.TrialFreeIntervalNum);
            break;
          case 'buy':
            mdQuantity = res.HireUsers;
            childQuantity = res.HireEmps;
            this.nMonths = Number(res.HireInervalNum);
            break;
          case 'extend':
            //chua biet lam gi
            break;
          default:
            break;
        }
        this.currency = res.CurrencyID;
        curMD.quantity = Number(mdQuantity);
        if (curMD.childModule) {
          curMD.childModule.quantity = Number(childQuantity);
        }
      }
      this.gridView?.gridRef?.refreshColumns();
    });
  }

  changeModuleQuantity(moduleID: string, isChild: boolean, e) {
    let curMD = this.gridView.dataSource.find((x) => x.moduleID == moduleID);

    if (curMD) {
      if (isChild) {
        curMD.childModule.quantity = e.data;
      } else {
        curMD.quantity = e.data;
      }
      this.gridView.gridRef.refreshColumns();
    }
  }

  confirmBuyMD() {
    let curMD: tmp_Modules = this.gridView.dataSource.find(
      (x) => x.moduleID == this.moduleID
    );
    curMD.currency = this.currency;
    this.tnService
      .BuyModules(this.mode, curMD, this.nMonths)
      .subscribe((res) => {
        console.log('res', res);
      });
    console.log(this.moduleID);
  }
}
