import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewChild,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
  CodxFormComponent,
  ImageViewerComponent,
} from 'codx-core';
import { CodxFdService } from '../../../codx-fd.service';

@Component({
  selector: 'lib-add-dedication-rank',
  templateUrl: './add-dedication-rank.component.html',
  styleUrls: ['./add-dedication-rank.component.scss'],
})
export class AddDedicationRankComponent extends UIComponent implements OnInit {
  header = '';
  title = '';
  dialog: DialogRef;
  formModel: any;
  dataUpdate: any;
  isModeAdd = true;
  user: any;

  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('imageUpload') imageUpload: ImageViewerComponent;

  @Output() loadData = new EventEmitter();

  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    private authStore: AuthStore,
    private fdSV: CodxFdService,
    @Optional() dt: DialogData,
    @Optional() dialog: DialogRef
  ) {
    super(injector);
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.dataUpdate = JSON.parse(
      JSON.stringify(dialog.dataService.dataSelected)
    );
    console.log('check color', this.dataUpdate);
    this.formModel = dialog.formModel;
    this.isModeAdd = dt.data?.isModeAdd;
    this.title = dt.data?.headerText;
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

  onInit(): void {}

  valueChange(e) {
    if (e) {
      this.dataUpdate[e.field] = e.data;
    }
  }

  onSave() {
    var formGroup = this.form.formGroup.controls;
    if (this.dataUpdate.color) formGroup.color.setValue(this.dataUpdate.color);
    if (
      formGroup.breakName.status == 'VALID' &&
      formGroup.breakValue.status == 'VALID' &&
      formGroup.color.status == 'VALID'
    ) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe((res) => {
          if (this.isModeAdd) {
            if (res.save) {
              if (this.user.userName)
                res.save['createdName'] = this.user.userName;
              this.imageUpload
                .updateFileDirectReload(res.save[0].recID)
                .subscribe((result) => {
                  this.loadData.emit();
                  var obj = { data: res.save[0], file: result };
                  this.dialog.close(obj);
                });
            } else this.notification.notifyCode('SYS023');
          } else {
            if (res && res.update) {
              this.imageUpload
                .updateFileDirectReload(res.update[0].recID)
                .subscribe((result) => {
                  this.loadData.emit();
                  var obj = { data: res.update[0], file: result };
                  this.dialog.close(obj);
                });
            } else this.notification.notifyCode('SYS007');
          }
        });
    } else this.fdSV.notifyInvalid(this.form.formGroup, this.formModel);
  }

  beforeSave(option) {
    option.methodName = 'AddEditRangeLineAsync';
    this.dataUpdate.rangeID = 'KUDOS';
    option.data = [this.dataUpdate, this.isModeAdd];
    return true;
  }
}
