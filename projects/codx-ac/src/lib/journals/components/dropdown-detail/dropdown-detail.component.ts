import {
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';
import { JournalService } from '../../journals.service';

@Component({
  selector: 'lib-dropdown-detail',
  templateUrl: './dropdown-detail.component.html',
  styleUrls: ['./dropdown-detail.component.css'],
})
export class DropdownDetailComponent extends UIComponent implements OnChanges {
  //#region Constructor
  /** A semicolon separated string
   * @example 2332;2342;23223
   */
  @Input() objectId;
  @Input() objectType: string;
  @Input() formModel: FormModel;

  shareModels: { id: string; text: string }[];

  constructor(injector: Injector, private journalService: JournalService) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.objectId || changes.objectType) {
      const objectId: string[] = this.objectId?.split(';');

      if (this.objectType === 'UG') {
        this.journalService.getUserGroups().subscribe((userGroups) => {
          this.shareModels = userGroups
            ?.filter((d) => objectId.includes(d.GroupID))
            .map((d) => ({ id: d.GroupID, text: d.GroupName }));
        });
      } else if (this.objectType === 'R') {
        this.journalService.getUserRoles().subscribe((userRoles) => {
          this.shareModels = userRoles
            ?.filter((d) => objectId.includes(d.RecID))
            .map((d) => ({ id: d.RecID, text: d.RoleName })); // wtf core???
        });
      }
    }
  }
  //#endregion

  //#region Event
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
