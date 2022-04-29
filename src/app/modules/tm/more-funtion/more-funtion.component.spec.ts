import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreFuntionComponent } from './more-funtion.component';

describe('MoreFuntionComponent', () => {
  let component: MoreFuntionComponent;
  let fixture: ComponentFixture<MoreFuntionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreFuntionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreFuntionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
