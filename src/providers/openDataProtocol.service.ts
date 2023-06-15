import { Injectable, Logger } from '@nestjs/common';

export interface IOData {

  $select: string

  formatNormalFieldValues(data: Array<any>): Promise<string>

  formatCustomFieldValues(data: Array<any>): Promise<string>
  
  formatGroupOperation(operation: 'and'|'or',  args: { property: string, params: any []}): string

}

@Injectable()
export class OpenDataProtocolService {

  // This class with convert the params into query string 

  private sigleOperator = [
    'gt',
    'ge',
    'lt',
    'le',
    'ne',
    'eq'
  ];
  
  private groupOperator = [
    'and',
    'or'
  ]
  public $select = 'lastActionDate, closedIn, resolvedIn, isDeleted, createdDate, baseStatus, status, ownerTeam, owner, urgency, category, subject, type, id'

  // private $filter  = 
  // private $expand = 

  private readonly logger = new Logger(OpenDataProtocolService.name);

  /* 
    &$select=id,status,category,createdDate&$filter=status eq 'S4 - COLETA REVERSA' and category eq 'Garantia'

    ----------------------------------------------------------------------

    "normalFieldValues": [
      {
        "name": string,
        "value": string,
        "expand": string
      } 
    ]

    * Default selector
    * - $select -> id, type, subject, category, urgency, status, baseStatus,
    * -            createdDate, isDeleted, resolvedIn, closedIn, lastActionDate,
    * -            serviceFirstLevel, serviceSecondLevel, statusHistories

    * - $expand -> owner, ownerTeam, serviceFull, actions,
    * - SLA     -> slaAgreement, slaAgreementRule, slaSolutionTime, slaResponseTime, slaSolutionDate
  */

  async formatNormalFieldValues(normalFields: Array<any>, useDefaults = false) {
    // retornar falso para finalizar operação antes da requisição http
    if (!normalFields) return;

    const selectMapper: Array<string> = [ useDefaults ? this.$select : "" ];
    const filterMapper : Array<string> = [];
    const expandMapper: Array<string> = [];

    /** 
     * * RULES
     * - EVERY KEY MUST BE ADDED TO $SELECT
     * TODO - Filter
     *  * IF VALUE, IS ADDED TO FILTER
     *    * If simple operator, handle operation + value
     *      IF THERE'S NO OPERATION IDENTIFIED ON VALUE, OPERATION VERIFY EQUALTY -> eq
     *    TODO - If grouped operator, AND/OR
     * 
     * * IF EXPANDED PROP 
     *   * EXPANDED HAS EXTENDED PROP
     *   * EXPANDED HAS CUSTOM SELECT 
     *  */ 

    normalFields.forEach((element) => {
      // Handle params to select and filter
      if (element?.name) {
        const name = element.name as string;

        if (element?.value) { // FILTER
          const value = element.value as string;
          // Set filter operantion
          let operation = this.sigleOperator.filter(operation => value.includes(`${operation} `))[0]
          const valueIncludesOperation = !!operation;

          if (!valueIncludesOperation) {
            operation = 'eq';
            console.log("Operation was empty, set default:", operation);
          }

          filterMapper.push(`${name} ${valueIncludesOperation ? '' : `${operation} `}${value}`);
        }
        if(!selectMapper.find( element => element.includes(name) )) {
          console.log(!selectMapper.find( element => element.includes(name) ))
          selectMapper.push(`${name}`);
          console.log(selectMapper)
        }
      }

      // * Expand
      if (element?.expand) {
        const expandValue = element.value ? `($expand=${element.value})` : ''
        const selectExpandedValue = element.select ? `($select=${element.select})` : ''

        expandMapper.push(`${element.expand}${expandValue}`);
        expandMapper.push(`${element.expand}${selectExpandedValue}`);
      }
    });
    
    // Parse arrays into query string 
    const selectString = `&$select=${selectMapper.filter( item => !!item ).join(',')}`;
    const filterString = `&$filter=${filterMapper.length > 1 ? filterMapper.map(filter => `${filter}`).join(' and ') : filterMapper[0]}`;
    const expandString = expandMapper.length ? `&$expand=${expandMapper}` : '';

    const query = selectString + expandString + filterString;

    return query;
  }

  formatGroupOperation(operation: 'and'|'or',  args: { property: string, params: any[]}) {
    let formattedString = '';
 
    args.params.forEach( (param, idx) => {
      if(idx%2==0 && idx!= 0) {
        formattedString += `(${args.property} eq '${args.params[idx-1]}' ${operation} ${args.property} eq '${param}')`
        if( idx+2 < args.params.length )
          formattedString += ` ${operation} `
      }
    } )

    return formattedString;
  }

  formatPeriod(period = { start: '', end: ''}, property = ['createdDate'] ) {
    const { start, end } = period;
    let formattedPeriodQuery = '';
    let startDate = '';
    let endDate = '';

    if (start)
      startDate = new Date(start).toISOString();
    else
      startDate = new Date().toISOString();

    if(end) {
      endDate = new Date(end).toISOString();
    }

    // formattedPeriodQuery = property.map`(date gt ${startDate} ${endDate? 'and date lt ' + endDate : '' })`
    formattedPeriodQuery = property.map(prop => 
      `(${prop} gt ${startDate} ${endDate? 'and ' + prop + ' lt ' + endDate : '' })`).join(' or ');


    return formattedPeriodQuery;
  }
}

