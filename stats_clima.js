// Import shape files for distritos and peru
var table = ee.FeatureCollection("users/a20164808/SHAPE_DISTRITOS"),
    region = ee.FeatureCollection("users/a20164808/FRONT_PERU");

// Flatten feature collection from distritos	
var distris = ee.FeatureCollection([table]).flatten();

// Import clima image collection, clip for peru and select bands
var modisNDVI = ee.ImageCollection("IDAHO_EPSCOR/TERRACLIMATE")
 .map(clipToCol)
 .select(["tmmn","tmmx","pr"]);
  
function clipToCol(image) { 
  return image.clip(region); 
}

// Set start and end time
var startDate = ee.Date('1990-01-01');
var endDate = ee.Date('2020-12-01');

// Filter by dates
var modisNDVI = modisNDVI.filterDate(startDate,endDate)

// Custom function
var getMeanVals = function(image){
  image = ee.Image(image)
  var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')
  var mean = image.reduceRegions({
      collection: distris,
      reducer: ee.Reducer.mean(),
      scale: 4638 
    })
  return mean
    .map(function(f){
      return f.set({'date': date})
    })
}

// Apply custom function
var means = modisNDVI
  .map(getMeanVals)
  .flatten()

// Export to csv  
Export.table.toDrive({
    collection:means.select(['.*'],null,false),
    description:"DATA_FULL_CLIMA",
    fileFormat:"CSV"
  })