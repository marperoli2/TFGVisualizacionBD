import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColumnChart } from '@toast-ui/chart';
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import * as d3 from 'd3';

@Component({
  selector: 'app-deviation',
  templateUrl: './deviation.component.html',
  styleUrls: ['./deviation.component.css']
})
export class DeviationComponent implements OnInit {

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

  ngOnInit(): void {
  }

  uploadListener($event: any): void {

    let text = [];

    let seriesName = [];  // Para guardar el nombre de la serie

    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {

      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {

        let csvData = reader.result;
        let csvRecordsArray = (<String>csvData).split(/\r\n|\n/);

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
        toastData.series[0].name = "%";
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
        this.margin = 120;
        this.width = 400;
        this.height = 1500;
        //Creación del gráfico con d3
        this.createSvg();
        this.drawBars(this.d3Data.sort((a, b) => d3.ascending(a.value, b.value)));

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

    options.chart.title = "Toast part to whole";
    options.chart.width = 70 * data.series[0].data.length;

    const el = document.getElementById('grafica');
    const chart = new ColumnChart({ el, data, options });


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
    for (let k = 0; k<belgiumValues.length; k++){
      this.values.push((belgiumValues[k]-spainValues[k]).toFixed(2))
    }
    console.log(belgiumValues);
    console.log(spainValues);
    console.log(this.values)
  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split('\",');
    let headerArray = [];
    for (let j = 1; j < headers.length - 8; j++) {
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
