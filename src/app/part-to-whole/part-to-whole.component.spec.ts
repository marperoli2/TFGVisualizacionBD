import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartToWholeComponent } from './part-to-whole.component';

describe('PartToWholeComponent', () => {
  let component: PartToWholeComponent;
  let fixture: ComponentFixture<PartToWholeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartToWholeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartToWholeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
