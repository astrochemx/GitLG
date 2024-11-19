import { show_error_message, show_information_message } from './bridge.js'
import { createApp } from 'vue'
import '../../src/globals'
import App from './App.vue'
import moveable from './directives/moveable'
import drag from './directives/drag'
import drop from './directives/drop'
import context_menu from './directives/context-menu'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import codeiconUrl from '@vscode/codicons/dist/codicon.css?url'
import '@vscode-elements/elements'

// Necessary because the ID tag must be set on the stylesheet in order to be retrievable from @vscode-elements
// https://github.com/vscode-elements/elements/blob/1d2b32cf8/src/vscode-icon/vscode-icon.ts#L81
// Which is apparently not possible to control in Vite https://github.com/vitejs/vite/issues/18324
const codiconElement = document.createElement('link')
codiconElement.rel = 'stylesheet'
codiconElement.href = codeiconUrl
codiconElement.id = 'vscode-codicon-stylesheet'
document.head.append(codiconElement)

let console_error = console.error
function handle_error(/** @type {any[]} */ ...args) {
	let e = args.map((x) =>
		typeof x === 'string' ? x : x ? (x.message || x.msg || x.data || x.body || x.stack || JSON.stringify.maybe(x, null, 4) || x.toString?.())?.toString?.() : '-')
		.join('\n')
	console_error(...args, new Error(), args[0]?.domChain ? `at element: ${JSON.stringify.maybe(args[0].domChain, null, 4)}` : '')
	console.trace()
	debugger // eslint-disable-line no-debugger
	show_error_message(e)
}
window.onerror = handle_error
console.error = handle_error
window.addEventListener('unhandledrejection', (e) =>
	handle_error(e.reason))

window.alert = show_information_message

let app = createApp(App)

app.config.errorHandler = handle_error
app.config.warnHandler = handle_error

// When adding global components here, also change in vite-config > components.d.ts
app.component('RecycleScroller', RecycleScroller)
let sfcs = import.meta.glob('./**/*.vue', { eager: true })
for (let path in sfcs)
	app.component(path.split('/').pop().split('.')[0], sfcs[path].default)

// TODO
app.directive('moveable', moveable)
app.directive('drag', drag)
app.directive('drop', drop)
app.directive('context-menu', context_menu)

app.mount('#app')
