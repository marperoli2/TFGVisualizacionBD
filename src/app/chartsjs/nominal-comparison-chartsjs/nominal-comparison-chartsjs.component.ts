import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';

@Component({
  selector: 'app-nominal-comparison-chartsjs',
  templateUrl: './nominal-comparison-chartsjs.component.html',
  styleUrls: ['./nominal-comparison-chartsjs.component.css']
})
export class NominalComparisonChartsjsComponent implements OnInit, AfterViewInit {

  @ViewChild('myChart') private barCanvas: ElementRef;
  nominalComparisonChart: any;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    this.nominalComparisonChartMethod();

  }

  private nominalComparisonChartMethod() {

    Chart.register(BarController, LinearScale, CategoryScale, BarElement);
    this.nominalComparisonChart = new Chart(this.barCanvas.nativeElement, {
      type: "bar",
      data: {
        labels: ['BJP', 'INC', 'AAP', 'CPI', 'CPI-M', 'NCP'],
        datasets: [{
          label: '# of Votes',
          data: [200, 50, 30, 15, 20, 34],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            beginAtZero: true
          }
        }
      }
    });


  }



}
