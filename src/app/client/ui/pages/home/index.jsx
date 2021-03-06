import React from 'react'
import { connect } from 'react-redux'
import Markdown from 'react-markdown'
import { localeId } from 'sp-i18n'

import Link from '@appUI/components/link'
import CenterContainer from '@appUI/containers/center'

import translate from 'sp-i18n'
import PageContainer from 'sp-ui-pagecontainer'
import htmlHead from '@appUtils/html-head.js'

import { ImportStyle } from 'sp-css-import'
import style from './styles.less'

const markdownRenderers = {
    Link: (props) => {
        return (
            props.href.match(/^(https?:)?\/\//)
                ? (props.href.indexOf('://') < 0
                    ? <a href={props.href}>{props.children}</a>
                    : <a href={props.href} target="_blank">{props.children}</a>
                )
                : <Link to={props.href}>{props.children}</Link>
        );
    }
}

@connect()
@ImportStyle(style)
export default class Home extends React.Component {
    static onServerRenderHtmlExtend(ext, store) {
        const head = htmlHead({
            store,
            title: translate('title')
        })

        ext.metas = ext.metas.concat(head.meta)
        ext.title = head.title
    }

    getMD() {
        if (localeId === 'en')
            return require(`@appDocs/updates/1.0.0/en.md`)
        if (localeId === 'ja')
            return require(`@appDocs/updates/1.0.0/ja.md`)
        return require(`@appDocs/updates/1.0.0/zh.md`)
    }
    render() {
        return (
            <PageContainer className={this.props.className}>
                <CenterContainer>
                    <Markdown
                        source={this.getMD()}
                        renderers={markdownRenderers}
                        childAfter={
                            <span className="end-of-doc"></span>
                        }
                    />
                </CenterContainer>
            </PageContainer>
        )
    }
}
