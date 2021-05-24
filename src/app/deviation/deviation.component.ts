import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColumnChart } from '@toast-ui/chart';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Title } from 'chart.js';
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
            text: 'Deviation - ChartsJS',
          }
        },
        scales: {
          y: {
            type: 'linear',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Porcentaje de diferencia Bélgica - España',
            },
          },
          x:{
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
        title: 'Tipo de alimentos',
      },
      yAxis: {
        title: 'Porcentaje de diferencia Bélgica - España',
      },
    };

    options.chart.title = "Deviation - Toast";
    options.chart.width = 70 * data.series[0].data.length;

    const el = document.getElementById('grafica');
    const chart = new ColumnChart({ el, data, options });


  }

  private draw3d(): void {

    let margin: number = 50;
    let width: number = 1200;
    let height: number = 400;

    let data: number[] = [];
    for (let k = 0; k < this.d3Data.length; k++) {
      data.push(Number(parseFloat(this.d3Data[k].value).toFixed(2)));
    }

    this.svg = d3.select("figure#imagen")
      .append("svg")
      .attr("width", width + (margin * 2))
      .attr("height", height + (margin * 3.5))
      .append("g")
      .attr("transform", "translate(" + margin + "," + margin + ")");

    const x = d3.scaleBand()
      .range([0, width])
      .domain(this.d3Data.map(d => d.foodSupply));

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickSize(-height))
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale

    var y = d3.scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .range([height, 0]);

    // Añado una línea central
    this.svg.append("line")
      .attr("x1", -6)
      .attr("y1", y(0))//so that the line passes through the y 0
      .attr("x2", width)
      .attr("y2", y(0))//so that the line passes through the y 0
      .style("stroke", "black");

    const yAxisScale = d3.scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .range([height, 0]);


    var yAxis = d3.axisLeft(yAxisScale)
      .ticks(5)
      .tickSize(-width);

    this.svg.append('g')
      .attr('transform', function (d) {
        return 'translate(0, 0)';
      })
      .call(yAxis)
      .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke", "grey"));;


    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(this.d3Data)
      .enter()
      .append("rect")
      .attr("x", function (d) { return x(d.foodSupply); })
      .attr("y", function (d) { return y(Math.max(0, d.value)); })
      .attr("height", function (d) { return Math.abs(y(0) - y(d.value)); })
      .attr("width", x.bandwidth())
      .style("fill", "blue")
      .style("stroke", "black")
      .style("stroke-width", "1px");

    //Añadiendo título al gráfico
    this.svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Deviation - d3");

    //Añadiendo título al eje Y
    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin * 1.1)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Porcentaje de diferencia Bélgica - España");

    //Añadiendo título al eje X
    this.svg.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin * 2) + ")")
      .style("text-anchor", "middle")
      .text("Tipo de alimentos");

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
