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
  selector: 'popup-add-cardTran',
  templateUrl: 'popup-add-cardTrans.component.html',
  styleUrls: ['popup-add-cardTrans.component.scss'],
})
export class PopupAddCardTransComponent extends UIComponent {
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
    this.data.transDate = new Date();
    this.formModel = dialogData?.data[1];
    this.headerText = dialogData?.data[2];    
    this.funcID = dialogData?.data[3];  
    this.dialogRef = dialogRef;
    this.dialogRef.formModel = this.formModel;    
    this.dialogRef.dataService = dialogData?.data[4];

  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupCardTrans = item;
        this.isAfterRender = true;
      });
  }


  beforeSave(option: RequestOption) {
    let itemData = this.fGroupCardTrans.value;
    option.methodName = 'AddResourceTransAsync';
    option.data = [itemData];
    return true;
  }

  onSaveForm() {
    if(this.funcID=="EPT22"){      
      this.data.transType='1';
    }else{      
      this.data.transType='2';
    }
    this.data.resourceType='2';
    this.fGroupCardTrans.patchValue(this.data);
    if (this.fGroupCardTrans.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupCardTrans, this.formModel);
      return;
    }

    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe(async (res) => {
        if (res.save || res.update) {
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if (this.returnData?.recID) {
            this.dialogRef && this.dialogRef.close(this.returnData);
          }
        } else {
          //Trả lỗi từ backend.
          return;
        }
      });
  }

  close(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
