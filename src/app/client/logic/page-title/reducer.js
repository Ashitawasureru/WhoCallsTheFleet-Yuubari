import {
    UPDATE_PAGE_TITLE
} from '../../redux/action-types.js'
import translate from 'sp-i18n'

const initialState = {
    // main: '',
    // sub: ''
}

export default function (state = initialState, action) {

    switch (action.type) {

        case UPDATE_PAGE_TITLE:
            if (typeof action.title === 'object')
                return action.title
            if (typeof action.title !== undefined)
                return {
                    main: action.title,
                    sub: undefined
                }
            return translate('title')

    }

    return state || translate('title');

}