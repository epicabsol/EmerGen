<script setup lang="ts">
import type { IGameData } from '../models/GameData';
import CharacterSheet, { type IStat, UpgradableStat } from '../models/CharacterSheet';
import StatisticView from '../views/StatisticView.vue';
import Modal from '../views/Modal.vue';
import UpgradeRow from '../views/UpgradeRow.vue';
import SheetBlock from '../views/SheetBlock.vue';
import EvaluationToolbar from '../views/EvaluationToolbar.vue';
import EvaluatedFormulaRow from '../views/formula/EvaluatedFormulaRow.vue';
import NumberIncrementDecrement from '@/views/NumberIncrementDecrement.vue';
import SkillCheckForm from '../views/check/SkillCheckForm.vue';
//import * as Formula from '../models/Formula';
import * as Scan from '../models/FormulaScan';
import * as Parse from '../models/FormulaParse';
import * as Evaluate from '../models/FormulaEvaluate';
import { nextTick, ref } from 'vue';
import { saveAs } from "file-saver";
import moment from "moment";
import SkillCheckWindowVM from "@/viewmodels/SkillCheckWindowVM";

const gameData = await async function() {
  const response = await fetch("GameData-Emergent.json");
  return await response.json() as IGameData;
}();

var character = ref(new CharacterSheet(gameData));
character.value.anyValueChanged.addHandler(() => { /*if (lastUnsavedTime.value === null)*/ lastUnsavedTime.value = Date.now() - 1000; });
const evaluationHistoryBottom = ref<HTMLElement | null>(null);

//
// Skill Checks
//

const skillCheckWindow = ref(new SkillCheckWindowVM(gameData, character.value));

/**
 * Shows the skill check dialog with the given stat selected in the check creation form.
 * @param statId 
 */
function showSkillCheckSetup(statId: string)
{
  skillCheckWindow.value.skillStatId = statId;
  skillCheckWindow.value.visible = true;
}

//
// Fomula Evaluator
//

const evaluationHistory = ref(new Array<Evaluate.FormulaEvaluationResult>());

function addEvaluation(formula: string)
{
  const evaluation = Evaluate.evaluateFormula(formula, new Evaluate.FormulaEvaluationContext(character.value, gameData));
  evaluationHistory.value.push(evaluation);

  nextTick(() => evaluationHistoryBottom.value?.scrollIntoView());
}

//
// Saving & Loading
//

let lastUnsavedTime = ref<number | null>(null);
let referenceTime = ref(Date.now());

setInterval(() => referenceTime.value = Date.now(), 1000);

function saveSheet()
{
  const data = character.value.serialize();
  const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
  saveAs(blob, character.value.name.trim().length > 0 ? character.value.name + ".json" : "Character.json");
  lastUnsavedTime.value = null;
}

async function loadSheet(event: Event)
{
  const input = event.target as HTMLInputElement;
  const reader = new FileReader();
  const file = input.files?.item(0);
  if (file !== null && file !== undefined)
  {
    const text = await file.text();
    character.value.deserialize(text);
    lastUnsavedTime.value = null;
  }
}

function lastSavedDisplayTime(): string
{
  if (lastUnsavedTime.value === null)
  {
    return "";
  }
  else
  {
    return moment(lastUnsavedTime.value).from(referenceTime.value);
  }
}


console.log(`Loaded game data ${gameData.dataVersion} for Emergent ${gameData.gameVersion}.`);
</script>
<template>
  <div class="sheet">
    <div class="title-toolbar">
      <h2 class="title-logo">Emergent Character Sheet</h2>

      <div class="title-controls">
        <span :class="{ 'unsaved-warning': true, 'hidden': lastUnsavedTime === null }">Unsaved changes from {{ lastSavedDisplayTime() }}</span>

        <div class="title-buttons">
          <button @click="skillCheckWindow.visible = true">Skill Checks</button>
          <label for="loadSheetFile" class="upload-button">Open...</label>
          <input id="loadSheetFile" type="file" accept=".json" class="upload-invisible" @change="loadSheet">
          <button @click="saveSheet">Save...</button>
        </div>
      </div>
    </div>

    <div class="sheet-blocks">
      <!-- Identity -->
      <SheetBlock display-name="Identity">
        <div class="identity-table">
          <label for="name">Name</label>
          <input v-model="character.name" type="text" id="name" name="name" placeholder="Name">

          <label for="pronouns">Pronouns</label>
          <input v-model="character.pronouns" type="text" id="pronouns" name="pronouns" placeholder="Pronouns">

          <label>Power</label>
          <span>{{ character.powerId }}</span>

          <label for="level">Level</label>
          <input v-model="character.level" type="number" id="level" name="level">

          <label for="age">Age</label>
          <input v-model="character.age" type="number" id="age" name="age">

          <label for="remainingWealth">Remaining Wealth</label>
          <input v-model="character.wealthRemaining" type="number" id="remainingWealth" name="remainingWealth">

          <label for="weeklyWealth">Weekly Wealth</label>
          <input v-model="character.wealthWeekly" type="number" id="weeklyWealth" name="weeklyWealth">
        </div>
      </SheetBlock>

      <!-- Derived Statistics -->
      <SheetBlock display-name="Derived">
        <div class="stat-row" v-for="derivedStatistic, derivedId in gameData.derivedStatistics">
          <StatisticView :stat="(character.stats.get(derivedId as string) as IStat)" />

          <div class="stat-content">
            <div class="stat-title">
              <h4 :title="`${derivedStatistic.displayDescription} (${derivedId} = ${derivedStatistic.formula})`">{{ derivedStatistic.displayName }}</h4>
              <button @click="showSkillCheckSetup(derivedId as string)">Roll Check...</button>
            </div>
            <div class="stat-subtitle">
              = {{ derivedStatistic.formula }}
            </div>
          </div>
        </div>
      </SheetBlock>

      <!-- Attributes & Skills -->
      <SheetBlock :display-name="attributeGroup.displayName" class="attribute-group" v-for="attributeGroup, i in gameData.attributeGroups">
        <div v-for="attribute, attributeId in attributeGroup.attributes">

          <div class="stat-row">
            <StatisticView :stat="(character.attributes.get(attributeId as string) as UpgradableStat)" />

            <div class="stat-content">
              <div class="stat-title">
                <h3 :title="attribute.displayDescription">{{ attribute.displayName }}</h3>
                <button @click="showSkillCheckSetup(attributeId as string)">Roll Check...</button>
              </div>

              <div class="stat-subtitle">
                <UpgradeRow :stat="ref((character.attributes.get(attributeId as string) as UpgradableStat))"></UpgradeRow>
              </div>
            </div>
          </div>

          <div v-for="skill, skillId in attribute.skills">

            <div class="stat-row stat-child">
              <StatisticView :stat="(character.attributes.get(attributeId as string)?.skills.get(skillId as string) as UpgradableStat)" />

              <div class="stat-content">
                <div class="stat-title">
                  <h4 :title="skill.displayDescription">{{ skill.displayName }}</h4>
                  <button @click="showSkillCheckSetup(skillId as string)">Roll Check...</button>
                </div>

                <div class="stat-subtitle">
                  <UpgradeRow :stat="ref((character.attributes.get(attributeId as string)?.skills.get(skillId as string) as UpgradableStat))"></UpgradeRow>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetBlock>
    </div>

    <!-- Formula Evaluator -->
    <div class="sheet-content sheet-fixed">
      <div class="evaluate-history">
        <div v-for="evaluation in evaluationHistory">
          <EvaluatedFormulaRow :result="evaluation" @reroll="addEvaluation(evaluation.formula)" />
        </div>
        <a ref="evaluationHistoryBottom"></a>
      </div>

      <EvaluationToolbar v-on:submit="addEvaluation" />
    </div>

    <!-- Skill Check Modal -->
    <Modal v-model="skillCheckWindow.visible" :auto-dismiss="true">
      <h2>Skill Checks</h2>

      <SkillCheckForm :vm="skillCheckWindow" />
    </Modal>
  </div>

</template>

<style scoped>
.title-toolbar
{
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

.title-logo
{
  flex-grow: 1;
}

.title-controls
{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.title-buttons
{
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.title-buttons button
{
  margin: 2px;
}

.upload-button
{
  border: 1px solid rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.1);
  margin: 2px;
  border-radius: 2px;
  padding: 2px 8px;
  user-select: none;
}

.upload-button:active
{
  background: rgba(0, 0, 0, 0.05);
}

.upload-button:hover
{
  background: rgba(0, 0, 0, 0.15);
}

.upload-invisible
{
  position: absolute;
  opacity: 0;
  width: 0px;
  height: 0px;
}

.unsaved-warning
{
  font-size: 0.9em;
  color: rgba(160, 20, 20, 0.8);
}

.hidden
{
  opacity: 0;
}

.identity-table
{
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.identity-table > label
{
  text-align: right;
  margin: 2px 4px;
}

.identity-table > input
{
  margin: 2px 4px;
}

.sheet
{
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sheet-blocks
{
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
  overflow-y: auto;

  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0 2rem;
  flex-grow: 1;
}

.stat-row
{
  display: flex;
  flex-direction: row;
  margin: 2px 0px;
  align-items: center;
}

.stat-row > .stat-box
{
  margin: 0px 4px;
}

.stat-child
{
  margin-left: 24px;
}

.stat-content
{
  flex-grow: 1;
  padding: 2px;
}

.stat-title
{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.stat-title > *:first-child
{
  flex-grow: 1;
}

.stat-title > *:not(:first-child)
{
  visibility: hidden;
}

.stat-row:hover .stat-title > *:not(:first-child)
{
  visibility: visible;
}

.stat-subtitle
{
  color: rgba(0, 0, 0, 0.6);
}

.evaluate-history
{
  max-height: 10em;
  overflow-y: auto;
}
</style>