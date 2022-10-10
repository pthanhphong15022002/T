import { Component, EventEmitter, Input, Output, TemplateRef } from "@angular/core";


@Component({
  selector: 'layout-panel',
  templateUrl: 'layout-panel.component.html',
  styleUrls: ['layout-panel.component.scss']
})
export class LayoutPanelComponent {
  @Input() body?: TemplateRef<any>;
  @Output() addNew = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  close(evt:any){
    this.delete.emit(evt.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id)
  }
  add(evt:any){
    this.addNew.emit(evt.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id);

  }
  scroll(evt:any){
    console.log(evt);

  }
}
