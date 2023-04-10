import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselStageComponent } from './carousel-stage.component';

describe('CarouselStageComponent', () => {
  let component: CarouselStageComponent;
  let fixture: ComponentFixture<CarouselStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselStageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
