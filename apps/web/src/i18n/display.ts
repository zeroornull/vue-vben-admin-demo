import { useI18n } from 'vue-i18n'

export function isCustomEmbedLink(item: { name: string; path?: string }) {
  return item.name === 'embed-link' && Boolean(item.path && item.path !== '/embed')
}

export function useDisplayTitle() {
  const { t, te } = useI18n()

  function translate(key: string, fallback: string) {
    return te(key) ? t(key) : fallback
  }

  function routeTitle(name: string, fallback: string) {
    return translate(`route.${name}`, fallback)
  }

  function menuTitle(item: { name: string; path?: string; title: string }) {
    if (isCustomEmbedLink(item)) return item.title
    return routeTitle(item.name, item.title)
  }

  function groupTitle(group: string | null | undefined) {
    if (!group) return null
    return translate(`group.${group}`, group)
  }

  function columnTitle(table: string, key: string, fallback?: string) {
    return translate(`column.${table}.${key}`, fallback ?? key)
  }

  return { columnTitle, groupTitle, menuTitle, routeTitle, t, te, translate }
}
