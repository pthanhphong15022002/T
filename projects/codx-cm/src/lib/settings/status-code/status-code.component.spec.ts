import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusCodeComponent } from './status-code.component';

describe('StatusCodeComponent', () => {
  let component: StatusCodeComponent;
  let fixture: ComponentFixture<StatusCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatusCodeComponent]
    });
    fixture = TestBed.createComponent(StatusCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
