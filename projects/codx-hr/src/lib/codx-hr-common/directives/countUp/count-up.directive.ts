import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[countUpAnimation]'
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  @Input() finalNumber: number = 0;
  @Input() countUpType: string = 'integer'; 

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.animateCountUp();
    });
  }

  private animateCountUp(): void {
    const startTime = performance.now();
    const duration = 1000;

    const step = (timestamp: number) => {
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      const currentNumber = this.finalNumber * percentage;
      const displayNumber = this.countUpType === 'integer' ? Math.floor(currentNumber) : currentNumber.toFixed(1);

      this.renderer.setProperty(this.el.nativeElement, 'textContent', displayNumber.toString());

      if (percentage < 1) {
        requestAnimationFrame(step);
      } else {
        this.renderer.setProperty(this.el.nativeElement, 'textContent', this.finalNumber.toString());
      }
    };

    requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
  }
}