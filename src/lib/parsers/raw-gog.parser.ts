import { ParserInfo, GenericParser, ParsedData } from '../../models';
import { APP } from '../../variables';
import * as _ from "lodash";
import * as os from "os";
import Registry from "winreg";

export class RawGOGParser implements GenericParser {

  private get lang() {
    return APP.lang.rawGogParser;
  }
  getParserInfo(): ParserInfo {
      return {
          title: 'Raw GOG',
          info: this.lang.docs__md.self.join('')
      };
  }

  private processRegKey(regkey: Registry.Registry){
    return new Promise<ParsedData["success"][number]>((resolve, reject) => {
      regkey.values((err: Error, values: Registry.RegistryItem[]) => {
        if (err) {
          return reject(err);
        }
        if (values) {
          let entry: ParsedData["success"][number] = {
            extractedTitle: values.find((entry) => entry.name === 'gameName').value,
            filePath: values.find((entry) => entry.name === 'launchCommand').value,
            extractedAppId: values.find((entry) => entry.name === 'gameID').value,
            launchOptions: (values.find((entry) => entry.name === 'launchParam') ?? {value: ''}).value,
            startInDirectory: values.find((entry) => entry.name === 'workingDir').value
          }
          return resolve(entry);
        }
      });
    });
  }

  private getRegInstalled(){
    return new Promise<ParsedData["success"]>((resolve, reject) => {
      const rootkey: string = '\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\'
      const reg = new Registry({
        hive: Registry.HKLM,
        key: rootkey,
      });

      reg.keys((err: Error, regkeys: Registry.Registry[]) => {
        if (err) {
          return reject(err);
        }
        if (regkeys) {
          const promiseArr = regkeys.map((regkey) => this.processRegKey(regkey))
          Promise.all(promiseArr).then((parsedArray) => {
            return resolve(parsedArray);
          }).catch((err2) => {
            return reject(err2)
          });
        } else {
          return resolve([]);
        }
      });
    });
  }

  execute(directories: string[], inputs: { [key: string]: any }, cache?: { [key: string]: any }) {
    return new Promise<ParsedData>((resolve,reject)=>{
      
      let parsePromise: Promise<ParsedData["success"]>;

      if(os.type()=='Windows_NT') {
        parsePromise = this.getRegInstalled();
      } else {
        return reject(this.lang.errors.gogNotCompatible);
      }

      parsePromise.then((games) => {
        let parsedData: ParsedData = { success: games, failed: [] };
        resolve(parsedData);
      }).catch((err)=>{
        reject(this.lang.errors.fatalError__i.interpolate({error: err}));
      });

    });
  }
}
