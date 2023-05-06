import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxGridviewComponent, FormModel, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent extends UIComponent {
  constructor(private inject: Injector, private routeActive: ActivatedRoute) {
    super(inject);
    this.routeActive.queryParams.subscribe((params) => {
      if (params?.orderID) {
        this.orderRecID = params?.orderID;
      }
    });
  }

  //#region View Child
  @ViewChild('moduleTmpl') moduleTmpl: ElementRef;
  @ViewChild('moduleQuantityTmpl') moduleQuantityTmpl: ElementRef;
  @ViewChild('moduleNetAmt') moduleNetAmt: ElementRef;
  @ViewChild('childModuleQuantityTmpl') childModuleQuantityTmpl: ElementRef;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  //#endregion
  orderFormodel: FormModel = {
    formName: 'OrderModules',
    gridViewName: 'grvOrderModules',
    entityName: 'TN_OrderModules',
  };

  orderRecID;
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
      {
        headerText: this.moduleGridHeaderText['netAmt'],
        template: this.moduleNetAmt,
        width: '150',
      },
    ];
  }

  changeModuleQuantity(moduleID: string, isChild: boolean, e) {
    let curMD = this.gridView.dataSource.find((x) => x.moduleID == moduleID);
    if (curMD) {
      if (isChild) {
        curMD.childModule.quantity = e.data;
      } else {
        curMD.quantity = e.data;
      }
      this.gridView.update();
      this.detectorRef.detectChanges();
    }
  }
}
