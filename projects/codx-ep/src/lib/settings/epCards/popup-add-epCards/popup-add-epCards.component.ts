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
  selector: 'popup-add-epCards',
  templateUrl: 'popup-add-epCards.component.html',
  styleUrls: ['popup-add-epCards.component.scss'],
})
export class PopupAddEpCardsComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();
  returnData:any;
  headerText = '';
  subHeaderText = '';
  fGroupAddEpCards: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  lstEquipment = [];
  isAfterRender = false;
  gviewEpCards: any;
  avatarID: any = null;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.headerText = dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.initForm();
  }

  initForm() {    
    this.codxEpService
      .getFormGroup(
        this.formModel.formName,
        this.formModel.gridViewName
      )
      .then((item) => {
        this.fGroupAddEpCards = item;        
        this.isAfterRender = true;
      });
  }

  
  beforeSave(option: any) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.fGroupAddEpCards.patchValue(this.data);
    if (this.fGroupAddEpCards.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddEpCards, this.formModel);
      return;
    }
    this.data.resourceType='7';
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res) {          
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if(this.imageUpload)
          {
            this.imageUpload
            .updateFileDirectReload(this.returnData.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
                //xử lí nếu upload ảnh thất bại
                //...
              }
            });
          }          
          if(this.isAdd){
            (this.dialogRef.dataService as CRUDService).add(this.returnData,0).subscribe();
          }
          else{
            (this.dialogRef.dataService as CRUDService).update(this.returnData).subscribe();
          }          
          this.dialogRef.close();
        }
        this.notificationsService.notifyCode('E0011');
        return;
      });
  }  
}
