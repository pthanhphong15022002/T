import { Component, ViewChild } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

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
      title : this.data.title,
      isRequired: false,
      count : 0,
      isList: "0"
    }
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
    let count = 1;
    if(Array.isArray(e)) count = e.length;
    this.data.documentControl[this.selectedIndex].count = count;
    this.dataChange.emit(this.data);
  }
}
