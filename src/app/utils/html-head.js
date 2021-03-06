import metas from 'metas'

import translate, { getLocaleId, localeId as currentLocaleId } from 'sp-i18n'

import { origin as siteOrigin } from '@appConfig/site.js'
import { availableLocalesFb } from '@appConfig/i18n.js'

import { update as updatePageTitle } from '@appLogic/page-title/api.js'

let head

export default (settings = {}) => {

    let fb_locale
    let fb_app_id = fb_app_id
    let dispatch
    const siteName = translate('title') + (__DEV__ ? ' (DEV)' : '')

    /**
     * 默认选项
     */
    const options = Object.assign({
        uri: '',
        description: '',
        image: null,

        state: {},

        "twitter:card": "summary_large_image",
        "currentOrigin": siteOrigin
    }, settings)

    if (options.store) {
        options.state = options.store.getState()
        dispatch = options.store.dispatch
    }

    let { uri, title, subtitle, description, image, state } = options
    const curLocaleId = state.localeId || currentLocaleId

    if (typeof uri === 'object') {
        let pathname = uri.pathname
        const query = uri.query || {}

        uri = pathname
        fb_locale = query.fb_locale
    } else if (typeof location !== 'undefined') {
        uri = location.pathname
    }

    if (uri.substr(0, 1) == '/') uri = uri.substr(1)
    if (title) {
        if (dispatch) {
            if (typeof subtitle !== 'undefined')
                dispatch(updatePageTitle({
                    main: title,
                    sub: subtitle
                }))
            else dispatch(updatePageTitle(title))
        }
        if (title !== siteName)
            title = title.replace(/\n/g, '') + ' - ' + siteName
    } else {
        title = siteName
    }
    if (description) description = description.replace(/\n/g, '')

    if (state.server) options.currentOrigin = state.server.origin || options.currentOrigin

    if (options.currentOrigin) options.currentOrigin = options.currentOrigin + '/'

    const meta = metas({
        title,
        description,
        image: image || (options.currentOrigin + 'launcher.jpg'),
        url: options.currentOrigin + uri,
        type: "website",
        locale: curLocaleId,

        siteName,

        twitter: {
            card: "summary",
            siteCreator: "Diablohu"
        }
    }, true)
    /*
    const meta = [
        // Schema.org markup for Google+
        { itemprop: 'name', content: title },
        { itemprop: 'description', content: description },
        { itemprop: 'image', content: image },

        // For FaceBook
        { property: 'fb:app_id', content: fb_app_id },
        { property: 'fb:admins', content: fb_app_id },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        // { property: 'og:url', content: options.currentOrigin + uri },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:image', content: image },

        // For FaceBook App
        { property: 'al:ios:url', content: siteOrigin + uri },
        { property: 'al:ios:app_store_id', content: '543577420' },
        { property: 'al:ios:app_name', content: siteName },
        { property: 'al:android:url', content: 'cmpg://photogrid.cmcm.com/' + uri },
        { property: 'al:android:app_name', content: siteName },
        { property: 'al:android:package', content: 'com.roidapp.photogrid' },
        // { property: 'al:web:url', content: options.currentOrigin },

        // For Twitter
        { name: 'twitter:card', content: options["twitter:card"] },
        { name: 'twitter:site', content: '@photogridorg' },
        { name: 'twitter:creator', content: '@photogridorg' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        { name: 'twitter:image:alt', content: title },
        { name: 'twitter:domain', content: 'photogrid.cmcm.com' },

        // For Twitter App
        { name: 'twitter:app:name:iphone', content: siteName },
        { name: 'twitter:app:id:iphone', content: '543577420' },
        { name: 'twitter:app:url:iphone', content: siteOrigin + uri },
        { name: 'twitter:app:name:googleplay', content: siteName },
        { name: 'twitter:app:id:googleplay', content: 'com.roidapp.photogrid' },
        { name: 'twitter:app:url:googleplay', content: 'cmpg://photogrid.cmcm.com/' + uri }
    ]
    */

    if (fb_locale)
        fb_locale = fb_locale.replace(/-/g, '_')
    else {
        availableLocalesFb.some(locale => {
            if (curLocaleId == getLocaleId(locale))
                fb_locale = locale
            return fb_locale
        })
    }

    if (fb_locale) {
        const localeId = getLocaleId(fb_locale)
        const fb_locale_parsed = fb_locale.replace(/_/g, '-').toLowerCase()
        const seg = fb_locale_parsed.split('-')

        // console.log(availableLocalesFb, localeId, fb_locale, seg)

        let localeMain, locales = []

        if (localeId === fb_locale_parsed || localeId === seg[0]) {
            localeMain = fb_locale
        } else {
            localeMain = availableLocalesFb[0]
        }

        locales = availableLocalesFb.filter(locale => locale !== localeMain)

        // console.log(localeMain, locales)

        meta.push({
            "property": "og:locale",
            "content": localeMain
        })

        locales.forEach(locale => {
            meta.push({
                "property": "og:locale:alternate",
                "content": locale
            })
        })
    }

    const metaOutput = meta.filter(obj => obj.content)

    // replace existing meta
    if (typeof document !== 'undefined') {
        if (!head) head = document.getElementsByTagName('head')[0]
        if (title) document.title = title
        let str = metaOutput.map(obj => {
            let str = '<meta'
            for (let i in obj) {
                str += ` ${i}="${obj[i]}"`
            }
            str += '>'
            return str
        })
        str = str.join('')
        const match = /(<!--INJECT_META_START-->)(.+)(<!--INJECT_META_END-->)/g.exec(head.innerHTML)

        if (match && match.length > 3) {
            if (str !== match[2]) {
                head.innerHTML = head.innerHTML.replace(/<!--INJECT_META_START-->(.+)<!--INJECT_META_END-->/g, '<!--INJECT_META_START-->' + str + '<!--INJECT_META_END-->')
                // console.log('head meta updated')
            } else {
                // console.log('head meta not change, do not update')
            }
        } else {
            head.innerHTML += '<!--INJECT_META_START-->' + str + '<!--INJECT_META_END-->'
            // console.log('head meta appended')
        }

    }

    return {
        meta: metaOutput,
        title
    }
}