import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddCustomersComponent } from './pop-add-customers.component';

describe('PopAddCustomersComponent', () => {
  let component: PopAddCustomersComponent;
  let fixture: ComponentFixture<PopAddCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddCustomersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
