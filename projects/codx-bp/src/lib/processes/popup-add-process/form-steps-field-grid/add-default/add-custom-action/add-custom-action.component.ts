import { Component, Injector, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, DialogData, DialogModel, DialogRef, NotificationsService, UIComponent, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'add-custom-action',
  templateUrl: './add-custom-action.component.html',
  styleUrls: ['./add-custom-action.component.scss']
})
export class AddCustomActionComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  dialog:any;
  activityType = 'Task';
  type='add';
  vllBP001:any;
  vllDefault:any;
  isAttach = false;
  hideDelete = false;
  data: any;
  process: any;
  formModel: import("codx-core").FormModel;
  typeShare: string;
  multiple: boolean;
  vllShare: string;
  listCombobox: any;
  vllBP013 = {
    datas: [
      {
        value: 1,
        text: 'Tuần tự',
      },
      {
        value: 2,
        text: 'Song song',
      },
      {
        value: 3,
        text: 'Đại diện',
      },
    ],
  };
  listDocument=[];
  checkList=[];
  user: import("codx-core").UserModel;
  refTask: any;
  constructor(
    private inject: Injector,
    private noti: NotificationsService,
    private auth: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  )
  {
    super(inject);
    this.user = auth.get();
    this.dialog = dialog;
    this.formModel = this.dialog?.formModel;
    if(dt?.data?.refTask){
      this.refTask = dt.data.refTask;
      this.data = {...dt.data.refTask};
      this.data.permissions=[];
      this.data.settings = JSON.parse(this.refTask.settings);
      
    }
  }
  onInit(): void {
    this.checkList = this.data?.settings?.checkList?.split(';') ?? [];
    this.getVll();
  }

  getVll()
  {
    this.cache.valueList('BP001').subscribe(vll=>{
      if(vll){
        this.vllBP001=vll;
        this.getVllDefault(this.vllBP001);
        this.detectorRef.detectChanges();
      }
    })
  }
  addCheckList() {
    this.checkList.push('');
    this.detectorRef.detectChanges();
  }
  valueChangeCheckList(e: any, i: any) {
    this.checkList[i] = e?.target?.value;
    let a = JSON.parse(JSON.stringify(this.checkList));
    if(this.data?.settings?.checkList==null) this.data.settings.checkList=[];
    this.data.settings.checkList = a?.join(';');
    this.detectorRef.detectChanges();
  }
  showCheck(e: any){
    console.log('show check: ', e)
    e.show = e?.item?.Show ?? false;
    this.detectorRef.detectChanges();
  }

  valueChangeUser(e: any) {
    if (e) {
      if(this.data.permissions==null) this.data.permissions=[];
      e.forEach((element) => {
        this.data.permissions.push({
          objectID: element?.objectType =="SYS061" ? null:element?.id ?? element?.objectType,
          objectName: element?.text ?? element?.objectName,
          objectType: element?.objectType =="SYS061" ? element?.id : element?.objectType,
          roleType: 'O',
        });
      });
    }
    this.detectorRef.detectChanges();
  }
  formatDocument() {
    this.listDocument = JSON.parse(JSON.stringify(this.process?.documentControl));
    let ids = [];
    this.listDocument.forEach((elm) => {
      if (elm.files && elm.files.length > 0) 
      {
        elm.files.forEach(element => {
          ids.push(element.fileID || element?.recID);
        });
      }
    });

    if(ids.length>0)
    {
      var str = JSON.stringify(ids);
      this.getFile(str)
    }
    this.detectorRef.detectChanges();
  }
  getFile(recID: any) {
    this.api
      .execSv('DM', 'DM', 'FileBussiness', 'GetListFile', recID)
      .subscribe((item:any) => {
        if (item) {
          item?.forEach(ix=>{
            let index = this.listDocument.findIndex(x=>x.files.some(x=>x.fileID == ix.recID));
            if(index>=0)
            {
              if(!this.listDocument[index]?.filess) this.listDocument[index].filess = [];
              this.listDocument[index].filess.push(ix);              
              this.detectorRef.detectChanges();
            }
          });
          
          //this.listDocument[i].filess = item;
        }
      });
  }
  fileSave(e: any) {
    let count = 0;
    var files = [];
    if (Array.isArray(e)) {
      e.forEach((elm) => {
        var f = {
          fileID: elm?.data?.recID,
          type: '1',
          eSign: false
        };
        files.push(f);
      });
      count = e.length;
    } else {
      var f = {
        fileID: e?.recID,
        type: '1',
        eSign: false
      };
      files.push(f);
      count = 1;
    }

    if (!this.data.attachments) this.data.attachments = 0;
    this.data.attachments += count;
    var documentControl = {
      recID: Util.uid(),
      title: this.data.stepName,
      isRequired: false,
      count: 0,
      listType: '1',
      stepID: this.data?.recID,
      stepNo: this.data?.stepNo,
      fieldID: this.data?.recID,
      memo: this.data?.memo,
      refID: '',
      files: files,
      permissions: 
      [
        {
          objectID: this.user?.userID,
          objectType: "U",
          download:true,
          read: true,
          update: true,
          delete: true
        }
      ]
    };
    let i = 0;
    this.listDocument.forEach((elm) => {
      if(!elm.permissions.some(x=>x.objectID == this.user.userID))
      {
        this.process?.documentControl[i].permissions.push(
          {
            objectID: this.user?.userID,
            objectType: "U",
            download:true,
            read: true,
            update: true,
            delete: true
          }
        )
      }
      i++;
    });
    this.process?.documentControl.push(documentControl);
    this.listDocument.push(documentControl);
    this.formatDocument();
  }

  fileDelete(e: any) {
    this.data.attachments--;
  }
  getVllDefault(data:any)
  {
    this.vllDefault = data.datas.filter(x=>x.value == this.activityType)[0];
  }

  valueChange(e:any)
  {
    this.data = e;
  }

  valueChangeProcess(e:any)
  {
    this.process = e;
  }
  close()
  {
    var list = ["Stage","Group","StartEnd","Timer","Conditions","SubProcess","Form"];
    if(!list.includes(this.data.activityType))
    {
      if(!this.data.permissions || this.data.permissions.length == 0)
      {
        //Nhớ nhắc Thương thêm mã noti
        this.noti.notify("Người thực hiện không được bỏ trống.");
      }
      else if(this.data?.duration == 0) this.noti.notify("Thời gian thực hiện phải lớn hơn 0."); 
      else 
      {
        let idFiles = [];
        // this.data.permissions.forEach(elm=>{
        //   this.process.documentControl.forEach(elm2=>{
        //     if(!elm2.permissions?.some(x=>x?.objectID == elm?.objectID))
        //     {
        //       if(elm2.permissions==null) elm2.permissions=[];
        //       elm2.permissions.push(
        //         {
        //           objectID: elm.objectID,
        //           objectType: elm.objectType,
        //           download:true,
        //           read: true,
        //           update: true,
        //           delete: true
        //         }
        //       )
        //     }
        //     if(elm2.files)
        //     {
        //       elm2.files?.forEach(xs=>{
        //         idFiles.push(xs.fileID);
        //       })
        //     }
        //   })
        // });

        //this.updatePermiss(idFiles,this.data.permissions);

        this.dialog?.close({data: this.data , process: this.process});
      }
    }
    // else if(this.data.activityType == "Form" && this.data?.settings?.esign)
    // {
    //   if(!this.data.settings?.template?.templateID) this.noti.notify("Mẫu template không được bỏ trống.");
    //   else this.dialog.close({data: this.data , process: this.process});
    // }
    // else this.dialog.close({data: this.data , process: this.process});
    //this.data.settings = JSON.stringify(this.data.settings);
    if(this.data.settings!=null){
      this.data.settings=JSON.stringify(this.data.settings);
    }
    delete this.data.recID;
    delete this.data.id;
    this.api.execSv("BP","BP","ProcessTasksBusiness","AddCustomTaskAsync",[this.refTask?.recID,this.data]).subscribe(item=>{
      if(item){
        this.noti.notifyCode("SYS034");
        this.dialog.close();
      }
    })
  }

  updatePermiss(idFiles:any,lisPer:any)
  {
    this.api.execSv("DM","DM","FileBussiness","UpdatePermissionByListRecIDFileAsync",[idFiles,lisPer]).subscribe(item=>{

    })
  }
  changeActivity(e:any)
  {
    this.vllDefault = e;
    this.activityType = e?.value;
  }

  deleteItem()
  {
    this.dialog.close({delete: this.data});
  }

  dataChangeAttach(e:any)
  {
    this.isAttach = e;
  }
  sharePerm(share: any) {
    this.listCombobox = { P: 'PositionByOrgChart' };
    this.multiple = true;
    this.vllShare = 'BP017';
    this.typeShare = '1';
    let option = new DialogModel();
    option.zIndex = 1010;
    this.callfc.openForm(share, '', 420, 600, null, null, null, option);
  }
  settingAdvancedTask(){
    let option = new DialogModel();
    option.zIndex = 1010;
    option.FormModel = this.formModel;
    var obj = {
      data: this.data,
      dataReminder: typeof this.data?.reminder == 'string' ? JSON.parse(this.data.reminder) : this.data.reminder,
      dataEventControl: typeof this.data?.reminder == 'string' ? JSON.parse(this.data?.eventControl) : this.data?.eventControl,
    };
    
  }
  deleteUser(index: any) {
    this.data.permissions = this.data.permissions?.splice(index, 1);
  }
  valueChangeRadio(e: any) {
    this.data.settings.approveMode = e?.target?.value;
  }
  openAttach1() {
    this.attachment.uploadFile();
  }
}
