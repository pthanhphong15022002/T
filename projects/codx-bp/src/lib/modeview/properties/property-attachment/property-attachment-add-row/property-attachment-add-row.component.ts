import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { elementAt } from 'rxjs';

@Component({
  selector: 'lib-property-attachment-add-row',
  templateUrl: './property-attachment-add-row.component.html',
  styleUrls: ['./property-attachment-add-row.component.css']
})
export class PropertyAttachmentAddRowComponent  implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;

  data:any;
  dialog:any;
  formModel:any;
  type:any;
  listFileAttach = [];
  disableSave = false;
  constructor(
    private api: ApiHttpService,
    private notifySvr: NotificationsService,
    public dmSV: CodxDMService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    if(dt?.data?.data )this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.formModel = dt?.data?.formModel;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.disableSave = false;
    if(!this.data)
    {
      this.defaultData();
    }
    else if(Array.isArray(this.data?.files) && this.data?.files.length>0)
    {
      var ids = this.data.files.map((u)=> {return u.fileID});
      this.getFile(ids)
    }
  }

  defaultData()
  {
    this.data = 
    {
      recID : Util.uid(),
      title : '',
      isRequired: false,
      count : 0,
      listType: "2",
      refID: '',
      files: []
    }
    this.data.refID = this.data.recID
  }

  openAttachment()
  {
    this.attachment.uploadFile();
  }

  fileAdd(e:any)
  {
    if(e?.data)
    {
      e.data.forEach(element => {
        if(!this.listFileAttach.some(x=>x.fileName == element.fileName))
        {
          var object = 
          {
            fileName : element.fileName,
            fileSize: element.fileSize,
            avatar: element.avatar,
            eSign: false
          }
          this.listFileAttach.push(object);
        }
      });
    }
  }

  changeEsign(index:any)
  {
    this.listFileAttach[index].eSign = !this.listFileAttach[index].eSign
    if(Array.isArray(this.data.files) && this.data.files.length>0)
    {
      this.data.files[index].eSign = !this.data.files[index].eSign;
    }
  }

  deleteRow(index:any)
  {
    let data = this.listFileAttach[index];
    this.attachment.fileUploadList = this.attachment.fileUploadList.filter(x=>x.fileName != data.fileName);
    this.listFileAttach.splice(index,1);

    if(this.data.files[index])
    {
      this.deleteFile(this.data.files[index].fileID);
      this.data.files.splice(index,1);
    }
  }
  
  valueChange(e:any)
  {
    this.data[e?.field] = e?.data
  }
  
  checkRequired()
  {
    if(!this.data?.title) 
    {
      this.notifySvr.notifyCode('SYS009', 0, "Tên mẫu hồ sơ");
      return true;
    }
    return false;
  }

  async onSave()
  {
    if(this.checkRequired()) return;
    if(this.attachment.fileUploadList.length>0)
    {
      this.disableSave = true;
      (await this.attachment.saveFilesObservable()).subscribe(item=>{
        if(item)
        {
          let dt = item;
          if(!Array.isArray(dt)) dt = [dt];
          let stt = this.data.files.length;
          for(let i = 0 ; i < dt.length ; i++)
          {
            var obj = 
            {
              fileID : dt[i].data.recID,
              type: '1',
              eSign: this.listFileAttach[stt + i].eSign
            }
            this.data.files.push(obj);
          }
          this.disableSave = false;
          this.dialog.close(this.data)
        }
      })
    }
    else this.dialog.close(this.data)
  }

  getFile(data:any)
  {
    this.api.execSv("DM","DM","FileBussiness","GetListFileByIDAsync",JSON.stringify(data)).subscribe((item:any)=>{
      if(item) {
        let i = 0;
        item.forEach(element=>{
          if(!this.listFileAttach.some(x=>x.fileName == element.fileName))
          {
            var avatar = `../../../assets/themes/dm/default/img/${this.dmSV.getAvatar(
              element.extension
            )}` ;
            var object = 
            {
              fileName : element.fileName,
              fileSize: element.fileSize,
              avatar: avatar,
              eSign: this.data.files[i].eSign
            }
            this.listFileAttach.push(object);
            i++;
          }
        })
      }
    })
  }

  deleteFile(id:any)
  {
    this.api.execSv("DM","DM","FileBussiness","DeleteFileToTrashAsync",[id,"",true]).subscribe()
  }
}
