import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnChart } from '@toast-ui/chart';
import { CSVRecord } from './CSVModel';

@Component({
  selector: 'app-part-to-whole',
  templateUrl: './part-to-whole.component.html',
  styleUrls: ['./part-to-whole.component.css']
})
export class PartToWholeComponent implements OnInit {

  constructor() { }

  @ViewChild('csvReader') csvReader: any;
  private categorias: any = []; // Para guardar las categorias o la coordenada x
  private values: any = []; // Para guardar los valroes de las serie

  ngOnInit(): void {
  }

  uploadListener($event: any): void {

    let text = [];

    let seriesName = [];  // Para guardar el nombre de la serie
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

        for (let i = 0; i < headersRow.length; i++) {
          seriesName.push(headersRow[i].trim().replace(/['"]+/g, ''));
        } //para quitar dobles comillas con las que sale del csv

        this.getDataRecordsArrayFromCSVFile(csvRecordsArray, myheader.length);

        //Datos para toast
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
        toastData.series[0].name = "hola";
        toastData.series[0].data = this.deleteComillas();
        console.log("inma", toastData.series[0].data);
        //Creación del gráfico con Toast
        this.createGraphToast(toastData, myheader);

        /*//Datos para Chartsjs
        this.chartsjsData.labels = this.categorias;
        this.chartsjsData.datasets[0].label = seriesName;
        this.chartsjsData.datasets[0].data = this.deleteComillas();
        console.log("-------------------", this.chartsjsData);
        //Creación del gráfico con Chartsjs
        this.createGraphChartsjs(this.chartsjsData);*/

        reader.onerror = function () {
          console.log('error is occured while reading file!');
        };
      };

    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }
  }

  /*private createGraphChartsjs(data:any) {

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
      },
      options: {
        scales: {
          y: {
            type: 'linear',
            beginAtZero: true
          }
        }
      }
    });


  }*/

  createGraphToast(data: any, myheader: any) {

    const options = {
      chart: { title: '', width: 15000, height: 500 },
    };

    options.chart.title = myheader[0] + "\\" + <string>myheader[1];
    options.chart.width = 70 * data.series[0].data.length;

    const el = document.getElementById('grafica');
    const chart = new ColumnChart({ el, data, options });


  }

  deleteComillas() {
    let resul: number[] = [];
    for (let i = 0; i < this.values.length; i++) {
      let aux = Number(parseFloat(this.values[i]).toFixed(2));
      if (!isNaN(parseFloat(this.values[i]))) {
        resul.push(aux);
      } else {
        resul.push(0);
      }
    }
    return resul;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {

    var encontrado = false;

    for (let i = 1; i < csvRecordsArray.length && !encontrado; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord[0] === "\"Spain\"") {
        for (let j =1; j < curruntRecord.length-8; j++){
          this.values.push(curruntRecord[j]);
        }
        encontrado = true;
      }

      //let csvRecord: CSVRecord = new CSVRecord();
      //this.categorias.push(curruntRecord[0].trim().replace(/['"]+/g, ''));

    }
    console.log("-----",this.values)


  }

  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
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
