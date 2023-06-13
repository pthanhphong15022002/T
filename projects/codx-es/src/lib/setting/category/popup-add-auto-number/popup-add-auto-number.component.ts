import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxGridviewV2Component,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxEsService } from '../../../codx-es.service';
import { PopupAddSegmentComponent } from '../popup-add-segment/popup-add-segment.component';

@Component({
  selector: 'lib-popup-add-auto-number',
  templateUrl: './popup-add-auto-number.component.html',
  styleUrls: ['./popup-add-auto-number.component.scss'],
})
export class PopupAddAutoNumberComponent implements OnInit, AfterViewInit {

  @ViewChild('grid') grid!:CodxGridviewV2Component;
  dialogAutoNum: FormGroup;
  dialog: DialogRef;
  isAfterRender = false;
  afterFgANumberDefault = false;
  formModel: FormModel;
  fmANumberDefault: FormModel;
  fgANumberDefault: FormGroup;
  functionID;
  // formModelData: FormModel;
  autoNoCode;
  newAutoNoCode;
  isSaveNew: string = '0';
  viewAutoNumber = '';
  description = '';

  lstEnableSeparator = ['0', '1', '2', '3', '4'];

  cbxName: object;
  vllStringFormat;
  vllDateFormat;
  invalidValue = false;

  data: any = {};
  autoDefaultData: any = {};
  autoNoSetting:any ={
    lastNumber: 1,
  };
  isAdd: boolean = true;

  basicCollapsed: boolean = false;
  advanceCollapsed:boolean = true;
  basicOnly:boolean=false;
  headerText = 'Thiết lập số tự động';
  subHeaderText = '';
  columns: any=[];
   grvSegments:string = 'grvAutoNumberSegments';
   formNameSegments:string = 'AutoNumberSegments';
   entitySegments:string = 'AD_AutoNumberSegments'
   editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Dialog',
  };

  autoAssignRule:string='2';
  autoNoSegments:any=[];
  addedSegments:any=[];
  autoNumberSettingPreview:string ='';
  funcItem!:any;
  disableAssignRule= false;
  constructor(
    private cache: CacheService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private api: ApiHttpService,
    private notify: NotificationsService,
    private callfunc: CallFuncService,
    private auth : AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    // this.formModelData = data?.data?.formModel;
    this.autoNoCode = data?.data?.autoNoCode;

    this.description = data?.data?.description;
    this.isAdd=data?.data?.isAdd;
    this.disableAssignRule = data?.data?.disableAssignRule;
    if(data?.data?.autoAssignRule) this.autoAssignRule = data?.data?.autoAssignRule;
    // Thiết lập số tự động mặc định của function
    this.functionID = data?.data?.functionID;
    if(this.functionID){
      this.autoDefaultData.functionID = this.functionID;
      this.autoNoSetting.numberSettingID = this.functionID;
      this.autoNoSetting.numberType='1'
    }
    if(data?.data?.basicOnly){
      this.basicOnly = true;
    }
    //tao moi autoNumber theo autoNumber mẫu
    this.newAutoNoCode = data?.data?.newAutoNoCode;
    this.isSaveNew = data?.data?.isSaveNew ?? '0';

    // delete this.cbxName.
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.initForm();
  }

  getViewAutoNumber(dialog) {
    this.setViewAutoNumber();
    return this.viewAutoNumber;
  }

  initForm() {
    this.formModel = new FormModel();
    this.formModel.entityName = 'AD_AutoNumbers';
    this.formModel.formName = 'AutoNumbers';
    this.formModel.gridViewName = 'grvAutoNumbers';
    this.dialog.formModel = this.formModel;

    this.cache.gridViewSetup(this.formNameSegments,this.grvSegments).subscribe((res:any)=>{
      this.columns = Object.values(res) as any[];
      console.log(this.columns);

    })
    if (this.functionID) {
      this.cache.functionList(this.functionID).subscribe((res:any)=>{
        if(res){
          this.funcItem = res;
          this.autoNoSetting.entityName = this.funcItem.entityName;
        }

      })
      this.api.execSv("SYS",'ERM.Business.AD','AutoNumberSegmentsBusiness','GetListSegmentsAsync',[this.functionID]).subscribe((res:any)=>{
        if(res){
          this.autoNoSegments = res;
        }
      })
      this.fmANumberDefault = new FormModel();
      this.fmANumberDefault.entityName = 'AD_AutoNumberDefaults';
      this.fmANumberDefault.formName = 'AutoNumberDefaults';
      this.fmANumberDefault.gridViewName = 'grvAutoNumberDefaults';

      this.esService
        .getFormGroup(
          this.fmANumberDefault.formName,
          this.fmANumberDefault.gridViewName
        )
        .then((res) => {
          if (res) {
            this.fgANumberDefault = res;
            this.esService
              .getAutoNumberDefaults(this.functionID)
              .subscribe((model) => {
                if (model) {
                  if(this.autoNoCode){
                    model.autoNumber = this.autoNoCode;
                  } else this.autoNoCode = model.autoNumber;
                  //model.autoNumber = this.autoNoCode;
                  this.fmANumberDefault.currentData = model;
                  this.autoDefaultData = model;
                  this.fgANumberDefault.patchValue(this.autoDefaultData);
                  if(this.autoDefaultData.autoNoType == '1'){
                    this.basicCollapsed = false;
                    this.advanceCollapsed = true;
                  }
                  else if(this.autoDefaultData.autoNoType == '2'){
                    this.basicCollapsed = true;
                    this.advanceCollapsed = false;
                    this.api.execSv("SYS",'ERM.Business.AD','AutoNumberSettingsBusiness','GetAsync',this.functionID).subscribe((res:any)=>{
                      if(res){
                        this.autoNoSetting = res;
                      }

                    })
                  }
                  this.cr.detectChanges();
                  this.afterFgANumberDefault = true;
                }
              });
          }
        });

      this.esService.getAutoNumber;


    }

    this.esService.setCacheFormModel(this.formModel);
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if (fg) {
          this.dialogAutoNum = fg;
          this.esService.getAutoNumber(this.autoNoCode).subscribe((res) => {
            if (res != null) {
              this.data = res;
              if(this.isAdd){
                res.lastNumber=0;
              }
              if (res.autoNoCode != null) {
                this.isAdd = false;
                this.formModel.currentData = this.data;
                this.dialogAutoNum.patchValue(res);
                this.isAfterRender = true;
                this.setViewAutoNumber();
              } else {
                this.isAdd = true;
                res.autoNoCode = this.autoNoCode;
                this.data.gridViewName = this.formModel.gridViewName;
                this.formModel.currentData = this.data;
                this.dialogAutoNum.patchValue(res);
                this.isAfterRender = true;
              }

              this.setViewAutoNumber();
            }
          });
        }
      });
    this.getVll();
  }

  getVll() {
    let i = 0;
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((gv) => {
        if (gv) {
          this.cache
            .valueList(gv['DateFormat']?.referedValue ?? 'L0088')
            .subscribe((vllDFormat) => {
              this.vllDateFormat = vllDFormat.datas;
              i++;
              if (i == 2) {
                this.setViewAutoNumber();
              }
            });

          this.cache
            .valueList(gv['StringFormat']?.referedValue ?? 'L0089')
            .subscribe((vllSFormat) => {
              this.vllStringFormat = vllSFormat.datas;
              i++;
              if (i == 2) {
                this.setViewAutoNumber();
              }
            });
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      this.data[field] = event.data;
      if (
        field == 'stringFormat' &&
        !this.lstEnableSeparator.includes(event.data)
      ) {
        this.data.separator = '';
        this.dialogAutoNum.patchValue({ separator: '' });
      }

      if (field != 'autoReset') this.setViewAutoNumber();
      this.cr.detectChanges();
    }
  }

  valueDefaultChange(event:any,field:string=''){
    if(!field) field = event.field;
    this.autoDefaultData[field] = event.data;
  }

  valueSettingChange(event:any,field:string =''){
    if(!field) field = event.field;
    this.autoNoSetting[field] = event.data;
    this.setAutoSetingPreview();
  }
  onSaveForm() {
    if (this.dialogAutoNum.invalid == true) {
      this.esService.notifyInvalid(this.dialogAutoNum, this.formModel);
      return;
    }

    if (this.invalidValue) {
      this.notify.notifyCode('AD018');
      return;
    }

    if (this.isSaveNew == '1') {
      delete this.data.id;
      delete this.data.recID;
      this.data.autoNoCode = this.newAutoNoCode;
      this.data.description = this.description;
      this.esService.addEditAutoNumbers(this.data, true).subscribe((res) => {
        if (res) {
          this.dialogAutoNum.patchValue(this.data);
          this.dialog && this.dialog.close(res);
        }
      });
    } else {
      if (this.isAdd) {
        this.data.lastNumber = 0;
        this.data.step = 1;
        this.data.description = 'description';
        if (this.description) {
          this.data.description = this.description;
        }
      }

      this.esService
        .addEditAutoNumbers(this.data, this.isAdd)
        .subscribe((res) => {
          if (res) {
            this.dialogAutoNum.patchValue(this.data);
            this.dialog && this.dialog.close(res);
          }
        });
    }

    if (this.functionID) {
      this.esService
        .updateAutoNumberDefaults(this.autoDefaultData)
        .subscribe((res) => {
          if (res) {
            this.autoDefaultData = res;
            if(this.autoDefaultData.autoNoType == '2'){
              this.api.execAction('AD_AutoNumberSettings',[this.autoNoSetting],this.autoNoSetting.recID ?'UpdateAsync' :"SaveAsync").subscribe((rs:any)=>{
                if(this.addedSegments.length){
                 this.api.execAction('AD_AutoNumberSegments',this.addedSegments,"SaveAsync").subscribe((res:any)=>{
                  if(res){
                  }
                 })
                }
              })
            }
          }
        });
    }
  }

  setViewAutoNumber() {
    if (this.vllStringFormat && this.vllDateFormat && this.data) {
      let dateFormat = '';
      if (this.data?.dateFormat != '0') {
        dateFormat =
          this.vllDateFormat.filter((p) => p.value == this.data?.dateFormat)[0]
            ?.text ?? '';
      }

      let lengthNumber;
      let strNumber = '';

      switch (this.data?.stringFormat) {
        // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
        case '0': {
          this.viewAutoNumber =
            this.data?.fixedString + dateFormat + this.data?.separator;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            this.data?.fixedString +
            dateFormat +
            this.data?.separator +
            strNumber;
          break;
        }
        // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
        case '1': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            this.data?.fixedString +
            strNumber +
            this.data?.separator +
            dateFormat;
          break;
        }
        // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
        case '2': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            strNumber +
            this.data?.separator +
            this.data?.fixedString +
            dateFormat;
          break;
        }
        // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
        case '3': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            strNumber +
            this.data?.separator +
            dateFormat +
            this.data?.fixedString;
          break;
        }
        // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
        case '4': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            dateFormat +
            this.data?.separator +
            strNumber +
            this.data?.fixedString;
          break;
        }
        // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
        case '5': {
          this.viewAutoNumber = this.data?.fixedString + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber = dateFormat + this.data?.fixedString + strNumber;
          break;
        }
        // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
        case '6': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          break;
        }
        // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
        case '7': {
          this.viewAutoNumber =
            dateFormat + this.data?.separator + this.data?.fixedString;
          break;
        }
      }

      this.viewAutoNumber = this.viewAutoNumber.substring(
        0,
        this.data?.maxLength
      );

      //   let indexStrF = this.vllStringFormat.findIndex(
      //     (p) => p.value == this.data?.stringFormat
      //   );
      //   let indexDF = this.vllDateFormat.findIndex(
      //     (p) => p.value == this.data?.dateFormat
      //   );
      //   let stringFormat = '';
      //   let dateFormat = '';
      //   if (indexStrF >= 0) {
      //     stringFormat = this.vllStringFormat[indexStrF].text;
      //     stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
      //   }

      //   // replace dấu phân cách và chuỗi
      //   stringFormat = stringFormat
      //     .replace(/-/g, this.data?.separator == null ? '' : this.data?.separator)
      //     .replace(
      //       'Chuỗi',
      //       this.data?.fixedString == null ? '' : this.data?.fixedString
      //     );

      //   //replace ngày
      //   if (indexDF >= 0) {
      //     dateFormat =
      //       this.vllDateFormat[indexDF].text == 'None'
      //         ? ''
      //         : this.vllDateFormat[indexDF].text;
      //   }
      //   if (dateFormat == '') {
      //     let sIndex = stringFormat.indexOf('Ngày');
      //     if (stringFormat[sIndex] == this.data?.separator) {
      //       //alert('1111111111');
      //     }
      //   }
      //   stringFormat = stringFormat.replace('Ngày', dateFormat);

      //   //replace số và set chiều dài
      //   let lengthNumber = this.data?.maxLength - stringFormat.length + 2;
      //   if (lengthNumber < 0) {
      //     stringFormat = stringFormat.replace('Số', '');
      //     stringFormat = stringFormat.substring(0, this.data?.maxLength);
      //   } else if (lengthNumber == 0) {
      //     stringFormat = stringFormat.replace('Số', '');
      //   } else {
      //     let strNumber = '#'.repeat(lengthNumber);
      //     stringFormat = stringFormat.replace('Số', strNumber);
      //   }
      //   this.viewAutoNumber = stringFormat;
      this.cr.detectChanges();
    } else {
      this.getVll();
    }
  }

  prarseInt(data) {
    return parseInt(data);
  }

  blur(event){
    console.log('blur', event);
    setTimeout(() => {
      if(this.invalidValue){
        this.notify.notifyCode('AD018');
      }
    }, 500);setTimeout
  }

  collapse(name:string){
    if(name == 'basic'){

      if(!this.basicOnly){
        this.basicCollapsed = !this.basicCollapsed;
        this.advanceCollapsed = !this.basicCollapsed;
      }
      else{
        this.basicCollapsed=false;
        this.advanceCollapsed = true;
      }

    }
    if(name == 'advance'){
      if(!this.basicOnly){
        this.advanceCollapsed = !this.advanceCollapsed;
        this.basicCollapsed = !this.advanceCollapsed;
      }
    }
  }

  addSegment(){
    let option = new DialogModel;
    let dialog = this.callfunc.openForm(PopupAddSegmentComponent,'',400,600,'',{autoNoSetting:this.autoNoSetting,columns:this.columns,segment:null},'',option);
    dialog.closed.subscribe((res:any)=>{
      if(res.event){
        let newSegment = res.event;
        newSegment.createdBy = this.auth.get().userID;
        newSegment.createdOn = new Date;
        if(!newSegment.recID) newSegment.recID = Util.uid();
        this.addedSegments.push(newSegment);
        this.autoNoSegments.push(newSegment);
        this.autoNoSegments = this.autoNoSegments.slice();
        this.setAutoSetingPreview();
      }
    })
  }

  setAutoSetingPreview(){
    if(this.autoNoSegments.length){
      let strFormat ='';
      let arr = this.autoNoSegments.map((x:any)=> x.dataFormat);
      // if(this.autoNoSetting.maxLength){
      //   strFormat = this.truncateString(arr.join(''),this.autoNoSetting.maxLength);
      // }
      // else{
      //   strFormat = arr.join('');
      // }
      strFormat = arr.join('');
      if(this.autoNoSetting.lastNumber){
        let str = this.autoNoSetting.lastNumber+'';
        if(this.autoNoSetting.maxLength){
          if(arr.length < this.autoNoSetting.maxLength - str.split('').length){
            let stringFormat = strFormat+ '#'.repeat(this.autoNoSetting.maxLength- arr.length - str.split('').length || 0)+str;
            strFormat = stringFormat;
          }
          else{
            strFormat = this.truncateString(strFormat,this.autoNoSetting.maxLength - str.split('').length -1)
            let stringFormat = strFormat+ '#'.repeat(this.autoNoSetting.maxLength- arr.length - str.split('').length || 0)+str;
            strFormat = stringFormat;
          }
        }
      }
      this.autoNumberSettingPreview = strFormat;
    }
  }


  private  truncateString(str:string, num:number,format:string ='') {
    if (str.length <= num) {
      return str
    }
    return str.slice(0, num) + format
  }
}
