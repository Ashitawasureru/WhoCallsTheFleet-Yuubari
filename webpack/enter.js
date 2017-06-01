const argv = require('yargs').argv
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const Dashboard = require('webpack-dashboard')
const DashboardPlugin = require('webpack-dashboard/plugin')

// 客户端开发环境webpack-dev-server端口号
const CLIENT_DEV_PORT = (() => {
    let port = 3001
    if (argv.cport) port = argv.cport
    if (process.env.CPORT) port = process.env.CPORT
    return port
})()


// 描述环境
// dev 开发， dist 部署
const env = (() => {
    let env = ''
    if (argv.env) env = argv.env
    if (process.env.WEBPACK_ENV) env = process.env.WEBPACK_ENV
    return env
})()


// 描述场景
// client 客户端， server 服务端
const stage = (() => {
    let stage = ''
    if (argv.stage) stage = argv.stage
    if (process.env.WEBPACK_STAGE) stage = process.env.WEBPACK_STAGE
    return stage
})()


// 生产标准配置文件格式
const factoryConfig = (config) => {

    const defaultConfigStruct = {
        client: {
            dev: {},
            dist: {}
        },
        server: {
            dev: {},
            dist: {}
        }
    }

    // 生产配置
    Object.assign(config, defaultConfigStruct)

    return config
}

const run = async (config) => {

    // 程序启动路径，作为查找文件的基础
    let appPath = process.cwd()

    // 配置非空处理
    if (config === undefined) config = {}

    // 标准化配置
    config = factoryConfig(config)

    // 客户端开发模式
    if (stage === 'client' && env === 'dev') {

        let wcd = await require('./client.dev')(appPath, CLIENT_DEV_PORT)
        Object.assign(wcd, config.client.dev)

        const compiler = webpack(wcd)
        // const dashboard = new Dashboard()

        // compiler.apply(new DashboardPlugin(dashboard.setData))

        // more config
        // http://webpack.github.io/docs/webpack-dev-server.html
        const server = new WebpackDevServer(compiler, {
            // quiet: true,
            quiet: false,
            hot: true,
            inline: true,
            contentBase: './',
            publicPath: '/dist/',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })

        server.listen(CLIENT_DEV_PORT)
    }

    // 客户端打包
    if (stage === 'client' && (env === 'dist' || env === 'prod')) {

        process.env.NODE_ENV = 'production'

        let wcd = await require('./client.dist')(appPath, env)
        Object.assign(wcd, config.client.dist)

        const compiler = webpack(wcd)
        compiler.run((err, stats) => {
            if (err) console.log(`webpack dist error: ${err}`)

            console.log(stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            }))
        })
    }

    // 服务端开发环境
    if (stage === 'server' && env === 'dev') {

        let wsd = require('./server.dev')(appPath, CLIENT_DEV_PORT)
        Object.assign(wsd, config.server.dev)

        webpack(wsd, (err, stats) => {
            if (err) console.log(`webpack dev error: ${err}`)

            console.log(stats.toString({
                chunks: false,
                colors: true
            }))
        })
    }

    // 服务端打包
    if (stage === 'server' && env === 'dist') {

        process.env.NODE_ENV = 'production'

        let wsd = require('./server.dist')(appPath)
        Object.assign(wsd, config.server.dist)

        webpack(wsd, (err, stats) => {
            if (err) console.log(`webpack dist error: ${err}`)

            console.log(stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            }))
        })
    }

}

run()