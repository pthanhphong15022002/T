import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { permissionDis } from '../../models/dispatch.model';
import { DispatchService } from '../../services/dispatch.service';
import { formatBytes } from '../../function/default.function';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
@Component({
  selector: 'app-od-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss']
})
export class SharingComponent implements OnInit {
  dialog      : any;
  data:any;
  files: any;
  formModel : any;
  dataDis = new permissionDis();
  percentage100 = false;
  userTo      : any;
  userCC      : any;
  gridViewSetup     : any;
  formatBytes = formatBytes
  shareForm = new FormGroup({
    to: new FormControl(),
    cc : new FormControl(),
    desc : new FormControl(),
    edit : new FormControl(),
    share: new FormControl(),
    download : new FormControl(),
    formDate: new FormControl(),
    toDate : new FormControl(),
  });
  constructor(
    private odService: DispatchService , 
    private cr: ChangeDetectorRef , 
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.data = dt?.data
    this.dialog = dialog;
  }
  ngOnInit(): void {
    //this.formdata = new FormGroup({});
    //alert(this.recID);
    this.gridViewSetup = this.data["gridViewSetup"];
    this.formModel = this.data?.option?.FormModel;
    this.files = this.data?.files;
  }

  changeValueTo(e:any)
  {
    this.shareForm.controls['to'].setValue(e.data.value);
  }
  changeValueCC(e:any)
  {
    this.shareForm.controls['cc'].setValue(e.data.value);
  }
  getJSONString(data) {
    return JSON.stringify(data);    
  }
  onSave()
  {
   /*  var objID = (this.shareForm.get('form').value).concat(this.shareForm.get('to').value);
    this.dataDis.objID       = objID.join(";");
    this.dataDis.description = this.shareForm.get('desc').value;
    this.dataDis.download = this.shareForm.get('download').value == null ? false :this.shareForm.get('download').value;
    this.dataDis.edit = this.shareForm.get('edit').value == null ? false :this.shareForm.get('edit').value;
    this.dataDis.share = this.shareForm.get('share').value == null ? false :this.shareForm.get('share').value;
    this.dataDis.formDate = this.shareForm.get('formDate').value == null ? new Date : this.shareForm.get('formDate').value;
    this.dataDis.toDate = this.shareForm.get('toDate').value == null ? new Date : this.shareForm.get('formDate').value; */
    var idFile = "";
    if(this.data.files) this.data.files.forEach(elm => {
      idFile += elm.recID + ";"
    });
    this.shareForm.value.recID = this.dialog.dataService.dataSelected.recID;
    this.shareForm.value.idFile = idFile;
    this.odService.shareDispatch(this.shareForm.value).subscribe((item)=>{
      if(item.status==0)
      {
        this.dialog.close(item.data);
      }
      this.notifySvr.notify(item.message);
    })
  }
}
