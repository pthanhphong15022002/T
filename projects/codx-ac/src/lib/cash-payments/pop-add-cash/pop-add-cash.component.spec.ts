import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddCashComponent } from './pop-add-cash.component';

describe('PopAddCashComponent', () => {
  let component: PopAddCashComponent;
  let fixture: ComponentFixture<PopAddCashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddCashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
