
/**
 * A subrange of a formula defined as the index of the start character and the number of characters.
 */
export class FormulaSpan
{
    public readonly startIndex: number;
    public readonly length: number;

    public constructor(startIndex: number, length: number)
    {
        this.startIndex = startIndex;
        this.length = length;
    }

    /**
     * Creates a FormulaSpan that contains both this span and the given other span.
     * @param other 
     * @returns 
     */
    public combine(other: FormulaSpan): FormulaSpan
    {
        const minStart = Math.min(this.startIndex, other.startIndex);
        const maxEnd = Math.max(this.startIndex + this.length, other.startIndex + other.length);
        return new FormulaSpan(minStart, maxEnd - minStart);
    }

    /**
     * Gets the portion of the given formula that this span refers to.
     * @param formula 
     * @returns 
     */
    public getSource(formula: string): string
    {
        return formula.substring(this.startIndex, this.startIndex + this.length);
    }
}

export enum FormulaDiagnosticLevel
{
    Warning,
    /**
     * Messages with this level indicate user error that prevent the operation from proceeding.
     */
    UserError,
    /**
     * Messages with this level indicate a programming defect.
     */
    Catastrophic,
}

export class FormulaDiagnosticMessage
{
    public readonly span: FormulaSpan;
    public readonly text: string;
    public readonly level: FormulaDiagnosticLevel;

    public constructor(span: FormulaSpan, text: string, level: FormulaDiagnosticLevel)
    {
        this.span = span;
        this.text = text;
        this.level = level;
    }
}
