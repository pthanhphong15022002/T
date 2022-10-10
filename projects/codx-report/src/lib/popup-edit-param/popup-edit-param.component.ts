import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Optional } from "@angular/core";
import { NotificationsService, ApiHttpService, DialogData, DialogRef } from "codx-core";

@Component({
  selector: 'popup-parameters',
  templateUrl: './popup-edit-param.component.html',
  styleUrls: ['./popup-edit-param.component.scss'],
})
export class PopupEditParamComponent implements OnInit, AfterViewInit {
  data: any ;
  dialog: DialogRef;
  headerTitle:string =  "Cài đặt tham số";
  searchText: string= "";
  lstParam: any = [];
  objInit: any = JSON.parse(`{"reportID":"","formName":"","controlName":"","controlType":"","controlIndex":"","labelName":"","mappingIndex":"","mappingName":"","dataType":"","dataFormat":"","defaultValue":"","dependences":"","description":"","parentName":"","headerType":"","referedType":"","referedValue":"","dimensionControl":"","permissionControl":"","length":0,"isRequired":false,"isVisible":false,"isEnable":false,"isValidate":false,"isCustomize":false,"multi":false,"isPin":false,"defaultName":"","customName":"","reload":false,"createdOn":"2022-10-06T16:19:40.2046408+07:00","createdBy":null,"modifiedOn":null,"modifiedBy":null,"owner":null,"buid":"","employeeID":null,"positionID":null,"orgUnitID":null,"divisionID":null,"write":true,"delete":false,"share":false,"assign":false,"includeTables":null,"updateColumns":"","unbounds":null}`);
  constructor(
    private notiService: NotificationsService,
    protected detectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ){
    this.dialog = dialog;
    this.data = dt?.data;
    let oProps =Object.getOwnPropertyDescriptors(this.objInit);
    delete oProps["createdOn"];
    delete oProps["buid"];
    delete oProps["reload"];
    delete oProps["reportID"];
      for(let i in oProps){

        if(oProps[i].value!= null ){
          var prop = {name: i, type: typeof(oProps[i].value)};
          this.lstParam.push(prop);
        }
      }
      debugger
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {

  }

  valueChange(evt:any){
    this.data[evt.field] = evt.data;
  }

  onSaveForm(){
    this.api.execSv<any>(
      'SYS',
      'SYS',
      'ReportParametersBusiness',
      'UpdateReportParamAsync',
      this.data
    ).subscribe(res => {
      if(res){
        this.dialog.close(true);
      }
    });
  }
}
