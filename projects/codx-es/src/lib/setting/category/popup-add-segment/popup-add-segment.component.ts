import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Optional } from "@angular/core";
import { CacheService, AuthStore, NotificationsService, DialogRef, DialogData, ApiHttpService } from "codx-core";
import { CodxEsService } from "../../../codx-es.service";

@Component({
  selector: 'lib-popup-add-segment',
  templateUrl: './popup-add-segment.component.html',
  styleUrls: ['./popup-add-segment.component.scss'],
})
export class PopupAddSegmentComponent implements OnInit, AfterViewInit {

  dialog!:any;
  data:any={};
  model: any = {GridViewName: "grvAutoNumberSegments"}
  headerText:string = "Thêm mới yếu tố";
  colums:any=[];
  attributeType:string='';
  disableCharNum:boolean = true;
  disableDataFormat:boolean = false;
  disableDataFormatSelect:boolean = true;
  diasbleAtt:boolean = false;
  vllDataFormat: string = 'AD010';
  autoNoSetting:any={};
  constructor(private cache: CacheService,
    private cr: ChangeDetectorRef,
    private api: ApiHttpService,
    private notify: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData){
      this.dialog = dialog;
      if(dt?.data && Object.keys(dt.data).length){
       if(dt.data.segment) this.data= dt.data.segment;
       if(dt.data.columns) this.colums = dt.data.columns;
       if(dt.data.autoNoSetting) this.autoNoSetting = dt.data.autoNoSetting;
       if(Object.keys(this.data).length == 0 && Object.keys(this.autoNoSetting).length){
        this.data.numberSettingID = this.autoNoSetting.numberSettingID;
       }
      }
  }

  ngAfterViewInit(): void {

  }
  ngOnInit(): void {

  }

  valueChange(e:any){
    this.disableDataFormatSelect = false;
    this.disableCharNum = false;
    this.disableDataFormat = false;
    this.diasbleAtt = false;

    this.data[e.field] = e.data;
    if(e.field == 'attributeName'){
      if(this.colums.length){
        let col = this.colums.find((x:any)=> x.fieldName ==e.data);
        if(col){
          this.attributeType = col.dataType;
        }
      }
    }
    switch (this.data.dataType) {
      case '0':
        this.disableDataFormatSelect = true;
        this.disableCharNum = true;
        this.disableDataFormat = false;
        this.diasbleAtt = true;
        break;
      case '1':
        this.disableDataFormat = true;
        this.disableCharNum = true;
      break;
      case '2':
        this.disableDataFormat = true;
        this.vllDataFormat = 'AD010';
        this.disableCharNum = true;
      break;
      case '4':
        this.disableDataFormat = true;
        if( this.attributeType?.toLowerCase() =='datetime'){
          this.disableCharNum = true;
        }
        if(this.attributeType?.toLowerCase() == 'string'){
          this.vllDataFormat = 'AD012';
          this.disableCharNum = false;
        }
      break;

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

  onSaveForm(){
    if(this.data.dataType && this.data.dataType !='0'){
      if(this.data.dateFormat) this.data.dataFormat =this.data.dateFormat ;
      if(this.data.charsNum) this.data.dataFormat = this.data.charsNum+this.data.dataFormat
    }

    this.dialog.close(this.data);
  }

}
