import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Group067Component } from './group067.component';

describe('Group067Component', () => {
  let component: Group067Component;
  let fixture: ComponentFixture<Group067Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Group067Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Group067Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
