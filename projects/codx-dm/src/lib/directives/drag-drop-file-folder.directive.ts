import { Directive, EventEmitter, Output, HostListener, HostBinding, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appDragDropFileFolder]'
})

export class DragDropFileFolderDirective {

  @Output() fileFolderDropped = new EventEmitter<any>();
  @Input() dataDrapDrop:any;
  @Input() canDrop:true;
  @Input() toDelete:false;
  //@HostBinding('style.background-color') private background = '#ffffff';
  @HostBinding('style.border-style') private borderstyle = 'none';
  @HostBinding('style.border-color') private bordercolor = '#7e8299';
  @HostBinding('style.border-width') private borderwidth = '1px';
  constructor(private _el: ElementRef) { 
  }
  
@HostListener('dragstart', ['$event']) dragstart(event) {
  //event.preventDefault();
  //  event.stopPropagation();
  var j = JSON.stringify(this.dataDrapDrop);
  event.dataTransfer.setData('data', j);
  event.dataTransfer["simple"] = "filefolder";
  event.dataTransfer.effectAllowed = "move";
}

  // Dragover Event
  @HostListener('dragover', ['$event']) dragOver(event) {
   
    if(event.dataTransfer.effectAllowed != "move") return;
    if(event.currentTarget.classList.contains("noDrop")) return;
    event.preventDefault();
    event.stopPropagation();
    //this.background = '#e2eefd';
    this.borderstyle = "dashed !important";
   
  }

  // Dragleave Event
  @HostListener('dragleave', ['$event']) public dragLeave(event) {
    if(event.dataTransfer.effectAllowed != "move") return;
    if(event.currentTarget.classList.contains("noDrop")) return;
    event.preventDefault();
    event.stopPropagation();
    //this.background = '#ffffff';
    this.borderstyle = "none";
    
  }

  // Drop Event
  @HostListener('drop', ['$event']) public drop(event) {
    if(event.dataTransfer.effectAllowed != "move") return;
    if(event.currentTarget.classList.contains("noDrop")) return;
    event.preventDefault();
    event.stopPropagation();
   // this.background = '#ffffff';
    this.borderstyle = "none";
    var obj = JSON.parse(event.dataTransfer.getData("data"));
    
    this.fileFolderDropped.emit({source:obj,target:this.dataDrapDrop,toDelete:this.toDelete});
    
  }

}