import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionGroupsComponent } from './dimension-groups.component';

describe('DimensionGroupsComponent', () => {
  let component: DimensionGroupsComponent;
  let fixture: ComponentFixture<DimensionGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DimensionGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
