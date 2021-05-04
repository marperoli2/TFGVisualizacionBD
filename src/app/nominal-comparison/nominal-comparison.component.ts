import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColumnChart } from '@toast-ui/chart';
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
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
      },
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
        toastData.series[0].name = seriesName;
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
        this.width = 3000 ;
        this.height = 400 ;
        //Creación del gráfico con d3
        this.createSvg();
        this.drawBars(this.d3Data);

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

    Chart.register(BarController, LinearScale, CategoryScale, BarElement);
    this.nominalComparisonChart = new Chart(this.barCanvas.nativeElement, {
      type: "bar",
      data: data,
      /*data: {
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
      },*/
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

  createGraphToast(data: any) {

    const options = {
      chart: { title: '', width: 15000, height: 500 },
    };

    options.chart.title = "Toast nominal comparison";
    options.chart.width = 70 * data.series[0].data.length;

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
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, this.maxY])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

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
      this.values.push(aux);
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
