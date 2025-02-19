import { Component, Injector, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogModel, DialogRef } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
import { BaseFieldComponent } from '../base.component';
import { FormSettingAdvancedTasksComponent } from './form-setting-advanced-tasks/form-setting-advanced-tasks.component';

@Component({
  selector: 'lib-add-default',
  templateUrl: './add-default.component.html',
  styleUrls: ['./add-default.component.scss']
})
export class AddDefaultComponent extends BaseFieldComponent implements OnInit {
  dialog:any;
  activityType = 'Stage';
  vllBP001:any;
  vllDefault:any;
  isAttach = false;
  hideDelete = false;
  constructor(
    public inject: Injector,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  )
  {
    super(inject);
    this.dialog = dialog;
    this.formModel = this.dialog?.formModel;
    if(dt?.data?.data) this.data = JSON.parse(JSON.stringify(dt.data.data));
    if(dt?.data?.process) this.process = dt.data.process;
    if(dt?.data?.type) this.type = dt.data.type;
    if(dt?.data?.stage) this.stage = dt.data.stage;
    if(dt?.data?.parent) this.parent = dt.data.parent;
    if(dt?.data?.activityType) this.activityType = dt.data.activityType;
    if(dt?.data?.listStage) this.listStage = dt.data.listStage;
    if(dt?.data?.hideDelete) this.hideDelete = dt?.data?.hideDelete
    if(dt?.data?.formModel) this.formModel = dt?.data?.formModel

    if(this.type == 'add') this.hideDelete = true;

    this.getVll();
  }
  ngOnInit(): void {
  
  }

  getVll()
  {
    let vll = this.shareService.loadValueList("BP001") as any;
    if(isObservable(vll))
    {
      vll.subscribe(item=>{
        this.vllBP001 = item;
        this.getVllDefault(this.vllBP001);
      })
    }
    else
    {
      this.vllBP001 = vll;
      this.getVllDefault(this.vllBP001);
    }
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
    var list = ["Stage","Group","StartEnd","Timer","Conditions","SubProcess"];
    if(!list.includes(this.data.activityType) || (this.data.activityType == "Form" && this.data.stepNo >= 1))
    {
      if(!this.data.permissions || this.data.permissions.length == 0)
      {
        //Nhớ nhắc Thương thêm mã noti
        this.notifySvr.notify("Người thực hiện không được bỏ trống.");
      }
      else if(this.data?.duration == 0) this.notifySvr.notify("Thời gian thực hiện phải lớn hơn 0."); 
      else 
      {
        let idFiles = [];
        this.data.permissions.forEach(elm=>{
          this.process.documentControl.forEach(elm2=>{
            if(!elm2.permissions?.some(x=>x?.objectID == elm?.objectID))
            {
              if(elm2.permissions==null) elm2.permissions=[];
              elm2.permissions.push(
                {
                  objectID: elm.objectID,
                  objectType: elm.objectType,
                  download:true,
                  read: true,
                  update: true,
                  delete: true
                }
              )
            }
            if(elm2.files)
            {
              elm2.files?.forEach(xs=>{
                idFiles.push(xs.fileID);
              })
            }
          })
        });

        this.updatePermiss(idFiles,this.data.permissions);

        this.dialog?.close({data: this.data , process: this.process});
      }
    }
    else if(this.data.activityType == "Form" && this.data?.settings?.esign)
    {
      if(!this.data.settings?.template?.templateID) this.notifySvr.notify("Mẫu template không được bỏ trống.");
      else this.dialog.close({data: this.data , process: this.process});
    }
    else this.dialog.close({data: this.data , process: this.process});
    //this.data.settings = JSON.stringify(this.data.settings);
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

  settingAdvancedTask(){
    let option = new DialogModel();
    option.zIndex = 1010;
    option.FormModel = this.formModel;
    var obj = {
      data: this.data,
      dataReminder: typeof this.data?.reminder == 'string' ? JSON.parse(this.data.reminder) : this.data.reminder,
      dataEventControl: typeof this.data?.reminder == 'string' ? JSON.parse(this.data?.eventControl) : this.data?.eventControl,
    };
    let popupDialog = this.callFuc.openForm(
      FormSettingAdvancedTasksComponent,
      '',
      900,
      800,
      '',
      obj,
      '',
      option
    );
    popupDialog.closed.subscribe((e) => {
      if (e?.event && e?.event.length > 0) {
        let reminder = e.event[0];
        let eventControl = e.event[1];


        this.data.reminder = typeof reminder != 'string' ? JSON.stringify(reminder) : reminder;
        this.data.eventControl = typeof eventControl != 'string' ? JSON.stringify(eventControl) : eventControl;
        // this.changeDetectorRef.detectChanges();
      }
    });
  }
}
