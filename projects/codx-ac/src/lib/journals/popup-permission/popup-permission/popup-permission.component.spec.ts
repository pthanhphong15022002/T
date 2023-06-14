import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPermissionComponent } from './popup-permission.component';

describe('PopupPermissionComponent', () => {
  let component: PopupPermissionComponent;
  let fixture: ComponentFixture<PopupPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupPermissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
