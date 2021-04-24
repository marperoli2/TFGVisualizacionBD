import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominalComparisonChartsjsComponent } from './nominal-comparison-chartsjs.component';

describe('NominalComparisonChartsjsComponent', () => {
  let component: NominalComparisonChartsjsComponent;
  let fixture: ComponentFixture<NominalComparisonChartsjsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NominalComparisonChartsjsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NominalComparisonChartsjsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
