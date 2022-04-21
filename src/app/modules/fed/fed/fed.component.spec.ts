import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FedComponent } from './fed.component';

describe('FedComponent', () => {
  let component: FedComponent;
  let fixture: ComponentFixture<FedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
