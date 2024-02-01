import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-add-file-from-process',
  templateUrl: './add-file-from-process.component.html',
  styleUrls: ['./add-file-from-process.component.scss']
})
export class AddFileFromProcessComponent {
  dialog:any;
  data:any;
  step:any;
  documentControl:any;
  formModel:any;
  selected:any;

  constructor(
    private ref: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.formModel = dialog.formModel;
    this.data = dt?.data?.process;
    this.step = dt?.data?.step;
    this.dialog = dialog;

    if(this.data) {
      this.documentControl = JSON.parse(JSON.stringify(this.data.documentControl));
      this.documentControl = this.documentControl.filter(x=>x.stepNo < this.step.stepNo);
      let i = 0;
      this.documentControl.forEach(elm => {
        var dt = this.data.steps.filter(x=>x.stepNo == elm.stepNo);
        if(dt)
        {
          elm.stepName = dt[0].stepName,
          elm.stageName =  this.data.steps.filter(x=>x.recID == dt[0].parentID)[0].stepName
          this.getFile(elm.fieldID,i);
          i++;
        }
      });
    }
  }

  getFile(recID:any,index:any)
  {
    let i = index;
    this.api.execSv("DM","DM","FileBussiness","GetFileByObjectIDAsync",[recID + ";",this.formModel.entityName]).subscribe(item=>{
      if(item)
      {
        this.documentControl[i].files = item;
      }
    })
  }

  save()
  {
    this.dialog.close(this.selected)
  }

  selectedItem(e:any)
  {
    if(this.selected?.recID == e.recID) this.selected = null;
    else this.selected = e;
  }
}
