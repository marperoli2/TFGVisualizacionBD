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
  selector: 'app-deviation',
  templateUrl: './deviation.component.html',
  styleUrls: ['./deviation.component.css']
})
export class DeviationComponent implements OnInit {

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
    } //para quitar dobles comillas con las que sale del csv7

    this.getDataRecordsArrayFromCSVFile(csvRecordsArray);
    this.d3getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow); //Hace falta el nombre de la cabecera para las series ({Cabecera:Value})

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
    toastData.categories = seriesName;
    toastData.series[0].name = "Porcenataje de diferencia Bélgica - España: ";
    toastData.series[0].data = this.values;
    //Creación del gráfico con Toast
    this.createGraphToast(toastData);

    //-------------------------------------------------------------------------------------

    //CHARTSJS
    this.chartsjsData.labels = seriesName;
    this.chartsjsData.datasets[0].label = "%";
    this.chartsjsData.datasets[0].data = this.values;
    //Creación del gráfico con Chartsjs
    this.createGraphChartsjs(this.chartsjsData);

    //-------------------------------------------------------------------------------------

    //D3

    //Creación del gráfico con d3
    this.draw3d();

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
            text: 'Deviation - ChartsJS',
          }
        },
        indexAxis: 'y',
        scales: {
          x: {
            type: 'linear',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Tipo de alimentos',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Porcentaje de diferencia Bélgica - España',
            },
          }
        }
      }
    });


  }

  createGraphToast(data: any) {

    const options = {
      chart: { title: 'Deviation - Toast', width: window.innerWidth -50, height: 500 },
      legend: {
        visible: false
      },
      xAxis: {
        title: 'Porcentaje de diferencia Bélgica - España',
      },
      yAxis: {
        title: 'Tipo de alimentos',
      },
     
    };

    const el = document.getElementById('grafica');
    const chart = new BarChart({ el, data, options });


  }

  private draw3d(): void {


    var margin = { top: 30, right: 0, bottom: 50, left: 120 };
    var width = window.innerWidth  -margin.left -margin.right ;
    var height = 600 - margin.top - margin.bottom;

    let data: number[] = [];
    for (let k = 0; k < this.d3Data.length; k++) {
      data.push(Number(parseFloat(this.d3Data[k].value).toFixed(2)));
    }

    this.svg = d3.select("figure#imagen")
      .append("svg")
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const y = d3.scaleBand()
      .range([0, height])
      .domain(this.d3Data.map(d => d.foodSupply))
      .align(0.5)
      .padding(0.4);

    this.svg.append("g")
      .call(d3.axisLeft(y)
      .tickSize(0));

   
    var x = d3.scaleLinear()
      .domain([Math.trunc(d3.min(data))-0.5 ,-Math.trunc(d3.min(data))+0.5 ])
      .range([0, width]);

    this.svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickSizeInner(-height))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));

    // Create and fill the bars
      this.svg.selectAll("bars")
        .data(this.d3Data)
        .enter()
        .append("rect")
        .attr("x", function (d) { if (d.value < 0) {return x(d.value);} else return x(0);})
        .attr("y", function (d) { return y(d.foodSupply); })
        .attr("height", y.bandwidth)
        .attr("width", function (d) { if (d.value < 0) {return x(0)-x(d.value);} else return x(d.value)- x(0);})
        .style("fill", "#47b9ff");

    //Añadiendo título al gráfico
    this.svg.append("text")
      .attr("x", width/2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font", "sans-serif")
      .text("Deviation - d3");

    //Añadiendo título al eje Y
    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font", "sans-serif")
      .text("Tipo de alimentos");

    //Añadiendo título al eje X
    this.svg.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top * 1.5) + ")")
      .style("text-anchor", "middle")
      .style("font", "sans-serif")
      .text("Porcentaje de diferencia Bélgica - España");

  }

  d3getDataRecordsArrayFromCSVFile(csvRecordsArray: any, header: any[]) {

    let country: any;
    let foodSupply: any;
    let value: any;
    var encontradoBelgium = false;
    var encontradoSpain = false;
    var belgiumValues = [];
    var spainValues = [];

    for (let i = 1; i < csvRecordsArray.length && !(encontradoBelgium && encontradoSpain); i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');

      if (currentRecord[0] === "\"Belgium\"") {
        for (let j = 1; j < currentRecord.length - 8; j++) {
          let aux = Number(parseFloat(currentRecord[j]).toFixed(2));
          if (isNaN(parseFloat(currentRecord[j]))) {
            aux = 0
          }
          belgiumValues.push(aux);
        }
        encontradoBelgium = true; //Para que no siga buscando cuando encuentre España
      }
      if (currentRecord[0] === "\"Spain\"") {
        for (let j = 1; j < currentRecord.length - 8; j++) {
          let aux = Number(parseFloat(currentRecord[j]).toFixed(2));
          if (isNaN(parseFloat(currentRecord[j]))) {
            aux = 0
          }
          spainValues.push(aux);
        }
        encontradoSpain = true; //Para que no siga buscando cuando encuentre España
      }
    }
    for (let k = 0; k < belgiumValues.length; k++) {
      foodSupply = header[k].trim().replace(/['"]+/g, '');
      value = (belgiumValues[k] - spainValues[k]).toFixed(2)
      this.d3Data.push({ foodSupply, value })
    }

  }


  getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

    var encontradoBelgium = false;
    var encontradoSpain = false;
    var belgiumValues = [];
    var spainValues = [];

    for (let i = 1; i < csvRecordsArray.length && !(encontradoBelgium && encontradoSpain); i++) {
      let currentRecordj = (<string>csvRecordsArray[i]).split(',');
      if (currentRecordj[0] === "\"Belgium\"") {
        for (let j = 1; j < currentRecordj.length - 8; j++) {
          let aux = Number(parseFloat(currentRecordj[j]).toFixed(2));
          if (isNaN(parseFloat(currentRecordj[j]))) {
            aux = 0
          }
          belgiumValues.push(aux);
        }
        encontradoBelgium = true; //Para que no siga buscando cuando encuentre España
      }
      if (currentRecordj[0] === "\"Spain\"") {
        for (let j = 1; j < currentRecordj.length - 8; j++) {
          let aux = Number(parseFloat(currentRecordj[j]).toFixed(2));
          if (isNaN(parseFloat(currentRecordj[j]))) {
            aux = 0
          }
          spainValues.push(aux);
        }
        encontradoSpain = true; //Para que no siga buscando cuando encuentre España
      }
    }
    for (let k = 0; k < belgiumValues.length; k++) {
      this.values.push((belgiumValues[k] - spainValues[k]).toFixed(2))
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
