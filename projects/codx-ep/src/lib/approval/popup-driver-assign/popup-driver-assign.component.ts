import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  AuthService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxEpService } from '../../codx-ep.service';

@Component({
  selector: 'popup-driver-assign',
  templateUrl: 'popup-driver-assign.component.html',
  styleUrls: ['popup-driver-assign.component.scss'],
})
export class PopupDriverAssignComponent extends UIComponent {
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();

  headerText = '';
  subHeaderText = '';

  fGroupCardTrans: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  isAfterRender = false;
  returnData: any;
  funcID: any;
  driverID:any;
  listDriver=[];
  driver:any;
  fields: Object = { text: 'driverName', value: 'driverID' };
  cbbDriver:any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private activatedRoute: ActivatedRoute,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.headerText = dialogData?.data[1];  
    this.dialogRef = dialogRef;    
    this.cbbDriver=dialogData?.data[2];

  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.detectorRef.detectChanges();
  }
 
  onSaveForm() {
    this.codxEpService.assignDriver(this.data?.recID,this.driverID).subscribe(res=>{
      if(res!=null)
      {
        this.data.driverName=res;
        this.notificationsService.notifyCode('SYS034');
        this.dialogRef && this.dialogRef.close(this.data); 
      }
    })
  }

  cbxChange(evt:any){
    if(evt){
      this.driverID=evt;
    }
  }
}
