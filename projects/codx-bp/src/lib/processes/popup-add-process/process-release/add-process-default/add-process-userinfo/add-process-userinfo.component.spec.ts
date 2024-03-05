import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProcessUserinfoComponent } from './add-process-userinfo.component';

describe('AddProcessUserinfoComponent', () => {
  let component: AddProcessUserinfoComponent;
  let fixture: ComponentFixture<AddProcessUserinfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddProcessUserinfoComponent]
    });
    fixture = TestBed.createComponent(AddProcessUserinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
