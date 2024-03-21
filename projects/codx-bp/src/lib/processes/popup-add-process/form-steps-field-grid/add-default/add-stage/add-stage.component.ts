import { Component, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../../base.component';
import { BP_Processes_Steps } from 'projects/codx-bp/src/lib/models/BP_Processes.model';
import { Util } from 'codx-core';

@Component({
  selector: 'lib-add-stage',
  templateUrl: './add-stage.component.html',
  styleUrls: ['./add-stage.component.scss']
})
export class AddStageComponent extends BaseFieldComponent implements OnInit {
  vllBP011 =
  {
    datas:
    [
      {
        value : 0,
        text: "Không cho phép"
      },
      {
        value : 1,
        text: "Tự động hoàn tất task con"
      },
      {
        value : 2,
        text: "Cập nhật thủ công"
      },
      {
        value : 3,
        text: "Hủy task tự động"
      }
    ]
  }

  vllBP012 =
  {
    datas:
    [
      {
        value : 0,
        text: "Không kiểm tra"
      },
      {
        value : 1,
        text: "Tất cả các hành động con phải hoàn tất"
      }
    ]
  }
  isAllowEdit = "0"; 
  ngOnInit(): void {
    if (this.process.settings && this.process.settings.length > 0) 
    {
      this.isAllowEdit = this.process.settings.filter(
        (x) => x.fieldName == 'AllowEdit'
      )[0]?.fieldValue;
    }
    if(this.type == 'add') this.defaultStep();
    else this.data.settings = typeof this.data.settings === 'string' ?  JSON.parse(this.data.settings) : this.data.settings;
  }

  defaultStep() {
    this.data = new BP_Processes_Steps();
    var vllStage = this.vll.datas.filter(x=>x.value == "Stage")[0];
    let count = this.process.steps.filter(x=>x.activityType == "Stage").length;
    this.data.recID = Util.uid();
    this.data.stepNo = this.process.steps.length;
    this.data.activityType = "Stage";
    this.data.stepName = vllStage.text + " " + (count + 1);
    this.data.reminder = this.process.reminder;
    this.data.eventControl = null;
    this.data.child = [];
    var processSetting = null ; //this.process.settings[0];
    this.data.settings = 
    {
      icon: "icon-i-bar-chart-steps",
      color: "#0078FF",
      backGround: "#EAF0FF",
      allowDrag: processSetting?.allowDrag || null,
      defaultProcess: processSetting?.defaultProcess || null,
      completeControl: processSetting?.completeControl || null,
      nextSteps: null,
      sortBy: null,
      totalControl: null,
      allowEdit: this.isAllowEdit
    };
    this.dataChange.emit(this.data);
  }

  valueChange(e:any)
  {
    this.data[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }

  valueChangeSetting(e:any)
  {
    this.data.settings[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }
  valueChangeSetting2(e:any,field:any)
  {
    this.data.settings[field] = e?.target?.value;
    this.dataChange.emit(this.data);
  }
}
