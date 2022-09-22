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
  headerText = '';
  subHeaderText = '';
  fGroupAddEpCards: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  lstEquipment = [];
  isAfterRender = false;
  gviewEpCards: any;
  avatarID: any = null;
  notificationsService: any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogRef?.dataService?.dataSelected;
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.initForm();
  }

  initForm() {
    if (this.isAdd) {
      this.headerText = 'Thêm mới thẻ xe';
      this.subHeaderText = 'Tạo thẻ xe';
    } else {
      this.headerText = 'Sửa thông tin xe';
      this.subHeaderText = 'Chỉnh sửa thẻ xe';
      this.avatarID = this.data.recID;
    }
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddEpCards = item;
        if (this.data) {
          this.fGroupAddEpCards.patchValue(this.data);
        }
        //patch thêm value
        this.isAfterRender = true;
      });
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        this.gviewEpCards = res;
      });
  }

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddEpCards.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    // if (this.fGroupAddEpCards.invalid == true) {
    //   this.codxEpService.notifyInvalid(this.fGroupAddEpCards, this.formModel);
    //   return;
    // }
    //patch thêm value
    if (this.fGroupAddEpCards.value.owner instanceof Object) {
      this.fGroupAddEpCards.patchValue({
        owner: this.fGroupAddEpCards.value.owner[0],
      });
    }
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save) {
          this.imageUpload.onSaveFile(res.save.recID);
          this.dialogRef.close();
        }
        if (res.update) {
          this.imageUpload
            .updateFileDirectReload(res.update.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          (this.dialogRef.dataService as CRUDService)
            .update(res.update)
            .subscribe();
        }
        return;
      });
  }

  fileCount(event) {
    this.fGroupAddEpCards.value.icon = event.data[0].data;
  }
  fileAdded(event) {
    debugger;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
  // dataValid() {
  //   var data = this.fGroupAddEpCards.value;
  //   var result = true;
  //   var requiredControlName = ['resourceName', 'owner', 'code'];
  //   requiredControlName.forEach((item) => {
  //     var x = data[item];
  //     if (!data[item]) {
  //       let fieldName = item.charAt(0).toUpperCase() + item.slice(1);
  //       this.notificationsService.notifyCode(
  //         'E0001',
  //         0,
  //         '"' + this.gviewEpCards[fieldName].headerText + '"'
  //       );
  //       result = false;
  //     }
  //   });
  //   return result;
  // }
}
