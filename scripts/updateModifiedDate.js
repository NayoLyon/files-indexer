const fs = require('fs');
const path = require('path');

// const mode = 'dryRun';
const mode = '';

// const rootPath = 'C:/Users/Nayo/Documents/temp/Photos Asie/Smartphone Lionel';
const rootPath = 'P:/2017/Asie/Smartphone Lionel';
const fileName = [
  { name: 'DSC_1567.JPG', hours: 0 },
  { name: 'MOV_1568.mp4', hours: -6 },
  { name: 'DSC_1569.JPG', hours: 0 },
  { name: 'MOV_1570.mp4', hours: -6 },
  { name: 'DSC_1571.JPG', hours: 0 },
  { name: 'DSC_1588.JPG', hours: 0 },
  { name: 'MOV_1589.mp4', hours: -6 },
  { name: 'MOV_1590.mp4', hours: -6 },
  { name: 'DSC_1591.JPG', hours: 0 },
  { name: 'MOV_1592.mp4', hours: -6 },
  { name: 'MOV_1593.mp4', hours: -6 },
  { name: 'DSC_1594.JPG', hours: 0 },
  { name: 'DSC_1683.JPG', hours: 0 },
  { name: 'MOV_1684.mp4', hours: -6 },
  { name: 'DSC_1685.JPG', hours: 0 },
  { name: 'DSC_1708.JPG', hours: 0 },
  { name: 'MOV_1709.mp4', hours: -6 },
  { name: 'DSC_1710.JPG', hours: 0 },
  { name: 'DSC_1766.JPG', hours: 0 },
  { name: 'MOV_1767.mp4', hours: -6 },
  { name: 'DSC_1768.JPG', hours: 0 },
  { name: 'DSC_1848.JPG', hours: 0 },
  { name: 'DSC_1849.JPG', hours: -0.5 },
  { name: 'DSC_1850.JPG', hours: 0 },
  { name: 'DSC_1902.JPG', hours: 0 },
  { name: 'MOV_1903.mp4', hours: -6 },
  { name: 'DSC_1904.JPG', hours: 0 },
  // { name: 'DSC_1924.JPG', hours: 0 },
  // { name: 'MOV_1925.mp4', hours: -6 },
  // { name: 'DSC_1926.JPG', hours: 0 },
  { name: 'DSC_1986.JPG', hours: 0 },
  { name: 'MOV_1987.mp4', hours: -6 },
  { name: 'DSC_1988.JPG', hours: 0 },
  { name: 'DSC_2018.JPG', hours: 0 },
  { name: 'MOV_2019.mp4', hours: -6 },
  { name: 'DSC_2020.JPG', hours: 0 },
  { name: 'DSC_2030.JPG', hours: 0 },
  { name: 'MOV_2031.mp4', hours: -6 },
  { name: 'DSC_2032.JPG', hours: 0 },
  { name: 'DSC_2033.JPG', hours: 0 },
  { name: 'MOV_2034.mp4', hours: -6 },
  { name: 'MOV_2035.mp4', hours: -6 },
  { name: 'MOV_2036.mp4', hours: -6 },
  { name: 'DSC_2037.JPG', hours: 0 },
  { name: 'DSC_2089.JPG', hours: 0 },
  { name: 'MOV_2090.mp4', hours: -6 },
  { name: 'DSC_2091.JPG', hours: 0 },
  { name: 'DSC_2104.JPG', hours: 0 },
  { name: 'MOV_2105.mp4', hours: -6 },
  { name: 'DSC_2106.JPG', hours: 0 },
  { name: 'DSC_2260.JPG', hours: 0 },
  { name: 'MOV_2261.mp4', hours: -6 },
  { name: 'DSC_2262.JPG', hours: 0 },
  { name: 'DSC_2301.JPG', hours: 0 },
  { name: 'MOV_2302.mp4', hours: -6 },
  { name: 'DSC_2303.JPG', hours: 0 },
  { name: 'DSC_2304.JPG', hours: 0 },
  { name: 'MOV_2305.mp4', hours: -6 },
  { name: 'DSC_2306.JPG', hours: 0 },
  { name: 'DSC_2311.JPG', hours: 0 },
  { name: 'MOV_2312.mp4', hours: -6 },
  { name: 'DSC_2313.JPG', hours: 0 },
  { name: 'DSC_2327.JPG', hours: 0 },
  { name: 'MOV_2328.mp4', hours: -7 },
  { name: 'DSC_2329.JPG', hours: 0 },
  { name: 'DSC_2335.JPG', hours: 0 },
  { name: 'MOV_2336.mp4', hours: -6 },
  { name: 'DSC_2337.JPG', hours: 0 },
  { name: 'DSC_2578.JPG', hours: 0 },
  { name: 'MOV_2579.mp4', hours: -6 },
  { name: 'DSC_2580.JPG', hours: 0 },
  { name: 'DSC_2591.JPG', hours: 0 },
  { name: 'MOV_2592.mp4', hours: -6 },
  { name: 'DSC_2593.JPG', hours: 0 },
  { name: 'DSC_2635.JPG', hours: 0 },
  { name: 'MOV_2636.mp4', hours: -6 },
  { name: 'DSC_2637.JPG', hours: 0 },
  { name: 'DSC_2639.JPG', hours: 0 },
  { name: 'MOV_2640.mp4', hours: -6 },
  { name: 'DSC_2641.JPG', hours: 0 },
  { name: 'DSC_3037.JPG', hours: 0 },
  { name: 'DSC_3038.JPG', hours: -6 },
  { name: 'DSC_3039.JPG', hours: 0 },
];

function updateModifiedDate(filePath, nbHours) {
  const fileStats = fs.statSync(filePath);
  const newModified = new Date(fileStats.mtime.getTime() + nbHours * 60 * 60 * 1000);
  if (mode === 'dryRun') {
    console.log(
      `Dry Run: setting times to '${filePath}': `,
      fileStats.atime,
      fileStats.mtime,
      newModified
    );
  } else if (nbHours !== 0) {
    fs.utimesSync(filePath, fileStats.atime, newModified);
    console.log(`Changing  times of '${filePath}': `, fileStats.atime, newModified);
  } else {
    console.log(`No change times of '${filePath}': `, fileStats.atime, fileStats.mtime);
  }
}

if (typeof fileName === 'string') {
  const filePath = path.resolve(rootPath, fileName);
  updateModifiedDate(filePath, -6);
} else if (fileName instanceof Array) {
  fileName.forEach(({ name, hours }) => {
    const filePath = path.resolve(rootPath, name);
    updateModifiedDate(filePath, hours);
  });
} else {
  console.error(`Invalid parameter type ${fileName} [${typeof fileName}]`, fileName);
}
