import _ from 'lodash';
import { encode as toonEncode, decode as toonDecode } from '@toon-format/toon';
import cleaner from 'deep-cleaner';

function getAllKeys(obj, seen = new Set()) {
  if (_.isArray(obj)) {
    obj.forEach(item => getAllKeys(item, seen));
  } else if (_.isPlainObject(obj)) {
    _.forOwn(obj, (value, key) => {
      seen.add(key);
      getAllKeys(value, seen);
    });
  }
  return seen;
}

function generateShortFormForKeys(keys){
  keys.sort((a,b)=>a.length-b.length);
  const ksf={};
  keys.forEach(key=>{
    if(!(key in ksf)){
      let endIndex=1
      while(true){
        if(Object.values(ksf).includes(key.slice(0, endIndex))){
          endIndex+=1;
          if(endIndex===key.length){
            ksf[key]=key;
            break;
          }
        }else{
          ksf[key]=key.slice(0,endIndex);
          break;
        }
      }
    }
  })
  return ksf;
}

function objectRenameKeys(obj, ksf) {
  if (_.isArray(obj)) return obj.map(v => objectRenameKeys(v, ksf));
  if (_.isPlainObject(obj)) {
    const mappedVals = _.mapValues(obj, v => objectRenameKeys(v, ksf));
    return _.mapKeys(mappedVals, (v, k) => ksf[k] ?? k);
  }
  return obj;
}

function replaceLargeStrings(obj, threshold = 50, seen = new Map(), table = {}) {
  if (_.isArray(obj)) {
    return obj.map((value) => replaceLargeStrings(value, threshold, seen, table));
  }
  if (_.isPlainObject(obj)) {
    return _.mapValues(obj, (value) => replaceLargeStrings(value, threshold, seen, table));
  }
  if (_.isString(obj)) {
    if (obj.length < threshold) return obj;
    if (seen.has(obj)) return seen.get(obj);
    const id = `@S${seen.size + 1}`;
    seen.set(obj, id);
    table[id] = obj;
    return id;
  }
  return obj;
}

function restoreLargeStrings(obj, table) {
  if (_.isArray(obj)) {
    return obj.map((value) => restoreLargeStrings(value, table));
  }
  if (_.isPlainObject(obj)) {
    return _.mapValues(obj, (value) => restoreLargeStrings(value, table));
  }
  if (_.isString(obj) && obj.startsWith('@S')) {
    return table[obj] ?? obj;
  }
  return obj;
}

export function encode(obj, options = {}) {
  const {
    allowShortForms = true,
    allowCleaning = true,
    replaceLongStrings = true,
    longStringThreshold = 50
  } = options;

  let keysShortForms;
  let renamedKeysObj;
  let cleanedObj;
  const longStringsTable={};
  let longStringsReplacedObj;

  if(allowShortForms){
    const allKeys=[...getAllKeys(obj)];
    keysShortForms=generateShortFormForKeys(allKeys);
    renamedKeysObj=objectRenameKeys(obj, keysShortForms);
  }

  if(allowCleaning){
    cleanedObj=cleaner.clean(renamedKeysObj ?? obj);
  }

  if(replaceLongStrings){
    longStringsReplacedObj=replaceLargeStrings(cleanedObj ?? renamedKeysObj ?? obj, longStringThreshold, new Map(), longStringsTable);
  }
    
  const encodedObj = toonEncode(longStringsReplacedObj ?? cleanedObj ?? renamedKeysObj ?? obj);

  const responseObj={encodedObj: encodedObj};
  if(allowShortForms){
    responseObj.keysShortForms=keysShortForms;
  }
  if(replaceLongStrings){
    responseObj.replaceLongStringsTable=longStringsTable;
  }

  return responseObj;
}

export function decode(encodedResult) {
  const { encodedObj, keysShortForms, replaceLongStringsTable } = encodedResult;

  if (!encodedObj) {
    throw new Error('encodedObj is required for decoding');
  }

  let decodedObj = toonDecode(encodedObj);

  if (replaceLongStringsTable && Object.keys(replaceLongStringsTable).length > 0) {
    decodedObj = restoreLargeStrings(decodedObj, replaceLongStringsTable);
  }

  if (keysShortForms && Object.keys(keysShortForms).length > 0) {
    const reversedKeysShortForms = _.invert(keysShortForms);
    decodedObj = objectRenameKeys(decodedObj, reversedKeysShortForms);
  }

  return decodedObj;
}

export default { encode, decode };