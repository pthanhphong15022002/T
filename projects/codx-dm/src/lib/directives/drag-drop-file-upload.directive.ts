import { Directive, EventEmitter, Output, HostListener, HostBinding, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDragDropFileUpload]'
})

export class DragDropFileUploadDirective {

  @Output() fileDropped = new EventEmitter<any>();

  //@HostBinding('style.background-color') private background = '#ffffff';
  @HostBinding('style.border-style') private borderstyle = 'none';
  @HostBinding('style.border-color') private bordercolor = '#7e8299';
  @HostBinding('style.border-width') private borderwidth = '1px';
  constructor(private _el: ElementRef) { 
  }
  // Dragover Event
  @HostListener('dragover', ['$event']) dragOver(event) {
    if(event.dataTransfer.effectAllowed == "move") return;
    event.preventDefault();
    event.stopPropagation();
    //this.background = '#e2eefd';
    this.borderstyle = "dashed !important";
  }

  // Dragleave Event
  @HostListener('dragleave', ['$event']) public dragLeave(event) {
    if(event.dataTransfer.effectAllowed == "move") return;
    event.preventDefault();
    event.stopPropagation();
    //this.background = '#ffffff';
    this.borderstyle = "none";
  }

  // Drop Event
  @HostListener('drop', ['$event']) public drop(event) {
    if(event.dataTransfer.effectAllowed == "move") return;
    if(event.currentTarget.classList.contains("home") || event.currentTarget.classList.contains("cancelEvent")){
      event.preventDefault();
      event.stopPropagation();
    }
    //this.background = '#ffffff';
    this.borderstyle = "none";
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files)
    }
  }
 
}