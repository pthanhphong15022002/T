import {
  Component,
  EventEmitter,
  Injector,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import {
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-stationery',
  templateUrl: './popup-add-stationery.component.html',
  styleUrls: ['./popup-add-stationery.component.scss'],
})
export class PopupAddStationeryComponent extends UIComponent {
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('popupColor') popupTemp: TemplateRef<any>;
  @Output() loadData = new EventEmitter();
  isAfterRender = false;
  dialogAddStationery: FormGroup;
  color: any;
  columnGrid;
  title: string = '';
  titleAction: string = 'Thêm mới';
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_add_alt_1',
      text: 'Định mức sử dụng',
      name: 'tabPeopleInfo',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  data: any = {};
  dialog: DialogRef;
  isAdd = true;
  colorItem: any;
  listColor = [];
  formModel: FormModel;
  headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Định mức sử dụng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogAddStationery = item;
        this.isAfterRender = true;
        if (this.data) {
          this.dialogAddStationery.patchValue(this.data);
          this.dialogAddStationery.addControl(
            'code',
            new FormControl(this.data.code)
          );
        }
      });
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddStationery.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    if (this.dialogAddStationery.invalid == true) {
      return;
    }
    this.dialogAddStationery.patchValue({
      owner: this.dialogAddStationery.value.owner[0],
    });
    this.dialogAddStationery.patchValue({ color: this.listColor.join(';') });
    this.dialogAddStationery.patchValue({
      groupID: '1',
    });
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save) {
          this.imageUpload
            .updateFileDirectReload(res.save.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
        } else {
          this.imageUpload
            .updateFileDirectReload(res.update.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
        }
        this.dialog.close();
      });
  }

  checkedOnlineChange(event) {
    this.dialogAddStationery.patchValue({
      online: event.data instanceof Object ? event.data.checked : event.data,
    });

    if (!this.dialogAddStationery.value.online)
      this.dialogAddStationery.patchValue({ onlineUrl: null });
    this.detectorRef.detectChanges();
  }

  setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.dialogAddStationery.patchValue(data);
    }
  }

  openPopupColor(template: any, color) {
    this.color = color;
    var dialog = this.callfc.openForm(template, '', 500, 350);
    this.detectorRef.detectChanges();
  }

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogAddStationery.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogAddStationery.patchValue({ [event['field']]: event.data });
      }
    }
    this.colorItem = event.data;
  }

  closeDialog(evt: any) {
    if (this.color != null) {
      let i = this.listColor.indexOf(this.color);
      if (i != -1) {
        this.listColor[i] = this.colorItem;
      }
    } else {
      this.listColor.push(this.colorItem);
    }
    this.detectorRef.detectChanges();
  }

  setTitle(e: any) {
    this.title = this.titleAction + ' ' + e.toString().toLowerCase();
    this.detectorRef.detectChanges();
  }

  buttonClick(e: any) {}

  splitColor(color: string): any {
    if (color) {
      return color.split(';');
    }
  }

  fileCount(event) {}

  fileAdded(event) {}
}
