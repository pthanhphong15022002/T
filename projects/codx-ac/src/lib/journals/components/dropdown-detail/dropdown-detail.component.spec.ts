import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownDetailComponent } from './dropdown-detail.component';

describe('DropdownDetailComponent', () => {
  let component: DropdownDetailComponent;
  let fixture: ComponentFixture<DropdownDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropdownDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
