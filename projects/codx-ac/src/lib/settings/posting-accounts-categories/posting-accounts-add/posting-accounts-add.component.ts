import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  FormModel,
  DialogRef,
  CacheService,
  CallFuncService,
  NotificationsService,
  DialogData,
  RequestOption,
  CodxInputComponent,
  CodxGridviewV2Component,
} from 'codx-core';
import { IVPostingAccounts } from '../../../models/IVPostingAccounts.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-posting-accounts-add',
  templateUrl: './posting-accounts-add.component.html',
  styleUrls: ['./posting-accounts-add.component.css','../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostingAccountsAddComponent extends UIComponent implements OnInit {

  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  headerText: any;
  dialog!: DialogRef;
  subheaderText: any;
  moduleID: any;
  postType: any;
  dataDefault: any;
  eleGrid:any;
  funcName:any;
  lblAdd:any;
  _rowIndex:any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData?.data?.headerText;
    this.subheaderText = dialogData?.data?.subheaderText;
    this.dataDefault = {...dialogData.data?.dataDefault};
    this._rowIndex = parseInt(dialogData.data?.dataDefault?.index);
    this.funcName = dialogData?.data?.funcName;
    this.eleGrid = dialogData.data?.eleGrid;
  }
  //#endregion Contructor

  //#region Init
  onInit(): void {
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });
  }

  onAfterInit(e){
    this.setValidateForm();
  }

  ngAfterViewInit() {}

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event

  /**
   * *Hàm xử lí khi change value
   * @param e 
   */
  valueChange(e: any) {
    switch (e.field.toLowerCase()){
      case 'itemlevel':
        this.form.setValue('itemValue','',{onlySelf: true,emitEvent: false});
        break;
      case 'objecttype':
        this.form.setValue('objectLevel','',{onlySelf: true,emitEvent: false});
        break;
      case 'objectlevel':
        if (e.data == '3') {
          this.form.setValue('objectValue',' ',{onlySelf: true,emitEvent: false});
        }
        break;
    }
    this.form.setValue(e.field,e.data,{onlySelf: true,emitEvent: false});
    this.setValidateForm();
  }
  
  //#endregion Event

  //#region Method

  /**
   * *Hàm lưu thiết lập tài khoản hạch toán
   * @param type 
   */
  onSave(type) {
    this.form.save(null, 0, '', '', false,{allowCompare:false}).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) {
        return;
      }
      if((res.save && !res.save.error) || (res.update && !res.update.error)){
        if (this.form.data.isAdd || this.form.data.isCopy)
            (this.eleGrid as CodxGridviewV2Component).addRow(res?.save?.data,0,true,false);
        else
            (this.eleGrid as CodxGridviewV2Component).updateRow(this._rowIndex,res?.update?.data,false);
        if (type == 'save') {
          this.dialog.close();
        }else{
          this.dialog.dataService.addNew().subscribe((res: any) => {
            if (res) {
              res.isAdd = true;
              res.moduleID = this.dataDefault.moduleID;
              res.postType = this.dataDefault.postType;
              if(this.form.data.isEdit || this.form.data.isCopy) this.headerText = (this.lblAdd + ' ' + this.funcName).toUpperCase();
              this.form.refreshData({...res});
              this.detectorRef.detectChanges();
            }
          });
        }
        if (this.form.data.isAdd || this.form.data.isCopy)
            this.notification.notifyCode('SYS006');
        else 
            this.notification.notifyCode('SYS007');
      }
    });
  }
  
  //#endregion Method

  //#region Function

  /**
   * *Hàm thay đổi validate form
   */
  setValidateForm(){
    let rItemValue = false;
    let rObjectLevel = false;
    let rObjectValue = false;
    let lsRequire :any = [];
    if((this.form.data.itemLevel != '' && this.form.data.itemLevel != null) && this.form.data.itemLevel != '4') rItemValue = true;
    lsRequire.push({field : 'ItemValue',isDisable : false,require:rItemValue});

    if(this.form.data.objectLevel == '' || this.form.data.objectLevel == null) rObjectLevel = true;
    lsRequire.push({field : 'ObjectLevel',isDisable : false,require:rObjectLevel});

    if(this.form.data.objectLevel && this.form.data.objectLevel != '3') rObjectValue = true; //? thiết lập require khi mã khác tất cả
    lsRequire.push({field : 'ObjectValue',isDisable : false,require:rObjectValue});

    this.form.setRequire(lsRequire);

  }

  //#endregion Function
}
