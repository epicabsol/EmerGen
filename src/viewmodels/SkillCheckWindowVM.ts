
import { StaticCalculationModifier, type ICalculationModifier } from "@/models/CharacterSheet";
import type CharacterSheet from "@/models/CharacterSheet";
import { type IGameData } from "@/models/GameData";
import * as Check from "@/models/SkillCheck";

/**
 * Applies a bonus/penalty when advantage or disadvantage overflows the range of possible check difficulties.
 */
class AdvantageOverflowModification implements ICalculationModifier
{
    
    public overflowBonus = 0;

    getDisplaySource(): string
    {
        return this.overflowBonus > 0 ? "Advantage" : "Disadvantage";
    }

    getDisplayTitle(): string
    {
        return (this.overflowBonus > 0 ? "Advantage overflow by "  + this.overflowBonus.toString(): "Disadvantage overflow by " + -this.overflowBonus.toString());
    }

    getDisplayEffect(): string
    {
        return this.overflowBonus > 0 ? "+" + this.overflowBonus.toString() : this.overflowBonus.toString();
    }

    apply(sourceValue: number): number
    {
        return sourceValue + this.overflowBonus;
    }
}

export default class SkillCheckWindowVM
{
    public readonly gameData: IGameData;
    public readonly characterSheet: CharacterSheet;

    /**
     * Whether this window is visible or hidden
     */
    public visible = false;

    /**
     * The stat ID of the skill that is selected
     */
    public skillStatId = "";

    /**
     * The starting check difficulty that is selected
     */
    public selectedDifficulty = Check.SkillCheckDifficulty.moderate;

    /**
     * The extra advantage/disadvantage to give the roll
     */
    public extraAdvantage = 0;

    /**
     * The extra bonus/penalty to give the roll
     */
    public extraBonus = 0;

    /**
     * The skill checks that have been made, in order that they were made.
     */
    public pastChecks = new Array<Check.SkillCheck>();

    // This is private, but Vue doesn't like using types with private members in props due to a bug
    advantageOverflowModification = new AdvantageOverflowModification();

    public constructor(gameData: IGameData, characterSheet: CharacterSheet)
    {
        this.gameData = gameData;
        this.characterSheet = characterSheet;
    }

    public getEffectiveSkillValue(): number
    {
        return this.characterSheet.evaluateStatistic(this.skillStatId).append(this.gatherModifications()).finalValue;
    }

    public getEffectiveDifficulty(): Check.EffectiveDifficulty
    {
        return Check.getEffectiveDifficulty(this.selectedDifficulty, this.getNetAdvantage());
    }

    public getNetAdvantage(): number
    {
        // TODO: We should expand this to include other sources of advantage/disadvantage
        return this.extraAdvantage;
    }

    public gatherModifications(): ICalculationModifier[]
    {
        const result = new Array<ICalculationModifier>();

        // Advantage/disadvantage overflow
        const effectiveDifficulty = this.getEffectiveDifficulty();
        if (effectiveDifficulty.extraBonus != 0)
        {
            this.advantageOverflowModification.overflowBonus = effectiveDifficulty.extraBonus;
            result.push(this.advantageOverflowModification);
        }

        // Extra bonus
        if (this.extraBonus != 0)
        {
            result.push(new StaticCalculationModifier("Skill check", "Extra " + (this.extraBonus > 0 ? "bonus" : "penalty"), this.extraBonus));
        }

        return result;
    }

    public rollCheck()
    {
        const check = this.characterSheet.rollSkillCheck(this.skillStatId, this.getEffectiveDifficulty(), this.gatherModifications(), this.selectedDifficulty, this.getNetAdvantage(), this.extraBonus);
        if (check !== undefined)
        {
            this.pastChecks.push(check);
        }
    }
}