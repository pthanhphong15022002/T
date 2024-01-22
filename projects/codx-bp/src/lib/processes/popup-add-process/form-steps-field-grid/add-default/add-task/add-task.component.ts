import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BaseFieldComponent } from '../../base.component';
import { BP_Processes_Steps } from 'projects/codx-bp/src/lib/models/BP_Processes.model';
import { Util } from 'codx-core';

@Component({
  selector: 'lib-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent extends BaseFieldComponent implements OnInit , OnChanges{
  @Input() activityType: any;
  listUses = [];
  vllBP013 =
  {
    datas:
    [
      {
        value : 0,
        text: "Đại diện "
      },
      {
        value : 1,
        text: "Song song"
      },
      {
        value : 2,
        text: "Tuần tự"
      },
    ]
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['activityType'].currentValue != changes['activityType'].previousValue)
    {
      this.activityType = changes['activityType'].currentValue;
      if(this.data) this.changeActivity()
    }
  }
  ngOnInit(): void {
    if(this.type == 'add') this.default();
    else {
      this.data.settings = typeof this.data.settings === 'string' ?  JSON.parse(this.data.settings) : this.data.settings;
      this.defaultValue();
    }
  }
  defaultValue()
  {
    if(this.data) {
      this.stage = this.listStage.filter(x=>x.recID == this.data.stageID)[0];
      this.listUses = this.data.owners || [];
    }
  }
  default()
  {
    var vllStage = this.vll.datas.filter(x=>x.value == "Task")[0];
    this.data = new BP_Processes_Steps();
    this.data.recID = Util.uid();
    this.data.stepNo = this.parent.child.length;
    this.data.stageID = this.stage.recID;
    this.data.parentID = this.parent.recID;
    this.data.activityType = "Task";
    this.data.stepName = vllStage.text + " " + (this.data.stepNo + 1);
    this.data.reminder = this.process.reminder;
    this.data.eventControl = null;
    this.data.interval = "1";
    this.data.memo = "";
    this.data.duration = "0";
    this.data.location = "";
    this.data.settings = 
    {
      icon: vllStage.icon,
      color: vllStage.color,
      backGround: vllStage.textColor,
      checkList: "",
      nextSteps: ""
    }
    this.dataChange.emit(this.data);
  }
  changeActivity()
  {
    var vllStage = this.vll.datas.filter(x=>x.value == this.activityType)[0];
    this.data.settings.icon = vllStage.icon;
    this.data.settings.color = vllStage.color;
    this.data.settings.backGround = vllStage.textColor;
    this.data.activityType = this.activityType;
  }
  valueChange(e:any)
  {
    this.data[e?.field] = e?.data;
    this.dataChange.emit(this.data);
  }

  valueChangeUser(e:any)
  {
    if(e?.data?.dataSelected)
    {
      e?.data?.dataSelected.forEach(element => {
        this.listUses.push(
          {
            objectID: element.id,
            objectName: element.text,
            objectType: "U"
          }
        )
      });
    }

    this.data.owners = this.listUses;
    this.dataChange.emit(this.data);
  }

  deleteUser(index:any)
  {
    this.listUses.splice(index,1);
    this.data.owners = this.listUses;
    this.dataChange.emit(this.data);
  }

  changeStage(e:any)
  {
    this.stage = this.parent = e;
    this.data.stageID = this.stage.recID;
    this.data.parentID = this.parent.recID;
    this.dataChange.emit(this.data);
  }
}
