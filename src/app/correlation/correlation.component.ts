import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScatterChart } from '@toast-ui/chart';
import { LineController, PointElement, CategoryScale, Chart, LinearScale ,ScatterController, LineElement } from 'chart.js';
import * as d3 from 'd3';

@Component({
  selector: 'app-correlation',
  templateUrl: './correlation.component.html',
  styleUrls: ['./correlation.component.css']
})
export class CorrelationComponent implements OnInit {

  constructor() { }

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
        backgroundColor:'rgba(0, 143, 57)'
      },
    ],
  };

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

        // Saca las cabeceras que interesan del fichero csv
        myheader[0] = headersRow[0].trim().replace(/['"]+/g, '');
        myheader[1] = headersRow[29].trim().replace(/['"]+/g, '');
        seriesName = headersRow[29].trim().replace(/['"]+/g, '');

        this.getDataRecordsArrayFromCSVFile(csvRecordsArray);

        //TOAST
        const toastData = {
          series: [
            {
              name: 'Correlacion',
              data: [ ]
            },
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
        var margin = {top: 10, right: 30, bottom: 30, left: 60};
        var width = 1400 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;

        //Creación del gráfico con d3

        var svgD3 = d3.select("#myD3Chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

         // Add X axis
   

        const x = d3.scaleLinear()
          .domain([0,12 ])
          .range([ 0, width ]);

        svgD3.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        const y = d3.scaleLinear()
          .domain([0, 0.20])
          .range([ height, 0]);
          svgD3.append("g")
          .call(d3.axisLeft(y));

          /*
          {x: 0.142134196465269, y: 0.00618577887381833},
          {x: 2.96730091613813, y: 0.0509513742071882},*/

        const data3d = [
        ]

        for (let i = 0; i < this.values.length; i++){
          data3d.push(this.values[i]);

        }

        
        const dots = svgD3.append('g');

       
        dots.selectAll("dot")
        .data(data3d)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 3)
        .style("opacity", .5)
        .style("fill", "#69b3a2");
        
  
        //-------------------------------------------------------------------------------------
  

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

    Chart.register(LineController, LineElement, ScatterController,PointElement, CategoryScale, LinearScale);
    this.correlationChart = new Chart(this.barCanvas.nativeElement, {
      type: "scatter",
      data: data,
      options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
        }
      }
    );
  }

  createGraphToast(data: any) {

    const options = {
      chart: { title: 'Confirmado', width: 900, height: 300 },
      xAxis: {
        title: 'Death'

      },
      yAxis: { title: 'Deaths (kg)' },
    };

    const el = document.getElementById('chart-area');
    const chart = new ScatterChart({ el, data, options })

  }


  getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');
      let x = parseFloat(currentRecord[26]);//*parseFloat(currentRecord[30]);
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


  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  fileReset() {
    this.csvReader.nativeElement.value = "";

  }





}
