import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-attachment-grid-files',
  templateUrl: './attachment-grid-files.component.html',
  styleUrls: ['./attachment-grid-files.component.scss']
})
export class AttachmentGridFilesComponent implements OnInit{
  listData: any;
  files:any;
  dialog:any;
  constructor(
    private api: ApiHttpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.dialog = dialog;
    this.listData = dt?.data;
  }
  ngOnInit(): void {
    if(this.listData && this.listData.length>0)
    {
      var ids = this.listData.map(function(item) {
        return item['fileID'];
      });
      this.getFile(ids);
    }
  }

  getFile(data:any)
  {
    this.api.execSv("DM","DM","FileBussiness","GetListFileByIDAsync",JSON.stringify(data)).subscribe(item=>{
      if(item)
      {
        this.files = item;
      }
    })
  }
}
