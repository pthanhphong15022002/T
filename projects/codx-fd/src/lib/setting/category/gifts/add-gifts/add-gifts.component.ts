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
import { CodxFdService } from 'projects/codx-fd/src/public-api';

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
  header = '';
  title = '';
  isAddMode = true;
  predicate = 'Category=@0';

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('form') form: CodxFormComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    private fdSV: CodxFdService,
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
    if(!this.dialog?.formModel.entityName) this.formModel.entityName = this.dialog?.formModel.entityPer;
    this.formType = data.data?.formType;
    this.title = data.data?.headerText;
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      if (res) {
        this.header =
          this.title +
          ' ' +
          res?.customName.charAt(0).toLocaleLowerCase() +
          res?.customName.slice(1);
      }
    });
  }

  onInit(): void {
    if (this.formType == 'edit') {
      this.isAddMode = false;
    } else {
      this.dataUpdate.owner = null;
      this.dataUpdate.price = null;
    }
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
        .save((option: any) => this.beforeSave(option, this.isAddMode), 0)
        .subscribe((res) => {
          if (res.save) {
            let data = res.save[2];
            this.imageUpload
              .updateFileDirectReload(data.giftID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
                var obj = { data: data, file: result };
                this.dialog.close(obj);
              });
          } else if (res.update) {
            let data = res.update[2];
            this.imageUpload
              .updateFileDirectReload(data.giftID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                }
                var obj = { data: data, file: result };
                this.dialog.close(obj);
              });
          }
          this.change.detectChanges();
        });
    } else this.fdSV.notifyInvalid(this.form.formGroup, this.formModel);
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
