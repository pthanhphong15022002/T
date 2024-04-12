import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarTreeviewComponent } from './sidebar-treeview.component';

describe('SidebarTreeviewComponent', () => {
  let component: SidebarTreeviewComponent;
  let fixture: ComponentFixture<SidebarTreeviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarTreeviewComponent]
    });
    fixture = TestBed.createComponent(SidebarTreeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
