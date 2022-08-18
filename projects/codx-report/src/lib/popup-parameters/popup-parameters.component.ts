import { Component, OnInit, AfterViewInit, Optional, ChangeDetectorRef, Input, ViewChild, ElementRef } from "@angular/core";
import { ApiHttpService, CodxInputComponent, DialogData, DialogRef, NotificationsService } from "codx-core";

@Component({
  selector: 'popup-parameters',
  templateUrl: './popup-parameters.component.html',
  styleUrls: ['./popup-parameters.component.scss'],
})
export class PopupParametersComponent implements OnInit, AfterViewInit {
  @Input() maxPin: number = 2;
  @ViewChild('switchBox') switchBox: ElementRef<any>;
  data: any ;
  dialog: DialogRef;
  headerTitle:string =  "Tham số hiển thị";
  searchText: string= "";
  lstParam: any = [];
  constructor(
    private notiService: NotificationsService,
    protected detectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,

  ){
    this.data = dt?.data[0];
    this.maxPin = dt?.data[1];
    this.dialog = dialog;
  }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    this.lstParam = JSON.parse(JSON.stringify(this.data));
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

}
