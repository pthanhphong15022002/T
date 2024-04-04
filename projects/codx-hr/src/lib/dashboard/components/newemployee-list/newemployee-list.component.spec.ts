import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewemployeeListComponent } from './newemployee-list.component';

describe('NewemployeeListComponent', () => {
  let component: NewemployeeListComponent;
  let fixture: ComponentFixture<NewemployeeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewemployeeListComponent]
    });
    fixture = TestBed.createComponent(NewemployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
