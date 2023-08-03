import {
  AfterViewChecked,
  Component,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormModel, UIComponent } from 'codx-core';
import { IJournalPermission } from '../../interfaces/IJournalPermission.interface';
import { PopupPermissionComponent } from '../../popup-permission/popup-permission.component';

@Component({
  selector: 'lib-dropdown-detail',
  templateUrl: './dropdown-detail.component.html',
  styleUrls: ['./dropdown-detail.component.css'],
})
export class DropdownDetailComponent
  extends UIComponent
  implements OnChanges, AfterViewChecked
{
  //#region Constructor
  @Input() objectType: string;
  @Input() permissions: IJournalPermission[] = [];
  @Input() formModel: FormModel;

  @ViewChild('content') content: ElementRef<HTMLElement>;

  /** A semicolon separated string
   * @example 2332;2342;23223
   */
  objectId: string;
  shareModels: { id: string; text: string }[] = [];
  overflowed: boolean = false;

  constructor(injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.content?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.shareModels = this.permissions.map((p) => ({
      id: p.objectID,
      text: p.objectName,
    }));

    this.objectId = this.permissions.map((p) => p.objectID).join(';');
  }
  //#endregion

  //#region Event
  onClick(m: any): void {
    console.log(m);
    this.openPermissionPopup();
  }

  onSelect(e): void {
    console.log(e);
    this.openPermissionPopup();
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  openPermissionPopup(): void {
    if (this.permissions[0]?.roleType !== '1') {
      return;
    }

    this.callfc
      .openForm(
        PopupPermissionComponent,
        'This param is not working',
        950,
        650,
        '',
        {
          permissions: this.permissions,
        }
      )
      .closed.subscribe(({ event }) => {
        if (event) {
          this.permissions = event;

          this.shareModels = this.permissions.map((p) => ({
            id: p.objectID,
            text: p.objectName,
          }));

          this.objectId = this.permissions.map((p) => p.objectID).join(';');
        }
      });
  }
  //#endregion
}
