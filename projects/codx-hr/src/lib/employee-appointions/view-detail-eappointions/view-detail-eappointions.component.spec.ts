import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailEappointionsComponent } from './view-detail-eappointions.component';

describe('ViewDetailEappointionsComponent', () => {
  let component: ViewDetailEappointionsComponent;
  let fixture: ComponentFixture<ViewDetailEappointionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailEappointionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailEappointionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
