import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorruleComponent } from './behaviorrule.component';

describe('BehaviorruleComponent', () => {
  let component: BehaviorruleComponent;
  let fixture: ComponentFixture<BehaviorruleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BehaviorruleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BehaviorruleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
