import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxBpService } from 'projects/codx-bp/src/public-api';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-add-process-default',
  templateUrl: './add-process-default.component.html',
  styleUrls: ['./add-process-default.component.css']
})
export class AddProcessDefaultComponent implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;
  dynamicFormsForm: FormGroup;
  process:any;
  data:any;
  dataIns:any = {};
  dialog:any;
  table:any
  formModel = 
  {
    funcID:'',
    formName: 'DynamicForms',
    gridViewName: 'grvDynamicForms',
    entityName: 'BP_Instances'
  }
  type = 'add';
  subTitle:any;
  tableField:any;
  user:any;
  constructor(
    private notifySvr: NotificationsService,
    private auth: AuthStore,
    private api: ApiHttpService,
    private bpService: CodxBpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.user = auth.get();
    this.dynamicFormsForm = new FormGroup({});
    this.process = dt?.data?.process;
    this.dataIns = dt?.data?.dataIns;
    this.type = dt?.data?.type;
    this.dialog = dialog;
    this.formModel.funcID = this.dialog.formModel?.funcID;
  }
  ngOnInit(): void {
    this.getData();
  }

  getData()
  {
    this.data = this.process.steps.filter(x=>x.activityType == "Form")[0];
    this.data.settings = typeof this.data.settings === 'string' ? JSON.parse(this.data.settings) : this.data.settings;
    this.formatData()
  }

  formatData()
  {
    var list = [];
    let extendInfo = JSON.parse(JSON.stringify(this.data.extendInfo));
    extendInfo.forEach(element => {
      let field = element.fieldName.toLowerCase();
      if(element.fieldType != "Title") 
      {
        if(this.type == 'add') {
          this.dynamicFormsForm.addControl(field, new FormControl(element.defaultValue , (element.isRequired ? Validators.required : null)));
          if(element.fieldType == "Attachment") this.dataIns.documentControl = JSON.parse(element.documentControl);
         
        }
        else 
        {
          this.dataIns.datas = typeof this.dataIns.datas === 'string' ?  JSON.parse(this.dataIns.datas) : this.dataIns.datas;
          let dataEdit = this.dataIns.datas;
          this.dynamicFormsForm.addControl(field, new FormControl(dataEdit[field] , (element.isRequired ? Validators.required : null)));
        }
      }
      if(element.fieldType == "SubTitle") this.subTitle = field;
      if(element.fieldType == "Table") 
      {
        element.dataFormat = typeof element.dataFormat == 'string' ? JSON.parse(element.dataFormat) : element.dataFormat;
        element.tableFormat = typeof element.tableFormat == 'string' ? JSON.parse(element.tableFormat) : element.tableFormat;
        this.tableField = field;
        if(this.type == 'add') {
          this.dataIns.datas = {};
          this.dataIns.datas[field] = [];
        }
      }
      var index = list.findIndex(x=>x.columnOrder == element.columnOrder)
      if(index >= 0)
      {
        list[index].child.push(element);
        list[index].child.sort((a,b) => a.columnNo - b.columnNo);
      }
      else
      {
        var obj = 
        {
          columnOrder : element.columnOrder,
          child: [element]
        }
        list.push(obj);
      }
      extendInfo = extendInfo.filter(x=>x.columnOrder != element.columnOrder && x.columnNo != element.columnNo);

    
    });
    list.sort((a,b) => a.columnOrder - b.columnOrder);
    this.table = list;
  }

  getField(key: string): string {
    if (!key) return '';

    return Util.camelize(key);
  }

  async onSave()
  {
    if(!this.checkAttachment()) return;
    if(this.dynamicFormsForm.invalid) this.findInvalidControls();
    else
    {
      var valueForm = this.dynamicFormsForm.value;
      this.dataIns.title= valueForm[this.subTitle];
      if(this.type == 'add')
      {
        var instanceNoControl = "1";
        var instanceNo = "aaaaaaa";
        var index = this.process.settings.findIndex(x=>x.fieldName == "InstanceNoControl");
        if(index>=0) instanceNoControl = this.process.settings[index].fieldValue;
    
        if(instanceNoControl == "0")
        {
          instanceNo = await firstValueFrom(
            this.bpService.genAutoNumber(this.formModel?.funcID, this.formModel.entityName, "InstanceNo")
          );
        }
        var stageF = this.process.steps.filter(x=>x.activityType == "Stage")[0];
        var stage = 
        {
          recID: Util.uid(),
          instanceID: this.dataIns.recID,
          applyFor: this.process?.applyFor,
          status: "1",
          taskType: stageF?.activityType,
          taskName: stageF?.stepName,
          memo: stageF.memo,
          location: stageF.location,
          interval: stageF.interval,
          duration: stageF.duration,
          settings: stageF.settings,
          stepID: stageF.recID,
          eventControl: stageF?.eventControl,	
          extendInfo: stageF?.extendInfo,	
          documentControl : stageF?.documentControl,	
          reminder: stageF?.reminder,
          checkList: stageF?.checkList,
          note: stageF?.note,
          attachments: stageF?.attachments,
          comments: stageF?.comments,
          isOverDue : stageF?.isOverDue,	
          owners: stageF?.owners,
          permissions: stageF?.owners,
        }
        var step = 
        {
          recID: Util.uid(),
          instanceID: this.dataIns.recID,
          applyFor: this.process?.applyFor,
          status: "1",
          taskType: this.data?.activityType,
          taskName: this.data?.stepName,
          memo: this.data.memo,
          location: this.data.location,
          interval: this.data.interval,
          duration: this.data.duration,
          settings: JSON.stringify(this.data.settings),
          stepID: this.data.recID,
          eventControl: this.data?.eventControl,	
          extendInfo: this.data?.extendInfo,	
          documentControl : this.data?.documentControl,	
          reminder: this.data?.reminder,
          checkList: this.data?.checkList,
          note: this.data?.note,
          attachments: this.data?.attachments,
          comments: this.data?.comments,
          isOverDue : this.data?.isOverDue,	
          owners: this.data?.owners,
          permissions: this.data?.owners,
        }
    
        valueForm[this.tableField] = this.dataIns.datas[this.tableField].filter(x=> typeof x === 'object');
        this.dataIns.processID = this.process?.recID,
        this.dataIns.instanceNo = instanceNo,
        this.dataIns.instanceID = this.dataIns.recID,
        this.dataIns.status= "1",
        this.dataIns.currentStage= stageF.recID,
        this.dataIns.currentStep= step.recID,
        this.dataIns.lastUpdate= null,
        this.dataIns.closed= false,
        this.dataIns.closedOn= null,
        this.dataIns.startDate= null,
        this.dataIns.endDate= null,
        this.dataIns.progress= null,
        this.dataIns.actualStart= null,
        this.dataIns.actualEnd= null,
        this.dataIns.createdOn= new Date(),
        this.dataIns.createdBy = this.user?.userID,
        this.dataIns.duration = this.process?.duration,
        this.dataIns.datas = JSON.stringify(valueForm)
        var listTask = JSON.stringify([stage,step]);

        //Luu process Task
        this.api.execSv("BP","BP","ProcessTasksBusiness","SaveListTaskAsync",listTask).subscribe();
        //Luu Instanes
        this.api.execSv("BP","BP","ProcessInstancesBusiness","SaveInsAsync",this.dataIns).subscribe(item=>{
          this.dialog.close(this.dataIns)
        });
    
        if(this.attachment.fileUploadList && this.attachment.fileUploadList.length > 0)
          (await this.attachment.saveFilesObservable()).subscribe();
      }
      else if(this.type == 'edit')
      {
        this.dataIns.modifiedOn= new Date(),
        this.dataIns.modifiedBy = this.user?.userID,
        this.dataIns.datas = JSON.stringify(valueForm)
        this.api.execSv("BP","BP","ProcessInstancesBusiness","UpdateInsAsync",this.dataIns).subscribe(item=>{
          this.dialog.close(this.dataIns)
        });
      }
    }
  }

  checkAttachment()
  {
    if(!this.dataIns.documentControl) return true;
    else
    {
      var arr = [];
      this.dataIns.documentControl.forEach(elm=>{
        if(elm.isRequired && elm.count == 0)
        {
          arr.push(elm.title)
        }
      })

      if(arr.length>0)
      {
        var name = arr.join(', ');
        name += " " + 'bắt buộc đính kèm mẫu'
        this.notifySvr.notify(name);
        return false;
      }

      return true;
    }
  }

  findInvalidControls() {
    const invalid = [];
    const controls = this.dynamicFormsForm.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    var name = invalid.join(" , ");
    this.notifySvr.notifyCode('SYS009', 0, name);
  }

  dataChangeAttachmentGrid(e:any)
  {
    var dt = JSON.parse(JSON.stringify(e));
    this.dataIns.documentControl = dt;
  }

  editTable(index:any,e:any)
  {
    debugger
    if(typeof this.dataIns.datas[this.tableField][index] === 'string') {
      this.dataIns.datas[this.tableField][index] = {}
    }
    this.dataIns.datas[this.tableField][index][e?.field] = e?.data;
  }

  addRow()
  {
    this.dataIns.datas[this.tableField].push("");
  }
}
