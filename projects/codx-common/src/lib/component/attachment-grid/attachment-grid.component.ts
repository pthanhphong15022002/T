import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AttachmentComponent } from '../attachment/attachment.component';
import { ApiHttpService, CallFuncService } from 'codx-core';
import { AttachmentGridFilesComponent } from './attachment-grid-files/attachment-grid-files.component';

@Component({
  selector: 'lib-attachment-grid',
  templateUrl: './attachment-grid.component.html',
  styleUrls: ['./attachment-grid.component.scss']
})
export class AttachmentGridComponent implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Input() data:any;
  @Input() formModel:any;
  @Input() dataIns:any;
  @Output() dataChange = new EventEmitter<any>();
  @Output() dataChangeAttachment = new EventEmitter<any>();
  selectedIndex:any;

  constructor(
    private api: ApiHttpService,
    private callFunc: CallFuncService
  )
  {

  }

  ngOnInit(): void {
    this.data = typeof this.data === 'string' ? JSON.parse(this.data) : this.data;
    this.formatData();
  }
 

  formatData()
  {
    if(this.data && this.data.length > 0)
    {
      let index = 0;
      this.data.forEach(element => {
        this.getFile(element?.recID,index);
        index ++;
      });
    }
  }

  openAttach(recID:any,index:any)
  {
    this.selectedIndex = index;
    this.attachment.objectId = recID;
    this.attachment.referType = 'attach' + this.dataIns.recID;
    this.attachment.uploadFile();
    this.dataChangeAttachment.emit(true);
  }

  valueChange(e:any,index:any)
  {
    this.data[index][e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }

  fileSave(e:any)
  {
    if(!this.data[this.selectedIndex]?.countAttach) this.data[this.selectedIndex].countAttach = 0;
    if(!this.data[this.selectedIndex].files) this.data[this.selectedIndex].files = [];
    if(!Array.isArray(e)) 
    {
     
      this.data[this.selectedIndex].countAttach ++;
      var obj = 
      {
        fileID: e.recID,
        type: '1'
      }
      this.data[this.selectedIndex].files.push(obj);
    }
    else
    {
      e.forEach(elm => {
        var obj = 
        {
          fileID: elm.data.recID,
          type: '1'
        }
        this.data[this.selectedIndex].files.push(obj);
      });
      this.data[this.selectedIndex].countAttach += e.length;
    }
    this.dataChange.emit(this.data);
    this.dataChangeAttachment.emit(false);
  }

  openFormDetail(data:any , refType:any=null)
  {
    this.callFunc.openForm(AttachmentGridFilesComponent,"",500,600,"",{data:data,referType:refType});
  }

  getFile(recID:any,index:any)
  {
    this.api.execSv("DM","DM","FileBussiness","CountAttachmentAsync",[recID,('attach' + this.dataIns.recID),this.formModel.entityName]).subscribe(item=>{
      if(item)
      {
        this.data[index].countAttach = item;
      }
    })
  }
}
