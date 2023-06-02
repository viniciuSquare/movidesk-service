interface ResourceMetricsRange {
    dataOutputRanges: string,
    weekMetricsStartRange: string,
    weekFormulaSample: string
}
interface MetricsReportProps {
    sourceRange: string,
    resourceMetricsRanges: {
        cpu: ResourceMetricsRange,
        memory: ResourceMetricsRange
    },
    instancesQuantity: number
}

export interface OutputMetricsReportProps {
    application: MetricsReportProps,
    database: MetricsReportProps
}

export abstract class OutputReport {
    protected product: "PRO" | "PLUS";

    abstract outputReportProperties: OutputMetricsReportProps

    // Determine sheets columns size
    abstract weeksReportSheetRange: string[][];

    protected weekReportSheet = "Semanas";
    protected monthReportSheet = "Mês";

    constructor(product: "PRO" | "PLUS") {
        this.product = product;

    }

    setWeeksReportsSheetRanges() {
        if (this.product == 'PLUS') {

        }
    }

    // TODO - Period to generate sheets name
    sheetsNamesFromPeriod() {

    }

    getWeekMetricsFormulaBy(weeks: string[][]) {
        // For each day in the week, get the cpu and memory formulas
        // weekFormulaSample `=IFERROR(AVERAGE('01-02-2023'!C17;'02-02-2023'!C17;'03-02-2023'!C17);"-")`
        return weeks.map((weekdays) => {
            const formulaBase = `=IFERROR(AVERAGE();"-")`;
            const database_cpu = weekdays.map((day, index) => {
                return `'${day.split("/").join("-")}'!${this.outputReportProperties.database.resourceMetricsRanges.cpu.weekMetricsStartRange.split(':')[0]}${index + 1 == weekdays.length ? "" : ";"}`;
            }).join("");

            const database_memory = weekdays.map((day, index) => {
                return `'${day.split("/").join("-")}'!${this.outputReportProperties.database.resourceMetricsRanges.memory.weekMetricsStartRange.split(':')[0]}${index + 1 == weekdays.length ? "" : ";"}`;
            }).join("");

            const application_cpu = weekdays.map((day, index) => {
                return `'${day.split("/").join("-")}'!${this.outputReportProperties.application.resourceMetricsRanges.cpu.weekMetricsStartRange.split(':')[0]}${index + 1 == weekdays.length ? "" : ";"}`;
            }).join("");

            const application_memory = weekdays.map((day, index) => {
                return `'${day.split("/").join("-")}'!${this.outputReportProperties.application.resourceMetricsRanges.memory.weekMetricsStartRange.split(':')[0]}${index + 1 == weekdays.length ? "" : ";"}`;
            }).join("");

            return {
                database_cpu: formulaBase.replace(
                    "AVERAGE()",
                    `AVERAGE(${database_cpu})`
                ),
                database_memory: formulaBase.replace(
                    "AVERAGE()",
                    `AVERAGE(${database_memory})`
                ),
                application_cpu: formulaBase.replace(
                    "AVERAGE()",
                    `AVERAGE(${application_cpu})`
                ),
                application_memory: formulaBase.replace(
                    "AVERAGE()",
                    `AVERAGE(${application_memory})`
                ),
            };
        });
    };

    dayAverageFunctions(startCell: string) {
        startCell = 'C4';

        return {
            normal: '=IFERROR((SUMIF(C8:C10;"<>0")+SUMIF(C4;"<>0"))/(COUNTIF(C8:C10;"<>0")+COUNTIF(C4;"<>0"));"-")',
            peak: '=IFERROR((SUMIF(C11:C13;"<>0")+SUMIF(C5:C7;"<>0"))/(COUNTIF(C11:C13;"<>0")+COUNTIF(C5:C7;"<>0"));"-")',
            night: '=IFERROR(SUMIF(C14:C17;"<>0")/COUNTIF(C14:C17;"<>0");"-")',
            day: '=IFERROR(SUMIF(C4:C17;"<>0")/COUNTIF(C4:C17;"<>0");"-")',
        }
    }
}