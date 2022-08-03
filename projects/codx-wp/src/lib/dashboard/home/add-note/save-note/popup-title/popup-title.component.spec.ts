import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupTitleComponent } from './popup-title.component';

describe('PopupTitleComponent', () => {
  let component: PopupTitleComponent;
  let fixture: ComponentFixture<PopupTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
