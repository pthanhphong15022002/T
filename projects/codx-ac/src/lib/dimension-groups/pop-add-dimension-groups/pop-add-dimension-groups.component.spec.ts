import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddDimensionGroupsComponent } from './pop-add-dimension-groups.component';

describe('PopAddDimensionGroupsComponent', () => {
  let component: PopAddDimensionGroupsComponent;
  let fixture: ComponentFixture<PopAddDimensionGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddDimensionGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddDimensionGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
