import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CodxFormComponent,
  CodxInputComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  ImageViewerComponent,
  LayoutAddComponent,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { CodxApproveStepsComponent } from 'projects/codx-share/src/lib/components/codx-approve-steps/codx-approve-steps.component';
import { Observable, Subject, lastValueFrom } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal, Vll067, Vll075 } from '../interfaces/IJournal.interface';
import { IJournalPermission } from '../interfaces/IJournalPermission.interface';
import { JournalsAddIdimcontrolComponent } from './journals-add-idimcontrol/journals-add-idimcontrol.component';

@Component({
  selector: 'lib-journals-add',
  templateUrl: './journals-add.component.html',
  styleUrls: ['./journals-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalsAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('formJournal') public formJournal: LayoutAddComponent;
  @ViewChild('image') public image: ImageViewerComponent;
  headerText: any;
  dialog!: DialogRef; 
  dialogData?: any;
  dataDefault: any;
  vllAC122:any = [];
  vllAC107:any = [];
  vllAC104:any = [];
  vllAC105:any = [];
  vllAC125:any = [];
  vllAC126:any = [];
  vllAC108:any = [];
  vllAC109:any = [];
  vllAC110:any = [];
  vllAC111:any = [];
  isOpenCbb:any = false;
  isMultiple:any = false;
  comboboxName:any;
  comboboxValue:any;
  fieldSelected:any;
  oAutoNumber:any = [];
  mainFilterValue:any;
  baseCurr:any;
  tabInfo: any[] = [ //? thiết lập tab hiển thị trên form
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description'},
    { icon: 'icon-settings', text: 'Thiết lập', name: 'Setting' },
    { icon: 'icon-people', text: 'Phân quyền', name: 'Roles' },
  ];
  fiscalYears:any;
  isPreventChange:any = false;
  showInfo:any = false;
  preData:any;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.dataDefault = { ...dialogData.data?.oData };
    this.mainFilterValue = dialogData.data?.mainFilterValue;
    this.preData = { ...dialogData.data?.oData };
    
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.getVll('AC122','vllAC122');
    this.getVll('AC107','vllAC107');
    this.getVll('AC104','vllAC104');
    this.getVll('AC105','vllAC105');
    this.getVll('AC125','vllAC125');
    this.getVll('AC126','vllAC126');
    this.getVll('AC108','vllAC108');
    this.getVll('AC109','vllAC109');
    this.getVll('AC110','vllAC110');
    this.getVll('AC111','vllAC111');
  }

  ngAfterViewInit() {
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        map((data) => data.filter((f) => f.category === '1')?.[0]),
      )
      .subscribe((res) => {
        let dataValue = JSON.parse(res.dataValue);
        if (!this.formJournal.form.data.isEdit) this.formJournal.form.setValue('idimControl', dataValue.IDIMControl, {});
        this.baseCurr = dataValue.BaseCurr;
      });
    
    this.onDisableTab();
  }
  //#endregion Init

  //#region Event
  onclickOpenCbx(cbxName:any,cbxValue:any,value:any,fieldSelected:any){
    this.isOpenCbb = true;
    if (value === '1' || value === '4') {
      this.isMultiple = false;
    }else{
      this.isMultiple = true;
    }
    this.comboboxName = cbxName;
    this.comboboxValue = cbxValue;
    this.fieldSelected = fieldSelected;
  }

  onClickSaveCombobox(event){
    if(event == null) {
      this.isOpenCbb = false;
      return;
    }
    this.formJournal.form.setValue(this.fieldSelected,event?.id,{onlySelf: true,emitEvent: false});
    this.isOpenCbb = false;
    let i = this.formJournal.form.data.drAcctID.split(';');
  }

  valueChange(event,fields:any = ''){
    if (this.isPreventChange) {
      return;
    }
    let field = event.field || event.ControlName || fields;
    let value = event.data;
    this.formJournal.form.data.updateColumns = '';
      switch (field.toLowerCase()) {
        case 'journalname':
          let index = event?.component?.dataService?.data.findIndex((x) => x.JournalNo == event?.component?.value);
          if (value == '' || value == null || index == -1 ) {
            setTimeout(() => {
              this.isPreventChange = true;
              this.formJournal.form.formGroup.patchValue({ ...this.preData });
              this.formJournal.form.data = {...this.preData};
              this.isPreventChange = false;
              this.onDisableTab();
              this.detectorRef.detectChanges();
            }, 100);
          }
          this.api
              .exec('AC', 'JournalsBusiness', 'LoadOneDataAsync', [
                this.formJournal.form.data.journalName
              ])
              .subscribe((res:any) => {
                if (res) {
                  delete res?.journalNo;
                  delete res?.status;
                  delete res?.journalName;
                  delete res?.recID;
                  delete res?.isTemplate;
                  this.isPreventChange = true;
                  this.formJournal.form.formGroup.patchValue(res);
                  Object.assign(this.formJournal.form.data,res);
                  this.onDisableTab();
                  this.isPreventChange = false;
                  this.detectorRef.detectChanges();
                }
              });
          break;
        case 'journaltype':
          this.cache
            .valueList('AC064')
            .pipe(
              map((d) => d.datas.filter((d) => d.value === this.formJournal.form.data.journalType)),
            )
            .subscribe((res) => {
              if (res && res.length > 0) {
                let data = res[0];
                this.formJournal.form.setValue('journalDesc',data?.text,{});
                this.onDisableTab();
              }else{
                this.isPreventChange = true;
                this.formJournal.form.formGroup.patchValue({ ...this.preData });
                this.formJournal.form.data = { ...this.preData };
                this.isPreventChange = false;
                this.onDisableTab();
                this.detectorRef.detectChanges();
              }
            });
          break;
        case 'reasonid':
          value = event.data;
          this.formJournal.form.setValue(field,value,{});
          break;
        case 'periodid':
          let indexpr = event?.component?.dataService?.data.findIndex((x) => x.PeriodID == event?.component?.value);
          if (value == '' || value == null || indexpr == -1 ) {
            setTimeout(() => {
              this.isPreventChange = true;
              this.formJournal.form.setValue(field,null,{});
              this.formJournal.form.setValue('fiscalYear',null,{});
              this.isPreventChange = false;
              this.detectorRef.detectChanges();
            }, 100);
          }
          let fiscalYear = value.substring(0, 4);
          this.formJournal.form.setValue('fiscalYear',fiscalYear,{});
          break;
        case 'vatcontrol':
          this.isPreventChange = true;
          if (value) {
            this.formJournal.form.setValue('vatControl','1',{});
          }else{
            this.formJournal.form.setValue('vatControl','0',{});
          }
          this.isPreventChange = false;
          break;
        case 'autopost':
          this.isPreventChange = true;
          if (value) {
            this.formJournal.form.setValue('autoPost',1,{});
          }else{
            this.formJournal.form.setValue('autoPost',0,{});
          }
          this.isPreventChange = false;
          break;
        case 'dim1control':
          this.formJournal.form.setValue('diM1','',{});
          this.detectorRef.detectChanges();
          break;
        case 'dim2control':
          this.formJournal.form.setValue('diM2','',{});
          this.detectorRef.detectChanges();
          break;
        case 'dim3control':
          this.formJournal.form.setValue('diM3','',{});
          this.detectorRef.detectChanges();
          break;
        case 'cracctcontrol':
          this.formJournal.form.setValue('crAcctID','',{});
          this.detectorRef.detectChanges();
          break;
        case 'dracctcontrol':
          this.formJournal.form.setValue('drAcctID','',{});
          this.detectorRef.detectChanges();
          break;
        case 'multicurrency':
          if (!value) {
            this.formJournal.form.setValue('currencyID',this.baseCurr,{});
            console.log(this.formJournal.form.data);
          }
          break;
      }
  }
  //#endregion Event

  //#region Method
  onSave(type){
    if (this.image?.imageUpload?.item) {
      this.formJournal.form.setValue('hasImage',1,{onlySelf: true,emitEvent: false,});
      this.image
        .updateFileDirectReload(this.formJournal?.form?.data?.recID)
        .subscribe((res) => {
          if (res) {
            this.formJournal.form.save(null, 0, '', '', false,{allowCompare:false})
              .pipe(takeUntil(this.destroy$))
              .subscribe((res: any) => {
                if (!res) return;
                if (res || res.save || res.update) {
                  if (res || !res.save.error || !res.update.error) {
                    if (this.formJournal.form.data.isAdd || this.formJournal.form.data.isCopy)
                      this.notification.notifyCode('SYS006');
                    else
                      this.notification.notifyCode('SYS007');
                    this.dialog.close();
                  }
                }
              })
          }
        });
    }else{
      this.formJournal.form.save(null, 0, '', '', false,{allowCompare:false})
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(!res) return;
        if (res || res.save || res.update) {
          if (res || !res.save.error || !res.update.error) {
            if (this.formJournal.form.data.isAdd || this.formJournal.form.data.isCopy)
              this.notification.notifyCode('SYS006');
            else
              this.notification.notifyCode('SYS007');
            this.dialog.close();
          }
        }
      })
    }
  }

  
  //#endregion Method

  //#region Function

  openIDimControlForm(){
    let obj = {
      lsselectidimcontrol: (this.formJournal.form.data.idimControl == '' || this.formJournal.form.data.idimControl == null) ? [] : [...this.formJournal.form.data.idimControl.split(';')],
      headerText : 'Thiết lập yếu tố tồn kho',
      showAll : false
    };
    let opt = new DialogModel();
    let dialog = this.callfc.openForm(
      JournalsAddIdimcontrolComponent,
      '',
      300,
      400,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((res) => {
      if (res.event != null) {
        this.formJournal.form.setValue('idimControl',res.event,{});
        this.detectorRef.detectChanges();
      }
    });
  }

  setTitle(event) {
    this.headerText = this.dialogData?.data?.headerText;
    this.detectorRef.detectChanges();
  }

  getVll(vllCode: string, propName: string) {
    this.cache
      .valueList(vllCode)
      .pipe(
        map((d) => d.datas.map((v) => v.value))
      )
      .subscribe((res) => {
        this[propName] = res;
      });
  }

  onDisableTab(){
    let strdisable = '';
    if (this.mainFilterValue === '3') {
      if(this.formJournal.form?.data?.journalType == '' || this.formJournal.form?.data?.journalType == null) strdisable +='1;2';
    }else{
      if(this.formJournal.form?.data?.journalName == '' || this.formJournal.form?.data?.journalName == null) strdisable +='1;2';
    }
    this.formJournal.setDisabled(strdisable);
  }

  openAutoNumberForm(){
    this.cache
      .valueList('AC159')
      .pipe(
        map((d) => d.datas.filter((d) => d.value === this.formJournal.form.data.journalType)),
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          let data = {
            autoNoCode: this.formJournal?.form?.data?.voucherFormat,
            description: res[0]?.text,
            disableAssignRule: true,
            autoAssignRule: this.formJournal?.form?.data?.assignRule,
          }
          let option = new DialogModel();
          option.IsFull = true;
          let dialog = this.callfc.openForm(
            PopupAddAutoNumberComponent,
            '',
            0,
            0,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res.event) {
              this.formJournal.form.setValue('voucherFormat',res.event.autoNoCode,{});
            }
          });
        }
      })
    
    
  }

  beforeOpenCbxAutoNumber(event){
    this.cache
      .valueList('AC159')
      .pipe(
        map((d) => d.datas.filter((d) => d.value === this.formJournal.form.data.journalType)),
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.api.exec('AC','ACBusiness','LoadDataOrderPaymentLogicAsync',res[0].text).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
            console.log(res);
          })
        }
      })
  }
  //#endregion Function
}
