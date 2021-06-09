import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BarChart, ColumnChart } from '@toast-ui/chart';
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title } from 'chart.js';
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

  //PARA CHARTSJS
  @ViewChild('myChart') private barCanvas: ElementRef;
  nominalComparisonChart: any;
  chartsjsData = {
    labels: [],
    datasets: [],
  };

  //PARA D3
  private svg: any;
  private maxX: number = 0;
  private margin3d: any;
  private width3d: number;
  private height3d: number;

  private d3Data: any[] = [];
  private d3EjeY: any[] = [];

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


    //TOAST
    const toastData = {
      categories: [],
      series: [],
    };

    toastData.categories = seriesName;

    let spain: number[] = [];
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, spain, "Spain")
    toastData.series.push({ name: "Spain", data: spain });

    let belgica: number[] = [];
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, belgica, "Belgium")
    toastData.series.push({ name: "Belgium", data: belgica })

    let slovenia: number[] = [];
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, slovenia, "Slovenia")
    toastData.series.push({ name: "Slovenia", data: slovenia })

    let uk: number[] = [];
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, uk, "United Kingdom")
    toastData.series.push({ name: "United Kingdom", data: uk })

    let czechia: number[] = [];
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, czechia, "Czechia")
    toastData.series.push({ name: "Czechia", data: czechia })

    //Creación del gráfico con Toast
    this.createGraphToast(toastData);

    //-------------------------------------------------------------------------------------

    //CHARTSJS

    this.chartsjsData.labels = seriesName;

    this.chartsjsData.datasets.push({ label: "Spain", data: spain, backgroundColor: 'rgba(59, 131, 189)' });

    this.chartsjsData.datasets.push({ label: "Belgium", data: belgica, backgroundColor: 'rgba(255, 128, 0)' });

    this.chartsjsData.datasets.push({ label: "Slovenia", data: slovenia, backgroundColor: '#ff0000' });

    this.chartsjsData.datasets.push({ label: "United Kingdom", data: uk, backgroundColor: '#00aa7f' });

    this.chartsjsData.datasets.push({ label: "Czechia", data: czechia, backgroundColor: '#8e00d5' });


    //Creación del gráfico con Chartsjs
    this.createGraphChartsjs(this.chartsjsData);

    //-------------------------------------------------------------------------------------

    //D3
    //Creación del gráfico con d3

    // Crea los datos como los necesita d3

    // Saca la cabecera
    for (let j = 1; j <= headersRow.length; j++) {
      this.d3EjeY.push(headersRow[j - 1].trim().replace(/['"]+/g, ''));
    }

    // Prepara los datos
    for (let i = 0; i < this.d3EjeY.length; i++) {
      this.d3Data.push({ "group": this.d3EjeY[i], "Spain": spain[i], "Belgium": belgica[i], "Slovenia": slovenia[i], "United Kingdom": uk[i], "Czechia": czechia[i] });
    }

    // Obtiene el valor máximo para el eje x
    this.maxX = spain.reduce((n, m) => Math.max(n, m));
    if (belgica.reduce((n, m) => Math.max(n, m)) > this.maxX)
      this.maxX = belgica.reduce((n, m) => Math.max(n, m));
    if (slovenia.reduce((n, m) => Math.max(n, m)) > this.maxX)
      this.maxX = slovenia.reduce((n, m) => Math.max(n, m));
    if (uk.reduce((n, m) => Math.max(n, m)) > this.maxX)
      this.maxX = uk.reduce((n, m) => Math.max(n, m));
    if (czechia.reduce((n, m) => Math.max(n, m)) > this.maxX)
      this.maxX = czechia.reduce((n, m) => Math.max(n, m));

    // Redonde para que el eje x sea múltiplo de 5
    this.maxX = (Math.trunc(this.maxX / 5) + 1) * 5;

    // Crea la gráfica
    this.createSvg();
    this.drawBars(this.d3Data);
  }

  private createGraphChartsjs(data: any) {

    Chart.register(BarController, LinearScale, CategoryScale, BarElement, Title, Legend);

    this.nominalComparisonChart = new Chart(this.barCanvas.nativeElement, {
      type: "bar",
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Part To Whole - ChartsJS',
          },
          legend: {
            display: true
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
      chart: { title: 'Part To Whole - Toast', width: window.innerWidth, height: 900 },
      xAxis: {
        title: 'Porcentaje de consumo',
      },
      yAxis: {
        title: 'Tipo de alimentos',
      },
    };
    // options.chart.width = 70 * data.series[0].data.length;

    const el = document.getElementById('grafica');
    const chart = new BarChart({ el, data, options });


  }


  private createSvg(): void {

    this.margin3d = { top: 10, right: 30, bottom: 100, left: 140 }
    this.width3d = window.innerWidth - this.margin3d.left - this.margin3d.right - 45;
    this.height3d = 1000 - this.margin3d.top - this.margin3d.bottom;

    this.svg = d3.select("figure#imagen")
      .append("svg")
      .attr("width", this.width3d + this.margin3d.left + this.margin3d.right)
      .attr("height", this.height3d + this.margin3d.top + this.margin3d.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin3d.left + "," + this.margin3d.top + ")");

  }

  private drawBars(data: any[]): void {

    let subgrupos: string[] = ["Spain", "Belgium", "Slovenia", "United Kingdom", "Czechia"];
    const y = d3.scaleBand()
      .range([0, this.height3d])
      .domain(this.d3EjeY)
      .padding(0.2);

    this.svg.append("g")
      .call(d3.axisLeft(y));

    const x = d3.scaleLinear()
      .domain([0, this.maxX])
      .range([0, this.width3d]);

    this.svg.append("g")
      .attr("transform", "translate(0," + this.height3d + ")")
      .call(d3.axisBottom(x)
        .tickSizeInner(-this.height3d))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "gray"));

    var ySubgroup = d3.scaleBand()
      .domain(subgrupos)
      .range([0, y.bandwidth()])

    var color = d3.scaleOrdinal()
      .domain(subgrupos)
      .range(['#5555ff', '#ffaa00', '#ff0000', '#00aa7f', '#8e00d5'])


    this.svg.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d) { return "translate(0," + y(d.group) + ")"; })
      .selectAll("rect")
      .data(function (d) { return subgrupos.map(function (key) { return { key: key, value: d[key] }; }); })
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", function (d) { return ySubgroup(d.key); })
      .attr("width", function (d) { return x(d.value); })
      .attr("height", ySubgroup.bandwidth)
      .attr("fill", function (d) { return color(d.key); });

    //Añadiendo título al gráfico
    this.svg.append("text")
    .style("font", "sans-serif")
      .attr("x", this.width3d / 2)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Part To Whole - d3");

    //Añadiendo título al eje Y
    this.svg.append("text")
    .style("font", "sans-serif")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.margin3d.left)
      .attr("x", 0 - (this.height3d / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Tipo de alimentos");

    //Añadiendo título al eje X
    this.svg.append("text") 
    .style("font", "sans-serif")
      .attr("transform", "translate(" + (this.width3d / 2) + ", " + (this.height3d + 50) + ")")
      .style("text-anchor", "middle")
      .text("Porcentaje de consumo en");

    // Añade la leyenda
    var legend = this.svg.selectAll(".legend")
      .data(subgrupos)//data set for legends
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", this.width3d - 18)
      .attr("y", 12)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function (d) { return color(d); });

    // draw legend text
    legend.append("text")
    .style("font", "sans-serif")
      .style("font", "14px open-sans")
      .attr("x", this.width3d - 24)
      .attr("y", 18)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) { return d });
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, datos: any[], countryFind: string) {

    var encontrado = false;

    for (let i = 1; i < csvRecordsArray.length && !encontrado; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');
      let country = currentRecord[0].trim().replace(/['"]+/g, '');

      if (country === countryFind) {
        for (let j = 1; j < currentRecord.length - 8; j++) {
          let aux = Number(parseFloat(currentRecord[j]).toFixed(2));
          if (isNaN(parseFloat(currentRecord[j]))) {
            aux = 0
          }
          datos.push(aux);
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
