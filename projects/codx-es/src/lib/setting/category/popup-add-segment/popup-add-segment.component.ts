import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';
import {
  CacheService,
  AuthStore,
  NotificationsService,
  DialogRef,
  DialogData,
  ApiHttpService,
} from 'codx-core';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'lib-popup-add-segment',
  templateUrl: './popup-add-segment.component.html',
  styleUrls: ['./popup-add-segment.component.scss'],
})
export class PopupAddSegmentComponent implements OnInit, AfterViewInit {
  dialog!: any;
  data: any = {};
  model: any = { GridViewName: 'grvAutoNumberSegments' };
  headerText: string = 'Thêm mới yếu tố';
  colums: any = [];
  attributeType: string = '';
  disableCharNum: boolean = true;
  disableDataFormat: boolean = false;
  disableDataFormatSelect: boolean = true;
  diasbleAtt: boolean = true;
  vllDataFormat: string = 'AD010';
  autoNoSetting: any = {};
  functionID: string = '';
  function: any = {};
  referenceAutoNumer = "";
  constructor(
    private cache: CacheService,
    private cr: ChangeDetectorRef,
    private api: ApiHttpService,
    private notify: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    if (dt?.data && Object.keys(dt.data).length) {
      if (dt.data.segment){
        this.data = dt.data.segment;
        this.headerText = 'Cập nhật'
        if(this.data.dataType !='0') this.disableDataFormatSelect = false;
        if(this.data.dataType =='2') this.vllDataFormat = 'AD010';
        else this.vllDataFormat = 'AD012'
        if(this.data.dataFormat){
          this.data.charsNum = parseInt(this.data.dataFormat.match(/\d+/g)?.join(""));
          this.data.dateFormat= this.data.dataFormat.match(/[a-z]+/gi).join("");
        }
        if (this.colums.length && this.data.atttributeName) {
          let col = this.colums.find((x: any) => x.fieldName == this.data.atttributeName);
          if (col) {
            this.attributeType = col.dataType;
            if (this.attributeType?.toLowerCase() == 'datetime') {
              this.disableCharNum = true;
              this.vllDataFormat = 'AD010';
            }
            if (this.attributeType?.toLowerCase() == 'string') {
              this.vllDataFormat = 'AD012';
              this.disableCharNum = false;
            }
          }
        }

      }
      if (dt.data.columns) this.colums = dt.data.columns;
      if (dt.data.autoNoSetting) this.autoNoSetting = dt.data.autoNoSetting;
      if (dt.data.functionID) this.functionID = dt.data.functionID;
      if (
        Object.keys(this.data).length == 0 &&
        Object.keys(this.autoNoSetting).length
      ) {
        this.data.numberSettingID = this.autoNoSetting.numberSettingID;
      }

      if(dt?.data?.referenceAutoNumer) this.referenceAutoNumer = dt?.data?.referenceAutoNumer
    }
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    if (this.functionID) {
      this.cache.functionList(this.functionID).subscribe((res) => {
        if (res) this.function = res;

      });
    }
  }

  valueChange(e: any) {
    this.disableDataFormatSelect = false;
    this.disableCharNum = false;
    this.disableDataFormat = false;
    this.diasbleAtt = false;

    this.data[e.field] = e.data;
    if (e.field == 'atttributeName') {
      debugger
      if (this.colums.length) {
        let col = this.colums.find((x: any) => x.fieldName == e.data);
        if (col) {
          this.attributeType = col.dataType;
        }
      }
      else if(this.referenceAutoNumer) this.attributeType = 'string'
    }
    if(e.field == 'dataType'){
      if(e.data=='1'){
        this.data.autoNumber=true;
      }
      else  this.data.autoNumber=false;
    }
    switch (this.data.dataType) {
      case '0':
        this.disableDataFormatSelect = true;
        this.disableCharNum = true;
        this.disableDataFormat = false;
        this.vllDataFormat = 'AD012';
        this.diasbleAtt = true;
        break;
      case '1':
        this.disableDataFormat = true;
        this.disableDataFormatSelect = true;
        this.disableCharNum = true;
        this.diasbleAtt = true;
        this.vllDataFormat = 'AD012';
        break;
      case '2':
        this.disableDataFormat = true;
        this.disableDataFormatSelect = false;
        this.diasbleAtt = true;
        this.vllDataFormat = 'AD010';
        this.disableCharNum = true;
        break;
      case '4':
        this.disableDataFormat = true;
        this.disableDataFormatSelect = false;
        if (this.attributeType?.toLowerCase() == 'datetime') {
          this.disableCharNum = true;
          this.vllDataFormat = 'AD011';
        }
        if (this.attributeType?.toLowerCase() == 'string') {
          this.vllDataFormat = 'AD012';
          this.disableCharNum = false;
        }
        break;
    }
    if(e.field=='charsNum'){
      if(this.data.dateFormat) this.data.dataFormat = e.data + this.data.dateFormat;
    }
    if(e.field=='dateFormat'){
      if(this.data.charsNum) this.data.dataFormat =this.data.charsNum+ e.data;
    }
    // if(this.data.dataType != '0'){
    //   this.disableDataFormat = true;
    // }
    // else this.disableDataFormat = false;
    // if(this.data.dataType == '2'){
    //   this.disableCharNum = true
    // }
    // else if(this.data.dataType == '4' && this.attributeType?.toLowerCase() =='datetime'){

    // }
    // else if(this.data.dataType == '4' && this.attributeType?.toLowerCase() == 'string'){

    // }
    // else{

    // }
  }

  onSaveForm() {
    if (this.data.dataType && this.data.dataType != '0') {
      if (this.data.dateFormat) this.data.dataFormat = this.data.dateFormat;
      if (this.data.charsNum)
         this.data.dataFormat = this.data.charsNum + this.data.dataFormat;
    }

    this.dialog.close(this.data);
  }
}
