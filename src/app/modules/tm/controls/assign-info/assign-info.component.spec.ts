import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignInfoComponent } from './assign-info.component';

describe('AssignInfoComponent', () => {
  let component: AssignInfoComponent;
  let fixture: ComponentFixture<AssignInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
