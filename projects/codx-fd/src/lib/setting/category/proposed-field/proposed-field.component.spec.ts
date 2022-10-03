import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposedfieldComponent } from './proposedfield.component';

describe('ProposedfieldComponent', () => {
  let component: ProposedfieldComponent;
  let fixture: ComponentFixture<ProposedfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProposedfieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposedfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
