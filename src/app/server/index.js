import cookie from 'cookie'

//

import { reactApp } from '../client'
import { template } from '../html'
import { CHANGE_LANGUAGE, TELL_CLIENT_URL, SERVER_REDUCER_NAME, serverReducer } from './server-redux'
import isomorphicUtils from 'sp-isomorphic-utils'
import { localeId as currentLocaleId } from 'sp-i18n'
import i18nOnServerRender from 'sp-i18n/onServerRender'
import getServiceWorkerFile from 'sp-pwa/get-service-worker-file'
// import injectPWA from 'sp-pwa/inject-pwa'

// const webpackConfig = require('../../../config/webpack')

const distPathname = 'dist-web'

// 

const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const app = new Koa()

/* 扩展服务端特色处理的redux */

reactApp.redux.reducer.use(SERVER_REDUCER_NAME, serverReducer)



/* 静态目录,用于外界访问打包好的静态文件js、css等 */

const koaStatic = require('koa-static')
const convert = require('koa-convert')
const rootPath = process.cwd() + '/' + distPathname + '/public'
const option = {
    maxage: 0,
    hidden: true,
    index: 'index.html',
    defer: false,
    gzip: true,
    extensions: false
}

app.use(convert(koaStatic(rootPath, option)))



/* 同构配置 */

const getFile = filename => isomorphicUtils.getFile(
    __DEV__ ? `app.${filename}` : `app/${filename}`,
    distPathname
)

const isomorphic = reactApp.isomorphic.createKoaMiddleware({

    // react-router 配置对象
    routes: reactApp.react.router.get(),

    // redux store 对象
    configStore: reactApp.createConfigureStoreFactory(),

    // HTML基础模板
    template,

    // 对HTML基础模板的自定义注入
    // 例如：<script>//inject_critical</script>  替换为 critical
    inject: {
        htmlattr: () => ` data-locale="${currentLocaleId}" lang="${currentLocaleId}"`,
        manifest: () => {
            const filename = `manifest-${currentLocaleId}.json`
            const { mtime } = __DEV__ ? '' : fs.statSync(path.join(rootPath, filename))
            return `<link rel="manifest" href="/${filename}?${mtime ? mtime.valueOf() : ''}">`
        },
        svg_symbols: `<div class="hide">${__ICONSVG__}</div>`,

        critical: `<script src="${getFile('critical.js')}"></script>`,
        critical_css: (() => {
            // console.log(path.join(rootPath, getFile('critical.css')))
            if (__DEV__) return ''
            else //return `<link rel="stylesheet" type="text/css" href="${getFile('critical.css')}" />`
                return `<style type="text/css">${
                    fs.readFileSync(
                        path.join(rootPath, getFile('critical.css')),
                        'utf-8'
                    )}</style>`
        })(),
        critical_extra_old_ie_filename: `<script>var __CRITICAL_EXTRA_OLD_IE_FILENAME__ = "${getFile('critical-extra-old-ie.js')}"</script>`,
        js: (() => ([
            getFile('client.js')
        ]))(),
        // css: [],
        serviceworker_path: __DEV__ ? '' : getServiceWorkerFile('service-worker.app.js', distPathname),
        // pwa: __DEV__ ? '' : injectPWA('service-worker.app.js')
    },

    onServerRender: (obj) => {
        if (__DEV__) console.log('onServerRender')

        let { koaCtx, reduxStore } = obj

        let lang = (() => {

            // 先查看URL参数是否有语音设置
            // hl 这个参数名是参考了Instargram
            let lang = koaCtx.query.hl

            // 如果没有，检查cookie
            const cookies = cookie.parse(koaCtx.request.header.cookie || '')
            if (!lang && cookies.spLocaleId && cookies.spLocaleId !== 'null')
                lang = cookies.spLocaleId

            // 如果没有，再看header里是否有语言设置
            if (!lang)
                lang = koaCtx.header['accept-language']

            // 如没有，再用默认
            if (!lang)
                lang = 'en'

            return lang
        })()

        reduxStore.dispatch({ type: CHANGE_LANGUAGE, data: lang })
        reduxStore.dispatch({ type: TELL_CLIENT_URL, data: koaCtx.origin })

        i18nOnServerRender(obj)
    }
})

app.use(isomorphic)

export default app