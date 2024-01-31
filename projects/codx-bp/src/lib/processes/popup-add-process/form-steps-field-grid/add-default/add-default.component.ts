import { Component, Injector, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable } from 'rxjs';
import { BaseFieldComponent } from '../base.component';

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
  }
  ngOnInit(): void {
    this.getVll();
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
    //this.data.settings = JSON.stringify(this.data.settings);
    this.dialog.close({data: this.data , process: this.process});
  }

  changeActivity(e:any)
  {
    this.vllDefault = e;
    this.activityType = e?.value;
  }
}
