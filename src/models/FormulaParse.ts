
import { FormulaSpan, FormulaDiagnosticMessage, FormulaDiagnosticLevel } from "./Formula";
import * as Scan from './FormulaScan';

/**
 * An interface implemented by things that can operate on all types of formula terms.
 */
export interface IFormulaTermVisitor<TParam, TResult>
{
    visitLiteralTerm(term: FormulaLiteralTerm, param: TParam): TResult;
    visitDieRollTerm(term: FormulaDieRollTerm, param: TParam): TResult;
    visitStatTerm(term: FormulaStatTerm, param: TParam): TResult;
    visitUnaryTerm(term: FormulaUnaryTerm, param: TParam): TResult;
    visitBinaryTerm(term: FormulaBinaryTerm, param: TParam): TResult;
}

export abstract class FormulaTerm
{
    public readonly span: FormulaSpan;
    public readonly source: string;

    public constructor(span: FormulaSpan, formula: string)
    {
        this.span = span;
        this.source = span.getSource(formula);
    }

    public abstract visit<TParam, TResult>(visitor: IFormulaTermVisitor<TParam, TResult>, param: TParam): TResult;
}

export class FormulaLiteralTerm extends FormulaTerm
{
    public readonly value: number;

    public constructor(token: Scan.FormulaIntegerToken, formula: string)
    {
        super(token.span, formula);

        this.value = token.value;
    }

    public visit<TParam, TResult>(visitor: IFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitLiteralTerm(this, param);
    }
}

export class FormulaDieRollTerm extends FormulaTerm
{
    public readonly dieCount: number;
    public readonly dieSides: number;

    public constructor(token: Scan.FormulaDieRollToken, formula: string)
    {
        super(token.span, formula);

        this.dieCount = token.dieCount;
        this.dieSides = token.dieSides;
    }

    public visit<TParam, TResult>(visitor: IFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitDieRollTerm(this, param);
    }
}

export class FormulaStatTerm extends FormulaTerm
{
    public readonly statId: string;

    public constructor(token: Scan.FormulaNameToken, formula: string)
    {
        super(token.span, formula);

        this.statId = token.name;
    }

    public visit<TParam, TResult>(visitor: IFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitStatTerm(this, param);
    }
}

export class FormulaUnaryTerm extends FormulaTerm
{
    public readonly operator: Scan.FormulaToken;
    public readonly operand: FormulaTerm;

    public constructor(operatorToken: Scan.FormulaToken, formula: string, operand: FormulaTerm)
    {
        super(operatorToken.span.combine(operand.span), formula);

        this.operator = operatorToken;
        this.operand = operand;
    }

    public getOperatorSource(): string
    {
        const spanRelativeToTerm = new FormulaSpan(this.operator.span.startIndex - this.span.startIndex, this.operator.span.length);
        return spanRelativeToTerm.getSource(this.source);
    }

    public visit<TParam, TResult>(visitor: IFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitUnaryTerm(this, param);
    }
}

export class FormulaBinaryTerm extends FormulaTerm
{
    public readonly operator: Scan.FormulaToken;
    public readonly firstOperand: FormulaTerm;
    public readonly secondOperand: FormulaTerm;

    public constructor(operatorToken: Scan.FormulaToken, formula: string, firstOperand: FormulaTerm, secondOperand: FormulaTerm)
    {
        super(firstOperand.span.combine(secondOperand.span), formula);

        this.operator = operatorToken;
        this.firstOperand = firstOperand;
        this.secondOperand = secondOperand;
    }

    public getOperatorSource(): string
    {
        const spanRelativeToTerm = new FormulaSpan(this.operator.span.startIndex - this.span.startIndex, this.operator.span.length);
        return spanRelativeToTerm.getSource(this.source);
    }

    public visit<TParam, TResult>(visitor: IFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitBinaryTerm(this, param);
    }
}

/**
 * Parses the given scanned formula to a formula term tree.
 * 
 * @param formula 
 * @param tokens 
 */
export function parseFormula(formula: string, tokens: Scan.FormulaToken[]): FormulaTerm | undefined
{
    let tokenIndex = 0;

    function parseInnerTerm(): FormulaTerm | undefined
    {
        const startToken = tokens[tokenIndex];
        tokenIndex += 1;
        if (startToken.type == Scan.FormulaTokenType.leftParenthesis)
        {
            // TODO: Get the correct span (including start and end parenthesis)

            const innerTerm = parseTerm();

            tokenIndex += 1; // Skip close parenthesis

            return innerTerm;
        }
        else if (startToken.type == Scan.FormulaTokenType.diceRoll)
        {
            return new FormulaDieRollTerm(startToken as Scan.FormulaDieRollToken, formula);
        }
        else if (startToken.type == Scan.FormulaTokenType.name)
        {
            return new FormulaStatTerm(startToken as Scan.FormulaNameToken, formula);
        }
        else if (startToken.type == Scan.FormulaTokenType.integer)
        {
            return new FormulaLiteralTerm(startToken as Scan.FormulaIntegerToken, formula);
        }
        else
        {
            // Error: WTF is this token?
            return undefined;
        }
    }

    function parseNegateTerm(): FormulaTerm | undefined
    {
        if (tokens[tokenIndex].type == Scan.FormulaTokenType.hyphen)
        {
            const operatorToken = tokens[tokenIndex];
            tokenIndex += 1;
            const operandTerm = parseInnerTerm();

            if (operandTerm !== undefined)
            {
                return new FormulaUnaryTerm(operatorToken, formula, operandTerm);
            }
            else
            {
                // ERROR: ???
                return undefined;
            }
        }
        else
        {
            return parseInnerTerm();
        }
    }

    function parseMultiplyDivideTerm(): FormulaTerm | undefined
    {
        let result = parseNegateTerm();

        if (result !== undefined)
        {
            while (tokenIndex < tokens.length && (tokens[tokenIndex].type == Scan.FormulaTokenType.asterisk || tokens[tokenIndex].type == Scan.FormulaTokenType.slash))
            {
                const operatorToken = tokens[tokenIndex];
                tokenIndex += 1;

                const nextTerm = parseNegateTerm();

                if (nextTerm !== undefined)
                {
                    result = new FormulaBinaryTerm(operatorToken, formula, result, nextTerm);
                }
                else
                {
                    // Error: ???
                    break;
                }
            }
        }

        return result;
    }

    function parseAddSubtractTerm(): FormulaTerm | undefined
    {
        let result = parseMultiplyDivideTerm();

        if (result !== undefined)
        {
            while (tokenIndex < tokens.length && (tokens[tokenIndex].type == Scan.FormulaTokenType.plus || tokens[tokenIndex].type == Scan.FormulaTokenType.hyphen))
            {
                const operatorToken = tokens[tokenIndex];
                tokenIndex += 1;
                
                const nextTerm = parseMultiplyDivideTerm();

                if (nextTerm !== undefined)
                {
                    result = new FormulaBinaryTerm(operatorToken, formula, result, nextTerm);
                }
                else
                {
                    // Error: ???
                    break;
                }
            }
        }

        return result;
    }

    // Alias for parsing the lowest precedence term
    const parseTerm = parseAddSubtractTerm;

    return parseTerm();
}
