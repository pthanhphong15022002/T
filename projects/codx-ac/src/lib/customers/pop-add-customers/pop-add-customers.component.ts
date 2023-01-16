import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CacheService, ApiHttpService, CallFuncService, NotificationsService, UIComponent, DialogData, DialogRef, FormModel, CodxFormComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Customers } from '../../models/Customers.model';

@Component({
  selector: 'lib-pop-add-customers',
  templateUrl: './pop-add-customers.component.html',
  styleUrls: ['./pop-add-customers.component.css']
})
export class PopAddCustomersComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  title:string;
  headerText:string;
  formModel: FormModel;
  dialog!: DialogRef;
  customers:Customers
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-settings icon-20 me-3', text: 'Thiết lập', name: 'Establish' },
    { icon: 'icon-train', text: 'Thông tin giao hàng', name: 'Shipment Details'},
    { icon: 'icon-location_on me-1', text: 'Danh sách địa chỉ', name: 'Location' },
    { icon: 'icon-contacts', text: 'Người liên hệ', name: 'Contact' },
    { icon: 'icon-credit_card', text: 'Tài khoản ngân hàng', name: 'Atm' },
    { icon: 'icon-20 me-2 icon-tune', text: 'Thông tin khác', name: 'Infomation' },
  ];
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialog;
    this.customers=dialog.dataService!.dataSelected;
    this.headerText = dialogData.data?.headerText;
  }

  onInit(): void {
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
}
