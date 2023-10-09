<script setup lang="ts">
import { computed, ref } from 'vue';
import NumberIncrementDecrement from '../NumberIncrementDecrement.vue';
import CharacterSheet, { type IStat } from '@/models/CharacterSheet';
import { type IGameData } from '@/models/GameData';
import StatisticView from '../StatisticView.vue';
import Dropdown from "../Dropdown.vue";
import * as Check from "../../models/SkillCheck";

const props = defineProps<{
    gameData: IGameData,
    characterSheet: CharacterSheet,
}>();

const skillStatId = ref("");
const hoverStatId = ref("");
const skillDropdown = ref<typeof Dropdown | null>(null);

const selectedDifficulty = ref(Check.SkillCheckDifficulty.moderate);
const hoverDifficulty = ref<Check.SkillCheckDifficulty | null>(null);

const extraAdvantage = ref(0);
const extraBonus = ref(0);

const effectiveDifficulty = computed(() => Check.getEffectiveDifficulty(selectedDifficulty.value, extraAdvantage.value));

class NoStat implements IStat
{
    public readonly id = "???";
    public readonly displayName = "Select skill";
    public readonly displayDescription = "";

    public getValue(): number
    {
        return 0;
    }
}

function statClicked(statId: string)
{
    skillStatId.value = statId;
    skillDropdown.value?.setVisible(false);
}

function statMouseOver(statId: string)
{
    hoverStatId.value = statId;
}

function statMouseOut(statId: string)
{
    if (hoverStatId.value == statId)
    {
        hoverStatId.value = "";
    }
}

function getHoverStat(): IStat
{
    if (hoverStatId.value.length > 0)
    {
        return props.characterSheet.getStatistic(hoverStatId.value) ?? emptyStat;
    }
    else if (skillStatId.value.length > 0)
    {
        return props.characterSheet.getStatistic(skillStatId.value) ?? emptyStat;
    }
    else
    {
        return emptyStat;
    }
}

function getEffectiveSkillValue(): number
{
    return props.characterSheet.evaluateStatistic(skillStatId.value).finalValue + extraBonus.value;
}

function difficultyClicked(difficulty: Check.SkillCheckDifficulty)
{
    selectedDifficulty.value = difficulty;
}

function difficultyMouseOver(difficulty: Check.SkillCheckDifficulty)
{
    hoverDifficulty.value = difficulty;
}

function difficultyMouseOut(difficulty: Check.SkillCheckDifficulty)
{
    if (hoverDifficulty.value == difficulty)
    {
        hoverDifficulty.value = null;
    }
}

const emptyStat = new NoStat();

</script>

<template>
    <div class="checkform-container">
        <div class="checkform-background">
            <div class="checkform-background-column">

            </div>

            <div class="checkform-background-column">

            </div>
        </div>
        
        <div class="checkform-columns">
            <div class="checkform-column">
                <h3>Skill</h3>

                <Dropdown class="selected-stat" ref="skillDropdown">
                    <template v-slot:activator>
                        <div :class="{ 'checkform-stat-row': true, 'open': skillDropdown?.isVisible ?? false }">
                            <StatisticView :stat="getHoverStat()" />

                            <span class="checkform-stat-title">{{ getHoverStat().displayName }}</span>

                            &#9660; <!-- down arrow -->
                        </div>
                    
                    </template>

                    <div class="checkform-skillcontainer">
                        <div v-for="attributeGroup in gameData.attributeGroups">
                            <div class="checkform-attributegroup">
                                {{ attributeGroup.displayName }}
                            </div>
                            <template v-for="attribute, attributeId in attributeGroup.attributes">
                                <div :class="{ 'checkform-skillchoice': true, 'active': hoverStatId.length > 0 ? (attributeId == hoverStatId) : (attributeId == skillStatId) }" @click="statClicked(attributeId as string)" @mouseover="statMouseOver(attributeId as string)" @mouseout="statMouseOut(attributeId as string)">
                                    <StatisticView mini :stat="(characterSheet.getStatistic(attributeId as string) as IStat)" :title="attribute.displayName + '\n\n' + attribute.displayDescription" />
                                </div>

                                <div v-for="skill, skillId in attribute.skills" :class="{ 'checkform-indent': true, 'checkform-skillchoice': true, 'active': hoverStatId.length > 0 ? (skillId == hoverStatId) : (skillId == skillStatId) }" @click="statClicked(skillId as string)" @mouseover="statMouseOver(skillId as string)" @mouseout="statMouseOut(skillId as string)">
                                    <StatisticView mini :stat="(characterSheet.getStatistic(skillId as string) as IStat)" :title="skill.displayName + '\n\n' + skill.displayDescription" />
                                </div>
                            </template>
                        </div>
                        <div>
                            <div class="checkform-attributegroup">
                                Derived
                            </div>
                            <div v-for="derived, derivedId in gameData.derivedStatistics" :class="{ 'checkform-skillchoice': true, 'active': hoverStatId.length > 0 ? (derivedId == hoverStatId) : (derivedId == skillStatId) }" @click="statClicked(derivedId as string)" @mouseover="statMouseOver(derivedId as string)" @mouseout="statMouseOut(derivedId as string)">
                                <StatisticView mini :stat="(characterSheet.getStatistic(derivedId as string) as IStat)" :title="derived.displayName + '\n\n' + derived.displayDescription" />
                            </div>
                        </div>
                    </div>

                </Dropdown>

                <br />
                
                Extra Bonus:
                <NumberIncrementDecrement v-model="extraBonus" :change-increment="1" />
            </div>

            <div class="checkform-column">
                <h3>Difficulty</h3>
                <div class="checkform-tabs">
                    <div v-for="difficulty in Check.allDifficulties" :class="{ 'checkform-difficultychoice': true, 'active': hoverDifficulty !== null ? (difficulty == hoverDifficulty) : (difficulty == selectedDifficulty) }" @click="difficultyClicked(difficulty)" @mouseover="difficultyMouseOver(difficulty)" @mouseout="difficultyMouseOut(difficulty)">
                        {{ Check.getDifficultyDieSides(difficulty) }}
                    </div>
                </div>
                <h3 class="checkform-difficulty">
                    {{ Check.SkillCheckDifficulty[hoverDifficulty ?? selectedDifficulty] }} <span class="checkform-difficultydie">d{{ Check.getDifficultyDieSides(hoverDifficulty ?? selectedDifficulty) }}</span>
                </h3>

                <br />

                Extra Advantage:
                <NumberIncrementDecrement v-model="extraAdvantage" :change-increment="1" />
            </div>
        </div>

        <div class="checkform-bottomrow">
            <div class="checkform-bottomcolumn">
                <div class="checkform-centeredrow">
                    <h1 class="checkform-valuebox">
                        {{ skillStatId.length > 0 ? getEffectiveSkillValue() : '&nbsp' }}

                    </h1>
                </div>
                <span class="checkform-difficultydie">Effective Skill Value</span>
            </div>

            <div class="checkform-submit">
                <h1><em>vs</em></h1>
                <button>Roll</button>
            </div>

            <div class="checkform-bottomcolumn">
                <div class="checkform-centeredrow">
                    <h1 class="checkform-valuebox">
                        1d{{ Check.getDifficultyDieSides(effectiveDifficulty.rollDifficulty) }} {{ effectiveDifficulty.extraBonus < 0 ? '+' : (effectiveDifficulty.extraBonus > 0 ? '-' : '') }} {{ effectiveDifficulty.extraBonus != 0 ? Math.abs(effectiveDifficulty.extraBonus).toString() : '' }}
                    </h1>
                </div>
            </div>
        </div>

        

    </div>
</template>

<style scoped>
.checkform-container
{
    position: relative;

    min-width: 600px;
    min-height: 300px;

    z-index: 0;
}

.checkform-content
{

    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
}

.checkform-columns
{
    display: flex;
    flex-direction: row;
    align-items: stretch;
}

.checkform-column
{
    flex: 1 1 0px;
    min-width: 0px;

    padding: 10px;

    display: flex;
    flex-direction: column;
}

.checkform-background
{
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-items: stretch;
    z-index: -5;
}

.checkform-background-column
{
    background-color: rgba(0, 0, 0, 0.1);
    border: 2px solid white;
    flex: 1 1 0px;
}

.checkform-bottomrow
{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: stretch;
    padding: 16px 4px;
}

.checkform-bottomcolumn
{
    flex-grow: 1;
    flex-basis: 0px;
    text-align: center;
}

.checkform-submit
{
    width: 64px;
    height: 64px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background-color: white;
}

.checkform-skillcontainer
{
    padding: 8px;
    display: flex;
    flex-direction: row;
}

.checkform-skillcontainer > *
{
    margin: 4px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.checkform-attributegroup
{
    font-weight: bold;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.5);
    pointer-events: none;
}

.checkform-skillchoice
{
    cursor: default;
    padding: 2px;
}

.active
{
    background: rgba(0, 0, 0, 0.1);
    /*border-radius: 0px;*/
    /*outline: 2px solid rgba(0, 0, 0, 0.1);*/
}

.checkform-indent
{
    padding-left: 10px;
}

.checkform-stat-row
{
    display: flex;
    align-items: center;
    padding: 4px;
}

.checkform-stat-row:hover, .checkform-stat-row.open
{
    background: white;
}

.checkform-stat-title
{
    margin: 6px;
    flex-grow: 1;
}

.selected-stat
{
    display: inline-block;
    align-self: stretch;
}

.checkform-valuebox
{
    display: inline-block;
    padding: 8px;
    border-radius: 4px;
    background: white;
    min-width: 1.5em;
    text-align: center;
}

.checkform-centeredrow
{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.checkform-tabs
{
    display: flex;
    flex-direction: row;
    
}

.checkform-tabs > *
{
    flex-basis: 0px;
    flex-grow: 1;
    cursor: pointer;
}

.checkform-tabs > *.active
{
    background-color: white;
}

.checkform-difficultychoice
{
    text-align: center;
    padding: 6px;
    user-select: none;
}

.checkform-difficulty
{
    text-transform: capitalize;
    padding: 8px;
    background-color: white;
    text-align: center;
}

.checkform-difficultydie
{
    font-size: 0.8em;
    text-transform: none;
    color: rgba(0, 0, 0, 0.5);
    margin: 4px;
}
</style>