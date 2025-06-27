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
            .filter((col) => col.getCanFilter())"
          :key="column.id"
          @click="column.toggleSorting()"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <font-awesome-icon
            :icon="['fas', getSortIcon(column)]"
            class="mr-2 w-4 h-4"
          />
          {{ column.columnDef.header }}
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
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="bg-white border-b hover:bg-gray-50"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-6 py-4"
            >
              {{ cell.renderValue() }}
              <!-- Debug: {{ cell.column.id }} - {{ typeof cell.renderValue() }} -->
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
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
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
  faPlus
)

const props = defineProps<{
  data: any[]
  columns: ColumnDef<any>[]
}>()
console.log('props', props)
const globalFilter = ref('')
const pageSize = ref(10)

const getSortIcon = (column: any) => {
  if (!column.getIsSorted()) return 'sort'
  return column.getIsSorted() === 'asc' ? 'sort-up' : 'sort-down'
}

const table = useVueTable({
  get data() {
    console.log('Table data:', props.data)
    return props.data
  },
  get columns() {
    console.log('Table columns:', props.columns)
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
