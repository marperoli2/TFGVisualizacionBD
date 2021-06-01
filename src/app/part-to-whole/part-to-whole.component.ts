import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BarChart, ColumnChart } from '@toast-ui/chart';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Title } from 'chart.js';
import * as d3 from 'd3';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-part-to-whole',
  templateUrl: './part-to-whole.component.html',
  styleUrls: ['./part-to-whole.component.css']
})
export class PartToWholeComponent implements OnInit {

  public csvData: string;

  //PARA TOAST
  @ViewChild('csvReader') csvReader: any;
  private categorias: any = []; // Para guardar las categorias o la coordenada x
  private values: any = []; // Para guardar los valroes de las serie
  private sss: any = []

  //PARA CHARTSJS
  @ViewChild('myChart') private barCanvas: ElementRef;
  nominalComparisonChart: any;
  chartsjsData = {
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: 'rgba(59, 131, 189)'
      },
      {
        label: '',
        data: [],
        backgroundColor: 'rgba(255, 128, 0)'
      },
    ],
  };

  //PARA D3
  private svg: any;
  private margin: number;
  private width: number;
  private height: number;
  private maxY: number = 0;
  // El elemento que elige el fichero
  @ViewChild('csvReader') csvReaderd3: any;
  private d3Data: any[] = [];

  constructor(private http: HttpClient) {
    this.http.get('assets/alimentos.csv', { responseType: 'text' })
      .subscribe(
        data => {
          this.csvData = data;
          this.allGraphs();

        },
        error => {
          console.log(error);
        }

      );
  }

  ngOnInit(): void {
  }

  private allGraphs() {

    let text = [];
    let seriesName = [];  // Para guardar el nombre de la serie

    let csvRecordsArray = (<String>this.csvData).split(/\r\n|\n/);

    let headersRow = this.getHeaderArray(csvRecordsArray);

    for (let i = 0; i < headersRow.length; i++) {
      seriesName.push(headersRow[i].trim().replace(/['"]+/g, ''));
    } //para quitar dobles comillas con las que sale del csv

    this.getDataRecordsArrayFromCSVFile(csvRecordsArray);
    this.getDataRecordsArrayFromCSVFileBelg(csvRecordsArray);
    this.d3getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow); //Hace falta el nombre de la cabecera para las series ({Cabecera:Value})

    //TOAST
    const toastData = {
      categories: [],
      series: [
        {
          name: '',
          data: [],
        },
        {
          name: '',
          data: [],
        },
      ],
    };
    toastData.categories = seriesName;
    toastData.series[0].name = "España:";
    toastData.series[0].data = this.values;
    toastData.series[1].name = "Bélgica:";
    toastData.series[1].data = this.sss;
    //Creación del gráfico con Toast
    this.createGraphToast(toastData);

    //-------------------------------------------------------------------------------------

    //CHARTSJS
    this.chartsjsData.labels = seriesName;
    this.chartsjsData.datasets[0].label = "%";
    this.chartsjsData.datasets[0].data = this.values;
    this.chartsjsData.datasets[1].label = "%";
    this.chartsjsData.datasets[1].data = this.sss;
    //Creación del gráfico con Chartsjs
    this.createGraphChartsjs(this.chartsjsData);

    //-------------------------------------------------------------------------------------

    //D3
    this.margin = 140;
    this.width = 400;
    this.height = 400;
    //Creación del gráfico con d3
    this.createSvg();
    this.drawBars(this.d3Data.sort((a, b) => d3.ascending(a.value, b.value)));
    console.log(this.d3Data)
  }

  private createGraphChartsjs(data: any) {

  Chart.register(BarController, LinearScale, CategoryScale, BarElement, Title);
  this.nominalComparisonChart = new Chart(this.barCanvas.nativeElement, {
    type: "bar",
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Part To Whole - ChartsJS',
        }
      },
      indexAxis: 'y',
      scales: {
        x: {
          title: {
            display: true,
            text: 'Porcentaje de consumo en',
          },
          type: 'linear',
          beginAtZero: true,
        },
        y: {
          title: {
            display: true,
            text: 'Tipo de alimentos',
          },
        }
      }
    }
  });


}

createGraphToast(data: any) {

  const options = {
    chart: { title: '', width: 15000, height: 500 },
    xAxis: {
      title: 'Porcentaje de consumo',
    },
    yAxis: {
      title: 'Tipo de alimentos',
    },
  };

  options.chart.title = "Part To Whole - Toast";
  options.chart.width = 70 * data.series[0].data.length;

  const el = document.getElementById('grafica');
  const chart = new BarChart({ el, data, options });


}

  private createSvg(): void {
  this.svg = d3.select("figure#imagen")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");

}

  private drawBars(data: any[]): void {
  // Create the X-axis band scale

  const y = d3.scaleBand()
    .range([0, this.width])
    .domain(data.map(d => d.foodSupply))
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, this.maxY])
    .range([0, this.width]);

  console.log(this.height)
    console.log(this.maxY)


    // Draw the X-axis on the DOM
    this.svg.append("g")
    .attr("transform", "translate(0," + this.width + ")")
    .call(d3.axisBottom(x));

  // Create the Y-axis band scale


  // Draw the Y-axis on the DOM
  this.svg.append("g")
    .call(d3.axisLeft(y));


  this.svg.selectAll("bars")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => 0)
    .attr("y", d => y(d.foodSupply))
    .attr("width", d => x(d.value))
    .attr("height", y.bandwidth)
    .attr("fill", "#d04a35");

  this.svg.append("g")
    .attr("fill", "white")
    .attr("text-anchor", "end")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("x", d => x(d.value))
    .attr("y", d => y(d.foodSupply))
    .attr("dy", "1em")
    .attr("dx", -4)
    .text(d => (d.value).toFixed(2))
    .call(text => text.filter(d => x(d.value) - x(0) < 25) // short bars
      .attr("dx", +4)
      .attr("fill", "black")
      .attr("text-anchor", "start"));

  //Añadiendo título al gráfico
  this.svg.append("text")
    .attr("x", this.width / 2)
    .attr("y", 0 - (this.margin / 6))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Part To Whole - d3");

  //Añadiendo título al eje Y
  this.svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - this.margin)
    .attr("x", 0 - (this.width / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Tipo de alimentos");

  //Añadiendo título al eje X
  this.svg.append("text")
    .attr("transform", "translate(" + (this.width / 2) + ", " + (this.height + 50) + ")")
    .style("text-anchor", "middle")
    .text("Porcentaje de consumo en");
}


d3getDataRecordsArrayFromCSVFile(csvRecordsArray: any, header: any[]) {

  var encontrado = false;
  let country: any;
  let foodSupply: any;
  let value: any;

  for (let i = 1; i < csvRecordsArray.length && !encontrado; i++) {
    let currentRecord = (<string>csvRecordsArray[i]).split(',');

    country = currentRecord[0].trim().replace(/['"]+/g, '');

    if (country === "Spain") {
      for (let j = 1; j < currentRecord.length - 8; j++) {
        foodSupply = header[j - 1].trim().replace(/['"]+/g, '');
        if (!isNaN(parseFloat(currentRecord[j]))) {
          value = parseFloat(currentRecord[j].trim().replace(/['"]+/g, ''));
          if (value > this.maxY) {
            this.maxY = value;
          }
        } else {
          value = 0;
        }
        this.d3Data.push({ foodSupply, value })
      }
      encontrado = true;
    }
  }
}


getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

  var encontrado = false;

  for (let i = 1; i < csvRecordsArray.length && !encontrado; i++) {
    let currentRecord = (<string>csvRecordsArray[i]).split(',');
    console.log(currentRecord[0])
    if (currentRecord[0] === "\"Spain\"") {
      for (let j = 1; j < currentRecord.length - 8; j++) {
        let aux = Number(parseFloat(currentRecord[j]).toFixed(2));
        if (isNaN(parseFloat(currentRecord[j]))) {
          aux = 0
        }
        this.values.push(aux);
      }
      encontrado = true; //Para que no siga buscando cuando encuentre España
    }
  }
}

getDataRecordsArrayFromCSVFileBelg(csvRecordsArray: any) {

  var encontrado = false;

  for (let i = 1; i < csvRecordsArray.length && !encontrado; i++) {
    let currentRecord = (<string>csvRecordsArray[i]).split(',');
    console.log(currentRecord[0])
    if (currentRecord[0] === "\"Belgium\"") {
      for (let j = 1; j < currentRecord.length - 8; j++) {
        let aux = Number(parseFloat(currentRecord[j]).toFixed(2));
        if (isNaN(parseFloat(currentRecord[j]))) {
          aux = 0
        }
        this.sss.push(aux);
      }
      encontrado = true; //Para que no siga buscando cuando encuentre España
    }
  }
}

getHeaderArray(csvRecordsArr: any) {
  let headers = (<string>csvRecordsArr[0]).split('\",');
  let headerArray = [];
  for (let j = 1; j < headers.length - 8; j++) {
    headerArray.push(headers[j]);
  }
  return headerArray;
}

}
