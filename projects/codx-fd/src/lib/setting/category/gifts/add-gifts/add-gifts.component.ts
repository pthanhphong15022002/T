import {
  Component,
  OnInit,
  Injector,
  EventEmitter,
  Output,
  ViewChild,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-add-gifts',
  templateUrl: './add-gifts.component.html',
  styleUrls: ['./add-gifts.component.scss'],
})
export class AddGiftsComponent extends UIComponent implements OnInit {
  formModel: any;
  dialog!: DialogRef;
  dataUpdate: any;
  formType: any;
  header = 'Thêm quà tặng';
  isAddMode = true;
  predicate = 'Category=@0';

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('form') form: CodxFormComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    private change: ChangeDetectorRef,
    @Optional() dt: DialogRef,
    @Optional() data: DialogData
  ) {
    super(injector);
    this.dialog = dt;
    this.dataUpdate = JSON.parse(
      JSON.stringify(this.dialog.dataService.dataSelected)
    );
    this.formModel = this.dialog?.formModel;
    this.formType = data.data?.formType;
  }

  onInit(): void {
    if (this.formType == 'edit') {
      this.isAddMode = false;
      this.header = 'Cập nhật quà tặng';
    } else this.dataUpdate.owner = null;
    if (!this.dataUpdate.owner) this.dataUpdate.owner = null;
  }

  ngAfterViewInit() {}

  onSave() {
    var formGroup = this.form.formGroup.controls;
    if (
      formGroup.giftName.status == 'VALID' &&
      formGroup.giftID.status == 'VALID' &&
      formGroup.memo.status == 'VALID' &&
      formGroup.price.status == 'VALID'
    ) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option, this.isAddMode), 1)
        .subscribe((res) => {
          if (res.save) {
            let data = res.save[2];
            this.imageUpload
              .updateFileDirectReload(data.giftID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
                // var obj = {data: data, file: result};
                // this.dialog.close(obj);
              });
            this.dialog.close(data);
          } else if (res.update) {
            let data = res.update[2];
            this.imageUpload
              .updateFileDirectReload(data.giftID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
                // var obj = { data: data, file: result };
                // this.dialog.close(obj);
              });
            this.dialog.close(data);
          }
          this.change.detectChanges();
        });
    } else {
      this.notification.notify('Vui lòng kiểm tra lại thông tin nhập');
      return null;
    }
  }

  beforeSave(op: any, isAdd) {
    op.methodName = 'AddEditGiftAsync';
    op.data = [this.dataUpdate, isAdd];
    return true;
  }

  changeHand(e) {}

  onChangeOnHandOfGift() {}

  valueChange(event) {
    if (event) {
      var field = event.field;
      var dt = event.data;
      this.dataUpdate[field] = dt;
    }
  }

  changeCombobox(data) {
    if (data) {
      var field = data.field;
      var dt = data.data;
      if (field === 'owner') {
        this.dataUpdate['owner'] = dt;
        this.dataUpdate['orgUnitID'] = data.component.itemsSelected[0]?.BUID;
      }
      if (field === 'groupID') {
        this.dataUpdate[field] = dt;
        this.dataUpdate['groupName'] =
          data.component.itemsSelected[0]?.GiftName;
      }
    }
  }
}
