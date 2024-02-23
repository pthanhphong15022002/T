import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  FormModel,
  DialogRef,
  NotificationsService,
  DialogData,
  RequestOption,
  LayoutAddComponent,
} from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'lib-pop-add-inventory',
  templateUrl: './models-add.component.html',
  styleUrls: ['./models-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelsAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('form') public form: LayoutAddComponent;
  dialog!: DialogRef;
  dialogData!: DialogData;
  headerText: string;
  dataDefault: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-rule',
      text: 'Dành hàng',
      name: 'Goods',
    },
  ];
  formType: any;
  private destroy$ = new Subject<void>(); 
  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dataDefault = {...dialogData?.data?.dataDefault};
    this.dialogData = {...dialogData};
    if(dialogData?.data?.dataDefault?.accountControl == '1')
      dialogData.data.dataDefault.accountControl = true;
    else
      dialogData.data.dataDefault.accountControl = false;

    if(dialogData?.data?.dataDefault?.stdCostReceipt == '1')
      dialogData.data.dataDefault.stdCostReceipt = true;
    else
      dialogData.data.dataDefault.stdCostReceipt = false;

    if(dialogData?.data?.dataDefault?.stdCostIssue == '1')
      dialogData.data.dataDefault.stdCostIssue = true;
    else
      dialogData.data.dataDefault.stdCostIssue = false;

    if(dialogData?.data?.dataDefault?.reservePartial == '1')
      dialogData.data.dataDefault.reservePartial = true;
    else
      dialogData.data.dataDefault.reservePartial = false;

    if(dialogData?.data?.dataDefault?.reserveExpired == '1')
      dialogData.data.dataDefault.reserveExpired = true;
    else
      dialogData.data.dataDefault.reserveExpired = false;
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
  }
  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy() {
    this.onDestroy();
  }
  //#endregion

  //#region Event
  valueChanges(e: any) {
    // if (e.data) {
    //   this.inventory[e.field] = '1';
    // } else {
    //   this.inventory[e.field] = '0';
    // }
  }
  //#endregion

  //#region Function
  setTitle() {
    this.headerText = this.dialogData?.data?.headerText;
    this.dt.detectChanges();
  }
  //#endregion

  //#region CRUD
  onSave() {
    this.formatData();
    this.form.form.save(null, 0, '', '', false,{allowCompare:false}).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if(res.hasOwnProperty('save')){
        if(res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if(res.hasOwnProperty('update')){
        if(res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if (this.form.form.data.isAdd || this.form.form.data.isCopy)
        this.notification.notifyCode('SYS006');
      else
        this.notification.notifyCode('SYS007');
      this.dialog.close();
    })
    // this.checkValidate();
    // if (this.validate > 0) {
    //   this.validate = 0;
    //   return;
    // } else {
    //   if (this.formType == 'add' || this.formType == 'copy') {
    //     this.dialog.dataService
    //       .save((opt: RequestOption) => {
    //         opt.methodName = 'AddAsync';
    //         opt.className = 'InventoryModelsBusiness';
    //         opt.assemblyName = 'IV';
    //         opt.service = 'IV';
    //         opt.data = [this.inventory];
    //         return true;
    //       })
    //       .subscribe((res) => {
    //         if (res.save) {
    //           this.dialog.close();
    //           this.dt.detectChanges();
    //         } else {
    //           this.notification.notifyCode(
    //             'SYS031',
    //             0,
    //             '"' + this.inventory.inventModelID + '"'
    //           );
    //           return;
    //         }
    //       });
    //   }
    //   if (this.formType == 'edit') {
    //     this.dialog.dataService
    //       .save((opt: RequestOption) => {
    //         opt.methodName = 'UpdateAsync';
    //         opt.className = 'InventoryModelsBusiness';
    //         opt.assemblyName = 'IV';
    //         opt.service = 'IV';
    //         opt.data = [this.inventory];
    //         return true;
    //       })
    //       .subscribe((res) => {
    //         if (res.save || res.update) {
    //           this.dialog.close();
    //           this.dt.detectChanges();
    //         }
    //       });
    //   }
    // }
  }
  onSaveAdd() {
    // this.checkValidate();
    // if (this.validate > 0) {
    //   this.validate = 0;
    //   return;
    // } else {
    //   this.dialog.dataService
    //     .save((opt: RequestOption) => {
    //       opt.methodName = 'AddAsync';
    //       opt.className = 'InventoryModelsBusiness';
    //       opt.assemblyName = 'IV';
    //       opt.service = 'IV';
    //       opt.data = [this.inventory];
    //       return true;
    //     })
    //     .subscribe((res) => {
    //       if (res.save) {
    //         this.dialog.dataService.clear();
    //         this.dialog.dataService.addNew().subscribe((res) => {
    //           this.form.formGroup.patchValue(res);
    //           this.inventory = this.dialog.dataService!.dataSelected;
    //         });
    //       } else {
    //         this.notification.notifyCode(
    //           'SYS031',
    //           0,
    //           '"' + this.inventory.inventModelID + '"'
    //         );
    //         return;
    //       }
    //     });
    // }
  }

  formatData() {
    if (this.form.form.data.accountControl) {
      this.form.form.setValue('accountControl','1',{},false);
    }else{
      this.form.form.setValue('accountControl','0',{},false);
    }

    if (this.form.form.data.stdCostReceipt) {
      this.form.form.setValue('stdCostReceipt','1',{},false);
    }else{
      this.form.form.setValue('stdCostReceipt','0',{},false);
    }

    if (this.form.form.data.stdCostIssue) {
      this.form.form.setValue('stdCostIssue','1',{},false);
    }else{
      this.form.form.setValue('stdCostIssue','0',{},false);
    }

    if (this.form.form.data.reservePartial) {
      this.form.form.setValue('reservePartial','1',{},false);
    }else{
      this.form.form.setValue('reservePartial','0',{},false);
    }

    if (this.form.form.data.reserveExpired) {
      this.form.form.setValue('reserveExpired','1',{},false);
    }else{
      this.form.form.setValue('reserveExpired','0',{},false);
    }
  }
  //#endregion
}
