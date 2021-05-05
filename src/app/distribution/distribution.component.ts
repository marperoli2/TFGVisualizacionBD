import { Component, OnInit, ViewChild } from '@angular/core';
import candela from 'candela';
import 'candela/plugins/vega/load.js';


@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.css']
})
export class DistributionComponent implements OnInit {

  @ViewChild('csvReader') csvReader: any;
  private categorias: any = []; // Para guardar las categorias o la coordenada x
  private values: any = []; // Para guardar los valroes de las serie

  constructor() { }

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

        var el = document.createElement('div')
        document.body.appendChild(el);
      
        /*for (var d = 0; d < 1000; d += 1) {
          data.push({
            a: Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random())
          });
        }*/
    
      
        var vis = new candela.components.Histogram(el, {
          data: this.values,
          x: 'deaths',
          width: 700,
          height: 400
        });
        vis.render();
      
      }
    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }
  
}

getDataRecordsArrayFromCSVFile(csvRecordsArray: any) {

  let deaths;

  for (let i = 1; i < csvRecordsArray.length; i++) {
    let currentRecord = (<string>csvRecordsArray[i]).split(',');


    if (!isNaN(parseFloat(currentRecord[27]))) {
      deaths = parseFloat(currentRecord[27].trim().replace(/['"]+/g, ''));
    } else {
      deaths = 0;
    }
    this.values.push({deaths});
  }

  console.log(this.values)
  

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
