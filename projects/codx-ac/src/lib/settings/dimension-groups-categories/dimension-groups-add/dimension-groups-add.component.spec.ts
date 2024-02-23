import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionGroupsAddComponent } from './dimension-groups-add.component';

describe('PopAddDimensionGroupsComponent', () => {
  let component: DimensionGroupsAddComponent;
  let fixture: ComponentFixture<DimensionGroupsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DimensionGroupsAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionGroupsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
