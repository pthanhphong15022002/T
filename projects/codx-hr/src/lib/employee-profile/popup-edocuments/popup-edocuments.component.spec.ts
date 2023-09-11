import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEdocumentsComponent } from './popup-edocuments.component';

describe('PopupEdocumentsComponent', () => {
  let component: PopupEdocumentsComponent;
  let fixture: ComponentFixture<PopupEdocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupEdocumentsComponent]
    });
    fixture = TestBed.createComponent(PopupEdocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
