import { Injectable, Logger } from '@nestjs/common';
import e from 'express';

@Injectable()
export class OpenDataProtocolService {

  // This class with convert the params into query string 

  private operations = [ 
    'gt', 
    'ge', 
    'lt', 
    'le', 
    'ne',
    'eq',
    'and',
    'or'
  ];

  private readonly logger = new Logger(OpenDataProtocolService.name);

  /* 
    &$select=id,status,category,createdDate&$filter=status eq 'S4 - COLETA REVERSA' and category eq 'Garantia'

    ----------------------------------------------------------------------

    "normalFieldValues": [
      {
        "name": string,
        "value": string
      } 
    ]
  */

  async formatNormalFieldValues(normalFields: Array<any>) {
    // retornar falso para finalizar operação antes da requisição http
    if (!normalFields) return;

    const selectMapper: Array<string> = [];
    const filterMapper: Array<string> = [];
    const expandMapper: Array<string> = [];

    // * RULES
    // TODO - EVERY KEY MUST BE ADDED TO $SELECT
    // TODO - IF VALUE, IS ADDED TO FILTER
      // TODO - IF THERE'S NO OPERATION IDENTIFIED ON VALUE, OPERATION VERIFY EQUALTY -> eq
    // TODO - IF EXPANDED PROP ????????
    
    normalFields.forEach((element) => {
      // Handle params to select and filter
      if (element?.name && element?.value) {
        const name = element.name as string;
        const value = element.value as string;

        let operation = this.operations.filter( operation => value.includes(operation) )[0]
        const valueIncludesOperation = !!operation;
        if( !valueIncludesOperation ) {
          operation = 'eq';
        }

        selectMapper.push(`${name}`);
        filterMapper.push(`${name} ${valueIncludesOperation ? '' : operation+" " }${value}`);
      } else if (element?.name) {
        selectMapper.push(`${element.name}`);
      }

      // Handle expand properties  
      if(element?.expand) {
        const expandValue = element.value ? `($expand=${element.value})` : ''
        expandMapper.push(`${element.expand}${expandValue}`)
      }
    });
    
    const selectString = `&$select=${selectMapper.join(',')}`;
    const filterString  = `&$filter=${ filterMapper.length > 1 ? filterMapper.join(' and ') : filterMapper[0] }`;
    const expandString = expandMapper.length ? `&$expand=${expandMapper}` : '';

    const query = selectString + expandString + filterString;

    return query;
  }
}

