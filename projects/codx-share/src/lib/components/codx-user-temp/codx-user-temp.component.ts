import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CacheService, CallFuncService, DialogModel, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'codx-user-temp',
  templateUrl: './codx-user-temp.component.html',
  styleUrls: ['./codx-user-temp.component.css']
})
export class CodxUserTempComponent implements OnInit {

  @Input() objectID:string = "";
  @Input() formModel:FormModel = null;
  services:string = "TM";
  assamplyName:string = "ERM.Business.TM";
  className:string = "TaskResourcesBusiness";
  lstData:any[] = [];
  countData:number = 0;
  dialog: DialogRef;
  dVllTM002:any = {};
  @ViewChild("tmpListItem") tmpListItem: TemplateRef<any>;
  constructor(
    private api:ApiHttpService,
    private callFC:CallFuncService,
    private cache:CacheService,
    private dt:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getDataAsync(this.objectID);
  }
  getValueListAsync(valueList:string){
    if(valueList){
      this.cache.valueList(valueList).subscribe((res) => {
        if (res && res?.datas?.length > 0) {
          res.datas.forEach((e:any) => {
            this.dVllTM002[e.value] = e;
          });
        }
      });
    }
  }
  getDataAsync(pObjectID:string){
    if(pObjectID){
      this.api.execSv(
        this.services,
        this.assamplyName,
        this.className,
        "GetListTaskResourcesByTaskIDAsync",
        [pObjectID])
      .subscribe((res:any)=>{
        if(res){
          console.log(res);
          this.countData = res.length;
        }
      })
    }
  }
  openPopup()
  {
    if(this.tmpListItem){
      let option = new DialogModel();
      let popup =  this.callFC.openForm(this.tmpListItem,"",400,500,"",null,"",option);
      popup.closed.subscribe((res:any) => {
        if(res)
        {
          this.getDataAsync(this.objectID);
        }
      });
    }
  }
  searchName(event:any){

  }

}


