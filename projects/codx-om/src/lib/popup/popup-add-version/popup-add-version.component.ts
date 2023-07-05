import {
  Component,
  inject,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';
import { OM_PlanVersion } from '../../model/okr.model';
import { OMCONST } from '../../codx-om.constant';

@Component({
  selector: 'popup-add-version',
  templateUrl: './popup-add-version.component.html',
  styleUrls: ['./popup-add-version.component.scss'],
})
export class PopupAddVersionComponent extends UIComponent {
  
  dataPlan:any;
  headerText='';
  dialogRef: DialogRef;
  data =new OM_PlanVersion();
  isAfterRender: boolean;
  isRelease: any;
  omSetting: any;
  autoUpdate= false;
  constructor(
    private injector: Injector,
    private omService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);    
    this.dialogRef = dialogRef;
    this.dataPlan = dialogData.data[0];
    this.headerText = dialogData?.data[1];
    this.isRelease = dialogData?.data[2];
  }

  onInit(): void {
    this.getCache();
    this.getData();
  }

  getData(){
    this.omService.getOKRPlansByID(this.dataPlan?.recID).subscribe(res=>{
      if(res){
        this.dataPlan=res; 
        let countVer = this.dataPlan?.versions!=null?this.dataPlan?.versions?.length : "0";
        this.data.versionNo = "v" + countVer + ".0";
        this.data.activedOn = new Date();
        this.isAfterRender=true;
      }
    })
  }
  getCache(){
    this.omService.getDataValueOfSetting(OMCONST.OMPARAM,null,'1').subscribe((res:any)=>{
      if(res){
        debugger
        this.omSetting = JSON.parse(res);
        if(this.omSetting?.AutoUpdate =="1"){
          this.autoUpdate=true;
        }
      }
    })
  }

  onSaveForm() {
    this.omService.updatePlanVersion(this.dataPlan?.recID, this.data).subscribe((res:any)=>{
      if(res){
        res.autoUpdate = this.autoUpdate;
        this.notificationsService.notifyCode('SYS034');
        this.dialogRef && this.dialogRef.close(res);        
      }
    })
  }

  autoUpdateChange(evt:any){
    if(evt){
      this.autoUpdate =evt?.data;
      this.detectorRef.detectChanges();
    }
  }
  valueChange(evt:any){
    if (evt && evt.field) {
      this.data[evt.field] = evt?.data;      
    }
    this.detectorRef.detectChanges();
  }
  timeChange(evt:any){
    if (evt && evt.field) {
      this.data[evt.field] = evt?.data?.fromDate;      
    }
    this.detectorRef.detectChanges();
  }
}
