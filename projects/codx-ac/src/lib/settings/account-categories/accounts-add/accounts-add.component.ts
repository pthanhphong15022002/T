import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-accounts-add',
  templateUrl: './accounts-add.component.html',
  styleUrls: ['./accounts-add.component.css','../../../codx-ac.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsAddComponent extends UIComponent {

  //#region Contructor
  @ViewChild('form') form: LayoutAddComponent; //? element form layoutadd
  dialog!: DialogRef;
  dialogData?: DialogData
  dataDefault: any;
  headerText: any;
  funcName: any;
  lblAdd:any;
  tabInfo: any[] = [ //? thiết lập tab hiển thị trên form
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-rule', text: 'Thiết lập', name: 'Establish' },
  ];
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.funcName = dialogData.data?.funcName;

    //* Set data default
    // if(!dialogData?.data?.dataDefault._isEdit) dialogData.data.dataDefault.detail = true;
    if(dialogData?.data?.dataDefault?.loanControl)
      dialogData.data.dataDefault.loanControl = '1';
    else
      dialogData.data.dataDefault.loanControl = '0';

    if(dialogData?.data?.dataDefault?.postDetail == '1')
      dialogData.data.dataDefault.postDetail = true;
    else
      dialogData.data.dataDefault.postDetail = false;

    this.dataDefault = {...dialogData?.data?.dataDefault};
    this.dialogData = {...dialogData};
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
  ngAfterViewInit() {
    (this.form.form as CodxFormComponent).onAfterInit.subscribe((res:any)=>{
      if(res){
        this.setValidateForm();
      }
    })
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  //#endregion Init

  //#region Event
  //#endregion Event

  //#region CRUD

  /**
   * *Hàm lưu tài khoản
   */
  onSave(type) {
    this.formatData();
    this.form.form.save(null, 0, '', '', false,{allowCompare:false}).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) {
        return;
      }
      if((res.save && !res.save.error) || (res.update && !res.update.error)){
        if (type === 'save') {
          this.dialog.close();
        }else{
          this.dialog.dataService.addNew().subscribe((res: any) => {
            if (res) {
              if(res.loanControl)
                res.loanControl = '1';
              else
                res.loanControl = '0';

              if(res.postDetail == '1')
                res.postDetail = true;
              else
                res.postDetail = false;
              res.isAdd = true;
              if(this.form.form.data.isEdit || this.form.form.data.isCopy) this.headerText = (this.lblAdd + ' ' + this.funcName).toUpperCase();
              (this.form.form as CodxFormComponent).refreshData({...res});
              this.dialog.dataService.clear();
              this.detectorRef.detectChanges();
            }
          });
        }
        if (this.form.data.isAdd || this.form.data.isCopy)
            this.notification.notifyCode('SYS006');
        else
            this.notification.notifyCode('SYS007');

        this.acService.clearCache('account');
      }
    });
  }

  //#endregion CRUD

  //#region Function

  /**
   * *Hàm thay đổi title cho form
   * @param event
   */
  setTitle(event) {
    this.headerText = this.dialogData?.data?.headerText;
  }

  /**
   * *Hàm xử lí format lại data trước khi lưu
   */
  formatData() {
    if (this.form.form.data.loanControl == '0') {
      //this.form.form.setValue('loanControl',false,{},true);
      this.form.form.data.loanControl = false
    } else {
      //this.form.form.setValue('loanControl',true,{},true);
      this.form.form.data.loanControl = true
    }
    if (this.form.form.data.postDetail == true) {
      //this.form.form.setValue('postDetail','1',{},true);
      this.form.form.data.postDetail = '1'
    }else{
      //this.form.form.setValue('postDetail','0',{},true);
      this.form.form.data.postDetail = '0'
    }
  }

  /**
   * *Hàm thay đổi validate form
   */
  setValidateForm(){
    let rAccountID = true;
    let lsRequire :any = [];
    if(this.form.form.data?._keyAuto == 'AccountID') rAccountID = false; //? thiết lập không require khi dùng đánh số tự động tài khoản
    lsRequire.push({field : 'AccountID',isDisable : false,require:rAccountID});
    this.form.form.setRequire(lsRequire);
  }

  //#endregion Function

}
