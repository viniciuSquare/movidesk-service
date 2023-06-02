export class ToolsKit {
    static groupBy = (key: any) => (array: any) =>
        array.reduce(
            (objectsByKeyValue: { [x: string]: any; }, obj: { [x: string]: string | number; }) => ({
                ...objectsByKeyValue,
                [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
            }),
            {}
        );

    static replaceAccents(string: string) {
        // Define a regular expression to match accents
        const regexAccentCases = [
            {
                regexAccents: /[áàãâäã]/gi,
                replacer: 'a'
            },
            {
                regexAccents: /[óóôòõ]/gi,
                replacer: 'o'
            },
            {
                regexAccents: /[ç]/gi,
                replacer: 'c'
            },
        ]

        // Replace the accents with their equivalent letters
        regexAccentCases.forEach(({ regexAccents, replacer }) => {

            string = string.replace(regexAccents, replacer);
        });

        return string;
    }
}