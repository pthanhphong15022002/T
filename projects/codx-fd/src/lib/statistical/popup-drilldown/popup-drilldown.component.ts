import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from "@angular/core";
import { DialogData, DialogRef, NotificationsService, UIComponent } from "codx-core";
import { CodxFdService } from "../../codx-fd.service";

@Component({
  selector: 'popup-drilldown',
  templateUrl: './popup-drilldown.component.html',
  styleUrls: ['./popup-drilldown.component.scss'],
})
export class DrilldownComponent extends UIComponent implements OnInit,AfterViewInit {
  @ViewChild('username') username!: TemplateRef<any>;
  @ViewChild('stt') stt!: TemplateRef<any>;
  formModel: any;
  dialog!: DialogRef;
  dataUpdate: any;
  formType: any;
  header = '';
  title = '';
  columnGrids:any=[]
  editSettings: any = {
    allowAdding: false,
    allowDeleting: false,
    allowEditing: true,
    mode: 'Dialog',
  };
  type:string;
  override onInit(): void {

  }
  dataSource:any=[];
  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    private fdSV: CodxFdService,
    private change: ChangeDetectorRef,
    @Optional() dt: DialogRef,
    @Optional() data: DialogData
  ) {
    super(injector);
    this.dialog = dt;
    this.dataSource=data.data[0];
    this.type = data.data[1]
    this.header = this.dataSource[0]?.departmentName
  }
  ngAfterViewInit(): void {
    if(this.type=='1'){
      this.columnGrids= [

        {
          field: 'username',
          headerText: "Tên nhân viên",
          //width: '25%',
          template: this.username
        },
        {
          headerText: "Tuyên dương",
          //width: '15%', //width: gv['Location'].width,
          field: 'cardType1',
        },
        {
          headerText: "Lời cảm ơn",
          //width: '10%', //gv['Equipments'].width,
          field: 'cardType2',
        },
        {
          headerText: "Góp ý thay đổi",
          //width: '20%', //width: gv['Note'].width,
          field: 'cardType3',
        },
        {
          headerText: "Đề xuất cải tiến",
          //width: '15%',
          field:'cardType4'
        },

      ];
    }
    if(this.type=='2'){
      this.columnGrids= [
        {
          field: 'stt',
          headerText: "STT",
          width:"50px",
          template: this.stt
        },
        {
          field: 'username',
          headerText: "Tên nhân viên",
          template: this.username
        },
        {
          headerText: "Tổng điểm thành tích",
          width: "100px",
          field: 'quantity',
        },
        {
          headerText: "Xếp hạng thành tích",
          width:'100px',
          field: 'stt',
        },


      ];
    }

  }
  onSave(){
    this.dialog && this.dialog.close()
  }
  countStt(data:any){
    return parseInt(data.index) +1;
  }
}
