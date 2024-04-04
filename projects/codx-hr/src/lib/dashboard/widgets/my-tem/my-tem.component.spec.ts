import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTemComponent } from './my-tem.component';

describe('MyTemComponent', () => {
  let component: MyTemComponent;
  let fixture: ComponentFixture<MyTemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTemComponent]
    });
    fixture = TestBed.createComponent(MyTemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
