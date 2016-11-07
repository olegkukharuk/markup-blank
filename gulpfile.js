'use strict';

// TODO: Обработка изображений и JS
// TODO: Add Sourcemaps, cssmin
// TODO: gulp.task 'clean' by rimraf
// TODO: Переключение режима компиляции через gulp.task (например, сборка для ВП или Инсейл)

var gulp = require('gulp');
var watch = require('gulp-watch');
var notify = require("gulp-notify");
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var pagebuilder = require('gulp-pagebuilder');  // https://github.com/mightymind/gulp-pagebuilder
var preprocess = require('gulp-preprocess');    // https://www.npmjs.com/package/gulp-preprocess
// Server and LiveReload
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
// FTP Deploy
var gutil = require('gulp-util');
var ftp = require('gulp-ftp');


var config = {
        path: {
            source_dir: '',
            build_dir: '',
            styles: {
                watch: './source/assets/stylesheet/**',
                source: './source/assets/stylesheet/index.scss',
                build: './build/assets/stylesheet/'
            },
            html: {
                root: './source/html/',
                watch: './source/html/**',
                source: './source/html/pages/*.html',
                build: './build/'
            },
            deploy: 'build/*'
        },
        notifications: {
            html: 'HTML compilation is complete',
            styles: 'Styles compilation is complete',
            deploy: 'Deploy is successful complete'
        },
        deploy: {
            host: '',
            user: '',
            pass: '',
            remotePath: ''
        }
    };


var preprocessContext = {
        NODE_ENV: 'dev',
        BUILD: 'dev',
        DEBUG: true
    };


gulp.task('html', function () {
    return gulp.src( config.path.html.source )
        .pipe(pagebuilder( config.path.html.root ))
        .pipe(gulp.dest( config.path.html.build ))
        .pipe(preprocess({context: preprocessContext}))
        .pipe(gulp.dest( config.path.html.build ))
        .pipe(reload({stream: true}))
        .pipe(notify({ message: config.notifications.html }));
});

gulp.task('styles', function() {
    gulp.src( config.path.styles.source )
        .pipe(sass().on('error', sass.logError))
        .pipe(sass())
        .pipe(sass({
            style: 'compressed',
            errLogToConsole: false,
            onError: function(err) {
                return notify().write(err);
            }
        }))
        .pipe(gulp.dest( config.path.styles.build ));
    gulp.src( config.path.styles.build )
        .pipe(autoprefixer({
            browsers: ['> 1%', 'IE 7'],
            cascade: false
        }))
        .pipe(gulp.dest( config.path.styles.build ))
        .pipe(notify({ message: config.notifications.styles }));
        setTimeout(function () {
            reload({stream: true});
        }, 2000);
});


gulp.task('deploy', function() {
    return gulp.src( config.path.deploy )
            .pipe(ftp( config.deploy ))
            .pipe(gutil.noop())
            .pipe(notify({ message: config.notifications.deploy }));
});


gulp.task('default', function() {
    gulp.watch( config.path.html.watch, ['html']);
    gulp.watch( config.path.styles.watch, ['styles']);
    browserSync.init({
        server: "./build"
    });
});
