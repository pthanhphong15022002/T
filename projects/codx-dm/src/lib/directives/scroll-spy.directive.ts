import { Directive, Injectable, Input, EventEmitter, Output, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[scrollSpy]'
})
export class ScrollSpyDirective {
    @Input() public spiedTags = [];
    @Output() public sectionChange = new EventEmitter<any>();
    private currentSection: string;

    constructor(private _el: ElementRef) { }

    @HostListener('scroll', ['$event'])
    onScroll(event: any) {
        let currentSection: string;
        let index: number;
        var ele = $('.data-scroll', $(this._el.nativeElement));
        if (ele.length == 0)
            ele = $(this._el.nativeElement)
        const children = ele.children();
        const scrollTop = event.target.scrollTop - 32;
        const parentOffset = event.target.offsetTop;
        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            if (this.spiedTags.some(spiedTag => spiedTag === element.tagName)) {
                if ((element.offsetTop - parentOffset) <= scrollTop) {
                    currentSection = element.id;
                    index = +element.dataset.index;
                }
            }
        }
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            this.sectionChange.emit({ current: this.currentSection, index: index });
        }
    }

}
