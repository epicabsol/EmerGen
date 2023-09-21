
import type CharacterSheet from "./CharacterSheet";
import type { IGameData } from "./GameData";
import { FormulaSpan, FormulaDiagnosticMessage, FormulaDiagnosticLevel } from "./Formula";
import * as Scan from "./FormulaScan";
import * as Parse from "./FormulaParse";

/**
 * An interface implemented by things that can operate on all types of evaluated formula terms.
 */
export interface IEvaluatedFormulaTermVisitor<TParam, TResult>
{
    visitOtherTerm(term: EvaluatedFormulaTerm, param: TParam): TResult;
    visitDieRollTerm(term: EvaluatedFormulaDieRollTerm, param: TParam): TResult;
    visitStatTerm(term: EvaluatedFormulaStatTerm, param: TParam): TResult;
    visitUnaryTerm(term: EvaluatedFormulaUnaryTerm, param: TParam): TResult;
    visitBinaryTerm(term: EvaluatedFormulaBinaryTerm, param: TParam): TResult;
}

export class FormulaEvaluationContext
{
    public readonly character: CharacterSheet;
    public readonly gameData: IGameData;

    public constructor(character: CharacterSheet, gameData: IGameData)
    {
        this.character = character;
        this.gameData = gameData;
    }

    public rollDie(sides: number): number
    {
        return Math.floor(Math.random() * sides) + 1;
    }
}

export class FormulaEvaluationSuccess
{
    public readonly success: true;
    public readonly rootTerm: EvaluatedFormulaTerm;
    public readonly value: number;

    public constructor(rootTerm: EvaluatedFormulaTerm)
    {
        this.success = true;
        this.rootTerm = rootTerm;
        this.value = rootTerm.value;
    }
}

export class FormulaEvaluationFailure
{
    public readonly success: false;

    public constructor()
    {
        this.success = false;
    }
}

export class FormulaEvaluationResult
{
    public readonly formula: string;
    public readonly details: FormulaEvaluationSuccess | FormulaEvaluationFailure;
    public readonly messages: FormulaDiagnosticMessage[];

    public constructor(formula: string, details: FormulaEvaluationSuccess | FormulaEvaluationFailure, messages: FormulaDiagnosticMessage[])
    {
        this.formula = formula;
        this.details = details;
        this.messages = messages;
    }
}

export class EvaluatedFormulaTerm
{
    public readonly sourceTerm: Parse.FormulaTerm;
    public readonly value: number;

    public constructor(sourceTerm: Parse.FormulaTerm, value: number)
    {
        this.sourceTerm = sourceTerm;
        this.value = value;
    }

    public visit<TParam, TResult>(visitor: IEvaluatedFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitOtherTerm(this, param);
    }
}

export class EvaluatedFormulaDieRollTerm extends EvaluatedFormulaTerm
{
    public readonly diceValues: number[];
    public readonly dieCount: number;
    public readonly dieSides: number;

    public constructor(sourceTerm: Parse.FormulaDieRollTerm, diceValues: number[])
    {
        let value = 0;
        for (var i = 0; i < diceValues.length; i++)
        {
            value += diceValues[i];
        }

        super(sourceTerm, value);

        this.diceValues = diceValues;
        this.dieCount = sourceTerm.dieCount;
        this.dieSides = sourceTerm.dieSides;
    }

    public visit<TParam, TResult>(visitor: IEvaluatedFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitDieRollTerm(this, param);
    }
}

export class EvaluatedFormulaStatTerm extends EvaluatedFormulaTerm
{
    public readonly resolvedStatId: string | null;

    public constructor(sourceTerm: Parse.FormulaStatTerm, resolvedStatId: string | null, statValue: number)
    {
        super(sourceTerm, statValue);

        this.resolvedStatId = resolvedStatId;
    }

    public visit<TParam, TResult>(visitor: IEvaluatedFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitStatTerm(this, param);
    }
}

export class EvaluatedFormulaUnaryTerm extends EvaluatedFormulaTerm
{
    public readonly operator: Scan.FormulaToken;
    public readonly operandTerm: EvaluatedFormulaTerm;

    public constructor(sourceTerm: Parse.FormulaUnaryTerm, value: number, operandTerm: EvaluatedFormulaTerm)
    {
        super(sourceTerm, value);

        this.operator = sourceTerm.operator;
        this.operandTerm = operandTerm;
    }

    public visit<TParam, TResult>(visitor: IEvaluatedFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitUnaryTerm(this, param);
    }
}

export class EvaluatedFormulaBinaryTerm extends EvaluatedFormulaTerm
{
    public readonly operator: Scan.FormulaToken;
    public readonly firstOperand: EvaluatedFormulaTerm;
    public readonly secondOperand: EvaluatedFormulaTerm;

    public constructor(sourceTerm: Parse.FormulaBinaryTerm, value: number, firstOperand: EvaluatedFormulaTerm, secondOperand: EvaluatedFormulaTerm)
    {
        super(sourceTerm, value);

        this.operator = sourceTerm.operator;
        this.firstOperand = firstOperand;
        this.secondOperand = secondOperand;
    }

    public visit<TParam, TResult>(visitor: IEvaluatedFormulaTermVisitor<TParam, TResult>, param: TParam): TResult
    {
        return visitor.visitBinaryTerm(this, param);
    }
}


export function evaluateFormula(formula: string, context: FormulaEvaluationContext): FormulaEvaluationResult
{
    const tokens = Scan.scanFormula(formula);
    const rootTerm = Parse.parseFormula(formula, tokens);

    if (rootTerm !== undefined)
    {
        function visitLiteralTerm(term: Parse.FormulaLiteralTerm, param: never): EvaluatedFormulaTerm
        {
            return new EvaluatedFormulaTerm(term, term.value);
        }

        function visitDieRollTerm(term: Parse.FormulaDieRollTerm, param: never): EvaluatedFormulaTerm
        {
            const rolls = new Array<number>();
            for (let i = 0; i < term.dieCount; i++)
            {
                rolls.push(context.rollDie(term.dieSides));
            }

            return new EvaluatedFormulaDieRollTerm(term, rolls);
        }

        function visitStatTerm(term: Parse.FormulaStatTerm, param: never): EvaluatedFormulaTerm
        {
            const stat = context.character.getStatistic(term.statId);
            if (stat !== undefined)
            {
                return new EvaluatedFormulaStatTerm(term, stat.id, context.character.evaluateStatistic(term.statId).finalValue);
            }
            else
            {
                return new EvaluatedFormulaStatTerm(term, null, 0);
            }
        }

        function visitUnaryTerm(term: Parse.FormulaUnaryTerm, param: never): EvaluatedFormulaTerm
        {
            const evaluatedOperand = visitTerm(term.operand);

            switch (term.operator.type)
            {
                case Scan.FormulaTokenType.hyphen:
                    return new EvaluatedFormulaUnaryTerm(term, evaluatedOperand.value * -1, evaluatedOperand);
                default:
                    // ERROR: WTF??
                    return evaluatedOperand;
            }
        }

        function visitBinaryTerm(term: Parse.FormulaBinaryTerm, param: never): EvaluatedFormulaTerm
        {
            const evaluatedFirstOperand = visitTerm(term.firstOperand);
            const evaluatedSecondOperand = visitTerm(term.secondOperand);

            switch (term.operator.type)
            {
                case Scan.FormulaTokenType.plus:
                    return new EvaluatedFormulaBinaryTerm(term, evaluatedFirstOperand.value + evaluatedSecondOperand.value, evaluatedFirstOperand, evaluatedSecondOperand);
                case Scan.FormulaTokenType.hyphen:
                    return new EvaluatedFormulaBinaryTerm(term, evaluatedFirstOperand.value - evaluatedSecondOperand.value, evaluatedFirstOperand, evaluatedSecondOperand);
                case Scan.FormulaTokenType.asterisk:
                    return new EvaluatedFormulaBinaryTerm(term, evaluatedFirstOperand.value * evaluatedSecondOperand.value, evaluatedFirstOperand, evaluatedSecondOperand);
                case Scan.FormulaTokenType.slash:
                    return new EvaluatedFormulaBinaryTerm(term, evaluatedFirstOperand.value / evaluatedSecondOperand.value, evaluatedFirstOperand, evaluatedSecondOperand);
                default:
                    // ERROR: WTF??
                    return new EvaluatedFormulaTerm(term, evaluatedFirstOperand.value);
            }
        }

        function visitTerm(term: Parse.FormulaTerm): EvaluatedFormulaTerm
        {
            return term.visit({ visitLiteralTerm, visitDieRollTerm, visitStatTerm, visitUnaryTerm, visitBinaryTerm }, null);
        }

        const evaluatedRootTerm = visitTerm(rootTerm);

        return new FormulaEvaluationResult(formula, new FormulaEvaluationSuccess(evaluatedRootTerm), []);
    }
    else
    {
        return new FormulaEvaluationResult(formula, new FormulaEvaluationFailure(), []);
    }
}
