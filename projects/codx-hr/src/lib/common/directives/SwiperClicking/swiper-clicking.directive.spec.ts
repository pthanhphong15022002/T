import { SwiperClickingDirective } from './swiper-clicking.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('SwiperClickingDirective', () => {
  it('should create an instance', () => {
    const elementRefMock: ElementRef<any> = {
      nativeElement: document.createElement('div')
    };

    const rendererMock: Renderer2 = {} as Renderer2;

    const directive = new SwiperClickingDirective(elementRefMock, rendererMock);
    
    expect(directive).toBeTruthy();
  });
});
