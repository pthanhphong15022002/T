import { SidebarToggleDirective } from './sidebar-toggle.directive';

describe('SidebarToggleDirective', () => {
  it('should create an instance', () => {
    const directive = new SidebarToggleDirective({ nativeElement: document.createElement('div') });
    expect(directive).toBeTruthy();
  });
});
