import fs from 'fs'

/**
 * Methods to read data from raw CSV from file's name
 */
export class CSVFile {

  static async getDataFromFile(fileName: string) {
    fileName = fileName.slice(0, fileName.indexOf('.csv'))

    const projectDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');
    const rawDirPath = projectDir + "/raw";
    
    console.log("Reading local file " + fileName + "\n");
    return await fs.readFileSync(`${rawDirPath}/${fileName}.csv`, 'utf-8')
  }
}