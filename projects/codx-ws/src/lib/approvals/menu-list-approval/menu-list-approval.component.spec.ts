import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuListApprovalComponent } from './menu-list-approval.component';

describe('MenuListApprovalComponent', () => {
  let component: MenuListApprovalComponent;
  let fixture: ComponentFixture<MenuListApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuListApprovalComponent]
    });
    fixture = TestBed.createComponent(MenuListApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
