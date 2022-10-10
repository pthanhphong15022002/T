import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CallFuncService, DialogRef } from 'codx-core';

@Component({
  selector: 'codx-user-temp',
  templateUrl: './codx-user-temp.component.html',
  styleUrls: ['./codx-user-temp.component.css']
})
export class CodxUserTempComponent implements OnInit {

  @Input() objectID:string = "";
  @Input() objectType:string = "";
  services:string = "SYS";
  assamplyName:string = "ERM.Business.AD";
  className:string = "UsersBusiness";
  countData:number = 0;
  dialog: DialogRef;
  constructor(
    private api:ApiHttpService,
    private callFC:CallFuncService,
    private dt:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }
  getDataAsync(pObjectID:string){
    if(pObjectID){
      this.api.execSv(this.services,this.assamplyName,this.className,"GetUserByIDAsync")
      .subscribe((res:any)=>{
        if(res){
          this.countData = res;
        }
      })
    }
  }
  openPopup(){
    
  }

}
