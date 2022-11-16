import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OKRComponent } from './okr.component';

describe('OkrComponent', () => {
  let component: OKRComponent;
  let fixture: ComponentFixture<OKRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OKRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OKRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
