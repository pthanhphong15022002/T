import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';
import { IJournalPermission } from '../../interfaces/IJournalPermission.interface';
import { JournalPermission } from '../../models/JournalPermission.model';
import { JournalService } from '../../journals.service';

@Component({
  selector: 'lib-group-share',
  templateUrl: './group-share.component.html',
  styleUrls: ['./group-share.component.css'],
})
export class GroupShareComponent extends UIComponent implements OnChanges {
  //#region Constructor
  @Input() formModel: FormModel;
  @Input() field: string;
  @Input() labelName: string;
  @Input() label: string;
  @Input() permissions: IJournalPermission[] = [];
  @Output() change = new EventEmitter();

  objectType: string;

  constructor(injector: Injector, private journalService: JournalService) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.permissions) {
      this.objectType = this.permissions[0]?.objectType;
    }
  }
  //#endregion

  //#region Event
  onChange(e: any): void {
    console.log(e);
    this.change.emit({
      field: e.field,
      data: e.data?.map(
        (m) =>
          new JournalPermission(
            JournalPermission.getRoleType(e.field),
            m.objectType,
            m.id,
            m.text
          )
      ),
    });
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
