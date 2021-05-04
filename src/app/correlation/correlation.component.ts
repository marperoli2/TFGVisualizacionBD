import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScatterChart } from '@toast-ui/chart';
import { LineController, PointElement, CategoryScale, Chart, LinearScale ,ScatterController, LineElement } from 'chart.js';


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
        data: []
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
        /*this.margin = 120;
        this.width = 3000 ;
        this.height = 400 ;
        //Creación del gráfico con d3
        this.createSvg();
        this.drawBars(this.d3Data)*/
  
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
    console.log(this.values);
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
