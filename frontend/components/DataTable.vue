<template>
  <div class="w-full">
    <!-- Search and Filter Bar -->
    <div class="flex flex-wrap gap-4 items-center mb-4">
      <div class="relative flex-1">
        <div
          class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
        >
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="w-5 h-5 text-gray-400"
          />
        </div>
        <input
          v-model="globalFilter"
          type="text"
          class="block p-2.5 pl-10 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search..."
        />
      </div>
      <div class="flex gap-2 items-center">
        <button
          v-for="column in table
            .getAllColumns()
            .filter(
              (col: any) => col.getCanFilter() && col.columnDef.header !== 'Delete'
            )"
          :key="column.id"
          @click="column.toggleSorting()"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <font-awesome-icon
            :icon="['fas', getSortIcon(column)]"
            class="mr-2 w-4 h-4"
          />
          <span v-if="column.columnDef.header !== 'Delete'">{{
            column.columnDef.header
          }}</span>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div
      class="overflow-x-auto relative rounded-lg border border-gray-200 shadow"
    >
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              class="px-6 py-3"
              :class="{
                'cursor-pointer select-none': header.column.getCanSort(),
              }"
              @click="
                header.column.getCanSort()
                  ? header.column.toggleSorting()
                  : null
              "
            >
              <div class="flex gap-2 items-center">
                {{ header.column.columnDef.header }}
                <font-awesome-icon
                  v-if="header.column.getCanSort()"
                  :icon="['fas', getSortIcon(header.column)]"
                  class="w-4 h-4"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in table.getRowModel().rows"
            :key="row.id"
            class="bg-white border-b hover:bg-gray-50"
          >
            <td
              v-for="(cell, cellIndex) in row.getVisibleCells()"
              :key="cell.id"
              :class="{ 'px-6 py-4': cell.column.id !== 'delete' }"
              @click="setEditMode(row, cell)"
            >
              <input
                v-if="editingCellKey === getCellKey(row, cell)"
                class="p-2 rounded-md border border-gray-300"
                v-model="editValue"
                @blur="onBlur(row, cell.column.id)"
                @keyup.enter="onEnter(row, cell.column.id)"
                @keyup.tab="onTab(row, cell.column.id)"
                @keyup.esc="cancelEdit"
              />

              <span v-else>
                <span v-if="cell.column.id === 'clients'"
                  ><Dropdown
                    v-model="row.original.userUuid"
                    :options="row.original.clients"
                    class="w-full"
                    optionLabel="name"
                    optionValue="code"
                    placeholder="Select a client"
                    @change="selectClient(row, $event)"
                  />
                </span>
                <span
                  v-else-if="cell.column.id === 'delete'"
                  class="flex justify-center items-center w-full h-full text-center text-red-500 cursor-pointer"
                  @click="deleteRecord(row)"
                >
                  <font-awesome-icon :icon="['fas', 'x']" class="w-4 h-4" />
                </span>
                <span
                  v-else-if="cell.column.id === 'images'"
                  class="cursor-pointer text-[#f59e0b]"
                  @click="editImages(row)"
                >
                  Click to Edit
                </span>
                <span v-else>
                  {{ cell.renderValue() }}
                </span>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4">
      <div class="flex gap-2 items-center">
        <button
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-4 h-4" />
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-4 h-4" />
        </button>
        <button
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-4 h-4" />
        </button>
        <button
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4" />
        </button>
        <button
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4" />
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4" />
        </button>
      </div>
      <div class="flex gap-2 items-center">
        <span class="text-sm text-gray-700">
          Page {{ table.getState().pagination.pageIndex + 1 }} of
          {{ table.getPageCount() }}
        </span>
        <select
          v-model="pageSize"
          class="px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300"
        >
          <option
            v-for="size in [10, 20, 30, 40, 50]"
            :key="size"
            :value="size"
          >
            {{ size }} rows
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
} from '@tanstack/vue-table'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { gallery } from '../services/api'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faFilter,
  faTimes,
  faPlus,
  faX,
} from '@fortawesome/free-solid-svg-icons'

import Dropdown from 'primevue/dropdown'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

library.add(
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faFilter,
  faTimes,
  faPlus,
  faX
)

const props = defineProps<{
  data: any[]
  columns: ColumnDef<any>[]
}>()
const globalFilter = ref('')
const pageSize = ref(10)
const editValue = ref('')
const editingCellKey = ref<string | null>(null)

const getSortIcon = (column: any) => {
  if (!column.getIsSorted()) return 'sort'
  return column.getIsSorted() === 'asc' ? 'sort-up' : 'sort-down'
}

const cancelEdit = () => {
  editingCellKey.value = null
  editValue.value = ''
}

const selectClient = (row: any, event: any) => {
  const selected = row.original.clients.find(
    (client: any) => client.code === event.value
  )
  console.log(row, selected?.name)
  emit('selected-client', row, selected)
}

const emit = defineEmits<{
  'record-deleted': []
  'show-overlay': [any]
  'update-cell': [row: any, cellValue: string, fieldName: string]
  'selected-client': [row: any, selected: { code: string; name: string }]
}>()

const skipBlur = ref(false)
const skipTab = ref(false)

const onTab = (row: any, fieldName: string) => {
  if (editValue.value.length === 0) {
    //todo will have to throw an warning or a toaster
    editingCellKey.value = null
    return
  }
  if (!skipTab.value) {
    emit('update-cell', row, editValue.value, fieldName)
  }
  editingCellKey.value = null
}

const onBlur = (row: any, fieldName: string) => {
  if (editValue.value.length === 0) {
    //todo will have to throw an warning or a toaster
    editingCellKey.value = null
    return
  }
  if (!skipBlur.value) {
    emit('update-cell', row, editValue.value, fieldName)
  }
  editingCellKey.value = null
}

const onEnter = (row: any, fieldName: string) => {
  if (editValue.value.length === 0) {
    //todo will have to throw an warning or a toaster
    editingCellKey.value = null
    return
  }
  skipBlur.value = true
  skipTab.value = true
  emit('update-cell', row, editValue.value, fieldName)
  editingCellKey.value = null
}

const deleteRecord = async (row: any) => {
  await gallery.delete(row.original.id)
  emit('record-deleted')
}

const updateInput = (row: any) => {}

const editImages = (row: any) => {
  emit('show-overlay', row)
}

const getCellKey = (row: any, cell: any) => `${row.id}_${cell.column.id}`

const isCellEditable = (cell: any) =>
  ![
    'createAt',
    'user_name',
    'totalSize',
    'delete',
    'bucketDirectory',
    'images',
    'clients',
  ].includes(cell.column.id)

const setEditMode = (row: any, cell: any) => {
  if (!isCellEditable(cell)) return
  editingCellKey.value = getCellKey(row, cell)
  editValue.value = row.original[cell.column.id]
}

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get globalFilter() {
      return globalFilter.value
    },
    get pagination() {
      return {
        pageIndex: 0,
        pageSize: pageSize.value,
      }
    },
  },
  onGlobalFilterChange: (value) => {
    globalFilter.value = value
  },
  onPaginationChange: (updater) => {
    if (typeof updater === 'function') {
      const newState = updater({
        pageIndex: table.getState().pagination.pageIndex,
        pageSize: pageSize.value,
      })
      pageSize.value = newState.pageSize
    }
  },
})

defineExpose({
  getSortIcon,
  pageSize,
})
</script>
