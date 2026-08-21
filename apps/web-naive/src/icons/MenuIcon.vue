<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue/offline'

import { resolveMenuIcon } from './menu-icons'

const props = defineProps<{
  name?: string
}>()

const icon = computed(() => resolveMenuIcon(props.name))
</script>

<template>
  <Icon v-if="icon" :icon="icon" height="1em" width="1em" />
</template>
