import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, DialogRef, NotificationsService, AuthService, DialogData, CodxGridviewV2Component } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { VATInvoices } from '../../../models/VATInvoices.model';

@Component({
  selector: 'lib-pop-up-vat',
  templateUrl: './pop-up-vat.component.html',
  styleUrls: ['./pop-up-vat.component.css']
})
export class PopUpVatComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid')
  public grid: CodxGridviewV2Component;
  dialog!: DialogRef;
  cashpayment: any;
  dateNow:any = new Date();
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  editSettings: any = {
    allowAdding: true,
    allowDeleting: true,
    allowEditing: true,
    mode: 'Normal',
  };
  dataVat: Array<any> = [];
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private auth: AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.cashpayment = dialogData.data.cashpayment;
  }
  onInit(): void {
    
  }

  ngAfterViewInit() {
    this.acService.setPopupSize(this.dialog,'80%','80%');
    this.dt.detectChanges();
  }
  close() {
    this.dialog.close();
  }
  valueChange(e: any) {

  }
  submit(){

  }
  addRow(){
    let data = new VATInvoices();
    let idx = this.grid.dataSource.length;
    data.rowNo = idx + 1;
    this.grid.addRow(data,idx);
  }
}
