import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopylinkComponent } from './copylink.component';

describe('CopylinkComponent', () => {
  let component: CopylinkComponent;
  let fixture: ComponentFixture<CopylinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopylinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopylinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
