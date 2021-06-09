import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LineChart } from '@toast-ui/chart';
import { Chart, LineController, LinearScale, CategoryScale, LineElement, PointElement, Title, Legend } from 'chart.js';
import * as d3 from 'd3';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { max } from 'd3';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-time-series',
  templateUrl: './time-series.component.html',
  styleUrls: ['./time-series.component.css']
})
export class TimeSeriesComponent implements OnInit {

  public d3DatacsvData: string;

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
  //public d3Data: { year: String, Amount: number }[] = [];
  private d3Data: any[] = [];
  private d3EjeY: any[] = [];

  private margin3d: any;
  private width3d: number;
  private height3d: number;
  private maxX: number;
  private minX: number;
  private maxY: number;


  constructor(private http: HttpClient) {
    this.http.get('assets/internet.csv', { responseType: 'text' })
      .subscribe(
        data => {
          this.d3DatacsvData = data;
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

    let csvRecordsArray = (<String>this.d3DatacsvData).split(/\r\n|\n/);

    let headersRow = this.getHeaderArray(csvRecordsArray);

    for (let i = 2; i < headersRow.length; i++) {
      seriesName.push(headersRow[i].trim().replace(/['"]+/g, ''));
    } //para quitar dobles comillas con las que sale del csv

    //TOAST
    const toastData = {
      categories: [],
      series: [],
    };
    toastData.categories = seriesName;

    // Saca los datos de los paises
    let spain: any[] = [];
    let portugal: any[] = [];
    let italia: any[] = [];
    let francia: any[] = [];
    let mundo: any[] = [];
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, spain, "España");
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, portugal, "Portugal");
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, italia, "Italia");
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, francia, "Francia");
    this.getDataRecordsArrayFromCSVFile(csvRecordsArray, mundo, "Mundo");

    //this.getDataRecordsArrayFromCSVFile(csvRecordsArray);
    toastData.series.push({ name: "España", data: spain });
    toastData.series.push({ name: "Portugal", data: portugal });
    toastData.series.push({ name: "Italia", data: italia });
    toastData.series.push({ name: "Francia", data: francia });
    toastData.series.push({ name: "Mundo", data: mundo });



    //Creación del gráfico con Toast
    this.createGraphToast(toastData);

    //-------------------------------------------------------------------------------------
    //CHARTSJS
    this.chartsjsData.labels = seriesName;
    this.chartsjsData.datasets.push({ label: "España", data: spain, borderColor: 'rgba(59, 131, 189)', backgroundColor: 'rgba(59, 131, 189)' });
    this.chartsjsData.datasets.push({ label: "Portugal", data: portugal, borderColor: 'rgba(255, 128, 0)', backgroundColor: 'rgba(255, 128, 0)' });
    this.chartsjsData.datasets.push({ label: "Italia", data: italia, borderColor: '#ff0000', backgroundColor: '#ff0000' });
    this.chartsjsData.datasets.push({ label: "Francia", data: francia, borderColor: '#00aa7f', backgroundColor: '#00aa7f' });
    this.chartsjsData.datasets.push({ label: "Mundo", data: mundo, borderColor: '#8e00d5', backgroundColor: '#8e00d5' });


    //Creación del gráfico con Chartsjs
    this.createGraphChartsjs(this.chartsjsData);

    //-------------------------------------------------------------------------------------

    //D3
    //Creación del gráfico con d3

    // Calcula los valores máximo y mínimos de la serie
    this.maxX = seriesName.reduce((n, m) => Math.max(n, m));
    this.minX = seriesName.reduce((n, m) => Math.min(n, m));

    this.maxY = 0;
    // Preprara los datos

    let spain3d: any[] = [];
    for (let i = 0; i < spain.length; i++) {
      if (this.maxY < spain[i]) this.maxY = spain[i];
      spain3d.push({ "year": seriesName[i], "Amount": spain[i] })
    }
    this.d3Data.push({ "key": "España", values: spain3d })

    let portugal3d: any[] = [];
    for (let i = 0; i < portugal.length; i++) {
      if (this.maxY < portugal[i]) this.maxY = portugal[i];
      portugal3d.push({ "year": seriesName[i], "Amount": portugal[i] })
    }
    this.d3Data.push({ "key": "Portugal", values: portugal3d })

    let italia3d: any[] = [];
    for (let i = 0; i < italia.length; i++) {
      if (this.maxY < italia[i]) this.maxY = italia[i];
      italia3d.push({ "year": seriesName[i], "Amount": italia[i] })
    }
    this.d3Data.push({ "key": "Italia", values: italia3d })


    let francia3d: any[] = [];
    for (let i = 0; i < francia.length; i++) {
      if (this.maxY < francia[i]) this.maxY = francia[i];
      francia3d.push({ "year": seriesName[i], "Amount": francia[i] })
    }
    this.d3Data.push({ "key": "Francia", values: francia3d })


    let mundo3d: any[] = [];
    for (let i = 0; i < mundo.length; i++) {
      if (this.maxY < mundo[i]) this.maxY = mundo[i];
      mundo3d.push({ "year": seriesName[i], "Amount": mundo[i] })
    }
    this.d3Data.push({ "key": "Mundo", values: mundo3d })

    this.createSvg();
    this.drawLine();

  }

  private createGraphChartsjs(data: any) {

    Chart.register(LineController, LinearScale, CategoryScale, LineElement, PointElement, Title, Legend);
    this.nominalComparisonChart = new Chart(this.barCanvas.nativeElement, {
      type: "line",
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Time Series - ChartsJS',
          },
          legend: {
            display: true,
          }
        },
        scales: {
          y: {
            type: 'linear',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Porcentaje de personas que usa internet',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Año',
            },
          }
        }
      }
    });


  }

  createGraphToast(data: any) {

    const options = {
      chart: { title: 'Time Series - Toast', width: window.innerWidth - 50, height: 700 },
      xAxis: {
        title: 'Año',
      },
      yAxis: {
        title: 'Porcentaje de personas que usas internet',
      },
    };

    const el = document.getElementById('grafica');
    const chart = new LineChart({ el, data, options });
  }

  private createSvg(): void {

    this.margin3d = { top: 25, right: 50, bottom: 75, left: 50 }
    this.width3d = window.innerWidth - this.margin3d.left - this.margin3d.right-50;
    this.height3d = 700 - this.margin3d.top - this.margin3d.bottom;

    this.svg = d3.select("figure#imagen")
      .append("svg")
      .attr("width", this.width3d + this.margin3d.left + this.margin3d.right)
      .attr("height", this.height3d + this.margin3d.top + this.margin3d.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin3d.left + "," + this.margin3d.top + ")");

  }


  private addPoint(x: any, y: any) {
    let colores: any[] = ['rgba(59, 131, 189)', 'rgba(255, 128, 0)', '#ff0000', '#8e00d5', '#00aa7f'];
    let puntos: any[] = [];
    for (let i = 0; i < this.d3Data.length; i++) {
      for (let j = 0; j < (this.d3Data[i].values).length; j++) {
        puntos.push({ "year": this.d3Data[i].values[j].year, "Amount": this.d3Data[i].values[j].Amount, "colorPunto": colores[i] });
      }
    }

    this.svg.selectAll(".circle")
      .data(puntos)
      .enter().append("circle")
      .attr("class", "circle")
      .attr("r", 4)
      .attr("cx", function (d) {
        return x(d.year);
      })
      .attr("cy", function (d) {
        return y(d.Amount);
      })
      .style("fill", function (d) {
        return d.colorPunto;
      });

  }

  private drawLine(): void {

    // Para dibujar una linea por grupo

    var x = d3.scaleLinear()
      .domain([this.minX, this.maxX])
      .range([0, this.width3d]);


    this.svg.append("g")
      .attr("transform", "translate(0," + this.height3d + ")")
      .call(d3.axisBottom(x).ticks(this.maxX - this.minX)
        .tickSizeInner(-this.height3d))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "gray"))
      .selectAll("text")
      .style("font", "sans-serif")
      .attr("transform", "translate(-10,10)rotate(-45)")
      .style("text-anchor", "end");



    // Add Y axis
    this.maxY = (Math.trunc(this.maxY / 10) + 1) * 10;
    var y = d3.scaleLinear()
      .domain([0, this.maxY])
      .range([this.height3d, 0]);

    this.svg.append("g")
      .call(d3.axisLeft(y)
        .tickSizeInner(-this.width3d))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "gray"));

    var res = this.d3Data.map(function (d) { return d.key }) // list of group names

    var color = d3.scaleOrdinal()
      .domain(res)
      .range(['rgba(59, 131, 189)', 'rgba(255, 128, 0)', '#ff0000', '#8e00d5', '#00aa7f']);

    this.svg.selectAll(".line")
      .data(this.d3Data)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", function (d) { return color(d.key) })
      .attr("stroke-width", 3)
      .attr("d", function (d) {
        return d3.line()
          .x(function (d: any) { return x(d.year); })
          .y(function (d: any) { return y(+d.Amount); })
          (d.values)

      });

    // Añadiendo los puntos
    this.addPoint(x, y);



    //Añaiendo título al gráfico
    this.svg.append("text")
      .attr("x", this.width3d / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font", "sans-serif")
      .text("Time Series - d3");

    //Añadiendo título al eje Y
    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.margin3d.left)
      .attr("x", (-this.height3d / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font", "sans-serif")
      .text("Porcentaje de personas que usan internet");

    //Añadiendo título al eje X
    this.svg.append("text")
    .style("font", "sans-serif")
    .attr("transform", "translate(" + this.width3d / 2 + "," + (this.height3d + this.margin3d.top + this.margin3d.bottom / 2) + ")")
      .style("text-anchor", "middle")
      .text("Año");

    let subgrupos: string[] = ["España", "Portugal", "Italia", "Francia", "Mundo"];
    // Añade la leyenda
    var legend = this.svg.selectAll(".legend")
      .data(subgrupos)//data set for legends
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", this.margin3d.left + 64)
      .attr("y", 12)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function (d) { return color(d); });

    // draw legend text
    legend.append("text")
      .style("font", "14px sans-serif")
      .attr("x", this.margin3d.left * 2)
      .attr("y", 18)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) { return d });


  }


  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, datos: any[], countryFind: string) {

    var encontrado = false;

    for (let i = 0; i < csvRecordsArray.length && !encontrado; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');
      let country = currentRecord[0].trim().replace(/['"]+/g, '');

      if (country === countryFind) {
        for (let j = 4; j < currentRecord.length - 4; j++) {
          let aux = Number(parseFloat(currentRecord[j].trim().replace(/[""]+/g, '')).toFixed(2));
          if (isNaN(parseFloat(currentRecord[j].trim().replace(/[""]+/g, '')))) {
            aux = 0
          }
          datos.push(aux);
        }
        encontrado = true; //Para que no siga buscando cuando encuentre España
      }
    }

  }



  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split('\",');
    let headerArray = [];
    for (let j = 1; j < headers.length - 4; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  fileReset() {
    this.csvReader.nativeElement.value = "";
    this.categorias = [];
    this.values = [];
  }


}
