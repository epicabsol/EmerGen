import type { IAttributeDefinition, IGameData } from "./GameData";
import { FormulaSpan } from "./Formula";
import * as Scan from "./FormulaScan";
import * as Parse from "./FormulaParse";
import * as Evaluate from "./FormulaEvaluate";
import * as Check from "./SkillCheck";

export type PropertyChangeHandler<TValue> = (oldValue: TValue, newValue: TValue) => void;
export type ChangeHandler = () => void;

export class Event<T extends ((...args: any[]) => void)>
{
    public handlers = new Array<T>();

    public addHandler(handler: T)
    {
        this.handlers.push(handler);
    }

    public removeHandler(handler: T)
    {
        const index = this.handlers.indexOf(handler);
        if (index >= 0)
        {
            this.handlers.splice(index, 1);
        }
    }

    public invoke(...args: Parameters<T>)
    {
        for (let i = 0; i < this.handlers.length; i++)
        {
            this.handlers[i](args);
        }
    }
}

export interface IStat
{
    id: string;
    getValue(): number;

    readonly displayName: string;
    readonly displayDescription: string;
}

/**
 * A stat that can be upgraded by adding (and possibly removing) upgrade points.
 */
export class UpgradableStat implements IStat
{
    public upgradeLevelChanged = new Event<PropertyChangeHandler<number>>();
    public upgradePointsChanged = new Event<PropertyChangeHandler<number>>();

    public readonly id: string;
    public readonly displayName: string;
    public readonly displayDescription: string;

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

    public constructor(id: string, levelUpPoints: number[], displayName: string, displayDescription: string)
    {
        this.id = id;
        this.levelUpPoints = levelUpPoints;
        this.displayName = displayName;
        this.displayDescription = displayDescription;
    }

    public tryAddUpgradePoint()
    {
        if (this.upgradeLevel < this.levelUpPoints.length)
        {
            const oldUpgradePoints = this.upgradePoints;
            this.upgradePoints += 1;

            if (this.upgradePoints >= this.levelUpPoints[this.upgradeLevel])
            {
                this.upgradeLevel += 1;
                this.upgradePoints = 0;

                this.upgradeLevelChanged.invoke(this.upgradeLevel - 1, this.upgradeLevel);
            }
            this.upgradePointsChanged.invoke(oldUpgradePoints, this.upgradePoints);
        }
    }

    public tryRemoveUpgradePoint()
    {
        const oldUpgradePoints = this.upgradePoints;
        if (this.upgradePoints > 0)
        {
            this.upgradePoints -= 1;
        }
        else if (this.upgradeLevel > 0)
        {
            this.upgradeLevel -= 1;
            this.upgradePoints = this.levelUpPoints[this.upgradeLevel] - 1;

            this.upgradeLevelChanged.invoke(this.upgradeLevel + 1, this.upgradeLevel);
        }

        this.upgradePointsChanged.invoke(oldUpgradePoints, this.upgradePoints);
    }

    public getValue(): number
    {
        return this.upgradeLevel;
    }
}

export class CharacterSkill extends UpgradableStat
{
    public readonly parentAttribute: CharacterAttribute;

    public constructor(id: string, levelUpPoints: number[], displayName: string, displayDescription: string, parentAttribute: CharacterAttribute)
    {
        super(id, levelUpPoints, displayName, displayDescription);

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

    public constructor(id: string, levelUpPoints: number[], displayName: string, displayDescription: string)
    {
        super(id, levelUpPoints, displayName, displayDescription);
    }
}

/**
 * A stat whose value is derived from the value of other stats.
 */
export class DerivedStat implements IStat
{
    public readonly id: string;
    public readonly formula: string;
    public readonly displayName: string;
    public readonly displayDescription: string;
    private readonly character: CharacterSheet;
    private readonly gameData: IGameData;
    private readonly rootTerm: Parse.FormulaTerm;

    public constructor(id: string, formula: string, displayName: string, displayDescription: string, character: CharacterSheet, gameData: IGameData)
    {
        this.id = id;
        this.formula = formula;
        this.displayName = displayName;
        this.displayDescription = displayDescription;
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


//
// 'Persisted' interfaces that define the JSON format for serialized character sheets
//

interface IPersistedCharacterSheet
{
    readonly name: string;
    readonly pronouns: string;
    readonly powerId: string;
    readonly level: number;
    readonly age: number;
    readonly wealthWeekly: number;
    readonly wealthRemaining: number;

    readonly attributes: { [id: string]: IPersistedCharacterStat };
    readonly skills: { [id: string]: IPersistedCharacterStat };
}

interface IPersistedCharacterStat
{
    readonly upgradeLevel: number;
    readonly upgradePoints: number;
}

export default class CharacterSheet
{
    public anyValueChanged = new Event<ChangeHandler>();
    public evaluationContext: Evaluate.FormulaEvaluationContext;

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
                const attributeData = attributeGroup.attributes[attributeId];
                const attributeIdUpper = attributeId.toUpperCase();
                const attribute = new CharacterAttribute(attributeIdUpper, gameData.attributeLevelUpPoints, attributeData.displayName, attributeData.displayDescription);
                attribute.upgradeLevelChanged.addHandler(() => this.onPropertyChanged());
                attribute.upgradePointsChanged.addHandler(() => this.onPropertyChanged());

                // Create child skills based on the game data
                for (const skillId in attributeData.skills)
                {
                    const skillData = attributeData.skills[skillId];
                    const skillIdUpper = skillId.toUpperCase();
                    const skill = new CharacterSkill(skillIdUpper, gameData.skillLevelUpPoints, skillData.displayName, skillData.displayDescription, attribute);
                    skill.upgradeLevelChanged.addHandler(() => this.onPropertyChanged());
                    skill.upgradePointsChanged.addHandler(() => this.onPropertyChanged());

                    attribute.skills.set(skillIdUpper, skill);
                    this.skills.set(skillIdUpper, skill);
                    this.stats.set(skillIdUpper, skill);
                }

                this.attributes.set(attributeIdUpper, attribute);
                this.stats.set(attributeIdUpper, attribute);
            }
        }

        for (const statId in gameData.derivedStatistics)
        {
            const statData = gameData.derivedStatistics[statId];
            const statIdUpper = statId.toUpperCase();
            const stat = new DerivedStat(statIdUpper, statData.formula, statData.displayName, statData.displayDescription, this, gameData);
            this.stats.set(statIdUpper, stat);
        }

        this.evaluationContext = new Evaluate.FormulaEvaluationContext(this, gameData);
    }

    public serialize(): string
    {
        const attributes: { [id: string]: IPersistedCharacterStat } = { };
        for (const attribute of this.attributes.values())
        {
            attributes[attribute.id] =
            {
                upgradeLevel: attribute.upgradeLevel,
                upgradePoints: attribute.upgradePoints,
            };
        }

        const skills: { [id: string]: IPersistedCharacterStat } = { };
        for (const skill of this.skills.values())
        {
            skills[skill.id] =
            {
                upgradeLevel: skill.upgradeLevel,
                upgradePoints: skill.upgradePoints,
            };
        }


        const persistentData: IPersistedCharacterSheet =
        {
            name: this.name,
            pronouns: this.pronouns, 
            powerId: this.powerId,
            level: this.level,
            age: this.age,
            wealthWeekly: this.wealthWeekly,
            wealthRemaining: this.wealthRemaining,

            attributes: attributes,
            skills: skills,
        };
        return JSON.stringify(persistentData);
    }

    public deserialize(data: string)
    {
        const persistentData = JSON.parse(data) as IPersistedCharacterSheet;

        this.name = persistentData.name;
        this.pronouns = persistentData.pronouns;
        this.powerId = persistentData.powerId;
        this.level = persistentData.level;
        this.age = persistentData.age;
        this.wealthWeekly = persistentData.wealthWeekly;
        this.wealthRemaining = persistentData.wealthRemaining;

        for (const skillId in persistentData.skills)
        {
            const skill = this.skills.get(skillId);
            if (skill !== undefined)
            {
                skill.upgradeLevel = persistentData.skills[skillId].upgradeLevel;
                skill.upgradePoints = persistentData.skills[skillId].upgradePoints;
            }
        }

        for (const attributeId in persistentData.attributes)
        {
            const attribute = this.attributes.get(attributeId);
            if (attribute !== undefined)
            {
                attribute.upgradeLevel = persistentData.attributes[attributeId].upgradeLevel;
                attribute.upgradePoints = persistentData.attributes[attributeId].upgradePoints;
            }
        }

        this.anyValueChanged.invoke();
    }

    public onPropertyChanged(_?: any, __?: any)
    {
        this.anyValueChanged.invoke();
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

    public rollSkillCheck(statId: string, baseDifficulty: Check.SkillCheckDifficulty, netAdvantage: number, netBonus: number): Check.SkillCheck | undefined
    {
        const stat = this.getStatistic(statId);

        if (stat != undefined)
        {
            const statEvaluation = this.evaluateStatistic(statId);
            const effectiveDifficulty = Check.getEffectiveDifficulty(baseDifficulty, netAdvantage);

            const dieRoll = this.evaluationContext.rollDie(Check.getDifficultyDieSides(effectiveDifficulty));

            return new Check.SkillCheck(statId, baseDifficulty, netAdvantage, dieRoll, statEvaluation.finalValue, netBonus);
        }
        else
        {
            return undefined;
        }
    }
}