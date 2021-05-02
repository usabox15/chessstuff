const { parallel, dest } = require('gulp');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');


function javascript(cb) {
  browserify('./src/browser.js')
    .bundle()
    .pipe(source('chessstuff.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('./lib/'));
  cb();
}


exports.default = javascript;
