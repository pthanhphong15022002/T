import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[libSwiperClicking]'
})
export class SwiperClickingDirective {
  private swiperMain:HTMLDivElement;
  @Input() ContainerID: string = '';
  @Input() type:string;
  @Input() scrollSpeed:number = 100;
  constructor(private elementRef: ElementRef,private renderer: Renderer2) { }
  @HostListener('document:click', ['$event.target'])
  onClick(target: any): void {  
      if(this.elementRef.nativeElement.contains(target)){
          this.swiperMain = document.getElementById(this.ContainerID) as HTMLDivElement;
          this.swiperMain.style.scrollBehavior = 'smooth';
          if(this.swiperMain && (this.type == 'next')){
            const scrollAmount = this.scrollSpeed;
            this.swiperMain.scrollLeft += scrollAmount
          }
          else if(this.swiperMain && (this.type == 'previous' && this.swiperMain.scrollLeft > 0)){
            const scrollAmount =  - this.scrollSpeed;
            this.swiperMain.scrollLeft += scrollAmount     
          }      
      }
  }

}



