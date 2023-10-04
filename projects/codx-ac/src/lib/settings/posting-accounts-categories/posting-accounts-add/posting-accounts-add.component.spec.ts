import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostingAccountsAddComponent } from './posting-accounts-add.component';

describe('PopAddItemComponent', () => {
  let component: PostingAccountsAddComponent;
  let fixture: ComponentFixture<PostingAccountsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostingAccountsAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostingAccountsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
