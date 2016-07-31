import gulp from 'gulp';

const $ = require('gulp-load-plugins')();

function build(dest) {
  return gulp.src('src/**/*.*')
    .pipe($.if('*.js', $.babel({
      presets: ['node6']
    })))
    .pipe(gulp.dest(dest));
}

gulp.task('build', () => build('dist'));
gulp.task('build:dev', () => build('.tmp'));

gulp.task('start', ['build:dev'], (cb) => {
  let started = false;

  return $.nodemon({
    script: '.tmp/server.js',
    watch: ['src'],
    tasks: ['build:dev']
  })
  .on('restart', () => {
    console.log('restarted!')
  })
  .on('start', () => {
		if (!started) {
			cb();
			started = true; 
		} 
	});
});

gulp.task('default', ['build']);
