
import {
  Component,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DropDownList } from '@syncfusion/ej2-angular-dropdowns';
import {
  Column,
  GridComponent,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import {
  ApiHttpService,
  CacheService,
  CodxGridviewComponent,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
@Component({
  selector: 'codx-import-add-mapping-template',
  templateUrl: './codx-import-add-mapping-template.component.html',
  styleUrls: ['./codx-import-add-mapping-template.component.scss'],
})
export class CodxImportAddMappingTemplateComponent implements OnInit, OnChanges {
  dialog:any;
  formModel: any;
  importAddMapTmp: FormGroup;
  submitted = false;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModel = dt.data?.[0];
  }
  get f(): { [key: string]: AbstractControl } {
    return this.importAddMapTmp.controls;
  }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.importAddMapTmp = this.formBuilder.group({
      nameTmp: ['', Validators.required],
    });
  }
  onSave()
  {
    this.submitted = true;
    if(this.importAddMapTmp.invalid) return;
    this.dialog.close(this.importAddMapTmp.value.nameTmp);
  }
}
