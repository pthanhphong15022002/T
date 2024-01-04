import { AfterViewInit, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Day } from '@syncfusion/ej2-angular-schedule';
import { ApiHttpService, AuthStore, CRUDService, CacheService, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';

@Component({
  selector: 'pr-popup-add-salcoeffemp',
  templateUrl: './popup-add-salcoeffemp.component.html',
  styleUrls: ['./popup-add-salcoeffemp.component.css']
})
export class PopupAddSalcoeffempComponent implements OnInit,AfterViewInit {
 
  user:any;
  dialog:DialogRef;
  data:any;
  headerText:string = "Hệ số lương thưởng";
  checked:boolean = false;
  columnGrids:any[] = [];
  dataSources:any[];
  @ViewChild("codxGridViewV2") codxGridViewV2:CodxGridviewV2Component;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private notiSV:NotificationsService,
    private auth:AuthStore,
    @Optional() dialogRef:DialogRef,
    @Optional() dialogData:DialogData,
  ) 
  {
    this.user = auth.get();
    this.dialog = dialogRef;
    this.data = dialogData.data?.data;
  }

  ngOnInit(): void {
    this.dataSources = [
      {
        coeffCode:"KPI1",
        coefficient: 1
      }
    ]
    this.cache.gridViewSetup(this.dialog.formModel.formName,this.dialog.formModel.gridViewName)
    .subscribe((grd:any) => {
      let field1 = grd.CoeffCode;
      field1.field = "coeffCode";
      let field2 = grd.Coefficient;
      field2.field = "coefficient";
      this.columnGrids.push(field1);
      this.columnGrids.push(field2);
    });
  }

  ngAfterViewInit(): void {
  }


  salCoeffs:any[] = [];
  //
  addRowGrid(){
    let salCoeff = {
      coeffCode:"",
      coefficient: 0
    }
    this.codxGridViewV2.addRow(salCoeff, this.codxGridViewV2.dataSource.length);
  }

}
