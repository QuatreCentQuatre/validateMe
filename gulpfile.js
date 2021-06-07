const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpConcat = require('gulp-concat');
const gulpRename = require('gulp-rename');
const gulpUglify = require('gulp-uglify');
const gulpUglifyES = require("gulp-uglify-es").default;
const browserify = require("browserify");
const babelify = require("babelify");
const buffer = require("vinyl-buffer");
const source = require("vinyl-source-stream");

const sourceFiles = [
    'src/me-validate.js',
];
const distPath = 'dist/';

function es5() {
    return (
      browserify({
          entries: [sourceFiles],
          transform: [babelify.configure({"presets": ["@babel/preset-env"]})]
      })
      .bundle()
      .pipe(source('me-validate.js'))
      .pipe(buffer())
      .pipe(gulpBabel())
      .pipe(gulp.dest(distPath))
      .pipe(gulpUglify())
      .pipe(gulpRename({ suffix: '.min' }))
      .pipe(gulp.dest(distPath))
    );
}
function esm() {
    return gulp.src(sourceFiles)
        .pipe(gulpConcat('me-validate-esm.js'))
        .pipe(gulp.dest(distPath))
        .pipe(gulpUglifyES())
        .pipe(gulpRename({ suffix: '.min' }))
        .pipe(gulp.dest(distPath));
}

exports.build = gulp.parallel(esm, es5);