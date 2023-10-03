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
export class AccountsAddComponent extends UIComponent implements OnInit {
  
  //#region Contructor

  @ViewChild('form') form: LayoutAddComponent; //? element form layoutadd
  dialog!: DialogRef;
  dialogData?: DialogData
  dataDefault: any;
  title: any;
  formModel: FormModel;
  tabInfo: any[] = [ //? thiết lập tab hiển thị trên form
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-rule', text: 'Thiết lập', name: 'Establish' },
  ];
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    override cache: CacheService,
    override api: ApiHttpService,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;

    //* Set data default
    if(!dialogData?.data?.dataDefault._isEdit) dialogData.data.dataDefault.detail = true;
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

  onInit(): void {}
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

  /**
   * *Hàm xử lí khi change value
   * @param event 
   */
  valueChange(event: any) {
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    (this.form.form as CodxFormComponent).setValue(field,value,{onlySelf: true,emitEvent: false});
  }

  //#endregion Event

  //#region CRUD

  /**
   * *Hàm lưu tài khoản
   */
  onSave() {
    this.formatData();
    (this.form.form as CodxFormComponent).save(null, 0, '', '', true,{allowCompare:false}).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) {
        return;
      }
      if((res.save && !res.save.error) || (res.update && !res.update.error)){
        this.acService.clearCache('account'); //? xóa cache account khi thêm tài khoản mới || chỉnh sửa tài khoản
        this.dialog.close(); 
      }
    });
  }

  /**
   * *Hàm lưu & thêm tài khoản
   */
  onSaveAdd() {
    this.formatData();
    (this.form.form as CodxFormComponent).save(null, 0, '', '', true,{allowCompare:false}).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) {
        return;
      }
      if((res.save && !res.save.error) || (res.update && !res.update.error)){
        this.acService.clearCache('account'); //? xóa cache account khi thêm tài khoản mới || chỉnh sửa tài khoản
        (this.form.form as CodxFormComponent).refreshData({...this.dialogData?.data?.dataDefault}); //? set lại data default cho form
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
    this.title = this.dialogData?.data?.headerText;
  }

  /**
   * *Hàm xử lí format lại data trước khi lưu
   */
  formatData() {
    if ((this.form.form as CodxFormComponent).data.loanControl == '0') {
      (this.form.form as CodxFormComponent).setValue('loanControl',false,{onlySelf: true,emitEvent: false},false);
    } else {
      (this.form.form as CodxFormComponent).setValue('loanControl',true,{onlySelf: true,emitEvent: false},false);
    }
    if ((this.form.form as CodxFormComponent).data.postDetail == true) {
      (this.form.form as CodxFormComponent).setValue('postDetail','1',{onlySelf: true,emitEvent: false},false);
    }else{
      (this.form.form as CodxFormComponent).setValue('postDetail','0',{onlySelf: true,emitEvent: false},false);
    }
  }

  /**
   * *Hàm thay đổi validate form
   */
  setValidateForm(){
    let rAccountID = true;
    let lsRequire :any = [];
    if((this.form.form as CodxFormComponent).data?._keyAuto == 'AccountID') rAccountID = false; //? thiết lập không require khi dùng đánh số tự động tài khoản
    lsRequire.push({field : 'AccountID',isDisable : false,require:rAccountID});
    (this.form.form as CodxFormComponent).setRequire(lsRequire);
  }

  //#endregion Function

}
