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
      console.log('params', params);
      if (params?.orderID) {
        this.orderRecID = params?.orderID;
        console.log('params', this.orderRecID);
        this.detectorRef.detectChanges();
      }
    });
  }

  //#region View Child
  @ViewChild('moduleTmpl') moduleTmpl: ElementRef;
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
        width: '400',
      },
      {
        headerText: this.moduleGridHeaderText['operator'],
        width: '150',
      },
      {
        headerText: this.moduleGridHeaderText['employee'],
        width: '150',
      },
      {
        headerText: this.moduleGridHeaderText['netAmt'],
        width: '150',
      },
    ];
  }
}
