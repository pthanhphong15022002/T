import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { UIComponent } from 'codx-core';
import { PopupAddItemComponent } from '../../popup-add-item/popup-add-item.component';

@Component({
  selector: 'lib-image-box-list',
  templateUrl: './image-box-list.component.html',
  styleUrls: ['./image-box-list.component.css'],
})
export class ImageBoxListComponent extends UIComponent {
  //#region Constructor
  @Input() data: any[];
  @Input() entityName: string;
  @Input() captionTemplate: TemplateRef<any>;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  hoveredId: string;

  constructor(injector: Injector, public parent: PopupAddItemComponent) {
    super(injector);
  }
  //#endregion

  //#region Init
  override onInit(): void {}
  //#endregion

  //#region Event
  onClickEdit(item: any): void {
    this.edit.emit(item);
  }

  onClickDelete(e: MouseEvent, item: any): void {
    e.stopPropagation();

    this.delete.emit(item);
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
