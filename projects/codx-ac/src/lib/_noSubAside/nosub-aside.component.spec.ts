import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NosubAsideComponent } from './nosub-aside.component';

describe('NosubAsideComponent', () => {
  let component: NosubAsideComponent;
  let fixture: ComponentFixture<NosubAsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NosubAsideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NosubAsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
