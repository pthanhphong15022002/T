import { Component, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../../base.component';
import { BP_Processes_Steps } from 'projects/codx-bp/src/lib/models/BP_Processes.model';
import { Util } from 'codx-core';

@Component({
  selector: 'lib-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent extends BaseFieldComponent implements OnInit{
  listUses = [];

  ngOnInit(): void {
    if(this.type == 'add') this.default();
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
      checkList: "",
      nextSteps: ""
    }
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
            objectName: element.text
          }
        )
      });
    }

    this.data.owners = this.listUses.map(x=>x.objectID).join(";");
    this.dataChange.emit(this.data);
  }

  deleteUser(index:any)
  {
    this.listUses.splice(index,1);
    this.data.owners = this.listUses.map(x=>x.objectID).join(";");
    this.dataChange.emit(this.data);
  }
}
