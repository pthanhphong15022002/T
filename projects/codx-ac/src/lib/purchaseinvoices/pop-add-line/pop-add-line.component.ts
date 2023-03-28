import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, DialogRef, FormModel, CacheService, ApiHttpService, CallFuncService, NotificationsService, DialogData } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';

@Component({
  selector: 'lib-pop-add-line',
  templateUrl: './pop-add-line.component.html',
  styleUrls: ['./pop-add-line.component.css']
})
export class PopAddLineComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  purchaseInvoicesLines:PurchaseInvoicesLines;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) { 
    super(inject);
    this.dialog = dialog;
    this.purchaseInvoicesLines = dialogData.data?.data;
    this.headerText = dialogData.data?.headerText;
    this.type = dialogData.data?.type;
    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.purchaseInvoicesLines);
  }
  
  valueChange(e){
    this.purchaseInvoicesLines[e.field] = e.data;
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.purchaseInvoicesLines);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.purchaseInvoicesLines[keymodel[i]] === null ||
              String(this.purchaseInvoicesLines[keymodel[i]]).match(/^ *$/) !==
                null ||
              this.purchaseInvoicesLines[keymodel[i]] == 0
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  onSave(){
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      window.localStorage.setItem('dataline', JSON.stringify(this.purchaseInvoicesLines));
      this.dialog.close();
    }
  }
}
