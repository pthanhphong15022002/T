import { Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogData, DialogRef, Util } from 'codx-core';
import { CodxBpService } from 'projects/codx-bp/src/public-api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-add-process-default',
  templateUrl: './add-process-default.component.html',
  styleUrls: ['./add-process-default.component.css']
})
export class AddProcessDefaultComponent implements OnInit{
  dynamicFormsForm: FormGroup;
  process:any;
  data:any;
  dialog:any;
  table:any
  formModel = 
  {
    funcID:'',
    formName: 'DynamicForms',
    gridViewName: 'grvDynamicForms',
    entityName: 'BP_Instances'
  }
  constructor(
    private bpService: CodxBpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
   
    this.dynamicFormsForm = new FormGroup({});
    this.process = dt?.data;
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
      if(element.fieldType != "Title") this.dynamicFormsForm.addControl(element.fieldName.toLowerCase(), new FormControl(element.defaultValue));
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
    var valueForm = this.dynamicFormsForm.value;

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
   
    var data = 
    {
      processID : this.process?.recID,
      instanceNo : instanceNo,
      title: valueForm.mo_ta_ngan_gon,
      status: "1",
      currentStage: null,
      currentStep: null,
      lastUpdate: null,
      closed: false,
      closedOn: null,
      startDate: null,
      endDate: null,
      progress: null,
      actualStart: null,
    }
    debugger
  }
}
