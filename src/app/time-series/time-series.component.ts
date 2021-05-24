import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LineChart } from '@toast-ui/chart';
import { Chart, LineController, LinearScale, CategoryScale, LineElement, PointElement, Title } from 'chart.js';
import * as d3 from 'd3';

@Component({
  selector: 'app-time-series',
  templateUrl: './time-series.component.html',
  styleUrls: ['./time-series.component.css']
})
export class TimeSeriesComponent implements OnInit {

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
  public d3Data: { year: String, Amount: number }[] = [];

  public svgInner;
  public yScale;
  public xScale;
  public xAxis;
  public yAxis;
  public lineGroup;

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

        for (let i = 2; i < headersRow.length; i++) {
          seriesName.push(headersRow[i].trim().replace(/['"]+/g, ''));
        } //para quitar dobles comillas con las que sale del csv

        console.log(headersRow)
        console.log(seriesName)

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
        toastData.series[0].name = "Porcentaje de población que usan internet: ";
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
        this.margin = 50;
        this.width = 1300;
        this.height = 600;
        //Creación del gráfico con d3
        this.createSvg(seriesName);
        console.log(this.values);

        console.log("antes")
        this.drawLine();
        console.log(this.d3Data)

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

    Chart.register(LineController, LinearScale, CategoryScale, LineElement, PointElement, Title);
    this.nominalComparisonChart = new Chart(this.barCanvas.nativeElement, {
      type: "line",
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Time Series - ChartsJS',
          }
        },
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
      chart: { title: 'Time Series - Toast', width: 1000, height: 500 },
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

  private createSvg(SeriesName: string[]): void {

    this.svg = d3
      .select("figure#imagen")
      .append('svg')
      .attr('height', this.height)
      .attr('transform', "translate( 0 , " + this.margin / 2 + ")")

    this.svgInner = this.svg
      .append('g')
      .style('transform', 'translate(0, ' + this.margin / 2 + 'px)');

    this.yScale = d3
      .scaleLinear()
      .domain([d3.max(this.d3Data, d => d.Amount) + 1, d3.min(this.d3Data, d => d.Amount)])
      .range([0, this.height - 2 * this.margin]);

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', 'translate(' + this.margin + 'px,  0)');


    this.xScale = d3
      .scaleBand()
      .domain(SeriesName)
      .range([0, this.width - 2 * this.margin]);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style('transform', 'translate(0, ' + (this.height - 2 * this.margin) + 'px)');

    this.lineGroup = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'line')
      .style('fill', 'none')
      .style('stroke', 'blue')
      .style('stroke-width', '2px')

  }


  private drawLine(): void {
    this.svg.attr('width', this.width);

    this.xScale.range([this.margin, this.width - 2 * this.margin]);


    const xAxis = d3
      .axisBottom(this.xScale)
      .tickSize(-this.height);


    this.xAxis.call(xAxis)
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"))
      .selectAll("text")
      .attr("transform", "translate(-10,10)rotate(-45)")
      .style("text-anchor", "end")
      ;

    const yAxis = d3
      .axisLeft(this.yScale)
      .ticks(10)
      .tickSize(-this.width);

    this.yAxis.call(yAxis)
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));

    const line = d3
      .line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveMonotoneX);

    const points: [number, number][] = this.d3Data.map(d => [
      this.xScale(d.year),
      this.yScale(d.Amount),
    ]);

    this.lineGroup.attr('d', line(points));

    //Añadiendo título al gráfico
    this.svgInner.append("text")
      .attr("x", this.width / 2)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Time Series - d3");

    //Añadiendo título al eje Y
    this.svgInner.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", (-this.height / 2 + this.margin))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Porcentaje de personas que usan internet");

    //Añadiendo título al eje X
    this.svgInner.append("text")
      .attr("transform", "translate(" + this.width / 2 + "," + (this.height - this.margin) + ")")
      .style("text-anchor", "middle")
      .text("Año");

  }


  d3getDataRecordsArrayFromCSVFile(csvRecordsArray: any, header: any[]) {

    var encontrado = false;
    let foodSupply: any;
    let value: any;

    let cabecera = (<string>csvRecordsArray[0]).split(',');


    for (let i = 1; i < csvRecordsArray.length && !encontrado; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');
      if (currentRecord[0] === "\"Mundo") {

        for (let j = 4; j < currentRecord.length - 4; j++) {
          let Amount = Number(parseFloat(currentRecord[j].trim().replace(/[""]+/g, '')).toFixed(2));
          if (isNaN(parseFloat(currentRecord[j].trim().replace(/[""]+/g, '')))) {
            Amount = 0
          }
          this.values.push(Amount);
          let year = cabecera[j].trim().replace(/[""]+/g, '');
          this.d3Data.push({ year, Amount })
        }
        encontrado = true; //Para que no siga buscando cuando encuentre Mundo
      }
    }
    console.log(this.d3Data);

  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

    var encontrado = false;

    for (let i = 0; i < csvRecordsArray.length && !encontrado; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');
      if (currentRecord[0] === "\"Mundo") {
        console.log('entra aqui')
        for (let j = 4; j < currentRecord.length - 4; j++) {
          console.log("despues" + currentRecord[j].trim().replace(/[""]+/g, ''))
          let aux = Number(parseFloat(currentRecord[j].trim().replace(/[""]+/g, '')).toFixed(2));
          if (isNaN(parseFloat(currentRecord[j].trim().replace(/[""]+/g, '')))) {
            aux = 0
          }
          this.values.push(aux);
        }
        encontrado = true; //Para que no siga buscando cuando encuentre Mundo
      }
    }

    console.log(this.values)
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
