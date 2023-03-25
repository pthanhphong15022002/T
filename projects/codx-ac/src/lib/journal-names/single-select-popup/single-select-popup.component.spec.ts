import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSelectPopupComponent } from './single-select-popup.component';

describe('SingleSelectPopupComponent', () => {
  let component: SingleSelectPopupComponent;
  let fixture: ComponentFixture<SingleSelectPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleSelectPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleSelectPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
