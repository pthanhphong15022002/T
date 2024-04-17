import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupMenusidebarReponsiveComponent } from './popup-menusidebar-reponsive.component';

describe('PopupMenusidebarReponsiveComponent', () => {
  let component: PopupMenusidebarReponsiveComponent;
  let fixture: ComponentFixture<PopupMenusidebarReponsiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupMenusidebarReponsiveComponent]
    });
    fixture = TestBed.createComponent(PopupMenusidebarReponsiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
