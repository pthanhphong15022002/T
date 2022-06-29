import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncommingAddComponent } from './incomming-add.component';

describe('TestAddComponent', () => {
  let component: IncommingAddComponent;
  let fixture: ComponentFixture<IncommingAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncommingAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncommingAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
