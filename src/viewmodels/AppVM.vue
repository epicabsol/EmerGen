<script setup lang="ts">
import type { IGameData } from '../models/GameData';
import CharacterSheet, { UpgradableStat } from '../models/CharacterSheet';
import StatisticView from '../views/StatisticView.vue';
import UpgradeRow from '../views/UpgradeRow.vue';
import SheetBlock from '../views/SheetBlock.vue';
import EvaluationToolbar from '../views/EvaluationToolbar.vue';
import EvaluatedFormulaRow from '../views/formula/EvaluatedFormulaRow.vue';
//import * as Formula from '../models/Formula';
import * as Scan from '../models/FormulaScan';
import * as Parse from '../models/FormulaParse';
import * as Evaluate from '../models/FormulaEvaluate';
import { nextTick, ref } from 'vue';

const gameData = await async function() {
  const response = await fetch("GameData-Emergent.json");
  return await response.json() as IGameData;
}();

var character = new CharacterSheet(gameData);
const evaluationHistoryBottom = ref<HTMLElement | null>(null);



const evaluationHistory = ref(new Array<Evaluate.FormulaEvaluationResult>());

function addEvaluation(formula: string)
{
  //const parse = Parse.parseFormula(formula, Scan.scanFormula(formula));
  const evaluation = Evaluate.evaluateFormula(formula, new Evaluate.FormulaEvaluationContext(character, gameData));
  //console.log(JSON.stringify(evaluation));
  evaluationHistory.value.push(evaluation);

  nextTick(() => evaluationHistoryBottom.value?.scrollIntoView());
}

console.log(`Loaded game data ${gameData.dataVersion} for Emergent ${gameData.gameVersion}.`);
</script>
<template>
  <div class="sheet">
    <div>
      <h2>Emergent Character Sheet</h2>
    </div>

    <div class="sheet-blocks">
      <!-- Identity -->
      <SheetBlock display-name="Identity">
        <label for="name">Name</label>
        <input v-model="character.name" type="text" id="name" name="name" placeholder="Name"><br />

        <label for="pronouns">Pronouns</label>
        <input v-model="character.pronouns" type="text" id="pronouns" name="pronouns" placeholder="Pronouns"><br />

        <label>Power</label>
        <span>{{ character.powerId }}</span><br />

        <label for="level">Level</label>
        <input v-model="character.level" type="number" id="level" name="level"><br />

        <label for="age">Age</label>
        <input v-model="character.age" type="number" id="age" name="age"><br />

        <label for="remainingWealth">Remaining Wealth</label>
        <input v-model="character.wealthRemaining" type="number" id="remainingWealth" name="remainingWealth"><br />

        <label for="weeklyWealth">Weekly Wealth</label>
        <input v-model="character.wealthWeekly" type="number" id="weeklyWealth" name="weeklyWealth"><br />
      </SheetBlock>

      <!-- Derived Statistics -->
      <SheetBlock display-name="Derived">
        <div class="stat-row" v-for="derivedStatistic, derivedId in gameData.derivedStatistics">
          <!--<StatisticView :stat="" />-->

          <div class="stat-content">
            <h4 :title="`${derivedStatistic.displayDescription} (${derivedId} = ${derivedStatistic.formula})`">{{ derivedStatistic.displayName }}</h4>
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
            <StatisticView :stat="ref((character.attributes.get(attributeId as string) as UpgradableStat))" />

            <div class="stat-content">
              <h3 :title="attribute.displayDescription">{{ attribute.displayName }}</h3>

              <div class="stat-subtitle">
                <UpgradeRow :stat="ref((character.attributes.get(attributeId as string) as UpgradableStat))"></UpgradeRow>
              </div>
            </div>
          </div>

          <div v-for="skill, skillId in attribute.skills">

            <div class="stat-row stat-child">
              <StatisticView :stat="ref((character.attributes.get(attributeId as string)?.skills.get(skillId as string) as UpgradableStat))" />

              <div class="stat-content">
                <h4 :title="skill.displayDescription">{{ skill.displayName }}</h4>

                <div class="stat-subtitle">
                  <UpgradeRow :stat="ref((character.attributes.get(attributeId as string)?.skills.get(skillId as string) as UpgradableStat))"></UpgradeRow>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetBlock>
    </div>

    <div class="sheet-content">
      <div class="evaluate-history">
        <div v-for="evaluation in evaluationHistory">
          <EvaluatedFormulaRow :result="evaluation" @reroll="addEvaluation(evaluation.formula)" />
        </div>
        <a ref="evaluationHistoryBottom"></a>
      </div>

      <EvaluationToolbar v-on:submit="addEvaluation" />
    </div>
  </div>

</template>

<style scoped>
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