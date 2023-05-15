import { Component, OnInit, AfterViewInit, Optional, ChangeDetectorRef, Input, ViewChild, ElementRef } from "@angular/core";
import { ApiHttpService, CodxInputComponent, DialogData, DialogRef, NotificationsService } from "codx-core";

@Component({
  selector: 'popup-show-dataset',
  templateUrl: './popup-show-dataset.component.html',
  styleUrls: ['./popup-show-dataset.component.scss'],
})
export class PopupShowDatasetComponent implements OnInit, AfterViewInit {
  @Input() maxPin: number = 2;
  @ViewChild('switchBox') switchBox: ElementRef<any>;
  data: any ;
  dialog: DialogRef;
  headerTitle:string =  "DATASET";
  searchText: string= "";
  lstParam: any = [];
  dataSource:any;
  contextMenuItems:any = [
             'ExcelExport', 'CsvExport', ];
  constructor(
    private notiService: NotificationsService,
    protected detectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,

  ){
    this.data = dt?.data;
    this.loadData();
    this.dialog = dialog;
    debugger
  }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }
  onSaveForm(){
    this.api.execSv<any>(
      'SYS',
      'SYS',
      'ReportParametersBusiness',
      'UpdateParameterPinedAsync',
      [this.data]
    ).subscribe(res => {
      console.log(res);
      if(res){
        this.dialog.close(true);
      }
    });
  }

  valueChange(evt:any, input?: CodxInputComponent){
    if(evt.field === 'searchBox'){
      this.searchText = evt.data;
      this.filter();
    }
    else {
      let countPin = this.data.filter(x=>x.isPin == true).length;
      if(evt.data == true){
        if(countPin >= this.maxPin){
          this.notiService.notify(`Chương trình chỉ cho phép ghim tối đa ${this.maxPin} tham số`);
          //this.notiService.notifyCode("SYS024");
          let index = this.lstParam.findIndex(x=>x.controlName == evt.field);
          if(index > -1){
            for(let i = 0; i< this.lstParam.length; i++){
              this.lstParam[i] = this.data.filter(x=>x.controlName == this.lstParam[i].controlName)[0];
            }
            this.lstParam[index].isPin = false;
            let datas = JSON.parse(JSON.stringify(this.lstParam));
            this.lstParam = [];
            this.lstParam = datas;
;         }
          return;
        }
      }
      let index = this.data.findIndex(x=>x.controlName == evt.field);
      if(index > -1){
        this.data[index].isPin = evt.data;
      }
      return;
    }

  }

  filter(){
    if(this.searchText){
      this.lstParam = this.data.filter((x: any)=> x.labelName.toLowerCase().includes(this.searchText));
      this.detectorRef.detectChanges();
    }
    else{
      this.lstParam = this.data
    }
  }

  loadData(){
    if(this.data){
      let mapParams = new Map();

      if(Object.keys(this.data.parameters).length>0){
        for(let key in this.data.parameters){
          mapParams.set(key,this.data.parameters[key])
        }
      }
      if(this.data.report){

        this.api.execSv(this.data.report.service,this.data.report.assemblyName,this.data.report.className,this.data.report.methodName,this.data.parameters)
        .subscribe((res:any)=>{
          if(res){
            this.dataSource = JSON.parse(res);

          }
        })
      }
    }
  }

}
