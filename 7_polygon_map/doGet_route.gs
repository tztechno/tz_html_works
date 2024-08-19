function doGet() {
  const sheet = SpreadsheetApp.openById('1z7sOi4m1dl9tY63xfiEUsii_ry4R8B4qf-L2evl_aHs').getSheetByName('route');
  const data = sheet.getDataRange().getValues();

  // 取得したデータをログに出力
  Logger.log('Spreadsheet Data: %s', JSON.stringify(data));

  const geojson = {
    "type": "FeatureCollection",
    "features": data.slice(1).map(row => {
      // WKT形式をGeoJSON形式に変換
      const coordinates = parseWKT(row[0]);

      // 各行のデータをログに出力
      Logger.log('LINESTRING: %s', row[0]);
      Logger.log('Parsed Coordinates: %s', JSON.stringify(coordinates));

      return {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
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
  // "LINESTRING (" と " )" の部分を取り除き、座標部分を取得
  const coordsStr = wkt.replace('LINESTRING (', '').replace(')', '');
  Logger.log('Coordinates String: %s', coordsStr);

  // 座標文字列を個々の座標に分割
  const coords = coordsStr.split(',').map(coord => {
    // 座標の緯度と経度を分割し、数値に変換
    const [lng, lat] = coord.trim().split(' ').map(Number);

    // 数値変換に失敗した場合はエラー処理
    if (isNaN(lng) || isNaN(lat)) {
      Logger.log('Error parsing coordinate: %s', coord);
      return null;
    }

    return [lng, lat];
  }).filter(coord => coord !== null); // 無効な座標を除外

  // GeoJSON形式の座標配列に変換
  return coords;
}
