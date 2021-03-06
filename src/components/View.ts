import {
  h,
  inject,
  provide,
  defineComponent,
  PropType,
  computed,
  InjectionKey,
  Ref,
} from 'vue'
import { RouteRecordNormalized } from '../matcher/types'
import { routeKey } from '../injectKeys'
import { RouteComponent } from '../types'

// TODO: make it work with no symbols too for IE
export const matchedRouteKey = Symbol() as InjectionKey<
  Ref<RouteRecordNormalized>
>

export const View = defineComponent({
  name: 'RouterView',
  props: {
    name: {
      type: String as PropType<string>,
      default: 'default',
    },
  },

  setup(props, { attrs }) {
    const route = inject(routeKey)!
    const depth: number = inject('routerViewDepth', 0)
    provide('routerViewDepth', depth + 1)

    const matchedRoute = computed(() => route.value.matched[depth])
    const ViewComponent = computed<RouteComponent | undefined>(
      () => matchedRoute.value && matchedRoute.value.components[props.name]
    )

    const propsData = computed(() => {
      const { props } = matchedRoute.value
      if (!props) return {}
      if (props === true) return route.value.params

      return typeof props === 'object' ? props : props(route.value)
    })

    provide(matchedRouteKey, matchedRoute)

    return () => {
      return ViewComponent.value
        ? h(ViewComponent.value as any, { ...propsData.value, ...attrs })
        : null
    }
  },
})
