//--------------------------
//-- **Imagen Selection** --
//--------------------------
var proy_lin = ee.FeatureCollection('users/a20164808/2234988_buffer');
Map.addLayer(proy_lin);
// 1. elevation
var srtm = ee.Image("USGS/SRTMGL1_003");
print(srtm);

// 2. ndvi
var ndvi = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA")
             .filterDate('2021-05-01','2021-05-26').sort('CLOUD_COVER').filterBounds(proy_lin).first()
             .normalizedDifference(['B5','B4']).rename('ndvi');
print(ndvi);
Map.addLayer(ndvi,{min:-1,max:1},'ndvi');

// 3. Climate part1 (diario)
var clima1 = ee.ImageCollection('ECMWF/ERA5/DAILY')
                   .select(['mean_2m_air_temperature','total_precipitation'])
                   .filter(ee.Filter.date('2019-01-01', '2020-01-01')).median();
print(clima1);

// 4. Climate part2 (mensual)
/*def (deficit de agua), pr (precipitacion acumulada), soil (humedad)
srad (radiacion solar), vs (velocidad del viento 10m)*/
var clima2 = ee.ImageCollection("IDAHO_EPSCOR/TERRACLIMATE")
             .select(['def','pr','soil','srad','vs'])
             .filter(ee.Filter.date('2019-01-01', '2020-01-01')).median();
print(clima2)

var imagen = srtm.addBands([ee.Image(ndvi),ee.Image(clima1),ee.Image(clima2)]);
print(imagen);


//---------------
//-- Reduction --
//---------------

// show buffer of features (1000m)
print(proy_lin);
Map.addLayer(proy_lin,{},'proyecto');

// Add reducer output to the Features in the collection.
var proy_lin_add = imagen.reduceRegions({
  collection: proy_lin,
  reducer: ee.Reducer.mean()
});
print(proy_lin_add);

// Export the FeatureCollection (csv)
Export.table.toDrive({
  collection: proy_lin_add,
  description: 'Recollection',
  folder: 'Estadisticas_Area_Proyecto',
  fileFormat: 'CSV'
});
