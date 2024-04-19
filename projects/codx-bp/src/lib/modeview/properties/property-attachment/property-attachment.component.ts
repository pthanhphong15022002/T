import { Component, OnInit, ViewChild } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { AttachmentGridFilesComponent } from 'projects/codx-common/src/lib/component/attachment-grid/attachment-grid-files/attachment-grid-files.component';
import { PropertyAttachmentAddRowComponent } from './property-attachment-add-row/property-attachment-add-row.component';

@Component({
  selector: 'lib-property-attachment',
  templateUrl: './property-attachment.component.html',
  styleUrls: ['./property-attachment.component.css']
})
export class PropertyAttachmentComponent extends BasePropertyComponent implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;

  selectedIndex = 0;
  listInfoFile=[];

  ngOnInit(): void {
    this.formatFile();
  }
  
  addRow(data=null)
  {
    let dialog =  this.callFuc.openForm(PropertyAttachmentAddRowComponent,"",500,600,"",{formModel: this.formModel , data: data});
    dialog.closed.subscribe(res=>{
      if(res?.event)
      {
        res.event.count = res?.event?.files.length || 0
        if(!this.data.documentControl) this.data.documentControl = [];
        let index = this.data.documentControl.findIndex(x=>x.recID == res?.event?.recID);
        if(index < 0) this.data.documentControl.push(res?.event)
        else this.data.documentControl[index] = res?.event
        this.formatFile()
        this.dataChange.emit(this.data);
      }
    })
  }
  
  formatFile()
  {
    this.data.documentControl = typeof this.data.documentControl == 'string' ? JSON.parse(this.data.documentControl) :  this.data.documentControl;
    if(this.data.documentControl && this.data.documentControl.length>0)
    {
      let ids = [];
      for(var i = 0 ; i < this.data.documentControl.length ; i++)
      {
        if(this.data.documentControl[i].files && this.data.documentControl[i].files.length>0)
        {
          this.data.documentControl[i].files.forEach(element => {
            if(!this.listInfoFile.some(x=>x.recID == element.fileID)) ids.push(element.fileID)
          });
        }
      }
     
      this.getFile(ids);
    }
  }

  getFile(data:any)
  {
    this.api.execSv("DM","DM","FileBussiness","GetListFileByIDAsync",JSON.stringify(data)).subscribe(item=>{
      if(item) {
        this.listInfoFile = this.listInfoFile.concat(item);
        this.ref.detectChanges();
      }
    })
  }

  genHTML(id:any)
  {
    if(!id || this.listInfoFile.length ==0) return "";
    var file = this.listInfoFile.filter(x => x.recID == id) as any;
    if(file && file.length>0) {
      var avatar = `../../../assets/themes/dm/default/img/${this.dmSV.getAvatar(
        file[0].extension
      )}`
      return '<img src="'+avatar+'" class="w-20px ms-2 me-2"></img><span class="text-gray-600">'+file[0].fileName+'<span>'
    }
    return "";
  }

  deleteFile(id:any)
  {
    this.api.execSv("DM","DM","FileBussiness","DeleteFileToTrashAsync",[id,"",true]).subscribe()
  }

  deleteRow(data:any,index:any)
  {
    var indexf =  this.data.documentControl[index].files.findIndex(x=>x.fileID == data?.fileID);
    this.deleteFile(this.data.documentControl[index].files[indexf].fileID);
    this.data.documentControl[index].files.splice(indexf,1);
    this.dataChange.emit(this.data);
  }
  eSign(data:any,index:any)
  {
    var indexf = this.data.documentControl[index].files.findIndex(x=>x.fileID == data?.fileID);
    this.data.documentControl[index].files[indexf].eSign = !this.data.documentControl[index].files[indexf].eSign;
    this.dataChange.emit(this.data);
  }
}
