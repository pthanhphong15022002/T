import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGroupComponent } from './project-group.component';

describe('ProjectGroupComponent', () => {
  let component: ProjectGroupComponent;
  let fixture: ComponentFixture<ProjectGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
