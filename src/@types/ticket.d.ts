declare namespace Ticket {
  interface Search {
    normalFieldValues: Array<any>
    customFieldValues?: Record<CustomFieldId, Record<Options, Value>>[];
  }

  type CustomFieldId = string;
  type Options = 'value' | 'storageFileGuid' | 'customFieldItem';
  type Value = boolean | string;

  interface Period {
    start: string;
    end: string;
    properties?: string[] | string;
  }
}
