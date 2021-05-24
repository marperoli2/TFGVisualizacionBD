import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColumnChart } from '@toast-ui/chart';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Title } from 'chart.js';
import * as d3 from 'd3';

@Component({
  selector: 'app-nominal-comparison',
  templateUrl: './nominal-comparison.component.html',
  styleUrls: ['./nominal-comparison.component.css']
})
export class NominalComparisonComponent implements OnInit {

  constructor() { }

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
        backgroundColor: 'rgba(0, 143, 57)'
      }
    ],
  };
  private data: any[] = [];


  //PARA D3
  private svg: any;
  private margin: number;
  private width: number;
  private height: number;
  private maxY: number = 0;
  // El elemento que elige el fichero
  @ViewChild('csvReader') csvReaderd3: any;
  private d3Data: any[] = [];


  ngOnInit(): void {

  }

  uploadListener($event: any): void {

    let text = [];

    let seriesName = "";  // Para guardar el nombre de la serie
    let myheader = [];  // Las cabeceras que interesan el fichero csv

    let files = $event.srcElement.files;


    if (this.isValidCSVFile(files[0])) {

      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {

        let csvData = reader.result;
        let csvRecordsArray = (<String>csvData).split(/\r\n|\n/);

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
        this.margin = 120;
        this.width = 3000;
        this.height = 400;
        //Creación del gráfico con d3
        this.createSvg();
        this.drawBars(this.d3Data.sort((a, b) => d3.descending(a.death, b.death)));

        reader.onerror = function () {
          console.log('error is occured while reading file!');
        };
      };

    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }
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
            text: 'Nominal Comparison - ChartsJS',
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Porcentaje de infectados que fallecen',
            },
            type: 'linear',
            beginAtZero: true,
          },
          x: {
            title: {
              display: true,
              text: 'Paises del mundo'
            }
          }
        }
      }
    });
  }

  createGraphToast(data: any) {

    const options = {
      chart: { title: '', width: 500, height: 500 },
      xAxis: {
        title: 'Países del mundo',
      },
      yAxis: {
        title: 'Porcentaje de infectados que fallecen',
      },
    };

    options.chart.title = "Nominal Comparison - Toast";
    options.chart.width = 65 * data.series[0].data.length;

    const el = document.getElementById('grafica');
    const chart = new ColumnChart({ el, data, options });

  }

  private createSvg(): void {
    this.svg = d3.select("figure#imagen")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");

  }

  private drawBars(data: any[]): void {

    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.country))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x)
        .tickSize(-this.height))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, this.maxY])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .ticks(10)
        .tickSize(-this.width))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.country))
      .attr("y", d => y(d.death))
      .attr("width", x.bandwidth())
      .attr("height", (d) => this.height - y(d.death))
      .attr("fill", "#d04a35");




    /* // gridlines in x axis function
     function make_x_gridlines() {
       return d3.axisBottom(x)
         .ticks(20)
     }
 
     // gridlines in y axis function
     function make_y_gridlines() {
       return d3.axisLeft(y)
         .ticks(20)
     }
 
     // add the X gridlines
     this.svg.append("g")
       .attr("class", "grid")
       .attr("transform", "translate(0," + this.height + ")")
       .call(make_x_gridlines()
         .tickSize(-this.height)
       )
 
     // add the Y gridlines
     this.svg.append("g")
       .attr("class", "grid")
       .call(make_y_gridlines()
         .tickSize(-this.width)
       )*/





    //Añadiendo título al gráfico
    this.svg.append("text")
      .attr("x", (this.width / 20))
      .attr("y", 0 - (this.margin / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Nominal Comparison - d3");

    //Añadiendo título al eje Y
    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin / 2)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Porcentaje de infectados que fallecen");

    //Añadiendo título al eje X
    this.svg.append("text")
      .attr("transform", "translate(" + (this.width / 2) + " ," + (this.height + this.margin) + ")")
      .style("text-anchor", "middle")
      .text("Países del mundo");

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

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split('\",');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
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
