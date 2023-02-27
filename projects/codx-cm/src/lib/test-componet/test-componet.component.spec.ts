import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponetComponent } from './test-componet.component';

describe('TestComponetComponent', () => {
  let component: TestComponetComponent;
  let fixture: ComponentFixture<TestComponetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestComponetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
