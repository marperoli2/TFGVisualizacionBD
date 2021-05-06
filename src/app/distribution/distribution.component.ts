import { Component, OnInit, ViewChild } from '@angular/core';
import candela from 'candela';
import 'candela/plugins/vega/load.js';
import * as d3 from 'd3';


@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.css']
})
export class DistributionComponent implements OnInit {

  @ViewChild('csvReader') csvReader: any;
  private categorias: any = []; // Para guardar las categorias o la coordenada x
  private values: any = []; // Para guardar los valroes de las serie

  private svg: any;

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

        //---------------------------------------------------------------------------------------------------------

        var myValues = [];
        for (let i = 0; i < this.values.length; i++) {
          myValues.push(this.values[i].deaths);
        }

        var bin1 = d3.bin();
        var bin2 = d3.bin().thresholds([ 0, 0.04, 0.08]);
        var mybuc = bin2(myValues);
      
        var margin = { top: 20, right: 30, bottom: 30, left: 50 },
          width = 530 - margin.left - margin.right,
          height = 280 - margin.top - margin.bottom;

        var max = (Math.trunc(d3.max(myValues)/0.02)+1)*0.02;   
        var min = d3.min(myValues);
        
        this.svg = d3.select("#histogram3d")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
          .domain([min, max])
          .range([0, width]);

        // Draw the X-axis on the DOM
        this.svg.append('g')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x));

        var y = d3.scaleLinear()
          .domain([0,100 ])
          .range([height,0]);

        this.svg.append('g')
          .call(d3.axisLeft(y))
          ;

        this.svg.selectAll("rect")
          .data(mybuc)
          .enter()
          .append("rect")
          .attr("x", 1)
          .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#69b3a2");

        /*this.svg = d3.select("#histogram3d").append("g")
                  .selectAll("rect")
                  .data(mybuc)
                  .join("rect")
                  .attr("y", d => 10)
                  .attr("height", 100 - 2 * 10)
                  .attr("x", d => (x(d.x0) + 1) | 0)
                  .attr("width", d => (x(d.x1) | 0) - (x(d.x0) | 0) - 2)
                  .attr("stroke-width", 1)
                  .attr("stroke-dasharray", d => (d.length === 0 ? "1 5" : null))
                  .attr("fill", "none");
                console.log("fin");
        
        */
      
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
