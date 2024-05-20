const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, './star-map.ts'),
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: '/node_modules/'
            },
            {
                test: /\.css?$/,
                use: [
                    { loader: 'style-loader', options: { injectType: 'styleTag' } },
                    'css-loader'
                ],
                exclude: '/node_modules/'
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, './'),
        filename: 'star-map.js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, './')
    },
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: /node_modules/
    }
};