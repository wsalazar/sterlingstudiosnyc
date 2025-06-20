<template>
  <div class="flex justify-center items-center space-x-2">
    <a
      v-for="icon in socialIcons"
      :key="icon.name"
      :href="icon?.href"
      target="__blank"
      class="text-gray-400 hover:text-gray-500"
    >
      <font-awesome-icon
        :icon="['fab', icon.name]"
        class="w-6 h-6"
        :class="icon.color"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faDiscord,
  faInstagram,
  faXTwitter,
  faTiktok,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface SocialMediaIcon {
  name: string
  icon: IconDefinition
  color: string
  href?: string
}

const socialIcons: SocialMediaIcon[] = [
  // { name: 'discord', icon: faDiscord, color: 'text-[#5865F2]' },
  {
    name: 'instagram',
    icon: faInstagram,
    color: 'text-[#E1306C]',
    href: 'https://www.instagram.com/sterlingstudiosnyc',
  },
  // { name: 'x-twitter', icon: faXTwitter, color: 'text-black' },
  // { name: 'tiktok', icon: faTiktok, color: 'text-black' },
  // { name: 'youtube', icon: faYoutube, color: 'text-[#FF0000]' },
]

socialIcons.forEach((icon) => library.add(icon.icon))
</script>

<style scoped></style>
