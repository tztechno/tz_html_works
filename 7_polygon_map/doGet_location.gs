function doGet() {
  const sheet = SpreadsheetApp.openById('1z7sOi4m1dl9tY63xfiEUsii_ry4R8B4qf-L2evl_aHs').getSheetByName('location');
  const data = sheet.getDataRange().getValues();

  const geojson = {
    "type": "FeatureCollection",
    "features": data.slice(1).map(row => {
      const coordinates = parseWKT(row[0]);

      return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": coordinates
        },
        "properties": {
          "name": row[2]  // 任意のプロパティ
        }
      };
    })
  };

  return ContentService.createTextOutput(JSON.stringify(geojson)).setMimeType(ContentService.MimeType.JSON);
}

// WKTをGeoJSONの座標配列に変換する関数
function parseWKT(wkt) {
  // "POINT (" の部分を取り除き、座標部分を取得
  const coordsStr = wkt.replace('POINT (', '').replace(')', '').trim();

  // 座標の緯度と経度を数値に変換
  const [lng, lat] = coordsStr.split(' ').map(Number);

  // GeoJSON形式で座標を返す
  return [lng, lat];
}
