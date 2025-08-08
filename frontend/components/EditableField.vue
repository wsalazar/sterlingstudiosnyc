<template>
  <div>
    <span
      v-if="props.isEditable"
      :class="
        props.spanClass +
        ' cursor-pointer hover:bg-gray-50 flex items-center justify-between'
      "
      @click="editField(props.imageObj)"
    >
      <span class="flex-1">{{ `${spanValue}` }}</span>
      <font-awesome-icon
        :icon="['fas', 'pencil']"
        class="ml-1 w-3 h-3 text-gray-400"
      />
    </span>
    <input
      v-else
      :class="props.inputClass"
      :type="props.type"
      :value="props.inputValue"
      :name="props.name"
      @keydown.enter.prevent="onEnter($event, props.index)"
      @keyup.esc="cancel"
      @blur="cancel"
    />
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPencil } from '@fortawesome/free-solid-svg-icons'

library.add(faPencil)

const props = defineProps<{
  name: string
  inputValue: string
  spanValue: string
  spanClass: string
  inputClass: string
  type: string
  onEnter: (e: Event, index: number) => void
  cancel: () => void
  imageObj: { imageId: string; bucket: string }
  index: number
  isEditable: boolean
  imageId: string
}>()

const emit = defineEmits<{
  (e: 'click-to-edit', imageObj: { imageId: string; bucket: string }): void
  (e: 'set-value', value: string): void
}>()

const editField = (imageObj: { imageId: string; bucket: string }) => {
  console.log('editableField editField', imageObj)
  emit('click-to-edit', imageObj)
}
</script>
