import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  AuthService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Device } from '../../../booking/car/popup-add-booking-car/popup-add-booking-car.component';

import { CodxEpService } from '../../../codx-ep.service';
import { Equipments } from '../../../models/equipments.model';

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
    //this.formModel = dialogData?.data[1];
    this.headerText = dialogData?.data[1];  
    this.dialogRef = dialogRef;
    //this.dialogRef.formModel = this.formModel;    
    this.dialogRef.dataService = dialogData?.data[2];
    this.cbbDriver=dialogData?.data[3];

  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.detectorRef.detectChanges();
  }

  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupCardTrans = item;
        this.isAfterRender = true;
      });
  }



  onSaveForm() {
    this.codxEpService.assignDriver(this.data.recID,this.driverID).subscribe(res=>{
      if(res!=null)
      {
        this.data.driverName=res;
        this.notificationsService.notify('Cấp/Trả thẻ thành công', '1', 0); //EP_TEMP Đợi messcode từ BA   
        this.dialogRef && this.dialogRef.close(this.data); 
      }
    })
  }

  close(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
  cbxChange(evt:any){
    if(evt){
      this.driverID=evt;
    }
  }
}
