import {Component, Input, OnInit, AfterViewInit, SimpleChanges} from '@angular/core';
import * as L from 'leaflet'
import '@geoman-io/leaflet-geoman-free';
import { v4 as uuidv4 } from "uuid";
import intersect from '@turf/intersect'
import union from '@turf/union'
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
  drawedLayerGroup: L.LayerGroup = new L.LayerGroup<any>();

  layerList: L.Layer[] = [];

  editMode: boolean = false;
  dragMode: boolean = false
  deleteMode: boolean = false


  @Input() borders: GeoJSON;
  @Input() shapes: GeoJSON;
  @Input() wmsLayers: IWmsLayer[];

  pathColor: string = '#FFA500';
  inFillOpacity: string = '0.4';

  dict = {
    '1': '#ffff02',
    '2': '#ffaa00',
    '3': '#e70000',
    '4': '#730000',
  }


  drawControl;

  drawControlOptions: any = {
    // position: 'topleft',
    drawPolygon: false,
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawCircle: false,
    cutPolygon: false,
    pinningOption: false,
    snappingOption: false
  };


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
    this.drawedLayerGroup.addTo(this.map)


  }

  setDesignTool(){
    // @ts-ignore
    L.PM.initialize();


    this.map.on('pm:create', e => {
      console.log(e)
      this.map.removeLayer(e.layer)

      this.drawedLayerGroup.addLayer(e.layer);

      // @ts-ignore
      let poly1 = this.borders.features[0]
      let poly2 = e.layer.toGeoJSON().features[0]
      let poly3 = intersect(poly1,poly2)

      // @ts-ignore
      L.polygon(poly3, {color: 'red'}).addTo(this.map);

    });

    this.map.on('pm:edit', e => {



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



  }

  enableDrawer (){
    let options = {
      templineStyle: {},
      hintlineStyle: {},
      pathOptions: {
        // add leaflet options for polylines/polygons
        color: this.pathColor,
        fillColor: this.pathColor,
        fillOpacity: this.inFillOpacity,
      },
    };

    // @ts-ignore
    this.map.pm.enableDraw('Polygon', options);
  }



  canToggle(){
    return (this.dragMode || this.editMode || this.deleteMode)
  }

  toggleDragMode(){
    // @ts-ignore
    this.map.pm.toggleGlobalDragMode();
    this.dragMode = !this.dragMode;

  }

  toggleEditMode(){
    // @ts-ignore
    this.map.pm.toggleGlobalEditMode();
    this.editMode = !this.editMode;

  }

  toggleRemoveMode(){
    // @ts-ignore
    this.map.pm.toggleGlobalRemovalMode()
    this.deleteMode =!this.deleteMode
  }



  loadBorder(){
    if(this.borderLayerGroup && this.map){
      this.borderLayerGroup.clearLayers();
      // @ts-ignore
      let layer= new L.GeoJSON(this.borders, { pmIgnore: true ,
      style: (feature)=>{
        return {
          color:'#000000',
          fillOpacity:0,
          weight: 1
        }
      }});
      this.borderLayerGroup.addLayer(layer);
      this.map.fitBounds(layer.getBounds());
    }
  }

  loadShapes(){
    if(this.jsonLayerGroup && this.map){
      this.jsonLayerGroup.clearLayers()

      this.jsonLayerGroup.addLayer(new L.GeoJSON(this.shapes,{
        // @ts-ignore
        pmIgnore: false,
        style: (feature) => {

          return {
            color: this.dict[feature.properties.niv.toString()],
            fillColor: this.dict[feature.properties.niv.toString()],
            fillOpacity: 1
          }
        }

      }));
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
