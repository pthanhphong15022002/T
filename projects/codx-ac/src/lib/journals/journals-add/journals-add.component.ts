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
import { JournalService } from '../journals.service';
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
  vllAC122:any = ['0801', 'CR', 'CP', 'BR', 'BP', 'CT', 'GJ'];
  vllAC107:any = ['II', 'IR', 'IT', 'IA'];
  vllAC104:any = ['PI'];
  vllAC105:any = ['SI', '0103', 'II', 'IT'];
  vllAC125:any = ['CP', 'BP', 'GJ', 'SI', '0103', 'PI'];
  vllAC126:any = ['SI', '0103', 'PI'];
  vllAC108:any = ['CR', 'CP', 'BR', 'BP', 'GJ'];
  vllAC109:any = ['SI', '0103', 'PI', 'II', 'IR', 'IT', '0305', 'IA'];
  vllAC110:any = ['SI', '0103', 'II', 'IT', 'IA'];
  vllAC111:any = ['PI', 'IR', 'IT', 'IA'];
  isOpenCbb:any = false;
  isMultiple:any = false;
  comboboxName:any;
  comboboxValue:any;
  fieldSelected:any;
  tabInfo: any[] = [ //? thiết lập tab hiển thị trên form
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description'},
    { icon: 'icon-settings', text: 'Thiết lập', name: 'Setting' },
    { icon: 'icon-people', text: 'Phân quyền', name: 'Roles' },
  ];
  fiscalYears:any;
  isPreventChange:any = false;
  showInfo:any = false;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private journalService: JournalService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog; //? dialog truyền vào
    this.dialogData = dialogData; //? data dialog truyền vào
    this.dataDefault = { ...dialogData.data?.oData }; //? get data của Cashpayments
    
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.acService
      .loadComboboxData$('FiscalPeriods', 'AC')
      .subscribe((periods) => {
        this.fiscalYears = [
          ...new Set(periods.map((p) => Number(p.FiscalYear))),
        ];
        console.log(this.fiscalYears);
      });
  }

  ngAfterViewInit() {
    if (!this.formJournal.form.data.isEdit) {
      this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        map((arr) => arr.filter((f) => f.category === '1')?.[0]),
        map((data) => JSON.parse(data.dataValue)?.IDIMControl)
      )
      .subscribe((res) => {
        this.formJournal.form.setValue('idimControl',res,{});
      });
    }
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
    if (event && this.formJournal.form.hasChange(this.formJournal.form.preData,this.formJournal.form.data)) { 
      this.formJournal.form.data.updateColumns = '';
      switch (field.toLowerCase()) {
        case 'journalname':
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
                  this.formJournal.form.formGroup.patchValue(res);
                  Object.assign(this.formJournal.form.data,res);
                  this.detectorRef.detectChanges();
                }
              });
          break;
        case 'journaltype':
          this.cache
            .valueList('AC064')
            .pipe(
              map((d) => d.datas.filter((d) => d.value === this.formJournal.form.data.journalType)[0]),
              map((x:any) => x.text)
            )
            .subscribe((res) => {
              if (res) {
                this.formJournal.form.setValue('journalDesc',res,{});
              }
            });
          break;
        case 'periodid':
          value = event.data;
          let fiscalYear = parseInt(value.substring(0, 4));
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
      }
    }
  }
  //#endregion Event

  //#region Method
  onSave(type){
    let obj = {
      currencyID: this.formJournal?.form?.data?.currencyID,
      cashBookID: this.formJournal?.form?.data?.cashBookID,
      warehouseIssue: this.formJournal?.form?.data?.warehouseIssue,
      warehouseReceipt: this.formJournal?.form?.data?.warehouseReceipt,
      mixedPayment: this.formJournal?.form?.data?.mixedPayment,
      subControl: this.formJournal?.form?.data?.subControl,
      settleControl: this.formJournal?.form?.data?.settleControl,
      drAcctControl: this.formJournal?.form?.data?.drAcctControl,
      drAcctID: this.formJournal?.form?.data?.drAcctID,
      crAcctControl: this.formJournal?.form?.data?.crAcctControl,
      crAcctID: this.formJournal?.form?.data?.crAcctID,
      diM1Control: this.formJournal?.form?.data?.diM1Control,
      diM2Control: this.formJournal?.form?.data?.diM2Control,
      diM3Control: this.formJournal?.form?.data?.diM3Control,
      diM1: this.formJournal?.form?.data?.diM1,
      diM2: this.formJournal?.form?.data?.diM2,
      diM3: this.formJournal?.form?.data?.diM3,
      idimControl: this.formJournal?.form?.data?.idimControl,
      isSettlement: this.formJournal?.form?.data?.isSettlement,
      projectControl: this.formJournal?.form?.data?.projectControl,
      assetControl: this.formJournal?.form?.data?.assetControl,
      loanControl: this.formJournal?.form?.data?.loanControl,
      multiCurrency: this.formJournal?.form?.data?.multiCurrency
    }
    this.formJournal.form.setValue('extras',JSON.stringify(obj),{onlySelf: true,emitEvent: false,});

    if (this.image?.imageUpload?.item) {
      this.formJournal.form.setValue('hasImage',1,{onlySelf: true,emitEvent: false,});
      this.image
        .updateFileDirectReload(this.formJournal?.form?.data?.recID)
        .subscribe((res) => {
          if (res) {
            this.formJournal.form.save(null, 0, '', '', false)
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
      this.formJournal.form.save(null, 0, '', '', false)
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
  //#endregion Function
}
