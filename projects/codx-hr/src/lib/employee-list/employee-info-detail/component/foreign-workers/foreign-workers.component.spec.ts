import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeignWorkersComponent } from './foreign-workers.component';

describe('ForeignWorkersComponent', () => {
  let component: ForeignWorkersComponent;
  let fixture: ComponentFixture<ForeignWorkersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForeignWorkersComponent]
    });
    fixture = TestBed.createComponent(ForeignWorkersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
