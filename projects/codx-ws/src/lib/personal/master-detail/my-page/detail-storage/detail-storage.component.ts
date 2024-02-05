import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-detail-storage',
  templateUrl: './detail-storage.component.html',
  styleUrls: ['./detail-storage.component.scss']
})
export class DetailStorageComponent implements OnInit {
  predicate = "@0.Contains(RecID)";
  dataValue:any;
  dialog:any;
  data: any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dt?.data));
    this.dialog = dialog;
  }
  ngOnInit(): void {
    if(this.data && this.data?.details?.length > 0){
      let lstIds = this.data?.details.map(x => x.refID);
      let predicate = '';
      let dataValue = '';
      for(let i = 0; i < lstIds.length; i++){
        if(i == 0){
          predicate = `RecID==@${i}`;
          dataValue = lstIds[i];
        }else{
          predicate += ' or ' + `RecID==@${i}`;
          dataValue += ';' + lstIds[i];
        }
      }
      this.predicate = predicate;
      this.dataValue = dataValue;
    }
  }



  close()
  {
    this.dialog.close();
  }
}
