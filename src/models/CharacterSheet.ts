import type { IAttributeDefinition, IGameData } from "./GameData";
import { FormulaSpan } from "./Formula";
import * as Scan from "./FormulaScan";
import * as Parse from "./FormulaParse";
import * as Evaluate from "./FormulaEvaluate";

export interface IStat
{
    id: string;
    getValue(): number;
}

/**
 * A stat that can be upgraded by adding (and possible removing) upgrade points.
 */
export class UpgradableStat implements IStat
{
    id: string;

    /**
     * How many levels this stat has been upgraded.
     */
    public upgradeLevel: number = 0;

    /**
     * How many points have been added towards the next level. Resets to zero on level up.
     */
    public upgradePoints: number = 0;

    /**
     * How many points are required to upgrade to each level.
     * 
     * Also implies how many levels this stat can be upgraded.
     */
    public readonly levelUpPoints: number[];

    public constructor(id: string, levelUpPoints: number[])
    {
        this.id = id;
        this.levelUpPoints = levelUpPoints;
    }

    public tryAddUpgradePoint()
    {
        if (this.upgradeLevel < this.levelUpPoints.length)
        {
            this.upgradePoints += 1;

            if (this.upgradePoints >= this.levelUpPoints[this.upgradeLevel])
            {
                this.upgradeLevel += 1;
                this.upgradePoints = 0;
            }
        }
    }

    public tryRemoveUpgradePoint()
    {
        if (this.upgradePoints > 0)
        {
            this.upgradePoints -= 1;
        }
        else if (this.upgradeLevel > 0)
        {
            this.upgradeLevel -= 1;
            this.upgradePoints = this.levelUpPoints[this.upgradeLevel] - 1;
        }
    }

    public getValue(): number
    {
        return this.upgradeLevel;
    }
}

export class CharacterSkill extends UpgradableStat
{
    public readonly parentAttribute: CharacterAttribute;

    public constructor(id: string, levelUpPoints: number[], parentAttribute: CharacterAttribute)
    {
        super(id, levelUpPoints);

        this.parentAttribute = parentAttribute;
    }

    public getValue(): number
    {
        return super.getValue() + this.parentAttribute.getValue();
    }
}

export class CharacterAttribute extends UpgradableStat
{
    public skills = new Map<string, CharacterSkill>();

    public constructor(id: string, levelUpPoints: number[])
    {
        super(id, levelUpPoints);
    }
}

export class DerivedStat implements IStat
{
    public readonly id: string;
    public readonly formula: string;
    private readonly character: CharacterSheet;
    private readonly gameData: IGameData;
    private readonly rootTerm: Parse.FormulaTerm;

    public constructor(id: string, formula: string, character: CharacterSheet, gameData: IGameData)
    {
        this.id = id;
        this.formula = formula;
        this.character = character;
        this.gameData = gameData;
        this.rootTerm = Parse.parseFormula(formula, Scan.scanFormula(formula)) ?? new Parse.FormulaLiteralTerm(new Scan.FormulaIntegerToken(new FormulaSpan(0, 1), 0), "0");
    }

    public getValue(): number
    {
        const result = Evaluate.evaluateTerm(this.rootTerm, new Evaluate.FormulaEvaluationContext(this.character, this.gameData));

        if (result.details.success)
        {
            return result.details.value;
        }
        else
        {
            return 0;
        }
    }
}

export class StatisticModification
{
    readonly displayName: string;
    readonly displayFormula: string;
    readonly amount: number;

    constructor(displayName: string, displayFormula: string, amount: number)
    {
        this.displayName = displayName;
        this.displayFormula = displayFormula;
        this.amount = amount;
    }
}

export class StatisticEvaluation
{
    readonly baseValue: number;
    readonly modifications: StatisticModification[];
    readonly finalValue: number;

    constructor(baseValue: number, modifications: StatisticModification[])
    {
        this.baseValue = baseValue;
        this.modifications = modifications;
        this.finalValue = baseValue;

        for (var i = 0; i < modifications.length; i++)
        {
            this.finalValue += this.modifications[i].amount;
        }
    }
}

export default class CharacterSheet
{
    //
    // Identity
    //
    name = "";
    pronouns = "";
    powerId = "";
    level = 0;
    age = 18;

    wealthWeekly = 0;
    wealthRemaining = 0;

    //
    // Attributes & Skills
    //
    attributes = new Map<string, CharacterAttribute>();
    skills = new Map<string, CharacterSkill>();
    stats = new Map<string, IStat>();

    //
    // Derived Statistics
    //
    // (nothing to store)

    //
    // Items & Gear
    //
    // TODO: Implement!

    //
    // Assets & Access
    //
    // TODO: Implement!

    //
    // Stress Track
    //
    // TODO: Implement!

    //
    // Strain Effects
    //
    // TODO: Implement!

    //
    // Fear
    //
    // TODO: Implement!

    // TODO: SECOND PAGE
    

    public constructor(gameData: IGameData)
    {
        // Create attributes based on the game data
        for (var i = 0; i < gameData.attributeGroups.length; i++)
        {
            const attributeGroup = gameData.attributeGroups[i];
            for (const attributeId in attributeGroup.attributes)
            {
                const attributeIdUpper = attributeId.toUpperCase();
                const attribute = new CharacterAttribute(attributeIdUpper, gameData.attributeLevelUpPoints);

                // Create child skills based on the game data
                for (const skillId in attributeGroup.attributes[attributeIdUpper].skills)
                {
                    const skillIdUpper = skillId.toUpperCase();
                    const skill = new CharacterSkill(skillIdUpper, gameData.skillLevelUpPoints, attribute);
                    attribute.skills.set(skillIdUpper, skill);
                    this.stats.set(skillIdUpper, skill);
                }

                this.attributes.set(attributeIdUpper, attribute);
                this.stats.set(attributeIdUpper, attribute);
            }
        }

        for (const statId in gameData.derivedStatistics)
        {
            const statIdUpper = statId.toUpperCase();
            const stat = new DerivedStat(statIdUpper, gameData.derivedStatistics[statId].formula, this, gameData);
            this.stats.set(statIdUpper, stat);
        }
    }


    public getStatistic(id: string): IStat | undefined
    {
        return this.stats.get(id.toUpperCase());
    }

    public evaluateStatistic(id: string): StatisticEvaluation
    {
        const stat = this.getStatistic(id);

        if (stat !== undefined)
        {
            // TODO: Get base value
            const baseValue = stat.getValue();

            // TODO: Apply any modifiers
            const modifications: StatisticModification[] = [];

            return new StatisticEvaluation(baseValue, modifications);
        }
        else
        {
            return new StatisticEvaluation(0, []);
        }
    }

    public evaluateFormula(formula: string)
    {
        
    }
}