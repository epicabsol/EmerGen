
import type CharacterSheet from "@/models/CharacterSheet";
import { type IGameData } from "@/models/GameData";
import * as Check from "@/models/SkillCheck";

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

    public constructor(gameData: IGameData, characterSheet: CharacterSheet)
    {
        this.gameData = gameData;
        this.characterSheet = characterSheet;
    }

    public getEffectiveSkillValue(): number
    {
        return this.characterSheet.evaluateStatistic(this.skillStatId).finalValue + this.extraBonus;
    }

    public getEffectiveDifficulty(): Check.EffectiveDifficulty
    {
        return Check.getEffectiveDifficulty(this.selectedDifficulty, this.extraAdvantage);
    }
}