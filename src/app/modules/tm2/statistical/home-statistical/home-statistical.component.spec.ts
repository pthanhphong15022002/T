import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStatisticalComponent } from './home-statistical.component';

describe('HomeStatisticalComponent', () => {
  let component: HomeStatisticalComponent;
  let fixture: ComponentFixture<HomeStatisticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeStatisticalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeStatisticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
