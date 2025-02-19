import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AttachmentComponent } from '../attachment/attachment.component';
import { ApiHttpService, CallFuncService, DialogModel, NotificationsService } from 'codx-core';
import { AttachmentGridFilesComponent } from './attachment-grid-files/attachment-grid-files.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';

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
  @Output() dataUploadAttachment = new EventEmitter<any>();
  selectedIndex:any;
  listInfoFile = [];
  documentControl: any;
  constructor(
    private notifv: NotificationsService,
    private callFuc: CallFuncService,
    public dmSV: CodxDMService,
    private api: ApiHttpService,
    private callFunc: CallFuncService
  )
  {}

  ngOnInit(): void {
    this.data = JSON.parse(JSON.stringify(this.data));
    this.documentControl = this.data.documentControl;
    this.documentControl = typeof this.documentControl === 'string' ? JSON.parse(this.documentControl) : this.documentControl;
    this.formatData();
    this.formatAttachment(this.documentControl);
  }
 

  formatData()
  {
    if(this.documentControl && this.documentControl.length > 0)
    {
      let index = 0;
      var ids = [];
      this.documentControl.forEach(element => {
        ids.push(element.recID);
        // this.getFile(element?.recID,index);
        // index ++;
      });
      if(ids.length>0)
      {
        let str = ids.join(";");
        this.getFile(str);
      }
    }
  }

  openAttach(recID:any,index:any)
  {
    this.selectedIndex = index;
    this.attachment.objectId = recID;
    this.attachment.referType = 'attach' + this.dataIns.recID;
    this.attachment.uploadFile();
    //this.dataChangeAttachment.emit(true);
  }

  valueChange(e:any,index:any)
  {
    this.documentControl[index][e?.field] = e?.data;
    this.dataChange.emit(this.documentControl);
  }

  fileSave(e:any)
  {
    if(!this.documentControl[this.selectedIndex]?.countAttach) this.documentControl[this.selectedIndex].countAttach = 0;
    if(!this.documentControl[this.selectedIndex].files) this.documentControl[this.selectedIndex].files = [];
    if(!Array.isArray(e)) 
    {
     
      this.documentControl[this.selectedIndex].countAttach ++;
      var obj = 
      {
        fileID: e.recID,
        type: '1'
      }
      this.documentControl[this.selectedIndex].files.push(obj);
    }
    else
    {
      e.forEach(elm => {
        var obj = 
        {
          fileID: elm.data.recID,
          type: '1'
        }
        this.documentControl[this.selectedIndex].files.push(obj);
      });
      this.documentControl[this.selectedIndex].countAttach += e.length;
    }
    this.dataChange.emit(this.documentControl);
    this.dataChangeAttachment.emit(false);
  }
  fileAdded(e:any)
  {
    if(!this.documentControl[this.selectedIndex]?.countAttach) this.documentControl[this.selectedIndex].countAttach = 0;
    if(e?.data)
    {
      this.documentControl[this.selectedIndex].countAttach  = e?.data.length;
      this.documentControl[this.selectedIndex].fileAttach = e?.data
      this.dataChange.emit(this.documentControl);
      this.dataUploadAttachment.emit(this.attachment.fileUploadList);
    }
  }

  openFormDetail(data:any , refType:any=null)
  {
    this.callFunc.openForm(AttachmentGridFilesComponent,"",500,600,"",{data:data,referType:refType});
  }

  getFile(recID:any)
  {
    this.api.execSv("DM","DM","FileBussiness","GetFileByObjectIDAsync",[recID,'BP_Instances',('attach' + this.dataIns.recID)]).subscribe((item:any)=>{
      if(item)
      {
        this.documentControl.forEach(elm=>{
          let dt = item.filter(x=>x.objectID == elm.recID);
          elm.countAttach = dt.length;
          elm.fileAttach = dt;
        })
      }
    })
  }

  formatAttachment(data:any)
  {
    if(data && data.length>0)
    {
      let ids = [];
      for(var i = 0 ; i < data.length ; i++)
      {
        if(data[i].files && data[i].files.length>0)
        {
          data[i].files.forEach(element => {
            if(!this.listInfoFile.some(x=>x.recID == element.fileID)) ids.push(element.fileID)
          });
        }
      }
     
      this.getFileExample(ids);
    }
  }

  getFileExample(data:any)
  {
    this.api.execSv("DM","DM","FileBussiness","GetListFileByIDAsync",JSON.stringify(data)).subscribe(item=>{
      if(item) {
        this.listInfoFile = this.listInfoFile.concat(item);
      }
    })
  }

  genHTML(id:any)
  {
    if(!id || this.listInfoFile.length ==0) return null;
    return this.listInfoFile.filter(x => x.recID == id);
  }

  editFile(id:any,index:any)
  {
    var info = this.listInfoFile.filter(x=>x.recID == id)
    if(!info[0].extension.includes('doc')) {
      this.notifv.notify("Chỉ hỗ trợ file word")
      return;
    }
    this.selectedIndex = index;
    if(info && info[0])
    {
      this.openFormTemplate('word',info)
    }
  }

  openFormTemplate(type: any, data: any = null) {
    var option = new DialogModel();
    option.FormModel = this.formModel;
    if (type == 'word') option.IsFull = true;
    let popup = this.callFuc.openForm(
      CodxExportAddComponent,
      null,
      1100,
      800,
      null,
      {
        action: 'edit',
        type: 'word',
        refType: this.formModel?.entityName,
        formModel: this.formModel,
        dataFile: data,
      },
      '',
      option
    );
    popup.closed.subscribe(res=>{
      if(res?.event) {
        if(!this.documentControl[this.selectedIndex].fileAttach) this.documentControl[this.selectedIndex].fileAttach = [];
        if(!this.documentControl[this.selectedIndex]?.countAttach) this.documentControl[this.selectedIndex].countAttach = 0;
        this.documentControl[this.selectedIndex].countAttach += res?.event.length;
        this.documentControl[this.selectedIndex].fileAttach = this.documentControl[this.selectedIndex].fileAttach.concat(res?.event);
        res?.event.forEach(element => {
          element.objectID = this.documentControl[this.selectedIndex].recID;
          element.objectType = this.formModel.entityName;
          element.referedType = 'attach' + this.dataIns.recID
        });
        this.dataUploadAttachment.emit(res?.event);
      }
    })
  }
}
