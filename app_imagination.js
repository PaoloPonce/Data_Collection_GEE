/*====================*/
/*====================*/
/*       Model        */
/*====================*/
/*====================*/

var proy_lin = ee.FeatureCollection('users/a20164808/2234988');
var centro = proy_lin.geometry().centroid().coordinates();
print(centro);

var m = {};
m.col = ee.ImageCollection("LANDSAT/LC08/C01/T1_RT_TOA").select(['B4','B3','B2']).filterBounds(proy_lin);
print(m.col.size());

m.imgInfo = {
  starYear : 2014,
  endYear : 2020,
  bands: ['B4','B3','B2'],
  viz: {min:0,max:0.3}
};


/*=============*/
/* Components  */
/*=============*/

var c = {};
c.controlPanel = ui.Panel();
c.map = ui.Map().centerObject(ee.Geometry.Point(-78.01,-8.2),11);


// P1
c.info = {};
c.info.titleLabel = ui.Label('Reto 2 con GEE - eponcea');
c.info.aboutLabel = ui.Label(
  'Esta app nos permite visualizar imágenes '+
  'centradas en el proyecto '+
  'por span de tiempo. ');
c.info.panel = ui.Panel([
  c.info.titleLabel,c.info.aboutLabel])

// P2  
c.selectYear = {};
c.selectYear.label = ui.Label('Seleccione un año');
c.selectYear.slider = ui.Slider({
  min: m.imgInfo.starYear,// endogenous
  max: m.imgInfo.endYear,//endogenous
  step: 1
});
c.selectYear.panel = ui.Panel([c.selectYear.label,c.selectYear.slider]);

// P3
c.selectCloud = {};
c.selectCloud.label = ui.Label('Seleccione un nivel de nubosidad (US)');
c.selectCloud.slider = ui.Slider({
  min: 10,
  max: 80,
  step: 10
});
c.selectCloud.panel = ui.Panel([c.selectCloud.label,c.selectCloud.slider]);

c.dividers = {};
c.dividers.divider1 = ui.Panel();
c.dividers.divider2 = ui.Panel();


/*==============*/
/* Composition  */
/*==============*/

ui.root.clear();
ui.root.add(c.controlPanel);
ui.root.add(c.map);
c.controlPanel.add(c.info.panel);
c.controlPanel.add(c.dividers.divider1);
c.controlPanel.add(c.selectYear.panel);
c.controlPanel.add(c.dividers.divider2);
c.controlPanel.add(c.selectCloud.panel);

/*==========*/
/* Styling  */
/*==========*/
var s = {};


s.aboutText = {
  fontSize: '13px',
  color: '505050'
};

s.widgetTitle = {
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '8px 8px 0px 8px',
  color: '383838'
};

s.strechHorizontal = {
  stretch: 'horizontal'
};

s.divider = {
  backgroundColor: 'F0F0F0',
  height: '4px',
  margin: '20px 0px'
};

c.controlPanel.style().set({
  width: '275px'
});

c.info.titleLabel.style().set({
  fontSize:'20px',
  fontWeight:'bold',
  color: '4A997E'
});

c.info.aboutLabel.style().set(s.aboutText);

c.selectYear.label.style().set(s.widgetTitle);
c.selectYear.slider.style().set(s.strechHorizontal);

c.selectCloud.label.style().set(s.widgetTitle);
c.selectCloud.slider.style().set(s.strechHorizontal);

/*=============*/
/* Behaviours  */
/*=============*/

function updateMap(){
  var year = c.selectYear.slider.getValue();//endogenous
  
  var img = m.col.filterDate(ee.Date.fromYMD(ee.Number(year), 1, 1),ee.Date.fromYMD(ee.Number(year), 12, 31))//(ee.Filter.eq('year', parseInt(year, 10)))
             .select(m.imgInfo.bands).filter(ee.Filter.lt('CLOUD_COVER', c.selectCloud.slider.getValue()));
  var layer = ui.Map.Layer({
    eeObject: img,
    visParams: m.imgInfo.viz,
  });
  var proy = ui.Map.Layer({
    eeObject: proy_lin,
    visParams: {color: 'EFF958'},
  });
  c.map.layers().set(0,layer);
  c.map.layers().set(1,proy);
}

c.selectYear.slider.onChange(updateMap);
c.selectCloud.slider.onChange(updateMap);

/*=============*/
/* Initialize  */
/*=============*/

updateMap()