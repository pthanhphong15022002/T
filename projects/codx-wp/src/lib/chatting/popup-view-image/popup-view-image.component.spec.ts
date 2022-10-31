import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViewImageComponent } from './popup-view-image.component';

describe('PopupViewImageComponent', () => {
  let component: PopupViewImageComponent;
  let fixture: ComponentFixture<PopupViewImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupViewImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupViewImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
