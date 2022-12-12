import { Component, EventEmitter, Input, Output, QueryList, TemplateRef } from "@angular/core";


@Component({
  selector: 'layout-panel',
  templateUrl: 'layout-panel.component.html',
  styleUrls: ['layout-panel.component.scss']
})
export class LayoutPanelComponent {
  @Input() body?: QueryList<any>;
  @Output() addNew = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Input() selectedTemplate!: TemplateRef<any>;
  @Input() isChart: boolean = false;
  close(evt:any){
    this.delete.emit(evt.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id)
  }
  add(evt:any){
    if(this.body && !this.isChart){
      this.addNew.emit({panelID: evt.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id,template:this.body});
    }
    else{
      this.addNew.emit({panelID:evt.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id});
    }


  }
  scroll(evt:any){
    console.log(evt);

  }
}
