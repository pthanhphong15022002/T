import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignProcessComponent } from './sign-process.component';

describe('SignProcessComponent', () => {
  let component: SignProcessComponent;
  let fixture: ComponentFixture<SignProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
