import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoomBookingComponent } from './edit-room-booking.component';

describe('EditRoomBookingComponent', () => {
  let component: EditRoomBookingComponent;
  let fixture: ComponentFixture<EditRoomBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRoomBookingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRoomBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
