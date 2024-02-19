import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupCopyEkowdsComponent } from './popup-copy-kowd.component';

describe('PopupCopyEkowdsComponent', () => {
  let component: PopupCopyEkowdsComponent;
  let fixture: ComponentFixture<PopupCopyEkowdsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupCopyEkowdsComponent]
    });
    fixture = TestBed.createComponent(PopupCopyEkowdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
