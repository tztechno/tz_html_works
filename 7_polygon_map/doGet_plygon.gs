function doGet() {
  const sheet = SpreadsheetApp.openById('1z7sOi4m1dl9tY63xfiEUsii_ry4R8B4qf-L2evl_aHs').getSheetByName('polygon');
  const data = sheet.getDataRange().getValues();

  // 取得したデータをログに出力
  Logger.log('Spreadsheet Data: %s', data);

  const geojson = {
    "type": "FeatureCollection",
    "features": data.slice(1).map(row => {
      // WKT形式をGeoJSON形式に変換
      const coordinates = parseWKT(row[0]);
      
      // 各行のデータをログに出力
      Logger.log('WKT: %s', row[0]);
      Logger.log('Parsed Coordinates: %s', coordinates);
      
      return {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": coordinates
        },
        "properties": {
          "name": row[1]  // 任意のプロパティ
        }
      };
    })
  };

  Logger.log('Generated GeoJSON: %s', JSON.stringify(geojson));

  return ContentService.createTextOutput(JSON.stringify(geojson)).setMimeType(ContentService.MimeType.JSON);
}

// WKTをGeoJSONの座標配列に変換する関数
function parseWKT(wkt) {
  // "POLYGON ((" の部分を取り除き、座標部分を取得
  const coordsStr = wkt.replace('POLYGON ((', '').replace('))', '');
  Logger.log('Coordinates String: %s', coordsStr);

  // 座標文字列を個々の座標に分割
  const coords = coordsStr.split(',').map(coord => {
    // 座標の緯度と経度を分割し、数値に変換
    const [lng, lat] = coord.trim().split(' ').map(Number);
    return [lng, lat];
  });
  Logger.log('Converted Coordinates Array: %s', coords);

  // GeoJSON形式の二重配列に変換
  return [coords];
}

