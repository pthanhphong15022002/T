import { Component, ViewChild } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { AttachmentGridFilesComponent } from 'projects/codx-common/src/lib/component/attachment-grid/attachment-grid-files/attachment-grid-files.component';

@Component({
  selector: 'lib-property-attachment',
  templateUrl: './property-attachment.component.html',
  styleUrls: ['./property-attachment.component.css']
})
export class PropertyAttachmentComponent extends BasePropertyComponent{
  selectedIndex = 0;
  @ViewChild('attachment') attachment: AttachmentComponent;
  
  addRow()
  {
    var data = 
    {
      recID : Util.uid(),
      title : '',
      isRequired: false,
      count : 0,
      listType: "2",
      refID: ''
    }
    data.refID = data.recID
    if(!this.data.documentControl) this.data.documentControl = [];
    this.data.documentControl.push(data);
    this.dataChange.emit(this.data);
  }
  
  deleteRow(index:any)
  {
    this.data.documentControl.splice(index, 1);;
    this.dataChange.emit(this.data);
  }

  uploadFile(recID:any, index:any)
  {
    this.selectedIndex = index;
    this.attachment.objectId = recID;
    this.attachment.uploadFile();
  }

  valueChangeAttach(e:any,index:any)
  {
    this.data.documentControl[index][e?.field]= e?.data;
    this.dataChange.emit(this.data);
  }

  fileSave(e:any)
  {
    if(!this.data.documentControl[this.selectedIndex]?.files) {
      this.data.documentControl[this.selectedIndex].files = [];
      this.data.documentControl[this.selectedIndex].count = 0;
    }
    var count = 1;
    if(Array.isArray(e))
    {
      count = e.length;
      e.forEach(elm=>{
        var obj = 
        {
          fileID : elm.data.recID,
          type: '1'
        }
        this.data.documentControl[this.selectedIndex].files.push(obj);
      })
  
    } 
    else
    {
      var obj = 
      {
        fileID : e.recID,
        type: '1'
      }
      this.data.documentControl[this.selectedIndex].files.push(obj);
    }
    this.data.documentControl[this.selectedIndex].count += count;
    this.dataChange.emit(this.data);
  }

  openFormFile(data:any)
  {
    this.callFuc.openForm(AttachmentGridFilesComponent,"",500,600,"",{data:data});
  }
}
