import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins({
  pattern: ['gulp-*', 'del']
});

function clean() {
  return $.del('.tmp');
}

gulp.task('clean', clean);

function build(dest) {
  return gulp.src('src/**/*.*')
    .pipe($.if('*.js', $.babel({
      presets: ['node6']
    })))
    .pipe(gulp.dest(dest));
}

gulp.task('build', ['clean'], () => build('dist'));
gulp.task('build:dev', ['clean'], () => build('.tmp'));

gulp.task('start', ['build:dev'], (done) => {
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
			done();
			started = true;
		}
	});
});

gulp.task('default', ['build']);
