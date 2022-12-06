import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OkrToolbarComponent } from './okr-toolbar.component';

describe('OkrToolbarComponent', () => {
  let component: OkrToolbarComponent;
  let fixture: ComponentFixture<OkrToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OkrToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OkrToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
