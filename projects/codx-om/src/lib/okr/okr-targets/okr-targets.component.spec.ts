import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OkrTargetsComponent } from './okr-targets.component';

describe('OkrTargetsComponent', () => {
  let component: OkrTargetsComponent;
  let fixture: ComponentFixture<OkrTargetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OkrTargetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OkrTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
