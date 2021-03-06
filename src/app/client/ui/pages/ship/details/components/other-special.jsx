import React from 'react'

import db from '@appLogic/database'

import ComponentContainer from '../commons/component-container.jsx'
import Special from '../commons/special.jsx'

import translate from 'sp-i18n'

// import { ImportStyle } from 'sp-css-import'
// import styles from './combat-special.less'

// @connect()
// @ImportStyle(styles)
export default class ShipDetailsSpecialOther extends React.Component {
    render() {
        return (
            <ComponentContainer className={this.props.className} title={translate("ship_details.other_special")}>
                {this.props.ship.tp && <Special
                    title={translate("ship_details.tp_bonus", {
                        bonus: this.props.ship.tp
                    })}
                    level={2}
                />}
                {this.props.ship.tp >= 8 && <Special
                    title={translate("ship_details.expedition_bonus", {
                        bonus: '5%'
                    })}
                    level={2}
                >
                    {translate("ship_details.expedition_bonus_daihatsu_description", {
                        daihatsu: db.equipments[68]._name
                    })}
                    <br />
                    {translate("ship_details.expedition_bonus_daihatsu_description2", {
                        daihatsu: db.equipments[68]._name
                    })}
                </Special>}
                {!this.props.ship.tp && <Special
                    title={translate("none")}
                    level={0}
                />}
            </ComponentContainer>
        )
    }
}