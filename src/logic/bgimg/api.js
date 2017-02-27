import store from '../../core/store.js';
import * as actions from './actions.js'

import { dir as thePath } from '../../core/defaults.js'

const getPath = (filename, type = '') => {
    if (typeof filename === 'object' && filename.name) filename = filename.name

    const dir = type == 'custom' ? thePath.bgimgs_custom : thePath.bgimgs

    if (self.nw) {
        const path = require('path')
        return path.normalize(path.join(dir, type, filename)).split(path.sep).join('/')
    } else {
        return dir + '/' + type + '/' + filename
    }
}

const getObj = (indexString) => {
    const [type, index] = indexString.split('-')

    if (typeof index === 'undefined') return {}

    return store.getState().bgimgState.list[type][index]
}

const getListInitial = (type) => {
    let list = []

    const dir = type == 'custom' ? thePath.bgimgs_custom : thePath.bgimgs

    const parseData = (name) => {
        return {
            name: name
        }
    }

    if (self.nw) {
        const fs = require('fs')
        const path = require('path')
        const getList = (dir) => {
            return fs.readdirSync(dir)
                .filter(function (file) {
                    return !fs.lstatSync(path.join(dir, file)).isDirectory()
                })
                .map(function (filename) {
                    return {
                        name: filename,
                        time: fs.statSync(path.join(dir, filename)).mtime.getTime()
                    };
                })
                .sort(function (a, b) { return b.time - a.time; })
                .map(function (o) { return o.name; })
        }

        getList(dir)
            .forEach(function (name) {
                list.push(parseData(
                    name,
                    type === 'default'
                ))
            })
    } else {

    }

    return list
}





export const initList = (currentIndex = 'default-0') => {
    const listDefault = getListInitial('default')
    const listCustom = getListInitial('custom')

    const [type, index] = currentIndex.split('-')
    const current = eval('list' + type.substr(0, 1).toUpperCase() + type.substr(1))[index]

    store.dispatch(
        actions.init({
            list: {
                default: listDefault,
                custom: listCustom
            },
            current: {
                index: currentIndex,
                original: getPath(current),
                blured: getPath(current, 'blured')
            }
        })
    )

    console.log(store.getState())
}

export const add = (filename) => {

}

export const remove = (indexCustom) => {

}

export const change = (currentIndex) => {
    const currentObj = getObj(currentIndex)

    store.dispatch(
        actions.change({
            index: currentIndex,
            original: getPath(currentObj),
            blured: getPath(currentObj, 'blured')
        })
    )
}

export const initImgLoaded = () => {
    store.dispatch(
        actions.initImgLoaded()
    )
}