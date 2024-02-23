import { Component, Injector, OnInit, Optional } from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'popup-supplier',
  templateUrl: './popup-supplier.component.html',
  styleUrls: ['./popup-supplier.component.scss'],
})
export class PopupSupplierComponent extends UIComponent {
  dialog;
  data;
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private authStore: AuthStore,
    private notify: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
  }
  currentSupplier;
  vllSupplier=[];
  title;
  onInit(): void {
    this.cache.valueList('ES029').subscribe((res) => {
      if (res) {
        this.vllSupplier = res?.datas;
        
        this.currentSupplier = res?.datas[0]?.value;
      }
    });
  }

  changeSupplier(supplier) {
    if (supplier) {
      this.currentSupplier = supplier;
      this.detectorRef.detectChanges();
    }
  }
  saveForm() {
    if (this.currentSupplier) {
      this.dialog && this.dialog.close(this.currentSupplier)
    }
  }
}
