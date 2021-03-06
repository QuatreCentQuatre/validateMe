const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
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
function es() {
  return (
    browserify({
      entries: [sourceFiles],
      transform: [babelify.configure(
        {
          "presets": [["@babel/preset-env", {
            "targets": {
              edge: "89",
              chrome: "89",
              firefox: "87",
              safari: "13",
              ios: "13"
            }
          }]]
        }
        )]
    })
    .bundle()
    .pipe(source('me-validate-es.js'))
    .pipe(buffer())
    .pipe(gulp.dest(distPath))
    .pipe(gulpUglifyES())
    .pipe(gulpRename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath))
  );
}

exports.build = gulp.parallel(es, es5);