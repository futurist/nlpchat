var path = require('path');

module.exports = {
    entry: {
        tree: './script/tree.js',
    },
    output: {
        path: __dirname,
        filename: './dist/[name].js'
    },
    module: {
        loaders: [
            { 
                test: path.join(__dirname, 'script'),
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query:{
                    cacheDirectory:true,
                    presets: ['es2015'],
                }
            }
        ]
    }
}

