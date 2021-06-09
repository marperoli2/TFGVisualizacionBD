import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScatterChart } from '@toast-ui/chart';
import { LineController, PointElement, CategoryScale, Chart, LinearScale, ScatterController, LineElement, Title } from 'chart.js';
import * as d3 from 'd3';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-correlation',
  templateUrl: './correlation.component.html',
  styleUrls: ['./correlation.component.css']
})
export class CorrelationComponent implements OnInit {

  public csvData: string;

  ngOnInit(): void {
  }

  //PARA TOAST
  @ViewChild('csvReader') csvReader: any;
  private categorias: any = []; // Para guardar las categorias o la coordenada x
  private values: any = []; // Para guardar los valroes de las serie


  //PARA CHARTSJS
  @ViewChild('myChart') private barCanvas: ElementRef;
  correlationChart: any;
  chartsjsData = {
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: '#47b9ff',
      },
      
      
    ],
  };

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

  private allGraphs() {

    let text = [];

    let seriesName = "";  // Para guardar el nombre de la serie
    let myheader = [];  // Las cabeceras que interesan el fichero csv

    let csvRecordsArray = (<String>this.csvData).split(/\r\n|\n/);

    let headersRow = this.getHeaderArray(csvRecordsArray);

    // Saca las cabeceras que interesan del fichero csv
    myheader[0] = headersRow[0].trim().replace(/['"]+/g, '');
    myheader[1] = headersRow[29].trim().replace(/['"]+/g, '');
    seriesName = headersRow[29].trim().replace(/['"]+/g, '');

    this.getDataRecordsArrayFromCSVFile(csvRecordsArray);

    //TOAST
    const toastData = {
      series: [
        {
          name: 'Correlación',
          data: []
        }
      ]
    };
    toastData.series[0].data = this.values;
    //Creación del gráfico con Toast
    this.createGraphToast(toastData);

    //-------------------------------------------------------------------------------------

    //CHARTSJS
    this.chartsjsData.datasets[0].data = this.values;
    //Creación del gráfico con Chartsjs
    this.createGraphChartsjs(this.chartsjsData);

    //-------------------------------------------------------------------------------------

    //D3
    var margin = { top: 30, right: 30, bottom: 50, left: 60 };
    var width = window.innerWidth - 2 * margin.left - 2 * margin.right;
    var height = 600 - margin.top - margin.bottom;


    //Creación del gráfico con d3

    var svgD3 = d3.select("#myD3Chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    let data3d = [];
    let valorEjeX = [];
    let valorEjeY = [];

    for (let i = 0; i < this.values.length; i++) {
      data3d.push(this.values[i]);
      valorEjeX.push(this.values[i].x)
      valorEjeY.push(this.values[i].y)
    }

    // Add X axis

    let maxX = (Math.trunc(d3.max(valorEjeX) / 10) + 1) * 10;

    const x = d3.scaleLinear()
      .domain([0, maxX])
      .range([0, width]);

    svgD3.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(2)
        .tickValues([maxX / 2, maxX])
        .tickFormat(d3.format("d"))
        .tickSizeInner(-height))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));

    let maxY = (Math.trunc((d3.max(valorEjeY) * 1000) / 100) + 1) / 10;
    const y = d3.scaleLinear()
      .domain([0, maxY])
      .range([height, 0]);
      
    svgD3.append("g")
      .call(d3.axisLeft(y)
        .ticks(2)
        .tickSizeInner(-width))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));

    const dots = svgD3.append('g');


    dots.selectAll("dot")
      .data(data3d)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 3)
      .style("fill", "#47b9ff");

    //Añadiendo título al gráfico
    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
      .attr("x", (width / 2))
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Correlation - d3");

    //Añadiendo título al eje Y
    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
      .attr("transform", "rotate(-90)")
      .style("font-size", "12px")
      .attr("y", -margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Porcentaje de muertes por covid en personas infectadas");

    //Añadiendo título al eje X
    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top) + ")")
      .style("text-anchor", "middle")
      .text("Porcentaje de población con obesidad");

    //Añadiendo texto izq superior
    svgD3.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("transform", "translate(" + margin.left / 2 + " ," + margin.top + ")")
      .style("text-anchor", "left")
      .text("Alto % Fallecimiento");

    svgD3.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .style("font-size", "12px")
      .attr("transform", "translate(" + margin.left / 2 + " ," + 1.5 * margin.top + ")")
      .style("text-anchor", "left")
      .text("Bajo % Obesidad");

    //Añadiendo texto izq inferior
    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "12px")
      .attr("transform", "translate(" + margin.left / 2 + " ," + (height / 2 + margin.top) + ")")
      .style("text-anchor", "left")
      .text("Bajo % Fallecimiento");

    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "12px")
      .attr("transform", "translate(" + margin.left / 2 + " ," + (height / 2 + 1.5 * margin.top) + ")")
      .style("text-anchor", "left")
      .text("Bajo % Obesidad");

    //Añadiendo texto derecha superior
    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "12px")
      .attr("transform", "translate(" + (width - 3 * margin.left) + " ," + margin.top + ")")
      .style("text-anchor", "left")
      .text("Alto % Fallecimiento");

    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "12px")
      .attr("transform", "translate(" + (width - 3 * margin.left) + " ," + 1.5 * margin.top + ")")
      .style("text-anchor", "left")
      .text("Alto % Obesidad");

    //Añadiendo texto izq inferior
    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "12px")
      .attr("transform", "translate(" + (width - 3 * margin.left) + " ," + (height / 2 + margin.top) + ")")
      .style("text-anchor", "left")
      .text("Bajo % Fallecimiento");

    svgD3.append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .style("font-size", "12px")
      .attr("transform", "translate(" + (width - 3 * margin.left) + " ," + (height / 2 + 1.5 * margin.top) + ")")
      .style("text-anchor", "left")
      .text("Alto % Obesidad");

    //-------------------------------------------------------------------------------------


  }

  private createGraphChartsjs(data: any) {

    Chart.register(LineController, LineElement, ScatterController, PointElement, CategoryScale, LinearScale, Title);
    this.correlationChart = new Chart(this.barCanvas.nativeElement, {
      type: "scatter",
      data: data,
      options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
        plugins: {
          title: {
            display: true,
            text: 'Correlation - ChartsJS',
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Porcentaje de muertes por covid en personas infectadas',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Porcentaje de población con obesidad',
            },
          }
        }
      }
    }
    );
  
  }

  createGraphToast(data: any) {

    const options = {
      chart: { title: 'Correlation - Toast', width: window.innerWidth-50, height: 500 },
      legend:{
        visible:false
      },
      xAxis: {
        title: 'Porcentaje de población con obesidad',
        scale:{
          min:0,
          max:50
        }

      },
      yAxis: { title: 'Porcentaje de muertes por covid en personas infectadas' },
      scale:{
        min:0,
        max:0.20
      }
    };

    const el = document.getElementById('chart-area');
    const chart = new ScatterChart({ el, data, options })

  }


  getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');
      let x = parseFloat(currentRecord[24]);//*parseFloat(currentRecord[30]);
      let y = parseFloat(currentRecord[27]);//*parseFloat(currentRecord[30]);
      if (isNaN(x)) {
        x = 0;
      }
      if (isNaN(y)) {
        y = 0;
      }
      this.values.push({ x, y });

    }

  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

}
