import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[codxAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {

  constructor(private element: ElementRef<HTMLInputElement>) { }
 
  ngAfterViewInit(): void {
    this.element.nativeElement.focus();
  }

}
