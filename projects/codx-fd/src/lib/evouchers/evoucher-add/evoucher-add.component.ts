import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DataRequest, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxFdService } from '../../codx-fd.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-evoucher-add',
  templateUrl: './evoucher-add.component.html',
  styleUrls: ['./evoucher-add.component.scss']
})
export class EvoucherAddComponent implements OnInit{
  dialog:any;
  data:any;
  listID = [];
  constructor(
    private api : ApiHttpService,
    private notiService: NotificationsService,
    private codxFdService: CodxFdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
  }
  ngOnInit(): void { 
  this.getData();
  }

  getData()
  {
    
    this.api.execSv("FD","FD","VouchersBusiness","GetCategoriesERMAsync").subscribe((item:any)=>{
      if(item && item.length > 0)
      {
        this.data = item;
        item.forEach(element => {
          this.listID.push(element.recID);
        });
      }
    });
  }

  changeValue(e:any,data:any)
  {
    if(e?.data && !this.listID.includes(data)) this.listID.push(data);
    else this.listID = this.listID.filter(x => x != data);
  }

  onSave()
  {
    var strIDs = this.listID.join(";");
    this.api.execSv("FD","FD","VouchersBusiness","SaveCategoriesTenantAsync",strIDs).subscribe(item=>{
      if(item)
      {
        this.notiService.notifyCode("SYS034"); 
        this.dialog.close(true);
      } 
      else this.notiService.notifyCode("AC0030" , 0 , "Thực thi "); 
    });
  }
}
