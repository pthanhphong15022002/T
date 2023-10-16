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
    this.dataSource=data.data;
    this.header = this.dataSource[0]?.departmentName
  }
  ngAfterViewInit(): void {
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
  onSave(){

  }
}
