
import { FormulaSpan } from "./Formula";

export enum FormulaTokenType
{
    name,
    integer,
    diceRoll, // #d#, e.g. 2d20, 132d841
    leftParenthesis,
    rightParenthesis,
    plus,
    hyphen,
    asterisk,
    slash,
}

export class FormulaToken
{
    public readonly span: FormulaSpan;
    public readonly type: FormulaTokenType;

    public constructor(span: FormulaSpan, type: FormulaTokenType)
    {
        this.span = span;
        this.type = type;
    }
}

export class FormulaDieRollToken extends FormulaToken
{
    public readonly dieCount: number;
    public readonly dieSides: number;

    public constructor(span: FormulaSpan, dieCount: number, dieSides: number)
    {
        super(span, FormulaTokenType.diceRoll);
        this.dieCount = dieCount;
        this.dieSides = dieSides;
    }
}

export class FormulaIntegerToken extends FormulaToken
{
    public readonly value: number;

    public constructor(span: FormulaSpan, value: number)
    {
        super(span, FormulaTokenType.integer);

        this.value = value;
    }
}

export class FormulaNameToken extends FormulaToken
{
    public readonly name: string;

    public constructor(span: FormulaSpan, name: string)
    {
        super(span, FormulaTokenType.name);

        this.name = name;
    }
}

/**
 * Separates the given formula string into individual tokens.
 * 
 * @param formula The formula to scan.
 */
export function scanFormula(formula: string): FormulaToken[]
{
    const result = new Array<FormulaToken>();

    // Based on Crafting Interpreters

    let startIndex = 0;
    let currentIndex = 0;

    function makeBasicToken(tokenType: FormulaTokenType): FormulaToken
    {
        return new FormulaToken(new FormulaSpan(startIndex, currentIndex - startIndex), tokenType);
    }

    function isDigit(character: string): boolean
    {
        const charCode = character.charCodeAt(0);
        return charCode >= '0'.charCodeAt(0) && charCode <= '9'.charCodeAt(0);
    }

    function isLetter(character: string): boolean
    {
        const charCode = character.charCodeAt(0);
        const lowercaseCharCode = charCode | 0x20; // Setting the 0x20 bit transforms any uppercase ASCII letters to lowercase
        return lowercaseCharCode >= 'a'.charCodeAt(0) && lowercaseCharCode <= 'z'.charCodeAt(0);
    }

    function readInteger(): number
    {
        while (currentIndex < formula.length && isDigit(formula[currentIndex]))
        {
            currentIndex += 1;
        }

        return Number.parseInt(formula.substring(startIndex, currentIndex));
    }

    while (currentIndex < formula.length)
    {
        const character = formula[currentIndex];

        currentIndex += 1;

        if (character == ' ')
        {

        }
        if (character == '(')
        {
            result.push(makeBasicToken(FormulaTokenType.leftParenthesis));
        }
        else if (character == ')')
        {
            result.push(makeBasicToken(FormulaTokenType.rightParenthesis));
        }
        else if (character == '+')
        {
            result.push(makeBasicToken(FormulaTokenType.plus));
        }
        else if (character == '-')
        {
            result.push(makeBasicToken(FormulaTokenType.hyphen));
        }
        else if (character == '*')
        {
            result.push(makeBasicToken(FormulaTokenType.asterisk));
        }
        else if (character == '/' || character == '\\')
        {
            result.push(makeBasicToken(FormulaTokenType.slash));
        }
        else if (isDigit(character))
        {
            // Could be an integer or a dice roll
            const firstNumber = readInteger();

            // Check for a 'd' character and a following digit
            if (currentIndex < formula.length - 1
                && formula[currentIndex] == 'd'
                && isDigit(formula[currentIndex + 1]))
            {
                currentIndex += 1; // Consume the 'd' and move the second number
                const originalStartIndex = startIndex;
                startIndex = currentIndex;
                const secondNumber = readInteger();

                result.push(new FormulaDieRollToken(new FormulaSpan(originalStartIndex, currentIndex - originalStartIndex), firstNumber, secondNumber));
            }
            else
            {
                result.push(new FormulaIntegerToken(new FormulaSpan(startIndex, currentIndex - startIndex), firstNumber));
            }
        }
        else if (isLetter(character))
        {
            // Advance until we are no longer on a letter
            while (currentIndex < formula.length && isLetter(formula[currentIndex]))
            {
                currentIndex++;
            }

            const span = new FormulaSpan(startIndex, currentIndex - startIndex);
            result.push(new FormulaNameToken(span, span.getSource(formula)));
        }

        startIndex = currentIndex;
    }

    return result;
}