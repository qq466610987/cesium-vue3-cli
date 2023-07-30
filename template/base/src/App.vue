<script setup lang="ts">
import {Viewer} from 'cesium'
import {onMounted} from 'vue'
// @ts-ignore
onMounted(()=>{
  new Viewer('cesiumContainer')
})

</script>

<template>
  <div id="cesiumContainer">
  </div>
</template>

<style scoped>
#cesiumContainer{
  width: 100%;
  height: 100%;
  position:absolute;
}
</style>
