/**
 * Game Data is immutable information about the game rules and content.
 */


type IdMap<TValue> = { [id: string]: TValue };

export interface ISkillDefinition
{
    /**
     * The unique ID of this skill.
     * 
     * IDs may only contain Latin letters and underscores.
     */
    id: string;

    /**
     * The name of this skill to show in UI.
     */
    displayName: string;

    /**
     * The description of this skill to show in UI.
     */
    displayDescription: string;
}

export interface IAttributeDefinition
{
    /**
     * The unique ID of this attribute.
     * 
     * IDs may only contain Latin letters and underscores.
     */
    id: string;

    /**
     * The name of this attribute to show in UI.
     */
    displayName: string;

    /**
     * The description of this attribute to show in UI.
     */
    displayDescription: string;

    /**
     * The skills in this attribute, by skill ID.
     */
    skills: IdMap<ISkillDefinition>;
}

export interface IAttributeGroupDefinition
{
    /**
     * The name of this attribute group to show in UI.
     */
    displayName: string;

    /**
     * The attributes in this attribute group, by attribute ID.
     */
    attributes: IdMap<IAttributeDefinition>;
}

export interface IDerivedStatisticDefinition
{
    /**
     * The name of this derived statistic to show in UI.
     */
    displayName: string;

    /**
     * The description of this derived statistic to show in UI.
     */
    displayDescription: string;

    /**
     * The formula used to calculate this derived statistic.
     * 
     * Warning: This should be deterministic - including dice rolls is not supported and will probably behave erratically!
     */
    formula: string;
}

export interface IGameData
{
    /**
     * The version of the game ruleset that this game data is for.
     * 
     * For example: `"Beta2.1"`
     */
    gameVersion: string;

    /**
     * The version of this game data file.
     * 
     * This value should follow Sematic Versioning syntax.
     */
    dataVersion: string;

    /**
     * The number of points it takes to level up each attribute level.
     * 
     * This also implies how many times an attribute can be levelled up.
     */
    attributeLevelUpPoints: number[];

    /**
     * The number of points it takes to level up each skill level.
     * 
     * This also implies how many times a skill can be levelled up.
     */
    skillLevelUpPoints: number[];

    /**
     * The character attributes, grouped into named attribute groups.
     */
    attributeGroups: IAttributeGroupDefinition[];

    derivedStatistics: IdMap<IDerivedStatisticDefinition>;
}

/*function getGameData(): IGameData
{

}

export default getGameData();*/