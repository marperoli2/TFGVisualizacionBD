import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BarChart, ColumnChart } from '@toast-ui/chart';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Title } from 'chart.js';
import * as d3 from 'd3';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-nominal-comparison',
  templateUrl: './nominal-comparison.component.html',
  styleUrls: ['./nominal-comparison.component.css']
})
export class NominalComparisonComponent implements OnInit {

  public csvData: string;

  //PARA TOAST
  @ViewChild('csvReader') csvReader: any;
  private categorias: any = []; // Para guardar las categorias o la coordenada x
  private values: any = []; // Para guardar los valroes de las serie

  //PARA CHARTSJS
  @ViewChild('myChart') private barCanvas: ElementRef;

  nominalComparisonChart: any;
  chartsjsData = {
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: '#47b9ff'
      }
    ],
  };
  private data: any[] = [];


  //PARA D3
  private svg: any;
  private maxY: number = 0;
  private margin3d: any;
  private width3d;
  private height3d;

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

    let seriesName = "";  // Para guardar el nombre de la serie
    let myheader = [];  // Las cabeceras que interesan el fichero csv

    let csvRecordsArray = (<String>this.csvData).split(/\r\n|\n/);

    let headersRow = this.getHeaderArray(csvRecordsArray);

    //Saca el nombre de la serie que vamos a representar
    seriesName = headersRow[27].trim().replace(/['"]+/g, '');

    //Cargamos los datos que se van a representar en las gráficas
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray);
    this.d3getDataRecordsArrayFromCSVFile(csvRecordsArray);

    //TOAST
    const toastData = {
      categories: [],
      series: [
        {
          name: '',
          data: [],
        },
      ],
    };
    toastData.categories = this.categorias;
    toastData.series[0].name = "Porcentaje de infectados que fallecen:";
    toastData.series[0].data = this.values;
    //Creación del gráfico con Toast
    this.createGraphToast(toastData);

    //-------------------------------------------------------------------------------------

    //CHARTSJS
    this.chartsjsData.labels = this.categorias;
    this.chartsjsData.datasets[0].label = seriesName;
    this.chartsjsData.datasets[0].data = this.values;
    //Creación del gráfico con Chartsjs
    this.createGraphChartsjs(this.chartsjsData);

    //-------------------------------------------------------------------------------------

    //D3
    //Creación del gráfico con d3
    this.createSvg();
    this.drawBars(this.d3Data.sort((a, b) => d3.descending(a.death, b.death)));


  }

  private createGraphChartsjs(data: any) {

    Chart.register(BarController, LinearScale, CategoryScale, BarElement, Title);
    this.barCanvas.nativeElement.height = 200;
    this.nominalComparisonChart = new Chart(this.barCanvas.nativeElement, {
      type: "bar",
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Nominal Comparison & Ranking - ChartsJS',
          }
        },
        indexAxis: 'y',
        scales: {
          x: {
            title: {
              display: true,
              text: 'Porcentaje de infectados que fallecen',
            },
            type: 'linear',
            beginAtZero: true,
          },
          y: {
            title: {
              display: true,
              text: 'Paises del mundo',
            },
          },
        },
      }
    });
  }

  createGraphToast(data: any) {

    const options = {
      chart: { title: 'Nominal Comparison & Ranking - Toast', width: window.innerWidth - 50, height: 1500 },
      legend: {
        visible: false
      },
      xAxis: {
        title: 'Porcentaje de infectados que fallecen',
      },
      yAxis: {
        title: 'Países del mundo',
      },
    };

    const el = document.getElementById('grafica');
    const chart = new BarChart({ el, data, options });

  }

  private createSvg(): void {

    this.margin3d = { top: 100, right: 0, bottom: 100, left: 160 }
    this.width3d = window.innerWidth - this.margin3d.left - this.margin3d.right - 90;
    /*1750 - this.margin3d.left - this.margin3d.right*/
    this.height3d = 2000 - this.margin3d.top - this.margin3d.bottom;

    this.svg = d3.select("figure#imagen")
      .append("svg")
      .attr("width", this.width3d + this.margin3d.left + this.margin3d.right)
      .attr("height", this.height3d + this.margin3d.top + this.margin3d.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin3d.left + "," + this.margin3d.top + ")");

  }

  private drawBars(data: any[]): void {

    // Create the X-axis band scale
    const x = d3.scaleLinear()
      .domain([0, this.maxY])
      .range([0, this.width3d]);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height3d + ")")
      .call(d3.axisBottom(x)
        .tickSizeInner(-(this.height3d)))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));

    // Create the Y-axis band scale
    const y = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, this.height3d])
      .padding(0.4);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y)
        .tickSize(0));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", 0) // d => x(d.death)
      .attr("y", function (d) { return y(d.country) })
      .attr("width", function (d) { return x(d.death); })
      .attr("height", y.bandwidth())
      .attr("fill", "#47b9ff");

    //Añadiendo título al gráfico
    this.svg.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("x", (this.width3d / 2))
      .attr("y", 0 - 25)
      .attr("text-anchor", "middle")
      //Añadiendo título al eje Y
      .text("Nominal Comparison & Ranking - d3");


    this.svg.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin3d.left)
      .attr("x", 0 - (this.height3d / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Países del mundo");

    //Añadiendo título al eje X
    this.svg.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("transform", "translate(" + (this.width3d / 2) + " ," + (this.height3d + 50) + ")")
      .style("text-anchor", "middle")
      .text("Porcentaje de infectados que fallecen");
  }

  d3getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

    let country: any;
    let death: any;

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');

      country = currentRecord[0].trim().replace(/['"]+/g, '');

      if (!isNaN(parseFloat(currentRecord[27]))) {
        death = parseFloat(currentRecord[27].trim().replace(/['"]+/g, ''));
        if (death > this.maxY) {
          this.maxY = death;
        }
      } else {
        death = 0;
      }
      this.d3Data.push({ country, death });
    }
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

    let aux;

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');

      this.categorias.push(currentRecord[0].trim().replace(/['"]+/g, ''));

      if (!isNaN(parseFloat(currentRecord[27]))) {
        aux = parseFloat(currentRecord[27].trim().replace(/['"]+/g, ''));
      } else {
        aux = 0;
      }
      this.values.push(aux.toFixed(2));
    }


  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split('\",');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

}
