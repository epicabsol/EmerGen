
// TODO: These could be game data
export enum SkillCheckDifficulty
{
    trivial,
    easy,
    moderate,
    hard,
    formidable,
    impossible,
}

export const allDifficulties: SkillCheckDifficulty[] = function()
{
    const result = [ ];
    for (let i = 0; i <= SkillCheckDifficulty.impossible; i++)
    {
        result.push(i);
    }
    return result;
}();

export class EffectiveDifficulty
{
    /**
     * The difficulty of the die to be rolled.
     */
    public readonly rollDifficulty: SkillCheckDifficulty;

    /**
     * Any additional bonus / penalty, for example, from advantage or disadvantage past the range of difficulties.
     */
    public readonly extraBonus: number;

    public constructor(rollDifficulty: SkillCheckDifficulty, extraBonus: number)
    {
        this.rollDifficulty = rollDifficulty;
        this.extraBonus = extraBonus;
    }
}

/**
* Computes the effective difficulty of this skill check after the net advantage has been taken into account.
*/
export function getEffectiveDifficulty(baseDifficulty: SkillCheckDifficulty, netAdvantage: number): EffectiveDifficulty
{
    if (baseDifficulty == SkillCheckDifficulty.impossible)
    {
        // Skill checks with a base difficulty of 'impossible' are not subject to advantage/disadvantage
        return new EffectiveDifficulty(baseDifficulty, 0);
    }
    else
    {
        const lowestTier = 0;
        const highestTier = SkillCheckDifficulty.impossible - 1;

        let modifiedTier = baseDifficulty - netAdvantage;
        let extraBonus = 0;
        if (modifiedTier < lowestTier)
        {
            extraBonus = lowestTier - modifiedTier;
            modifiedTier = lowestTier;
        }
        else if (modifiedTier > highestTier)
        {
            extraBonus = highestTier - modifiedTier;
            modifiedTier = highestTier;
        }

        return new EffectiveDifficulty(modifiedTier, extraBonus);
    }
}

export function getDifficultyDieSides(effectiveDifficulty: SkillCheckDifficulty): number
{
    let dieSides = 0;

    switch (effectiveDifficulty)
    {
        case SkillCheckDifficulty.trivial:
            dieSides = 4;
            break;
        case SkillCheckDifficulty.easy:
            dieSides = 6;
            break;
        case SkillCheckDifficulty.moderate:
            dieSides = 8;
            break;
        case SkillCheckDifficulty.hard:
            dieSides = 10;
            break;
        case SkillCheckDifficulty.formidable:
            dieSides = 12;
            break;
        case SkillCheckDifficulty.impossible:
            dieSides = 20;
            break;
    }

    return dieSides;
}

/**
 * Represents a record of a skill check that was made.
 */
export class SkillCheck
{
    /**
     * The stat ID of the skill that this check was against.
     */
    public statId: string;

    /**
     * The difficulty class of the check.
     */
    public baseDifficulty: SkillCheckDifficulty;

    /**
     * The total amount of advantage the player had.
     * 
     * One advantage and two disadvantage would have a netAdvantage of -1.
     */
    public netAdvantage: number;

    /**
     * The value that was rolled according to this check's effective difficulty.
     */
    public dieRoll: number;

    /**
     * The value of the skill specified by statId at the time this skill check was made.
     */
    public baseSkillValue: number;

    /**
     * The total amount of bonus the player had on this roll.
     * 
     * One bonus and two penalty would have a netBonus of -1.
     */
    public netBonus: number;

    public constructor(statId: string, baseDifficulty: SkillCheckDifficulty, netAdvantage: number, dieRoll: number, baseSkillValue: number, netBonus: number)
    {
        this.statId = statId;
        this.baseDifficulty = baseDifficulty;
        this.netAdvantage = netAdvantage;
        this.dieRoll = dieRoll;
        this.baseSkillValue = baseSkillValue;
        this.netBonus = netBonus;
    }
    
    /**
     * Determines the degree of success/failure of the check.
     * 
     * Values >= 0 are success (see isSuccess()) and values < 0 are failure.
     */
    public getSuccessDegree(): number
    {
        const skillValue = this.effectivePlayerSkillValue();
        // Rolling '1' always is at least a 'flat success' (degree zero)
        if (this.dieRoll == 1 && this.dieRoll > skillValue)
        {
            return 0;
        }
        else
        {
            return this.dieRoll - skillValue;
        }
    }

    /**
     * Determines the level of critical success/failure of this check.
     * 
     * A standard success/failure would be 0, a double critical success would be 2, and a double critical failure would be -2.
     */
    public getCriticalDegree(): number
    {
        return Math.trunc(this.getSuccessDegree() / 5);
    }

    /**
     * Determines whether the player succeeded the check.
     */
    public isSuccess(): boolean
    {
        return this.getSuccessDegree() >= 0;
    }

    /**
     * Computes the effective value of the player's skill being checked, after the bonuses and penalties have been taken into account.
     */
    public effectivePlayerSkillValue(): number
    {
        return this.baseSkillValue + this.netBonus;
    }
}