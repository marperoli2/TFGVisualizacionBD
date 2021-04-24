import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ColumnChart } from '@toast-ui/chart'

const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000],
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000, 5000],
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000, 7000],
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000, 3000],
    },
  ],
};

const options = {
  chart: { title: 'Monthly Revenue', width: 900, height: 400 },
};

@Component({
  selector: 'app-nominal-comparison-toast',
  templateUrl: './nominal-comparison-toast.component.html',
  styleUrls: ['./nominal-comparison-toast.component.css']
})

export class NominalComparisonToastComponent implements OnInit, AfterViewInit {
  
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit():void{
    const el = document.getElementById("nominalComparison");
    const chart = new ColumnChart({el, data, options});
  }

}
