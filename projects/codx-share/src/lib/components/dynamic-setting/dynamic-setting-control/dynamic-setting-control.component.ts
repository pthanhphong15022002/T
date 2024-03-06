import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { CodxFormScheduleComponent, DataRequest, DialogData, DialogModel, DialogRef, UIComponent } from 'codx-core';
import { CatagoryComponent } from '../catagory/catagory.component';

@Component({
  //standalone:true,
  selector: 'dynamic-setting-control',
  templateUrl: './dynamic-setting-control.component.html',
  styleUrls: ['./dynamic-setting-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSettingControlComponent extends UIComponent implements OnChanges{
  //#region Contrucstor
  @Input() settingFull: any;
  @Input() formModel: any;
  @Input() autoSchedule: boolean = true;
  @Input() headerText: any = 'Thiết lập tham số';
  @Input() showHeaderText: any = true;
  @Input() lineType:string = '1';
  @Input() isDialog: boolean = true;
  @Output() valueChanges: EventEmitter<any> = new EventEmitter();
  @Output() changeAutoSchedules: EventEmitter<any> = new EventEmitter();
  oldDataValue: any = {};
  isauto:any = false;
  componentSub = '';

  itemSelect:any;
  dialog?: DialogRef;
  newSetting:any = [];
  tilte:any;
  setting:any = [];
  dataValue:any = {};
  constructor(
    private inject: Injector,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    if (data) {
      this.newSetting = (data.data?.newSetting as []) || [];
      this.lineType = data.data?.lineType;
      this.itemSelect = data.data?.itemSelect;
      this.tilte= data.data?.tilte;
      this.dataValue = data.data?.dataValue;
      if(!this.settingFull)this.settingFull = data.data?.settingFull;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['lineType']){
      this.lineType = changes['lineType'].currentValue;
    }
    if(changes['settingFull']){
      this.settingFull = changes['settingFull'].currentValue;
      if (this.settingFull) {
        this.setting = this.settingFull?.paras;
        this.newSetting = this.setting;
        if (this.setting && this.lineType) {
          this.newSetting = this.setting.filter(x => x.lineType == this.lineType);
        }
        if(this.settingFull?.paraValues) this.dataValue = JSON.parse(this.settingFull?.paraValues);
        this.detectorRef.detectChanges();
      }
    }
  }
  //#endregion Contrucstor

  //#region Init
  onInit() {
    if (!this.dialog) {
      if (this.settingFull) {
        this.setting = this.settingFull?.paras;
        if (this.setting) {
          this.newSetting = this.setting.filter(x => x.lineType == this.lineType);
        }
         if(this.settingFull?.paraValues) this.dataValue = JSON.parse(this.settingFull?.paraValues);
        this.detectorRef.detectChanges();
      }
    }
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Event
  valueChange(event:any,data: any = null,autoDefault: any = null){
    var value = event.data;
    var field = event.field;
    if (
      !data.dataType ||
      (typeof value == 'boolean' &&
        data.dataType.toLowerCase() != 'boolean' &&
        data.dataType.toLowerCase() != 'bool')
    ) {
      value = +value + '';
    }
    if (data.displayMode !== '4' && data.displayMode !== '5') {
      this.dataValue[field] = value;
    } else {
      if (event.component?.controlType == 'share' && !value) return;
      if (!Array.isArray(value)) {
        if (this.dataValue[field] == value) return;
        this.dataValue[field] = value;
      }

      let fID = '',
        id = '',
        fName = '',
        name = '',
        fType = '',
        type = '';
      var settingChild = this.setting.filter((item: any) => {
        if (item.refLineID === data.recID) {
          if (item.dataFormat === 'ID') fID = item.fieldName;
          if (item.dataFormat === 'Name') fName = item.fieldName;
          if (item.dataFormat === 'Type') fType = item.fieldName;
          return item;
        }
      });
      if (Array.isArray(value)) {
        value.forEach((element, i) => {
          let space = '';
          if (i > 0) space = ';';
          id += space + (element.id || '');
          name += space + (element.text || element.objectName || '');
          type += space + (element.objectType || '');
        });
      }
      if (fID) this.dataValue[fID] = id;
      if (fName) this.dataValue[fName] = name;
      if (fType) this.dataValue[fType] = type;
      var ele = document.querySelector(
        '.share-object-name[data-recid="' + data.recID + '"]'
      );
      if (ele) ele.innerHTML = name;
    }
    this.valueChanges.emit(event);
  }

  valueShareChange(event:any,data: any = null ,autoDefault: any = null){
    if(data.fieldName=='ApproveControl'){
      this.dataValue['ApproveBy']=event.data[0].objectType;
      this.dataValue['ApproveByName']=event.data[0].objectName;
    }
  }

  changeAutoSchedule(event:any){
    this.settingFull.stop = event.data;
    this.changeAutoSchedules.emit(this.settingFull);
  }

  openPopup(evt: any, item: any, reference: string = '') {
    let value = item.fieldName;
    let recID = item.recID;
    if (!reference) reference = item.reference;
    let width = 0,
      height = 0,
      title = '',
      funcID = '',
      data = {},
      cssClass = '',
      dialogModel = new DialogModel();
    if (!reference) {
      let lineType = +this.lineType + 1 + '';
      let itemChild = this.setting.filter(
        (x) => x.refLineID === recID && x.lineType === lineType
      );
      data['newSetting'] = itemChild;
      data['lineType'] = lineType;
      data['itemSelect'] = item;
      data['tilte'] = item.tilte;
      data['dataValue'] = this.dataValue;
      data['settingFull'] = this.settingFull;
      width = 500;
      height = 100 * itemChild.length;
      this.callfc.openForm(
        DynamicSettingControlComponent,
        title,
        width,
        height,
        funcID,
        data,
        cssClass,
        dialogModel
      );
    }
  }

  openSub(evt: any, data: any, dataValue: any) {

  }

  collapseItem(evt: any, setting: any) {

  }

  openForm(){
    let option = new DialogModel();
    option.FormModel = this.formModel;
    this.callfc.openForm(
      CodxFormScheduleComponent,
      '',
      800,
      screen.height,
      '',
      this.settingFull.recID,
      '',
      option
    );
    // this.dialog.closed.subscribe((res) => {
    //   if (res && res?.event) {
    //     if (res?.event) {
    //       console.log(res);
    //     }
    //   }
    // })
  }
  //#endregion Event

  //#region Method
  onSave() {
    this.settingFull.paraValues = JSON.stringify(this.dataValue);
    this.api
      .execAction(
        'BG_ScheduleTasks',
        [this.settingFull],
        'UpdateAsync'
      )
      .subscribe((res: any) => {
        if (res) {
          this.dialog.close();
        }
      });
  }
  //#endregion

  //#region Function
  //#endregion Function
}
