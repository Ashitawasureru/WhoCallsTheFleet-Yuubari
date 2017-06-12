import React from 'react'
import { connect } from 'react-redux'

import translate from 'sp-i18n'
import PageContainer from 'sp-ui-pagecontainer'
import htmlHead from 'Utils/html-head.js'
import db from 'Logic/database'

import Link from 'UI/components/link.jsx'

import Header from './details/components/header.jsx'

import { ImportStyle } from 'sp-css-import'
import style from './details.less'

@connect()
@ImportStyle(style)
export default class extends React.Component {
    static htmlExtends(ext, store) {
        const head = htmlHead({
            store,
            title: db.ships[store.getState().routing.locationBeforeTransitions.pathname.split('/').reverse()[0]]._name
        })

        ext.meta = ext.meta.concat(head.meta)
        ext.title = head.title
    }

    get ship() {
        if (!this._data && this.props.params.id)
            this._data = db.ships[this.props.params.id]
        return this._data || {}
    }

    renderSeries() {
        const serieses = this.ship._series
        return (
            <div>
                <table>
                    <tbody>
                        {serieses.map((series, i) => (
                            <tr key={i}>
                                <th style={{
                                    textAlign: 'right'
                                }}><i>
                                    {i == 0 && "-"}
                                    {i > 0 && serieses[i-1].next_lvl}
                                    {i > 0 && serieses[i-1].next_blueprint === 'on' && <small><br/>+ Blueprint</small>}
                                    {i > 0 && serieses[i-1].next_catapult === 'on' && <small><br/>+ Catapult</small>}
                                    {i > 0 && serieses[i-1].next_loop === 'on' && ' (Switchable)'}
                                </i></th>
                                <td>
                                    {this.ship.id === series.id && db.ships[series.id]._name}
                                    {this.ship.id !== series.id && <Link to={`/ships/${series.id}`}>
                                        {db.ships[series.id]._name}
                                    </Link>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    renderSlotEquipments() {
        let i = 0
        let renderArr = []
        while(i < 4){
            const slot = this.ship.slot[i]
            const equipmentId = typeof slot !== 'undefined' ? this.ship.equip[i] : undefined
            renderArr.push(
                <tr key={i}>
                    <th style={{
                        textAlign: 'right'
                    }}><i>{typeof slot !== 'undefined' ? slot : "-"}</i></th>
                    <td>
                        {equipmentId &&
                            <Link to={`/equipments/${equipmentId}`}>
                                {db.equipments[equipmentId]._name}
                            </Link>
                        }
                        {!equipmentId && "-"}
                    </td>
                </tr>
            )
            i++
        }
        return (
            <div>
                <h4>{translate('ship_details.slot_and_equipments')}</h4>
                <table>
                    <tbody>
                        {renderArr}
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        if (__CLIENT__ && __DEV__) console.log('thisShip', this.ship)
        return (
            <PageContainer
                className={this.props.className}
            >
                <Header ship={this.ship} />

                <p><i>{translate('under_construction')}...</i></p>

                {this.renderSeries()}
                {this.renderSlotEquipments()}
            </PageContainer>
        )
    }
}