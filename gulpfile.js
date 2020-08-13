const { src, dest } = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpConcat = require('gulp-concat');
const gulpRename = require('gulp-rename');
const gulpUglify = require('gulp-uglify');

const sourceFiles = [
    'src/me-validate.js',
];
const distPath = 'dist/';

function js() {
    return src(sourceFiles)
        .pipe(gulpConcat('me-validate.js'))
        .pipe(gulpBabel())
        .pipe(dest(distPath))
        .pipe(gulpUglify())
        .pipe(gulpRename({ suffix: '.min' }))
        .pipe(dest(distPath));
}

exports.build = js;