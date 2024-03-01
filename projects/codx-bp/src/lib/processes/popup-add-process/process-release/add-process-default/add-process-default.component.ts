import { Component, EventEmitter, Input, OnInit, Optional, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, AuthStore, CallFuncService, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxBpService } from 'projects/codx-bp/src/public-api';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { elementAt, firstValueFrom } from 'rxjs';
import { AddTableRowComponent } from './add-table-row/add-table-row.component';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Component({
  selector: 'lib-add-process-default',
  templateUrl: './add-process-default.component.html',
  styleUrls: ['./add-process-default.component.css']
})
export class AddProcessDefaultComponent implements OnInit{
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChildren('gridView') gridView:QueryList<CodxGridviewV2Component>;
  @Input() process:any;
  @Input() dataIns:any
  @Input() type = 'add';
  @Input() stepID:any;
  @Output() dataChange = new EventEmitter<any>();
  data:any;
  dialog:any;
  table:any
  dataTable = {};
  formModel = 
  {
    funcID:'',
    formName: 'DynamicForms',
    gridViewName: 'grvDynamicForms',
    entityName: 'BP_Instances'
  }
  dynamicFormsForm: FormGroup;
  subTitle:any;
  tableField:any;
  user:any;
  isAttach= false;
  constructor(
    private notifySvr: NotificationsService,
    private auth: AuthStore,
    private api: ApiHttpService,
    private bpService: CodxBpService,
    private callFuc: CallFuncService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.user = auth.get();
    this.dynamicFormsForm = new FormGroup({});
    this.process = this.process || dt?.data?.process;
    this.dataIns = this.dataIns || dt?.data?.dataIns;
    this.type = dt?.data?.type ? dt?.data?.type : this.type;
    this.dialog = dialog;
    this.formModel.funcID = this.dialog.formModel?.funcID;
  }
  ngOnInit(): void {
    if(this.type == 'add')  {
      this.dataIns.recID = Util.uid();
      this.dataIns.documentControl = this.process?.documentControl || [];
    }
    this.getData();
  }

  getData()
  {
    var index = 0;
    if(this.stepID) {
      var dts = this.process.steps.filter(x=>x.activityType == "Form");
      if(dts)
      {
        index = dts.findIndex(x=>x.recID == this.stepID);
      }
    }
    this.data = this.process.steps.filter(x=>x.activityType == "Form")[index];
    this.data.settings = typeof this.data.settings === 'string' ? JSON.parse(this.data.settings) : this.data.settings;
    this.formatData()
  }

  formatData()
  {
    let indexTable = 0;
    var list = [];
    let extendInfo = JSON.parse(JSON.stringify(typeof this.data.extendInfo == 'string' ?  JSON.parse(this.data.extendInfo) : this.data.extendInfo))
    extendInfo.forEach(element => {
      let field = element.fieldName.toLowerCase();
      if(element.fieldType != "Title") 
      {
        if(this.type == 'add') {
          this.dynamicFormsForm.addControl(field, new FormControl(element.defaultValue , (element.isRequired ? Validators.required : null)));
          if(element.fieldType == "Attachment") {
            //this.dataIns.documentControl = JSON.parse(element.documentControl);
            element.documentControl = typeof element.documentControl == 'string' ? JSON.parse(element.documentControl): element.documentControl;
          }
        }
        else 
        {
          if(element.fieldType == "Attachment") {
            element.documentControl = typeof element.documentControl == 'string' ? JSON.parse(element.documentControl): element.documentControl;
            if(element.documentControl) element.documentControl = this.dataIns.documentControl.filter(x=>x.fieldID == element.recID);
          }
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
        element.columnsGrid = [];
        element.indexTable = indexTable;
        element.dataFormat.forEach(elm2 => {
          var obj = 
          {
            headerText: elm2.title,
            controlType: elm2.controlType,
            field: elm2.fieldName
          }
          element.columnsGrid.push(obj)
        });

        if(element?.tableFormat?.hasIndexNo) {
          var obj2 = 
          {
            headerText: 'STT',
            controlType: "Numberic",
            field: 'indexNo'
          }
          element.columnsGrid.unshift(obj2)
        }
        indexTable ++;

        if(this.type == 'edit')
        {
          this.dataTable[element.fieldName] = this.dataIns.datas[element.fieldName];
        }
        // this.tableField = field;
        // if(this.type == 'add') {
        //   this.dataIns.datas = {};
        //   this.dataIns.datas[field] = [];
        // }
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
    key = key.toLowerCase();
    return Util.camelize(key);
  }

  async onSave(type=1)
  {
    if(!this.checkAttachment()) return;
    if(this.dynamicFormsForm.invalid) this.findInvalidControls();
    else
    {
      var valueForm = this.dynamicFormsForm.value;
      if(this.type == 'add')
      {
        this.dataIns.title= valueForm[this.subTitle];
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
        
        var keysTable = Object.keys(this.dataTable)
        if(keysTable.length>0)
        {
          keysTable.forEach(k=>{
            valueForm[k] = this.dataTable[k];
          })
        }
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
        this.dataIns.datas = JSON.stringify(valueForm);
        // if(!this.dataIns?.documentControl) this.dataIns.documentControl = [];
        // this.dataIns.documentControl = this.data?.documentControl.concat(this.dataIns.documentControl);
        var listTask = JSON.stringify([stage,step]);
        //Luu process Task
        this.api.execSv("BP","BP","ProcessTasksBusiness","SaveListTaskAsync",listTask).subscribe();
        //Luu Instanes
        this.api.execSv("BP","BP","ProcessInstancesBusiness","SaveInsAsync",this.dataIns).subscribe(async item=>{
        
          //addFile nếu có
          this.addFileAttach(type);
        });
      }
      else if(this.type == 'edit')
      {
        this.dataIns.modifiedOn= new Date(),
        this.dataIns.modifiedBy = this.user?.userID;
        if(this.dataIns.datas)
        {
          if(typeof this.dataIns.datas == 'string') this.dataIns.datas = JSON.parse(this.dataIns.datas)
          let keys = Object.keys(valueForm)
          keys.forEach(k => {
            this.dataIns.datas[k] = valueForm[k];
          });
          this.dataIns.datas = JSON.stringify(this.dataIns.datas)
        }
        else this.dataIns.datas = JSON.stringify(valueForm)
        this.updateIns();
      }
    }
  }

  async addFileAttach(type:any)
  {
    if(this.attachment?.fileUploadList && this.attachment?.fileUploadList?.length > 0)
    {
      (await this.attachment.saveFilesObservable()).subscribe(item2=>{
        if(item2)
        {
          let arr = [];
          if(!Array.isArray(item2))
          {
            arr.push(item2);
          }
          else arr = item2;
          arr.forEach(elm=>{
            var obj = 
            {
              fileID: elm.data.recID,
              type: 1
            }
            var index = this.dataIns.documentControl.findIndex(x=>x.fieldID == elm.data.objectID);
            if(index >=0 ) 
            {
              if(!this.dataIns.documentControl[index]?.files) this.dataIns.documentControl[index].files = [];
              this.dataIns.documentControl[index].files.push(obj);
            }
          })
          if(type == 1) this.dialog.close(this.dataIns)
          else this.startProcess(this.dataIns.recID)
          this.api.execSv("BP","BP","ProcessInstancesBusiness","UpdateInsAsync",this.dataIns).subscribe();
          //this.dataIns.documentControl.
        }
      });
    }
    else
    {
      if(type == 1) this.dialog.close(this.dataIns)
      else this.startProcess(this.dataIns.recID)
    }
   
  }
  updateIns()
  {
    this.api.execSv("BP","BP","ProcessInstancesBusiness","UpdateInsAsync",this.dataIns).subscribe(item=>{
      this.dialog.close(this.dataIns);
      this.dataChange.emit(this.dataIns);
    });
  }

  checkAttachment()
  {
    if(!this.dataIns.documentControl) return true;
    else
    {
      var arr = [];
      this.dataIns.documentControl.forEach(elm=>{
        if(elm.isRequired && (elm?.countAttach == 0 || !elm?.countAttach))
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
    if(Array.isArray(e))
    {
      e.forEach(elm=>{
        var dt = JSON.parse(JSON.stringify(elm));
        var index = this.dataIns.documentControl.findIndex(x=>x.recID == elm.recID);
        if(index>=0) this.dataIns.documentControl[index] = dt;
      });

      //this.api.execSv("BP","BP","ProcessInstancesBusiness","UpdateInsAsync",this.dataIns).subscribe();  
    }
  
  }

  editTable(index:any,e:any)
  {
    if(typeof this.dataIns.datas[this.tableField][index] === 'string') {
      this.dataIns.datas[this.tableField][index] = {}
    }
    this.dataIns.datas[this.tableField][index][e?.field] = e?.data;
  }

  startProcess(recID:any) {
    this.api
      .execSv(
        'BP',
        'ERM.Business.BP',
        'ProcessesBusiness',
        'StartProcessAsync',
        [recID]
      )
      .subscribe((res:any) => {
        if (res) {
          if(res?.recID){
            this.dataIns=res;
          }
          else{
            this.dataIns.status = '2';
          }
          this.dialog.close(this.dataIns);
        }
      });
  }

  dataChangeAttachment(e:any)
  {
    this.isAttach = e;
  }

  addRow(data:any,fieldName:any,index=0)
  {
    if(!this.dataTable[fieldName.toLowerCase()]) this.dataTable[fieldName.toLowerCase()] = []
    var option = new DialogModel();
    option.FormModel = this.formModel;
    option.zIndex = 1000;
    let popup = this.callFuc.openForm(
      AddTableRowComponent,
      '',
      600,
      750,
      '',
      {dataTable: data},
      '',
      option
    );

    popup.closed.subscribe(res=>{
      if(res?.event)
      {
        this.dataTable[fieldName.toLowerCase()].push(res?.event);
        var grid = this.gridView.find((_, i) => i == index);
        grid.refresh();
      }
    })
  }
}
