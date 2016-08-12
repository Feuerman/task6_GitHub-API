'use strict';

const gulp = require('gulp'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'), 
    cssmin = require('gulp-minify-css'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        jade: 'build/',
        js: 'build/js/',
        css: 'build/css/'
    },
    src: {
        jade: 'src/*.jade',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss'
    },
    watch: {
        jade: 'src/**/*.jade',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss'
    },
    clean: './build'
};


var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

gulp.task('jade', function() {
    gulp.src(['src/*.jade', '!src/_*.jade'])
        .pipe(jade({
            pretty: true
        }))
        .on('error', console.log)
    .pipe(gulp.dest(path.build.jade))
    .pipe(reload({stream: true}));
}); 

gulp.task('jsbuild', function () {
    gulp.src(path.src.js)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('stylebuild', function () {
    gulp.src(path.src.style)        
        .pipe(sass())
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('build', [
    'jade',
    'jsbuild',
    'stylebuild'
]);

gulp.task('watch', function(){
    watch([path.watch.jade], function(event, cb) {
        gulp.start('jade');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('stylebuild');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('jsbuild');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);