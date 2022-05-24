import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncTaskGroupComponent } from './func-task-group.component';

describe('FuncTaskGroupComponent', () => {
  let component: FuncTaskGroupComponent;
  let fixture: ComponentFixture<FuncTaskGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuncTaskGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FuncTaskGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
