import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[libSidebarToggle]',
})
export class SidebarToggleDirective {
  @Input() sidebarID: string = '';
  @Input() mainContentID: string = '';
  @Input() toggleSpeed: number = 300;
  @Input() paddingNumber: number = 12;

  private isSidebarExpanded: boolean = false;
  private originalSidebarWidth: string = '';
  private defaultSidebarWidth: string = '367px';

  constructor(private el: ElementRef) {}

  @HostListener('click')
  onClick(): void {
    const sidebar = document.getElementById(this.sidebarID);
    const mainContent = document.getElementById(this.mainContentID);

    console.log(mainContent);

    if (sidebar && mainContent) {
      if (this.isSidebarExpanded) {
        this.originalSidebarWidth =
          sidebar.style.width || this.defaultSidebarWidth;
        sidebar.style.transform = 'translateX(0)';
        mainContent.style.marginRight = this.defaultSidebarWidth;
      } else {
        sidebar.style.transform = 'translateX(100%)';
        mainContent.style.marginRight = '0px';
      }

      this.isSidebarExpanded = !this.isSidebarExpanded;

      sidebar.style.transitionDuration = `${this.toggleSpeed}ms`;
      mainContent.style.transitionDuration = `${this.toggleSpeed}ms`;

      setTimeout(() => {
        var display = sidebar.style.display === 'none' ? 'block' : 'none';
        sidebar.style.display = display;
      }, this.toggleSpeed + 10);
    }
  }
}