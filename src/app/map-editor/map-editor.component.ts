import {Component, Input, OnInit, AfterViewInit, SimpleChanges} from '@angular/core';
import * as L from 'Leaflet'
import '@geoman-io/leaflet-geoman-free';
//import 'leaflet.pm';
import { v4 as uuidv4 } from "uuid";
import {GeoJSON} from "geojson";
import {IWmsLayer} from "../iwms-layer";



@Component({
  selector: 'app-map-editor',
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.scss']
})
export class MapEditorComponent implements OnInit {

  mapId: string;
  map: L.Map;
  wmsLayerGroup: L.LayerGroup = new L.LayerGroup<any>();
  jsonLayerGroup: L.LayerGroup = new L.LayerGroup<any>();
  //borderLayerGroup: GeoJSON;
  borderLayerGroup: L.LayerGroup = new L.LayerGroup<any>();


  @Input() borders: GeoJSON;
  @Input() shapes: GeoJSON;
  @Input() wmsLayers: IWmsLayer[];



  setMap() {
    const baseLayer: L.TileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );
    const viewerOptions: L.MapOptions = {
      layers: [baseLayer],
    };
    this.map = L.map(this.mapId, viewerOptions);
    console.log("InitMap");

    //add layer groups
    this.wmsLayerGroup.addTo(this.map);
    this.jsonLayerGroup.addTo(this.map);
    this.borderLayerGroup.addTo(this.map);

  }

  setDesignTool(){
    // @ts-ignore
    L.PM.initialize({ optIn: true });
    // @ts-ignore
    this.map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      cutPolygon: false,
      pinningOption: false,
      snappingOption: false
    });

  }

  constructor() {
    this.mapId = uuidv4();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.hasOwnProperty('borders')) this.loadBorder();
    if(changes.hasOwnProperty('shapes')) this.loadShapes();
    if(changes.hasOwnProperty('wmsLayers')) this.loadWmss();

  }

  ngAfterViewInit(){
    this.setMap();
    this.loadBorder();
    this.loadShapes();
    this.loadWmss();
    this.setDesignTool();

    // @ts-ignore
    // this.map.pm.enableDraw('Polygon', {
    //   snappable: true,
    //   snapDistance: 20,
    // });
    var options = {
      templineStyle: {},
      hintlineStyle: {},
      pathOptions: {
        // add leaflet options for polylines/polygons
        color: 'orange',
        fillColor: 'green',
      },
    };

// enable drawing mode for shape - e.g. Poly or Line
    // @ts-ignore
    this.map.pm.enableDraw('Polygon', options);

  }

  loadBorder(){
    if(this.borderLayerGroup && this.map){
      this.borderLayerGroup.clearLayers();
      let layer= new L.GeoJSON(this.borders);
      this.borderLayerGroup.addLayer(layer);
      this.map.fitBounds(layer.getBounds());
    }
  }

  loadShapes(){
    if(this.jsonLayerGroup && this.map){
      this.jsonLayerGroup.clearLayers()
      this.jsonLayerGroup.addLayer(new L.GeoJSON(this.shapes));
    }
  }

  loadWmss(){
    if(this.wmsLayerGroup && this.map){
      this.wmsLayerGroup.clearLayers()
      this.wmsLayers.map((layer: IWmsLayer)=>{
        this.wmsLayerGroup.addLayer(new L.TileLayer.WMS(layer.baseUrl, layer.options));
      });

    }
  }

}
