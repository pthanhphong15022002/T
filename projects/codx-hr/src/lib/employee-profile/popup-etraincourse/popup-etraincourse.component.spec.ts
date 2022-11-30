import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupETraincourseComponent } from './popup-etraincourse.component';

describe('PopupETraincourseComponent', () => {
  let component: PopupETraincourseComponent;
  let fixture: ComponentFixture<PopupETraincourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupETraincourseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupETraincourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
