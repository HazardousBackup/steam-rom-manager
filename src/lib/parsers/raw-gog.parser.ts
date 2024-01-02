import { ParserInfo, GenericParser, ParsedData } from '../../models';
import { APP } from '../../variables';
import * as _ from "lodash";
import * as fs from "fs-extra";
import * as genericParser from '@node-steam/vdf';
import * as path from "path";
import { stat } from 'original-fs';

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

  execute(directories: string[], inputs: { [key: string]: any }, cache?: { [key: string]: any }) {
    return new Promise<ParsedData>((resolve,reject)=>{
        reject();
    })
  }
}
