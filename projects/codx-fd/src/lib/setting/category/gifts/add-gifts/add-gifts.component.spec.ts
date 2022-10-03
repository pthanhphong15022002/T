import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGiftsComponent } from './add-gifts.component';

describe('AddGiftsComponent', () => {
  let component: AddGiftsComponent;
  let fixture: ComponentFixture<AddGiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddGiftsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
